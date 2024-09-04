import { PentestGPTContext } from "@/context/context"
import { LLM, LLMID } from "@/types"
import { IconCircle, IconCircleCheck, IconLock } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ModelOption } from "./model-option"
import { useRouter } from "next/navigation"

interface ModelSelectProps {
  selectedModelId: string
  onSelectModel: (modelId: LLMID) => void
}

export const ModelSelect: FC<ModelSelectProps> = ({
  selectedModelId,
  onSelectModel
}) => {
  const router = useRouter()
  const { subscription, profile, availableHostedModels } =
    useContext(PentestGPTContext)
  const isPremium = subscription !== null

  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"hosted" | "local">("hosted")

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleSelectModel = (modelId: LLMID) => {
    onSelectModel(modelId)
    setIsOpen(false)
  }

  const allModels = [...availableHostedModels]

  const sortedModels = [...allModels].sort((a, b) => {
    // Prioritize 'mistral' to appear first
    if (a.provider === "mistral" && b.provider !== "mistral") return -1
    if (b.provider === "mistral" && a.provider !== "mistral") return 1

    // Then prioritize 'openai'
    if (a.provider === "openai" && b.provider !== "openai") return -1
    if (b.provider === "openai" && a.provider !== "openai") return 1

    // Finally, sort alphabetically by provider name, or any other criteria you see fit
    return (
      a.provider.localeCompare(b.provider) ||
      a.modelName.localeCompare(b.modelName)
    )
  })

  // Group the sorted models by provider
  const groupedSortedModels = sortedModels.reduce<Record<string, LLM[]>>(
    (groups, model) => {
      const key = model.provider
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(model)
      return groups
    },
    {}
  )

  if (!profile) return null

  const handleUpgradeClick = () => {
    router.push("/upgrade")
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger
        className="bg-background w-full justify-start"
        asChild
        disabled={allModels.length === 0}
      >
        <div className="max-h-[300px] overflow-auto">
          {Object.entries(groupedSortedModels).map(([provider, models]) => {
            const filteredModels = models
              .filter(model => model.provider !== "openrouter")
              .filter(model => {
                if (tab === "hosted") return true
                if (tab === "local") return false
                if (tab === "openrouter") return model.provider === "openrouter"
              })
              .filter(model =>
                model.modelName.toLowerCase().includes(search.toLowerCase())
              )

            if (filteredModels.length === 0) return null

            return (
              <div key={provider}>
                <div className="">
                  {filteredModels.map(model => (
                    <div
                      key={model.modelId}
                      className="hover:bg-accent flex w-full cursor-not-allowed items-center justify-between space-x-3 truncate rounded p-1"
                      onClick={() => {
                        if (!isPremium && model.provider === "openai") {
                          handleUpgradeClick() // Show dialog for non-premium users trying to select an OpenAI model
                        } else if (
                          model.modelId === "mistral-large" &&
                          !isPremium
                        ) {
                          handleUpgradeClick() // Show dialog for non-premium users trying to select a Mistral Large model
                        } else {
                          handleSelectModel(model.modelId) // Allow selection for premium users or non-OpenAI models
                        }
                      }}
                    >
                      <ModelOption model={model} onSelect={() => {}} />
                      {selectedModelId === model.modelId ? (
                        <IconCircleCheck className="" size={28} />
                      ) : !isPremium &&
                        (model.provider === "openai" ||
                          model.modelId === "mistral-large") ? (
                        <IconLock className="opacity-50" size={28} />
                      ) : (
                        <IconCircle className="opacity-50" size={28} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </DropdownMenuTrigger>
    </DropdownMenu>
  )
}
