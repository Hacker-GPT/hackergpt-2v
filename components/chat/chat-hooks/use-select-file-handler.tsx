import { PentestGPTContext } from "@/context/context"
import { createDocXFile, createFile } from "@/db/files"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import mammoth from "mammoth"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"

export const ACCEPTED_FILE_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/json",
  "text/markdown",
  "application/pdf",
  "text/plain",
  "text/html"
].join(",")

export const useSelectFileHandler = () => {
  const {
    selectedWorkspace,
    profile,
    chatSettings,
    setNewMessageImages,
    setNewMessageFiles,
    setShowFilesDisplay,
    setFiles,
    setUseRetrieval
  } = useContext(PentestGPTContext)

  const [filesToAccept, setFilesToAccept] = useState(ACCEPTED_FILE_TYPES)

  useEffect(() => {
    handleFilesToAccept()
  }, [chatSettings?.model])

  const handleFilesToAccept = () => {
    const model = chatSettings?.model
    const FULL_MODEL = LLM_LIST.find(llm => llm.modelId === model)

    if (!FULL_MODEL) return

    setFilesToAccept(
      FULL_MODEL.imageInput
        ? `${ACCEPTED_FILE_TYPES},image/*`
        : ACCEPTED_FILE_TYPES
    )
  }

  const handleSelectDeviceFile = async (file: File) => {
    if (!profile || !selectedWorkspace || !chatSettings) return

    setShowFilesDisplay(true)

    const loadingId = "loading-" + crypto.randomUUID()

    if (file) {
      let simplifiedFileType =
        file.type.split("/")[0] === "text" ? "text" : file.type.split("/")[1]

      let reader = new FileReader()

      if (file.type.includes("image")) {
        reader.readAsDataURL(file)
      } else if (
        ACCEPTED_FILE_TYPES.split(",").includes(file.type) ||
        file.type.split("/")[0] === "text"
      ) {
        if (simplifiedFileType.includes("vnd.adobe.pdf")) {
          simplifiedFileType = "pdf"
        } else if (
          simplifiedFileType.includes(
            "vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) ||
          simplifiedFileType.includes("docx")
        ) {
          simplifiedFileType = "docx"
        }

        setNewMessageFiles(prev => [
          ...prev,
          {
            id: loadingId,
            name: file.name,
            type: simplifiedFileType,
            file: file
          }
        ])

        // Handle docx files
        if (
          file.type.includes(
            "vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) ||
          file.type.includes("docx")
        ) {
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.extractRawText({
            arrayBuffer
          })

          const createdFile = await createDocXFile(
            result.value,
            file,
            {
              user_id: profile.user_id,
              description: "",
              file_path: "",
              name: file.name,
              size: file.size,
              tokens: 0,
              type: simplifiedFileType
            },
            selectedWorkspace.id
          )

          if (!createdFile) {
            toast.error(
              "You reached the maximum amount of files! Please delete some in the files tab."
            )
            setNewMessageFiles(prev => prev.filter(f => f.id !== loadingId))
            return
          }

          setFiles(prev => [...prev, createdFile])

          setNewMessageFiles(prev =>
            prev.map(item =>
              item.id === loadingId
                ? {
                    id: createdFile.id,
                    name: createdFile.name,
                    type: createdFile.type,
                    file: file
                  }
                : item
            )
          )

          reader.onloadend = null

          return
        } else {
          // Use readAsArrayBuffer for PDFs and readAsText for other types
          file.type.includes("pdf")
            ? reader.readAsArrayBuffer(file)
            : reader.readAsText(file)
        }
      } else {
        // Read unsupported file as text
        reader.readAsText(file)
      }

      reader.onloadend = async function () {
        try {
          if (file.type.includes("image")) {
            // Create a temp url for the image file
            const imageUrl = URL.createObjectURL(file)

            // This is a temporary image for display purposes in the chat input
            setNewMessageImages(prev => [
              ...prev,
              {
                messageId: crypto.randomUUID(),
                path: "",
                base64: reader.result, // base64 image
                url: imageUrl,
                file
              }
            ])
          } else {
            let fileContent = reader.result as string

            // If the file was unsupported, transform it into a .txt file
            if (!ACCEPTED_FILE_TYPES.split(",").includes(file.type)) {
              simplifiedFileType = "txt"
              file = new File([fileContent], `${file.name}.txt`, {
                type: "text/plain"
              })

              // Add the transformed file to the preview
              setNewMessageFiles(prev => [
                ...prev,
                {
                  id: loadingId,
                  name: file.name,
                  type: simplifiedFileType,
                  file: file
                }
              ])
            }

            const createdFile = await createFile(
              file,
              {
                user_id: profile.user_id,
                description: "",
                file_path: "",
                name: file.name,
                size: file.size,
                tokens: 0,
                type: simplifiedFileType
              },
              selectedWorkspace.id
            )

            if (!createdFile) {
              toast.error(
                "You reached the maximum amount of files! Please delete some in the files tab."
              )

              setNewMessageFiles(prev =>
                prev.filter(file => file.id !== loadingId)
              )
              return
            }

            setFiles(prev => [...prev, createdFile])

            setNewMessageFiles(prev =>
              prev.map(item =>
                item.id === loadingId
                  ? {
                      id: createdFile.id,
                      name: createdFile.name,
                      type: createdFile.type,
                      file: file
                    }
                  : item
              )
            )

            setUseRetrieval(true)
          }
        } catch (error: any) {
          toast.error(`Failed to upload ${file.name}: ${error?.message}`, {
            duration: 10000
          })
          setNewMessageImages(prev =>
            prev.filter(img => img.messageId !== "temp")
          )
          setNewMessageFiles(prev => prev.filter(file => file.id !== loadingId))
        }
      }
    }
  }

  return {
    handleSelectDeviceFile,
    filesToAccept
  }
}
