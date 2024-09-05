import { PentestGPTContext } from "@/context/context"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { IconChevronDown } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { ChatSettingsForm } from "../ui/chat-settings-form"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface ChatSettingsProps {}

export const ChatSettings: FC<ChatSettingsProps> = ({}) => {
  useHotkey("i", () => handleClick())

  const { chatSettings, setChatSettings, isMobile } =
    useContext(PentestGPTContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (buttonRef.current) {
      buttonRef.current.click()
    }
  }

  useEffect(() => {
    if (!chatSettings) return

    setChatSettings({
      ...chatSettings
    })
  }, [chatSettings?.model])

  if (!chatSettings) return null

  const fullModel = LLM_LIST.find(llm => llm.modelId === chatSettings.model)

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          ref={buttonRef}
          className="flex items-center space-x-1"
          variant="ghost"
        >
          <div className="text-xl">
            {fullModel?.modelName || chatSettings.model}
          </div>

          <IconChevronDown className="ml-1 mt-1" size={18} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="bg-background border-input relative flex max-h-[calc(100vh-60px)] w-[300px] flex-col space-y-4 overflow-auto rounded-lg border-2 p-3 dark:border-none"
        align={isMobile ? "center" : "start"}
      >
        <ChatSettingsForm
          chatSettings={chatSettings}
          onChangeChatSettings={setChatSettings}
        />
      </PopoverContent>
    </Popover>
  )
}
