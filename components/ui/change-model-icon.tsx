import { FC, HTMLAttributes, useMemo, useState } from "react"
import { IconBolt, IconChevronDown } from "@tabler/icons-react"
import { WithTooltip } from "../ui/with-tooltip"
import { GPT4o } from "@/lib/models/llm/openai-llm-list"
import React from "react"
import { LLMID } from "@/types"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "../ui/dropdown-menu"

import { ModelIcon } from "../models/model-icon"
import { Sparkle, Sparkles } from "lucide-react"

interface ChangeModelIconProps {
  currentModel: string
  onChangeModel: (model: string) => void
  isMobile: boolean
}

const getModelDisplayName = (modelId: string): string => {
  switch (modelId) {
    case GPT4o.modelId:
      return "4o"
    case "mistral-medium":
      return "3.5"
    case "mistral-large":
      return "4"
    default:
      return modelId
  }
}

export const ChangeModelIcon: FC<ChangeModelIconProps> = ({
  currentModel,
  onChangeModel,
  isMobile
}) => {
  const ICON_SIZE = isMobile ? 22 : 20
  const [isHovered, setIsHovered] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const displayName = useMemo(
    () => getModelDisplayName(currentModel),
    [currentModel]
  )

  const handleModelChange = (model: string) => {
    onChangeModel(model)
    setIsDropdownOpen(false)
  }

  const getClassNames = (
    base: string,
    condition: boolean,
    trueClass: string,
    falseClass: string
  ) => `${base} ${condition ? trueClass : falseClass}`

  const shouldShowDetails =
    (isHovered || isDropdownOpen) && (!isMobile || isDropdownOpen)

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <WithTooltip
        delayDuration={0}
        side="bottom"
        display={<div>Change model</div>}
        trigger={
          <DropdownMenu onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <div className="relative flex cursor-pointer items-center hover:opacity-50">
                <LocalModelIcon
                  modelId={currentModel as LLMID}
                  height={ICON_SIZE}
                  width={ICON_SIZE}
                />
                <div className="relative flex items-center">
                  <span
                    className={getClassNames(
                      "absolute left-full ml-1 text-sm transition-all duration-500",
                      shouldShowDetails,
                      "opacity-100 translate-x-0",
                      "opacity-0 -translate-x-4"
                    )}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {displayName}
                  </span>
                  <IconChevronDown
                    className={getClassNames(
                      "absolute left-full transition-all duration-500",
                      shouldShowDetails,
                      "opacity-100",
                      "opacity-50"
                    )}
                    size={16}
                    style={{
                      transform: `translateX(${shouldShowDetails ? displayName.length * 0.4 + 0.5 : 0}rem)`
                    }}
                  />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top">
              {[
                { id: GPT4o.modelId, name: "GPT-4o" },
                { id: "mistral-large", name: "PGPT-Large" },
                { id: "mistral-medium", name: "PGPT-Small" }
              ].map(({ id, name }) => (
                <DropdownMenuItem
                  key={id}
                  onSelect={() => handleModelChange(id)}
                  className="text-base"
                >
                  <ModelIcon
                    modelId={id as LLMID}
                    height={18}
                    width={18}
                    className="mr-2"
                  />{" "}
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
    </div>
  )
}

interface LocalModelIconProps extends HTMLAttributes<HTMLDivElement> {
  modelId: LLMID | "custom"
  height: number
  width: number
}

const LocalModelIcon: FC<LocalModelIconProps> = ({
  modelId,
  height,
  width,
  ...props
}) => {
  const IconComponent =
    {
      [GPT4o.modelId]: Sparkles,
      "mistral-medium": IconBolt,
      "mistral-large": Sparkle
    }[modelId as LLMID] || Sparkles

  return <IconComponent size={width} />
}
