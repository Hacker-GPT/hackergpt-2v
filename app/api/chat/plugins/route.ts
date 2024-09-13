import { getAIProfile } from "@/lib/server/server-chat-helpers"
import { ServerRuntime } from "next"

import { checkRatelimitOnApi } from "@/lib/server/ratelimiter"

import {
  pluginIdToHandlerMapping,
  isCommand,
  handleCommand
} from "@/lib/plugins/chatpluginhandlers"
import { OpenRouterStream } from "@/lib/plugins/openrouterstream"
import { PluginID, pluginUrls } from "@/types/plugins"
import { isPremiumUser } from "@/lib/server/subscription-utils"
import { buildFinalMessages } from "@/lib/build-prompt"
import { commandGeneratorHandler } from "@/lib/gpts/command-generator-handler"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { payload, chatImages, selectedPlugin, fileData } = json as {
    payload: any
    chatImages: any[]
    selectedPlugin: string
    fileData?: { fileName: string; fileContent: string }[]
  }

  const freePlugins: PluginID[] = [
    PluginID.CVEMAP,
    PluginID.SUBFINDER,
    PluginID.WHOIS,
    PluginID.WAFDETECTOR
  ]

  try {
    const profile = await getAIProfile()
    const isPremium = await isPremiumUser(profile.user_id)

    if (!freePlugins.includes(selectedPlugin as PluginID) && !isPremium) {
      return new Response(
        "Access Denied to " +
          selectedPlugin +
          ": The plugin you are trying to use is exclusive to Pro members. Please upgrade to a Pro account to access this plugin."
      )
    }

    let chatSettings = payload.chatSettings

    let ratelimitmodel
    if (chatSettings.model === "mistral-medium") {
      ratelimitmodel = "pentestgpt"
    } else if (chatSettings.model === "mistral-large") {
      ratelimitmodel = "pentestgpt-pro"
    } else {
      ratelimitmodel = "gpt-4"
    }

    const rateLimitCheckResultForPlugins = await checkRatelimitOnApi(
      profile.user_id,
      "plugins"
    )
    if (rateLimitCheckResultForPlugins !== null) {
      return rateLimitCheckResultForPlugins.response
    }

    const rateLimitCheckResultForChatSettingsModel = await checkRatelimitOnApi(
      profile.user_id,
      ratelimitmodel
    )
    if (rateLimitCheckResultForChatSettingsModel !== null) {
      return rateLimitCheckResultForChatSettingsModel.response
    }

    const formattedMessages = (await buildFinalMessages(
      payload,
      profile,
      chatImages,
      selectedPlugin as PluginID
    )) as any

    const terminalPlugins = [PluginID.SQLI_EXPLOITER, PluginID.SSL_SCANNER]

    if (terminalPlugins.includes(selectedPlugin as PluginID)) {
      return await commandGeneratorHandler({
        userID: profile.user_id,
        profile_context: profile.profile_context,
        messages: formattedMessages,
        pluginID: selectedPlugin as PluginID
      })
    }

    let invokedByPluginId = false
    const cleanMessages = formattedMessages.slice(1, -1)
    let latestUserMessage = cleanMessages[cleanMessages.length - 1]

    let latestUserMessageContent = ""
    if (Array.isArray(latestUserMessage.content)) {
      latestUserMessage.content.forEach((item: any) => {
        if (item.type === "text") {
          latestUserMessageContent += item.text + " "
        }
      })
      latestUserMessage = {
        role: latestUserMessage.role,
        content: latestUserMessageContent
      }
    } else {
      latestUserMessageContent = latestUserMessage.content
    }

    if (latestUserMessageContent.startsWith("/")) {
      const commandPlugin = Object.keys(pluginUrls)
        .find(plugin =>
          isCommand(plugin.toLowerCase(), latestUserMessageContent)
        )
        ?.toLowerCase()

      if (!commandPlugin) {
        return new Response(
          "Error: Command not recognized. Please check the command and try again."
        )
      }

      if (
        commandPlugin &&
        !freePlugins.includes(selectedPlugin as PluginID) &&
        !isPremium
      ) {
        return new Response(
          "Access Denied to " +
            commandPlugin +
            ": The plugin you are trying to use is exclusive to Pro members. Please upgrade to a Pro account to access this plugin."
        )
      }

      for (const plugin of Object.keys(pluginUrls)) {
        if (isCommand(plugin.toLowerCase(), latestUserMessageContent)) {
          return await handleCommand(
            plugin.toLowerCase(),
            latestUserMessage,
            cleanMessages
          )
        }
      }
    } else if (pluginIdToHandlerMapping.hasOwnProperty(selectedPlugin)) {
      invokedByPluginId = true

      const toolHandler = pluginIdToHandlerMapping[selectedPlugin]
      const response = await toolHandler(
        latestUserMessage,
        process.env[`ENABLE_${selectedPlugin.toUpperCase()}_PLUGIN`] !==
          "FALSE",
        OpenRouterStream,
        cleanMessages,
        invokedByPluginId,
        fileData && fileData.length > 0 ? fileData : undefined
      )

      return response
    }
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
