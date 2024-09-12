"use client"

import { ChatHelp } from "@/components/chat/chat-help"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatSettings } from "@/components/chat/chat-settings"
import ChatStarters from "@/components/chat/chat-starters"
import { ChatUI } from "@/components/chat/chat-ui"
import { BrandLarge, BrandSmall } from "@/components/ui/brand"
import { PentestGPTContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useContext } from "react"
import { availablePlugins } from "@/lib/plugins/available-plugins"
import { ChatPluginInfo } from "@/components/chat/chat-plugin-info"

export default function ChatPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const { chatMessages, selectedPlugin, isMobile, showSidebar } =
    useContext(PentestGPTContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  const selectedPluginInfo =
    selectedPlugin && selectedPlugin !== "none"
      ? availablePlugins.find(plugin => plugin.value === selectedPlugin)
      : undefined

  return (
    <>
      {chatMessages.length === 0 ? (
        <div className="relative flex h-full flex-col items-center justify-center">
          <div
            className={`absolute left-1/2 -translate-x-1/2 ${isMobile && selectedPluginInfo ? "-translate-y-2/4" : "-translate-y-3/4"}`}
          >
            {selectedPluginInfo ? (
              <ChatPluginInfo pluginInfo={selectedPluginInfo} />
            ) : isMobile ? (
              <div className="mb-12">
                <BrandSmall />
              </div>
            ) : (
              <div className="">
                <BrandLarge />
              </div>
            )}
          </div>

          <div
            className={`flex max-h-[50px] min-h-[50px] w-full items-center justify-center font-bold sm:justify-start ${showSidebar ? "sm:pl-2" : "sm:pl-12"}`}
          >
            <div className="mt-2 max-w-[200px] truncate text-sm sm:max-w-[400px] sm:text-base md:max-w-[500px] lg:max-w-[600px] xl:w-[800px]">
              <ChatSettings />
            </div>
          </div>

          <div className="flex grow flex-col items-center justify-center" />

          <div
            className={`z-10 -mx-2 w-full min-w-[300px] items-end px-2 pb-1 sm:w-[600px] md:w-[650px] ${
              showSidebar ? "lg:w-[650px]" : "lg:w-[700px]"
            } xl:w-[800px]`}
          >
            <ChatStarters
              selectedPlugin={selectedPlugin}
              chatMessages={chatMessages}
            />
          </div>

          <div
            className={`z-10 w-screen items-end px-2 pb-3 pt-2 sm:w-[600px] sm:pb-8 md:w-[650px] md:min-w-[300px] ${
              showSidebar ? "lg:w-[650px]" : "lg:w-[700px]"
            } xl:w-[800px]`}
          >
            <ChatInput />
          </div>

          <div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">
            <ChatHelp />
          </div>
        </div>
      ) : (
        <ChatUI />
      )}
    </>
  )
}
