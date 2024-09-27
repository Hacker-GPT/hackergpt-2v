import { GPT4o } from "@/lib/models/llm/openai-llm-list"
import { toast } from "sonner"

export const handleFileUpload = (
  files: File[],
  chatSettings: any,
  setShowConfirmationDialog: (show: boolean) => void,
  setPendingFiles: (files: File[]) => void,
  handleSelectDeviceFile: (file: File) => void
) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"]
  const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv"]
  const supportedExtensions = [
    "csv",
    "json",
    "md",
    "pdf",
    "txt",
    "html",
    "htm",
    ...imageExtensions
  ]

  const unsupportedFiles: File[] = []

  files.forEach(file => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""

    // if (
    //   imageExtensions.includes(fileExtension) &&
    //   chatSettings?.model !== GPT4o.modelId
    // ) {
    //   toast.error(
    //     `${file.name}: Image files are only supported by GPT-4 for now.`
    //   )
    if (videoExtensions.includes(fileExtension)) {
      toast.error(`${file.name}: Video files are not supported yet.`)
    } else if (fileExtension && !supportedExtensions.includes(fileExtension)) {
      unsupportedFiles.push(file)
    } else {
      handleSelectDeviceFile(file)
    }
  })

  if (unsupportedFiles.length > 0) {
    setPendingFiles(unsupportedFiles)
    setShowConfirmationDialog(true)
  }
}
