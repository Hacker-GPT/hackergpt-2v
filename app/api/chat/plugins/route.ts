import { getAIProfile } from "@/lib/server/server-chat-helpers"
import { ServerRuntime } from "next"

import { checkRatelimitOnApi } from "@/lib/server/ratelimiter"

import { PluginID } from "@/types/plugins"
import { isPremiumUser } from "@/lib/server/subscription-utils"
import { buildFinalMessages } from "@/lib/build-prompt"
import { commandGeneratorHandler } from "@/lib/gpts/command-generator-handler"

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
  const json = await request.json()
  const { payload, chatImages, selectedPlugin, fileData } = json as {
    payload: any
    chatImages: any[]
    selectedPlugin: string
    fileData?: { fileName: string; fileContent: string }[]
  }

  const freePlugins: PluginID[] = [
    PluginID.CVE_MAP,
    PluginID.SUBDOMAIN_FINDER,
    PluginID.WAF_DETECTOR,
    PluginID.WHOIS_LOOKUP
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

    const terminalPlugins = [
      PluginID.SQLI_EXPLOITER,
      PluginID.SSL_SCANNER,
      PluginID.DNS_SCANNER,
      PluginID.PORT_SCANNER,
      PluginID.WAF_DETECTOR,
      PluginID.WHOIS_LOOKUP,
      PluginID.SUBDOMAIN_FINDER,
      PluginID.CVE_MAP
    ]

    if (terminalPlugins.includes(selectedPlugin as PluginID)) {
      return await commandGeneratorHandler({
        userID: profile.user_id,
        profile_context: profile.profile_context,
        messages: formattedMessages,
        pluginID: selectedPlugin as PluginID
      })
    }
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
