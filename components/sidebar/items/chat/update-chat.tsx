import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PentestGPTContext } from "@/context/context"
import { updateChat } from "@/db/chats"
import { Tables } from "@/supabase/types"
import { IconEdit } from "@tabler/icons-react"
import { FC, useContext, useRef, useState } from "react"

interface UpdateChatProps {
  chat: Tables<"chats">
}

export const UpdateChat: FC<UpdateChatProps> = ({ chat }) => {
  const { setChats } = useContext(PentestGPTContext)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [showChatDialog, setShowChatDialog] = useState(false)
  const [name, setName] = useState(chat.name)

  const handleUpdateChat = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const updatedChat = await updateChat(chat.id, { name })
    setChats(prevState =>
      prevState.map(c => (c.id === chat.id ? updatedChat : c))
    )
    setShowChatDialog(false)
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
          <div className="flex items-center p-3 hover:opacity-50">
            <IconEdit size={20} className="mr-2" />
            <span>Rename</span>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <Label>Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowChatDialog(false)}>
            Cancel
          </Button>
          <Button ref={buttonRef} onClick={handleUpdateChat}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
