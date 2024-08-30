import React, { useContext, useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContentTop,
  DropdownMenuItem
} from "../ui/dropdown-menu"
import {
  IconChevronDown,
  IconLock,
  IconBuildingStore
} from "@tabler/icons-react"
import PluginStoreModal from "./plugin-store"
import { PluginID, PluginSummary } from "@/types/plugins"
import { PentestGPTContext } from "@/context/context"
import {
  usePluginContext,
  ActionTypes,
  getInstalledPlugins
} from "./chat-hooks/PluginProvider"
import { availablePlugins } from "@/lib/plugins/available-plugins"
import { TransitionedDialog } from "../ui/transitioned-dialog"
import { DialogPanel } from "@headlessui/react"
import { useRouter } from "next/navigation"

interface PluginSelectorProps {
  onPluginSelect: (type: string) => void
}

const PluginSelector: React.FC<PluginSelectorProps> = ({ onPluginSelect }) => {
  const { subscription, setSelectedPlugin, selectedPlugin, chatSettings } =
    useContext(PentestGPTContext)
  const [selectedPluginName, setSelectedPluginName] =
    useState("No plugin selected")
  const [isPluginStoreModalOpen, setIsPluginStoreModalOpen] = useState(false)
  const [showLockedPluginDialog, setShowLockedPluginDialog] = useState(false)
  const [currentPlugin, setCurrentPlugin] = useState<PluginSummary | null>(null)
  const { state: pluginState, dispatch: pluginDispatch } = usePluginContext()

  const router = useRouter()

  const defaultPluginIds = [0, 99]

  const isPremium = subscription !== null

  const handleUpgradeToPlus = () => {
    setShowLockedPluginDialog(false)
    router.push("/upgrade")
  }

  useEffect(() => {
    const foundPlugin = availablePlugins.find(
      plugin => plugin.value === selectedPlugin
    )
    if (foundPlugin) {
      setSelectedPluginName(foundPlugin.selectorName)
    }

    // Check if GPT-4 is selected and ENHANCE_SEARCH is active
    if (
      chatSettings?.model.includes("gpt-4-turbo-preview") &&
      selectedPlugin === PluginID.ENHANCED_SEARCH
    ) {
      setSelectedPlugin(PluginID.NONE)
      setSelectedPluginName("No plugin selected")
      onPluginSelect(PluginID.NONE)
    }
  }, [selectedPlugin, chatSettings?.model])

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

  const selectorPlugins = updatedAvailablePlugins.filter(
    plugin =>
      (plugin.isInstalled || defaultPluginIds.includes(plugin.id)) &&
      !(
        chatSettings?.model.includes("gpt-4-turbo-preview") &&
        plugin.value === PluginID.ENHANCED_SEARCH
      )
  )

  const renderPluginOptions = () => {
    return selectorPlugins.map(plugin => (
      <DropdownMenuItem
        key={plugin.id}
        onSelect={() => {
          if (!plugin.isPremium || isPremium) {
            if (plugin.value === PluginID.PLUGINS_STORE) {
              setIsPluginStoreModalOpen(true)
            } else {
              onPluginSelect(plugin.value)
              setSelectedPluginName(plugin.selectorName)
              setSelectedPlugin(plugin.value)
            }
          } else {
            setCurrentPlugin(plugin)
            setShowLockedPluginDialog(true)
          }
        }}
        className={`flex items-center justify-between ${plugin.isPremium && !isPremium ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span>{plugin.selectorName}</span>
        {plugin.isPremium && !isPremium ? (
          <IconLock size={18} className="ml-2" />
        ) : plugin.value === PluginID.PLUGINS_STORE ? (
          <IconBuildingStore size={18} className="ml-2" />
        ) : null}
      </DropdownMenuItem>
    ))
  }

  return (
    <div className="flex items-center justify-start space-x-4">
      <span className="text-sm font-medium">Plugins</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center space-x-2 rounded border border-gray-300 p-2 hover:cursor-pointer">
            <span className="text-sm">{selectedPluginName}</span>
            <button className="flex items-center border-none bg-transparent p-0">
              <IconChevronDown size={18} />
            </button>
          </div>
        </DropdownMenuTrigger>
        <div className="flex">
          <DropdownMenuContentTop
            side="top"
            className="bg-secondary mx-14 mb-3 sm:mx-0"
          >
            {renderPluginOptions()}
          </DropdownMenuContentTop>
        </div>
      </DropdownMenu>
      <PluginStoreModal
        isOpen={isPluginStoreModalOpen}
        setIsOpen={setIsPluginStoreModalOpen}
        pluginsData={updatedAvailablePlugins}
        installPlugin={installPlugin}
        uninstallPlugin={uninstallPlugin}
      />
      <LockedPluginModal
        isOpen={showLockedPluginDialog}
        currentPlugin={currentPlugin}
        handleCancelUpgrade={() => setShowLockedPluginDialog(false)}
        handleUpgradeToPlus={handleUpgradeToPlus}
        isPremium={isPremium}
      />
    </div>
  )
}

const LockedPluginModal = ({
  isOpen,
  currentPlugin,
  handleCancelUpgrade,
  handleUpgradeToPlus,
  isPremium
}: {
  isOpen: boolean
  currentPlugin: any
  handleCancelUpgrade: () => void
  handleUpgradeToPlus: () => void
  isPremium: boolean
}) => {
  return (
    <TransitionedDialog isOpen={isOpen} onClose={handleCancelUpgrade}>
      <DialogPanel className="bg-popover w-full max-w-lg rounded-md p-10 text-center">
        {!isPremium && (
          <>
            <p>
              The <b>{currentPlugin?.name}</b> plugin is only accessible with a{" "}
              <b>Pro</b> plan.
            </p>
            <p className="mt-2">Ready to upgrade for access?</p>
          </>
        )}
        <div className="mt-5 flex justify-center gap-5">
          <button
            onClick={handleCancelUpgrade}
            className="ring-offset-background focus-visible:ring-ring bg-input text-primary hover:bg-input/90 flex h-[36px] items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>
          {!isPremium && (
            <button
              onClick={handleUpgradeToPlus}
              className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 flex h-[36px] items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Upgrade
            </button>
          )}
        </div>
      </DialogPanel>
    </TransitionedDialog>
  )
}

export default PluginSelector
