import { Tables } from "@/supabase/types"
import { PluginID } from "@/types/plugins"
import { FC } from "react"
import { MessageMarkdown } from "./message-markdown"
import { MessagePluginFile } from "./message-plugin-file"
import { MessageImageGenerator } from "./message-image-generator"
import { MessageCodeInterpreter } from "./e2b-messages/message-code-interpreter"
import { MessageTerminal } from "./e2b-messages/message-terminal"

interface MessageTypeResolverProps {
  message: Tables<"messages">
  previousMessage: Tables<"messages"> | undefined
  messageSizeLimit: number
  isLastMessage: boolean
  toolInUse: string
}

const extractOutputFilename = (content: string) => {
  const jsonMatch = content.match(/"command"\s*:\s*"(.+?)"/)
  const commandContent = jsonMatch ? jsonMatch[1] : content

  const filenameMatch = commandContent.match(/-output\s+(\S+)/)
  return filenameMatch ? filenameMatch[1].trim() : undefined
}

export const MessageTypeResolver: FC<MessageTypeResolverProps> = ({
  previousMessage,
  message,
  messageSizeLimit,
  isLastMessage,
  toolInUse
}) => {
  const isPluginOutput =
    message.plugin !== null &&
    message.plugin !== PluginID.NONE.toString() &&
    message.role === "assistant"

  // console.log({
  //   isPluginOutput,
  //   plugin: message.plugin,
  //   role: message.role
  // })

  if (
    (isPluginOutput &&
      message.plugin === PluginID.CODE_INTERPRETER.toString()) ||
    toolInUse === PluginID.CODE_INTERPRETER
  ) {
    return (
      <MessageCodeInterpreter
        content={message.content}
        messageId={message.id}
        isAssistant={message.role === "assistant"}
      />
    )
  }

  if (
    (isPluginOutput && message.plugin === PluginID.TERMINAL.toString()) ||
    toolInUse === PluginID.TERMINAL
  ) {
    return (
      <MessageTerminal
        content={message.content}
        messageId={message.id}
        isAssistant={message.role === "assistant"}
      />
    )
  }

  if (
    message.plugin === PluginID.IMAGE_GENERATOR.toString() ||
    toolInUse === PluginID.IMAGE_GENERATOR
  ) {
    return (
      <MessageImageGenerator
        content={message.content}
        isAssistant={message.role === "assistant"}
      />
    )
  }

  // If the previous message is a plugin command and the current message is the output
  if (
    isPluginOutput &&
    previousMessage?.content.startsWith("/") &&
    (previousMessage.content.split("/n/n")[0].includes(" -output ") ||
      previousMessage.content.split("/n/n")[0].includes(" --output "))
  ) {
    const outputFilename = extractOutputFilename(previousMessage.content)

    return (
      <MessagePluginFile
        created_at={message.created_at}
        content={message.content}
        plugin={message.plugin ?? PluginID.NONE}
        autoDownloadEnabled={true}
        id={message.id}
        filename={outputFilename}
        isLastMessage={isLastMessage}
        isAssistant={message.role === "assistant"}
      />
    )
  }

  // If the current message is a plugin command and the previous message is the output
  if (
    isPluginOutput &&
    (message.content.split("/n/n")[0].includes(" -output ") ||
      message.content.split("/n/n")[0].includes(" --output "))
  ) {
    const outputFilename = extractOutputFilename(
      message.content.split("/n/n")[0]
    )

    return (
      <MessagePluginFile
        created_at={message.created_at}
        content={message.content}
        plugin={message.plugin ?? PluginID.NONE}
        autoDownloadEnabled={true}
        id={message.id}
        filename={outputFilename}
        isLastMessage={isLastMessage}
        isAssistant={message.role === "assistant"}
      />
    )
  }

  if (
    typeof message.content === "string" &&
    message.content.length > messageSizeLimit
  ) {
    return (
      <MessagePluginFile
        created_at={message.created_at}
        content={message.content}
        plugin={message.plugin ?? PluginID.NONE}
        autoDownloadEnabled={false}
        id={message.id}
        filename={message.plugin + "-" + message.id + ".md"}
        isLastMessage={isLastMessage}
        isAssistant={message.role === "assistant"}
      />
    )
  }

  return (
    <MessageMarkdown
      content={message.content}
      isAssistant={message.role === "assistant"}
    />
  )
}
