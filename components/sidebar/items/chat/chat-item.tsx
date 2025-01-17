import { PentestGPTContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { useParams } from "next/navigation"
import { FC, useContext, useRef, useState, useCallback } from "react"
import { DeleteChat } from "./delete-chat"
import { UpdateChat } from "./update-chat"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { IconDots, IconShare2 } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ShareChatButton } from "@/components/chat/chat-share-button"

interface ChatItemProps {
  chat: Tables<"chats">
}

export const ChatItem: FC<ChatItemProps> = ({ chat }) => {
  const {
    selectedChat,
    isMobile,
    setShowSidebar,
    contentType,
    setContentType
  } = useContext(PentestGPTContext)
  const { handleSelectChat } = useChatHandler()
  const params = useParams()
  const isActive = params.chatid === chat.id || selectedChat?.id === chat.id
  const itemRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = useCallback(() => {
    if (contentType === "tools") {
      setContentType("chats")
    }
    handleSelectChat(chat)
    if (isMobile) {
      setShowSidebar(false)
    }
  }, [
    handleSelectChat,
    chat,
    isMobile,
    setShowSidebar,
    contentType,
    setContentType
  ])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleDropdownTrigger = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsOpen(true)
  }, [])

  return (
    <div
      ref={itemRef}
      className={cn(
        "hover:bg-accent focus:bg-accent group flex w-full cursor-pointer items-center rounded p-2 hover:opacity-50 focus:outline-none",
        isActive && "bg-accent"
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      <div className="flex-1 truncate text-sm">{chat.name}</div>

      <div
        className={cn(
          "w-0 shrink-0 overflow-hidden",
          (isActive || isOpen) && "w-6",
          "group-hover:w-6"
        )}
      >
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button
              onClick={handleDropdownTrigger}
              className="flex size-6 items-center justify-center rounded"
            >
              <IconDots size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={5}
            className="py-2"
            onClick={e => e.stopPropagation()}
          >
            <ShareChatButton chat={chat}>
              <div className="w-full cursor-pointer">
                <div className="flex items-center p-3 hover:opacity-50">
                  <IconShare2 size={20} className="mr-2" />
                  <span>Share</span>
                </div>
              </div>
            </ShareChatButton>
            <UpdateChat chat={chat} onAction={handleCloseDropdown} />
            <DeleteChat chat={chat} onAction={handleCloseDropdown} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
