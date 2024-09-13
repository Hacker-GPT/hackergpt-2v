import { handleCvemapRequest } from "./cvemap/cvemap.content"
import { handleSubfinderRequest } from "./subfinder/subfinder.content"
// Tools
import { handleWhoisRequest } from "../tools/whois-lookup/whois-lookup-content"

import { OpenRouterStream } from "@/lib/plugins/openrouterstream"

import { Message } from "@/types/chat"

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type CommandHandler = {
  [key: string]: (...args: any[]) => any
}

type pluginHandlerFunction = (
  lastMessage: any,
  enableFeature: boolean,
  OpenRouterStream: any,
  messagesToSend: any,
  invokedByToolId: boolean,
  fileData?: { fileName: string; fileContent: string }[]
) => Promise<any>

type pluginIdToHandlerMapping = {
  [key: string]: pluginHandlerFunction
}

export const pluginIdToHandlerMapping: pluginIdToHandlerMapping = {
  cvemap: handleCvemapRequest,
  subfinder: handleSubfinderRequest,
  // Tools
  whois: handleWhoisRequest
}

const commandHandlers: CommandHandler = {
  handleCvemapRequest,
  handleSubfinderRequest,
  // Tools
  handleWhoisRequest
}

export const isCommand = (commandName: string, message: string) => {
  if (!message.startsWith("/")) return false

  const trimmedMessage = message.trim()
  const commandPattern = new RegExp(
    `^\\/${commandName}(?:\\s+(-[a-z]+|\\S+))*$`
  )

  return commandPattern.test(trimmedMessage)
}

export const handleCommand = async (
  commandName: string,
  lastMessage: any,
  messagesToSend: any
) => {
  const handlerFunction = `handle${capitalize(commandName)}Request`
  return await commandHandlers[handlerFunction](
    lastMessage,
    process.env[`ENABLE_${commandName.toUpperCase()}_PLUGIN`] !== "FALSE",
    OpenRouterStream,
    messagesToSend
  )
}

export interface ProcessAIResponseOptions {
  fileContentIncluded?: boolean
  fileNames?: string[]
}

type TransformQueryFunction = (
  message: Message,
  fileContentIncluded?: boolean,
  fileNames?: string
) => string

export async function* processAIResponseAndUpdateMessage(
  lastMessage: Message,
  transformQueryFunction: TransformQueryFunction,
  OpenRouterStream: {
    (messages: Message[], answerMessage: Message): Promise<ReadableStream<any>>
  },
  messagesToSend: Message[],
  options: ProcessAIResponseOptions = {}
): AsyncGenerator<string, { aiResponseText: string }, undefined> {
  const { fileContentIncluded = false, fileNames } = options
  const joinedFileNames = fileNames?.join(", ")

  let answerMessage = { role: "user", content: "" } as Message

  const answerPrompt = transformQueryFunction(
    lastMessage,
    fileContentIncluded,
    joinedFileNames
  )
  answerMessage.content = answerPrompt
  const openAIResponseStream = await OpenRouterStream(
    messagesToSend,
    answerMessage
  )

  let aiResponse = ""
  const reader = openAIResponseStream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = new TextDecoder().decode(value, { stream: true })
    aiResponse += chunk
    yield chunk
  }

  return {
    aiResponseText: aiResponse
  }
}

export function getCommandFromAIResponse(
  lastMessage: Message,
  aiResponse: string
) {
  try {
    const jsonMatch = aiResponse.match(/```json\n\{.*?\}\n```/s)
    if (jsonMatch) {
      const jsonResponseString = jsonMatch[0].replace(/```json\n|\n```/g, "")
      const jsonResponse = JSON.parse(jsonResponseString)
      lastMessage.content = jsonResponse.command
    } else {
      throw new Error("No JSON command found in the AI response.")
    }
  } catch (error) {
    throw error
  }

  return lastMessage.content
}

export function formatScanResults({
  pluginName,
  pluginUrl,
  target,
  results
}: {
  pluginName: string
  pluginUrl: string
  target: string | string[] | null | undefined
  results: any
}) {
  const formattedDateTime = new Date().toLocaleString("en-US", {
    timeZone: "Etc/GMT+5",
    timeZoneName: "short"
  })

  const resultsFormatted = Array.isArray(results)
    ? results.join("\n")
    : results.split("\n").join("\n")

  let targetInfo = ""
  if (Array.isArray(target)) {
    if (target.length > 0) {
      targetInfo = `**Target**: "${target.join(", ")}"\n\n`
    }
  } else if (target && target !== "") {
    targetInfo = `**Target**: "${target}"\n\n`
  }

  return (
    `# [${pluginName}](${pluginUrl}) Results\n` +
    targetInfo +
    "**Scan Date & Time**:" +
    ` ${formattedDateTime} (UTC-5) \n\n` +
    "## Results:\n" +
    "```\n" +
    resultsFormatted +
    "\n" +
    "```\n"
  )
}

export function createGKEHeaders(): Headers {
  const headers = new Headers()
  headers.set("Content-Type", "text/event-stream")
  headers.set("Cache-Control", "no-cache")
  headers.set("Connection", "keep-alive")
  return headers
}

export const processGKEData = (data: string) => {
  return data
    .split("\\n")
    .filter(line => line && !line.startsWith("data:") && line.trim() !== "")
    .join("\n")
}
