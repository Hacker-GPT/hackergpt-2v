import { ContentType } from "@/types"
import {
  IconFile,
  IconLayoutSidebarRightExpand,
  IconMessage,
  IconPuzzle
} from "@tabler/icons-react"
import React, { FC, useContext, useState } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { Settings } from "../utility/settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { PentestGPTContext } from "@/context/context"
import PluginStoreModal from "@/components/chat/plugin-store"
import { availablePlugins } from "@/lib/plugins/available-plugins"
import {
  usePluginContext,
  ActionTypes,
  getInstalledPlugins
} from "@/components/chat/chat-hooks/PluginProvider"
import { useRouter } from "next/navigation"

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
  handleToggleSidebar: () => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange,
  handleToggleSidebar
}) => {
  const router = useRouter()
  const { subscription } = useContext(PentestGPTContext)
  const [isPluginStoreModalOpen, setIsPluginStoreModalOpen] = useState(false)
  const { state: pluginState, dispatch: pluginDispatch } = usePluginContext()

  const installPlugin = (pluginId: number) => {
    pluginDispatch({
      type: ActionTypes.INSTALL_PLUGIN,
      payload: pluginId
    })
  }

  const uninstallPlugin = (pluginId: number) => {
    pluginDispatch({
      type: ActionTypes.UNINSTALL_PLUGIN,
      payload: pluginId
    })
  }

  const installedPlugins = getInstalledPlugins(pluginState.installedPluginIds)

  const updatedAvailablePlugins = availablePlugins.map(plugin => ({
    ...plugin,
    isInstalled: installedPlugins.some(p => p.id === plugin.id)
  }))

  return (
    <div className="flex flex-col justify-between border-r-2 pb-5">
      <PluginStoreModal
        isOpen={isPluginStoreModalOpen}
        setIsOpen={setIsPluginStoreModalOpen}
        pluginsData={updatedAvailablePlugins}
        installPlugin={installPlugin}
        uninstallPlugin={uninstallPlugin}
      />
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

        {subscription && (
          <SidebarSwitchItem
            icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
            contentType="files"
            onContentTypeChange={onContentTypeChange}
          />
        )}

        {/* Imitating SidebarSwitchItem but without contentType */}
        <button
          onClick={() => setIsPluginStoreModalOpen(!isPluginStoreModalOpen)}
          className={
            "ring-offset-background focus-visible:ring-ring data-[state=active]:text-foreground inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all hover:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
          }
        >
          <IconPuzzle size={SIDEBAR_ICON_SIZE} />
        </button>
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        <WithTooltip display={<div>Settings</div>} trigger={<Settings />} />
      </div>
    </div>
  )
}
