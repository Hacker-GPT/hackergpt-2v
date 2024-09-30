import { PentestGPTContext } from "@/context/context"
import { PROFILE_CONTEXT_MAX } from "@/db/limits"
import { updateProfile } from "@/db/profile"
import { LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
import { supabase } from "@/lib/supabase/browser-client"
import {
  IconCreditCard,
  IconDatabaseCog,
  IconSettings,
  IconUserHeart,
  IconX
} from "@tabler/icons-react"
import { DialogPanel, DialogTitle } from "@headlessui/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FC, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { TransitionedDialog } from "../ui/transitioned-dialog"
import { Button } from "../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { SubscriptionTab } from "./profile-tabs/subscription-tab"
import { deleteAllChats } from "@/db/chats"
import { PersonalizationTab } from "./profile-tabs/personalization-tab"
import { ProfileTab } from "./profile-tabs/profile-tab"
import { DeleteAllChatsDialog } from "./delete-all-chats-dialog"
import { DataControlsTab } from "./profile-tabs/data-controls-tab"

interface SettingsProps {}

export const Settings: FC<SettingsProps> = () => {
  const { profile, setProfile, envKeyMap, setAvailableHostedModels, isMobile } =
    useContext(PentestGPTContext)

  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [profileInstructions, setProfileInstructions] = useState(
    profile?.profile_context || ""
  )
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const fetchUserEmail = async () => {
      const user = await supabase.auth.getUser()
      setUserEmail(user?.data.user?.email || "Not available")
    }
    fetchUserEmail()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const handleSave = async () => {
    if (!profile) return

    const isOverLimit = profileInstructions.length > PROFILE_CONTEXT_MAX
    if (isOverLimit) {
      toast.error(
        `Profile instructions exceed the limit of ${PROFILE_CONTEXT_MAX} characters.`
      )
      return
    }

    const updatedProfile = await updateProfile(profile.id, {
      ...profile,
      profile_context: profileInstructions
    })

    setProfile(updatedProfile)

    toast.success("Profile updated!", { duration: 2000 })

    const providers = ["openai", "mistral", "openrouter"]

    providers.forEach(async provider => {
      let providerKey: keyof typeof profile =
        `${provider}_api_key` as keyof typeof profile

      const models = LLM_LIST_MAP[provider]
      const envKeyActive = envKeyMap[provider]

      if (!envKeyActive) {
        const hasApiKey = !!updatedProfile[providerKey]

        if (hasApiKey && Array.isArray(models)) {
          setAvailableHostedModels(prev => {
            const newModels = models.filter(
              model =>
                !prev.some(prevModel => prevModel.modelId === model.modelId)
            )
            return [...prev, ...newModels]
          })
        } else if (!hasApiKey && Array.isArray(models)) {
          setAvailableHostedModels(prev =>
            prev.filter(model => !models.includes(model))
          )
        }
      }
    })

    setIsOpen(false)
  }

  const handleDeleteAllChats = () => {
    setIsOpen(false)
    setShowConfirmationDialog(true)
  }

  const handleConfirm = async () => {
    setShowConfirmationDialog(false)
    const deleted = await deleteAllChats(profile?.user_id || "")
    if (deleted) {
      window.location.reload()
    } else {
      toast.error("Failed to delete all chats")
    }
  }

  const handleCancelDelete = () => {
    setShowConfirmationDialog(false)
    setIsOpen(true)
  }

  const tabItems = [
    { value: "profile", icon: IconSettings, label: "General" },
    { value: "personalization", icon: IconUserHeart, label: "Personalization" },
    { value: "subscription", icon: IconCreditCard, label: "Subscription" },
    { value: "data-controls", icon: IconDatabaseCog, label: "Data Controls" }
  ]

  const tabListClass = isMobile
    ? "mb-6 flex flex-wrap gap-2"
    : "mr-8 mt-6 w-1/4 flex-col space-y-2 pt-10"

  const tabTriggerClass = `
    ${isMobile ? "flex-shrink flex-grow-0 min-w-0" : "w-full justify-start"}
    flex items-center whitespace-nowrap px-2 py-2
    data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=inactive]:text-primary
  `

  if (!profile) return null

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        {profile.image_url ? (
          <Image
            className="mt-2 size-[34px] cursor-pointer rounded hover:opacity-50"
            src={profile.image_url + "?" + new Date().getTime()}
            height={34}
            width={34}
            alt="Profile"
          />
        ) : (
          <IconSettings size={SIDEBAR_ICON_SIZE} />
        )}
      </button>

      <TransitionedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DialogPanel
          className={`
          bg-popover overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all
          ${isMobile ? "" : "w-full max-w-3xl md:min-w-[700px]"}
          max-h-[90vh] overflow-y-auto
        `}
        >
          <div className="mb-4 flex items-center justify-between">
            <DialogTitle className="text-xl font-medium leading-6">
              Settings
            </DialogTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-muted rounded-full p-2 transition-colors"
            >
              <IconX size={20} />
            </button>
          </div>

          <Tabs
            defaultValue="profile"
            className={`${isMobile ? "mt-4 flex flex-col" : "mt-10 flex"}`}
            onValueChange={setActiveTab}
          >
            <TabsList className={`${tabListClass} bg-transparent`}>
              {tabItems.map(({ value, icon: Icon, label }, index) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`
                    ${tabTriggerClass}
                    ${isMobile && index === tabItems.length - 1 && tabItems.length % 2 !== 0 ? "" : ""}
                  `}
                >
                  <Icon className="mr-2" size={20} />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div
              className={`${isMobile ? "mt-6" : "-mt-7"} mb-4 min-h-[300px] w-full`}
            >
              <TabsContent value="profile">
                <ProfileTab
                  handleDeleteAllChats={handleDeleteAllChats}
                  handleSignOut={handleSignOut}
                />
              </TabsContent>

              <TabsContent value="subscription">
                <SubscriptionTab
                  value="subscription"
                  userEmail={userEmail}
                  isMobile={isMobile}
                />
              </TabsContent>

              <TabsContent value="personalization">
                <PersonalizationTab
                  value="personalization"
                  profileInstructions={profileInstructions}
                  setProfileInstructions={setProfileInstructions}
                />
              </TabsContent>

              <TabsContent value="data-controls">
                <DataControlsTab value="data-controls" />
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-6 flex h-[38px] items-center justify-end">
            {activeTab === "personalization" ? (
              <Button onClick={handleSave}>Save</Button>
            ) : (
              <div className="w-[64px]"></div>
            )}
          </div>
        </DialogPanel>
      </TransitionedDialog>

      <DeleteAllChatsDialog
        isOpen={showConfirmationDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirm}
      />
    </>
  )
}
