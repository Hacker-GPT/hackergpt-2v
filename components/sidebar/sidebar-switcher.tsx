import { ContentType } from "@/types"
import {
  IconFile,
  IconLayoutSidebarRightExpand,
  IconMessage,
  IconPuzzle
} from "@tabler/icons-react"
import React, { FC, useContext } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { Settings } from "../utility/settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { PentestGPTContext } from "@/context/context"

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
  handleToggleSidebar: () => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange,
  handleToggleSidebar
}) => {
  const { isPremiumSubscription, contentType } = useContext(PentestGPTContext)

  return (
    <div
      className={`flex flex-col justify-between ${contentType !== "gpts" && "border-r-2"} pb-5`}
    >
      <TabsList
        className="bg-tertiary grid h-[440px] grid-rows-7"
        style={{ marginTop: "-5px" }}
      >
        <button
          onClick={handleToggleSidebar}
          className={
            "ring-offset-background focus-visible:ring-ring data-[state=active]:text-foreground inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all hover:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
          }
        >
          <IconLayoutSidebarRightExpand size={SIDEBAR_ICON_SIZE} />
        </button>

        <SidebarSwitchItem
          icon={<IconMessage size={SIDEBAR_ICON_SIZE} />}
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />

        {isPremiumSubscription && (
          <SidebarSwitchItem
            icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
            contentType="files"
            onContentTypeChange={onContentTypeChange}
          />
        )}

        <SidebarSwitchItem
          icon={<IconPuzzle size={SIDEBAR_ICON_SIZE} />}
          contentType="gpts"
          onContentTypeChange={onContentTypeChange}
          display="Plugins"
        />
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        <WithTooltip display={<div>Settings</div>} trigger={<Settings />} />
      </div>
    </div>
  )
}
