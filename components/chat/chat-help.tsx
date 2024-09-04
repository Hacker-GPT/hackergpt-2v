import useHotkey from "@/lib/hooks/use-hotkey"
import {
  IconBrandGithub,
  IconBrandX,
  IconQuestionMark
} from "@tabler/icons-react"
import Link from "next/link"
import { FC, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"

interface ChatHelpProps {}

export const ChatHelp: FC<ChatHelpProps> = ({}) => {
  useHotkey("/", () => setIsOpen(prevState => !prevState))

  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <IconQuestionMark className="bg-primary text-secondary size-[20px] cursor-pointer rounded-full p-0.5 opacity-60 hover:opacity-50 lg:size-[20px]" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Link
              className="cursor-pointer hover:opacity-50"
              href="https://x.com/PentestGPT"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandX />
            </Link>

            <Link
              className="cursor-pointer hover:opacity-50"
              href="https://github.com/hackerai-tech/PentestGPT"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandGithub />
            </Link>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="flex justify-center py-2">
          <div className="cursor-text select-text text-sm opacity-60">
            contact@hackerai.co
          </div>
        </div>

        <DropdownMenuItem className="flex justify-between">
          <div>Show Help</div>
          <div className="flex opacity-60">
            <div className="min-w-[30px] rounded border p-1 text-center">⌘</div>
            <div className="min-w-[30px] rounded border p-1 text-center">
              Shift
            </div>
            <div className="min-w-[30px] rounded border p-1 text-center">/</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex w-[300px] justify-between">
          <div>New Chat</div>
          <div className="flex opacity-60">
            <div className="min-w-[30px] rounded border p-1 text-center">⌘</div>
            <div className="min-w-[30px] rounded border p-1 text-center">
              Shift
            </div>
            <div className="min-w-[30px] rounded border p-1 text-center">O</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex justify-between">
          <div>Focus Chat</div>
          <div className="flex opacity-60">
            <div className="min-w-[30px] rounded border p-1 text-center">⌘</div>
            <div className="min-w-[30px] rounded border p-1 text-center">
              Shift
            </div>
            <div className="min-w-[30px] rounded border p-1 text-center">L</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex justify-between">
          <div>Toggle Files</div>
          <div className="flex opacity-60">
            <div className="min-w-[30px] rounded border p-1 text-center">⌘</div>
            <div className="min-w-[30px] rounded border p-1 text-center">
              Shift
            </div>
            <div className="min-w-[30px] rounded border p-1 text-center">F</div>
          </div>
        </DropdownMenuItem>

        {/* <DropdownMenuItem className="flex justify-between">
          <div>Toggle Retrieval</div>
          <div className="flex opacity-60">
            <div className="min-w-[30px] rounded border-[1px] p-1 text-center">
              ⌘
            </div>
            <div className="min-w-[30px] rounded border-[1px] p-1 text-center">
              Shift
            </div>
            <div className="min-w-[30px] rounded border-[1px] p-1 text-center">
              E
            </div>
          </div>
        </DropdownMenuItem> */}

        <DropdownMenuItem className="flex justify-between">
          <div>Open Settings</div>
          <div className="flex opacity-60">
            <div className="min-w-[30px] rounded border p-1 text-center">⌘</div>
            <div className="min-w-[30px] rounded border p-1 text-center">
              Shift
            </div>
            <div className="min-w-[30px] rounded border p-1 text-center">I</div>
          </div>
        </DropdownMenuItem>

        {/* <DropdownMenuItem className="flex justify-between">
          <div>Open Quick Settings</div>
          <div className="flex opacity-60">
            <div className="min-w-[30px] rounded border-[1px] p-1 text-center">
              ⌘
            </div>
            <div className="min-w-[30px] rounded border-[1px] p-1 text-center">
              Shift
            </div>
            <div className="min-w-[30px] rounded border-[1px] p-1 text-center">
              P
            </div>
          </div>
        </DropdownMenuItem> */}

        <DropdownMenuItem className="flex justify-between">
          <div>Toggle Sidebar</div>
          <div className="flex opacity-60">
            <div className="min-w-[30px] rounded border p-1 text-center">⌘</div>
            <div className="min-w-[30px] rounded border p-1 text-center">
              Shift
            </div>
            <div className="min-w-[30px] rounded border p-1 text-center">S</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
