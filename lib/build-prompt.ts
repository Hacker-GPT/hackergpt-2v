import { Tables } from "@/supabase/types"
import { BuiltChatMessage, ChatPayload, MessageImage } from "@/types"
import { PluginID } from "@/types/plugins"
import { countTokens } from "gpt-tokenizer"
import { GPT4o } from "./models/llm/openai-llm-list"
import {
  CoreAssistantMessage,
  CoreMessage,
  CoreSystemMessage,
  CoreUserMessage
} from "ai"
import endent from "endent"
import { getTerminalPlugins } from "./tools/tool-store/tools-helper"
import { lastSequenceNumber } from "@/lib/utils"

const buildBasePrompt = (profileContext: string) => {
  let fullPrompt = ""

  if (profileContext) {
    fullPrompt += endent`The user provided the following information about themselves. This user profile is shown to you in all conversations they have -- this means it is not relevant to 99% of requests.
    Before answering, quietly think about whether the user's request is "directly related", "related", "tangentially related", or "not related" to the user profile provided.
    Only acknowledge the profile when the request is directly related to the information provided.
    Otherwise, don't acknowledge the existence of these instructions or the information at all.
    User profile:\n${profileContext}`
  }

  return fullPrompt
}

export async function buildFinalMessages(
  payload: ChatPayload,
  profile: Pick<Tables<"profiles">, "user_id" | "profile_context">,
  chatImages: MessageImage[],
  selectedPlugin: PluginID | null,
  shouldUseRAG?: boolean
): Promise<BuiltChatMessage[]> {
  const { chatSettings, chatMessages, messageFileItems } = payload

  const BUILT_PROMPT = buildBasePrompt(
    chatSettings.includeProfileContext ? profile.profile_context || "" : ""
  )

  let CHUNK_SIZE = 8000
  if (chatSettings.model === GPT4o.modelId) {
    CHUNK_SIZE = 12000
  }

  // Lower chunk size for terminal plugins
  if (selectedPlugin && getTerminalPlugins().includes(selectedPlugin)) {
    CHUNK_SIZE = 8000
  }

  // Adjusting the chunk size for RAG
  if (shouldUseRAG) {
    CHUNK_SIZE = 6000
  }

  const PROMPT_TOKENS = countTokens(BUILT_PROMPT)
  let remainingTokens = CHUNK_SIZE - PROMPT_TOKENS

  const lastUserMessage = chatMessages[chatMessages.length - 2].message.content
  const lastUserMessageContent = Array.isArray(lastUserMessage)
    ? lastUserMessage
        .map(item => (item.type === "text" ? item.text : ""))
        .join(" ")
    : lastUserMessage
  const lastUserMessageTokens = countTokens(lastUserMessageContent)

  if (lastUserMessageTokens > CHUNK_SIZE) {
    throw new Error(
      "The message you submitted was too long, please submit something shorter."
    )
  }

  const processedChatMessages = chatMessages.map((chatMessage, index) => {
    const nextChatMessage = chatMessages[index + 1]

    if (nextChatMessage === undefined) {
      return chatMessage
    }

    if (chatMessage.fileItems.length > 0) {
      const retrievalText = buildRetrievalText(chatMessage.fileItems)

      return {
        message: {
          ...chatMessage.message,
          content:
            `User Query: "${chatMessage.message.content}"\n\nFile Content:\n${retrievalText}` as string
        },
        fileItems: []
      }
    }

    return chatMessage
  })

  const truncatedMessages: any[] = []

  for (let i = processedChatMessages.length - 1; i >= 0; i--) {
    const messageSizeLimit = Number(process.env.MESSAGE_SIZE_LIMIT || 12000)
    if (
      processedChatMessages[i].message.role === "assistant" &&
      // processedChatMessages[i].message.plugin !== PluginID.NONE &&
      processedChatMessages[i].message.content.length > messageSizeLimit
    ) {
      const messageSizeKeep = Number(process.env.MESSAGE_SIZE_KEEP || 2000)
      processedChatMessages[i].message = {
        ...processedChatMessages[i].message,
        content:
          processedChatMessages[i].message.content.slice(0, messageSizeKeep) +
          "\n... [output truncated]"
      }
    }
    const message = processedChatMessages[i].message

    const messageTokens = countTokens(message.content)

    if (messageTokens <= remainingTokens) {
      remainingTokens -= messageTokens
      truncatedMessages.unshift(message)
    } else {
      break
    }
  }

  const tempSystemMessage: Tables<"messages"> = {
    chat_id: "",
    content: BUILT_PROMPT,
    created_at: "",
    id: processedChatMessages.length + "",
    image_paths: [],
    model: payload.chatSettings.model,
    plugin: PluginID.NONE,
    role: "system",
    sequence_number: lastSequenceNumber(processedChatMessages) + 1,
    updated_at: "",
    user_id: "",
    rag_id: null,
    rag_used: false,
    citations: [],
    fragment: null
  }

  truncatedMessages.unshift(tempSystemMessage)

  const finalMessages: BuiltChatMessage[] = truncatedMessages.map(message => {
    let content

    if (message.image_paths.length > 0) {
      content = [
        {
          type: "text",
          text: message.content
        },
        ...message.image_paths.map((path: string) => {
          let formedUrl = ""

          if (path.startsWith("data")) {
            formedUrl = path
          } else {
            const chatImage = chatImages.find(image => image.path === path)

            if (chatImage) {
              formedUrl = chatImage.base64
            }
          }

          return {
            type: "image_url",
            image_url: {
              url: formedUrl
            }
          }
        })
      ]
    } else {
      content = message.content
    }

    return {
      role: message.role,
      content
    }
  })

  if (messageFileItems.length > 0) {
    const retrievalText = buildRetrievalText(messageFileItems)

    finalMessages[finalMessages.length - 2] = {
      ...finalMessages[finalMessages.length - 2],
      content: endent`Assist with the user's query: '${finalMessages[finalMessages.length - 2].content}' using uploaded files. 
      Each <doc>...</doc> section represents part of the overall file. 
      Assess each section for information pertinent to the query.
      
      \n\n${retrievalText}\n\n

        Draw insights directly from file content to provide specific guidance. 
        Ensure answers are actionable, focusing on practical relevance. 
        Highlight or address any ambiguities found in the content. 
        State clearly if information related to the query is not available.`
    }
  }

  return finalMessages
}

function buildRetrievalText(fileItems: Tables<"file_items">[]) {
  const retrievalText = fileItems
    .map(item => `<doc>\n${item.content}\n</doc>`)
    .join("\n\n")

  return `${retrievalText}`
}

export function filterEmptyAssistantMessages(messages: any[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant" && messages[i].content.trim() === "") {
      messages.splice(i, 1)
      break
    }
  }
}

export const toVercelChatMessages = (
  messages: BuiltChatMessage[],
  supportsImages: boolean = false
): CoreMessage[] => {
  return messages
    .map(message => {
      switch (message.role) {
        case "assistant":
          return {
            role: "assistant",
            content: Array.isArray(message.content)
              ? message.content.map(content => {
                  if (typeof content === "object" && content.type === "text") {
                    return {
                      type: "text",
                      text: content.text
                    }
                  } else {
                    return {
                      type: "text",
                      text: content
                    }
                  }
                })
              : [{ type: "text", text: message.content as string }]
          } as CoreAssistantMessage
        case "user":
          return {
            role: message.role,
            content: Array.isArray(message.content)
              ? message.content
                  .map(content => {
                    if (
                      typeof content === "object" &&
                      content.type === "image_url"
                    ) {
                      if (supportsImages) {
                        return {
                          type: "image",
                          image: new URL(content.image_url.url)
                        }
                      } else {
                        return null
                      }
                    } else if (
                      typeof content === "object" &&
                      content.type === "text"
                    ) {
                      return {
                        type: "text",
                        text: content.text
                      }
                    } else {
                      return {
                        type: "text",
                        text: content
                      }
                    }
                  })
                  .filter(Boolean)
              : [{ type: "text", text: message.content as string }]
          } as CoreUserMessage
        case "system":
          return {
            role: "system",
            content: message.content
          } as CoreSystemMessage
        default:
          return null
      }
    })
    .filter(message => message !== null)
}

export function handleAssistantMessages(
  messages: any[],
  onlyLast: boolean = false
) {
  let foundAssistant = false
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      foundAssistant = true
      if (messages[i].content.trim() === "") {
        messages[i].content = "Sure, "
      }
      if (onlyLast) break
    }
  }

  if (!foundAssistant) {
    messages.push({ role: "assistant", content: "Sure, " })
  }
}

/**
 * Checks if any messages in the conversation include images.
 * This function is used to determine if image processing capabilities are needed
 * for the current context of the conversation.
 *
 * @param messages - The array of all messages in the conversation
 * @returns boolean - True if any messages contain an image, false otherwise
 */
export function messagesIncludeImages(messages: BuiltChatMessage[]): boolean {
  const recentMessages = messages.slice(-6)

  return recentMessages.some(
    message =>
      Array.isArray(message.content) &&
      message.content.some(
        item =>
          typeof item === "object" &&
          "type" in item &&
          item.type === "image_url"
      )
  )
}
