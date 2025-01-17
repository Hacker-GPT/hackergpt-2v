import { replaceWordsInLastUserMessage } from "@/lib/ai-helper"
import { buildSystemPrompt } from "@/lib/ai/prompts"
import {
  filterEmptyAssistantMessages,
  toVercelChatMessages
} from "@/lib/build-prompt"
import llmConfig from "@/lib/models/llm/llm-config"
import { checkRatelimitOnApi } from "@/lib/server/ratelimiter"
import { getAIProfile } from "@/lib/server/server-chat-helpers"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { ServerRuntime } from "next"
import { createToolSchemas } from "@/lib/tools/llm/toolSchemas"
import { PluginID } from "@/types/plugins"
import { executeWebSearchTool } from "@/lib/tools/llm/web-search"
import { createStreamResponse } from "@/lib/ai-helper"
import { executeTerminalTool } from "@/lib/tools/llm/terminal"

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

export async function POST(request: Request) {
  try {
    const { chatSettings, messages, isTerminalContinuation, selectedPlugin } =
      await request.json()

    const profile = await getAIProfile()
    const rateLimitCheckResult = await checkRatelimitOnApi(
      profile.user_id,
      "gpt-4"
    )
    if (rateLimitCheckResult !== null) {
      return rateLimitCheckResult.response
    }

    filterEmptyAssistantMessages(messages)
    replaceWordsInLastUserMessage(messages)

    // Handle special plugins
    switch (selectedPlugin) {
      case PluginID.WEB_SEARCH:
        return createStreamResponse(async dataStream => {
          await executeWebSearchTool({
            config: { chatSettings, messages, profile, dataStream }
          })
        })

      case PluginID.TERMINAL || isTerminalContinuation:
        return createStreamResponse(async dataStream => {
          await executeTerminalTool({
            config: { messages, profile, dataStream, isTerminalContinuation }
          })
        })
    }

    const systemPrompt = buildSystemPrompt(
      llmConfig.systemPrompts.gpt4o,
      profile.profile_context
    )

    const openai = createOpenAI()

    return createStreamResponse(dataStream => {
      const { getSelectedSchemas } = createToolSchemas({
        chatSettings,
        messages,
        profile,
        dataStream,
        isTerminalContinuation
      })

      const result = streamText({
        model: openai("gpt-4o", { parallelToolCalls: false }),
        system: systemPrompt,
        messages: toVercelChatMessages(messages, true),
        temperature: 0.5,
        maxTokens: 2048,
        abortSignal: request.signal,
        tools: getSelectedSchemas("all")
      })

      result.mergeIntoDataStream(dataStream)
    })
  } catch (error: any) {
    const errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
