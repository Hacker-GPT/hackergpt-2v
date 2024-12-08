import { replaceWordsInLastUserMessage } from "@/lib/ai-helper"
import { buildSystemPrompt } from "@/lib/ai/prompts"
import {
  filterEmptyAssistantMessages,
  toVercelChatMessages
} from "@/lib/build-prompt"
import llmConfig from "@/lib/models/llm/llm-config"
import { ratelimit } from "@/lib/server/ratelimiter"
import { getAIProfile } from "@/lib/server/server-chat-helpers"
import { getSubscriptionInfo } from "@/lib/server/subscription-utils"
import { fragmentSchema } from "@/lib/tools/fragments/fragment-schema"
import { toPrompt } from "@/lib/tools/fragments/prompt"
import { executeFragment } from "@/lib/tools/fragments/sandbox-execution"
import templates from "@/lib/tools/fragments/templates"
import { epochTimeToNaturalLanguage } from "@/lib/utils"
import { BuiltChatMessage } from "@/types/chat-message"
import { createOpenAI } from "@ai-sdk/openai"
import { streamObject, streamText, tool } from "ai"
import { decode, encode } from "gpt-tokenizer"
import { ServerRuntime } from "next"

export const runtime: ServerRuntime = "edge"
export const preferredRegion = [
  "iad1",
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1"
]

const MAX_TOKENS = 32000
const INITIAL_TOKENS = 1000

function messagesToPrompt(messages: BuiltChatMessage[]) {
  return messages
    .map(message => `${message.role}: ${message.content}`)
    .join("\n")
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const profile = await getAIProfile()
    const subscriptionInfo = await getSubscriptionInfo(profile.user_id)

    if (!subscriptionInfo.isPremium) {
      return new Response(
        "Access Denied: This feature is exclusive to Pro and Team members. Please upgrade your account to access the fragment tool.",
        { status: 403 }
      )
    }

    const rateLimitResult = await ratelimit(profile.user_id, "fragment")
    if (!rateLimitResult.allowed) {
      const waitTime = epochTimeToNaturalLanguage(
        rateLimitResult.timeRemaining!
      )
      return new Response(
        JSON.stringify({
          error: `Oops! It looks like you've reached the limit for fragment tool.\nTo ensure fair usage for all users, please wait ${waitTime} before trying again.`
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    filterEmptyAssistantMessages(messages)
    replaceWordsInLastUserMessage(messages)

    const openai = createOpenAI({
      baseURL: llmConfig.openai.baseURL,
      apiKey: llmConfig.openai.apiKey
    })

    const stream = new ReadableStream({
      async start(controller) {
        const enqueueChunk = (code: string, object: any) =>
          controller.enqueue(
            `${code}:${JSON.stringify([
              {
                isFragment: true
              },
              object
            ])}\n`
          )

        const { object: finalObjectPromise, partialObjectStream } =
          streamObject({
            model: openai("gpt-4o"),
            schema: fragmentSchema,
            prompt:
              toPrompt(templates) +
              "Execute the task described in the conversation bellow:\n\n" +
              messagesToPrompt(messages)
          })

        const keysAlreadySeen = new Set<string>()
        const transmittingKeys = new Set<string>()
        for await (const partialObject of partialObjectStream) {
          let clearTransmittingKeys = false
          const keys = Object.keys(partialObject)
          for (const key of keys) {
            if (keysAlreadySeen.has(key)) {
              continue
            }
            keysAlreadySeen.add(key)
            if (!clearTransmittingKeys) {
              clearTransmittingKeys = true
              transmittingKeys.clear()
            }
            transmittingKeys.add(key)
          }

          for (const key of transmittingKeys) {
            enqueueChunk("2", {
              [key]: partialObject[key as keyof typeof partialObject]
            })
          }
        }

        const finalObject = await finalObjectPromise

        enqueueChunk("2", {
          sandboxExecution: "starting"
        })

        const sandboxData = await executeFragment(
          finalObject,
          profile.user_id,
          5 * 60 * 1000
        )

        enqueueChunk("2", {
          sandboxResult: sandboxData,
          sandboxExecution: "completed"
        })

        controller.enqueue(`d:{"finishReason":"stop"}\n`)

        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked"
      }
    })
  } catch (error) {
    console.error("Terminal execution error:", error)
    return new Response("An error occurred while processing your request", {
      status: 500
    })
  }
}

async function streamTerminalOutput(
  terminalStream: ReadableStream<Uint8Array>,
  enqueueChunk: (chunk: string) => void
): Promise<string> {
  const reader = terminalStream.getReader()
  let terminalOutput = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = new TextDecoder().decode(value)
    terminalOutput += chunk
    enqueueChunk(chunk)
  }
  return terminalOutput
}
