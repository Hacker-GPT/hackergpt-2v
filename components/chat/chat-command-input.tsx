import { PentestGPTContext } from "@/context/context"
import { FC, useContext } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { FilePicker } from "./file-picker"

interface ChatCommandInputProps {}

export const ChatCommandInput: FC<ChatCommandInputProps> = ({}) => {
  const {
    newMessageFiles,
    chatFiles,
    isAtPickerOpen,
    setIsAtPickerOpen,
    atCommand,
    focusFile
  } = useContext(PentestGPTContext)

  const { handleSelectUserFile } = usePromptAndCommand()

  return (
    <>
      <div>
        <FilePicker
          isOpen={isAtPickerOpen}
          searchQuery={atCommand}
          onOpenChange={setIsAtPickerOpen}
          selectedFileIds={[...newMessageFiles, ...chatFiles].map(
            file => file.id
          )}
          onSelectFile={handleSelectUserFile}
          isFocused={focusFile}
        />
      </div>
    </>
  )
}
