import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { PentestGPTContext } from "@/context/context"
import { deleteChat } from "@/db/chats"
import useHotkey from "@/lib/hooks/use-hotkey"
import { Tables } from "@/supabase/types"
import { IconTrash } from "@tabler/icons-react"
import { FC, useContext, useRef, useState } from "react"

interface DeleteChatProps {
  chat: Tables<"chats">
}

export const DeleteChat: FC<DeleteChatProps> = ({ chat }) => {
  useHotkey("Backspace", () => setShowChatDialog(true))
  const { setChats } = useContext(PentestGPTContext)
  const { handleNewChat } = useChatHandler()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [showChatDialog, setShowChatDialog] = useState(false)

  const handleDeleteChat = async () => {
    await deleteChat(chat.id)

    setChats(prevState => prevState.filter(c => c.id !== chat.id))

    setShowChatDialog(false)

    handleNewChat()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  return (
    <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
      <DialogTrigger asChild>
        <div className="w-full cursor-pointer">
          <div className="text-error flex items-center p-3 hover:opacity-50">
            <IconTrash className="mr-2" size={20} />
            <span>Delete</span>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Delete Chat?</DialogTitle>

          <DialogDescription>
            <br />
            This will delete &quot;{chat.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowChatDialog(false)}>
            Cancel
          </Button>
          <Button
            ref={buttonRef}
            variant="destructive"
            onClick={handleDeleteChat}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
