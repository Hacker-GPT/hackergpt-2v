"use client"

import { PentestGPTContext } from "@/context/context"
import { getProfileByUserId, updateProfile } from "@/db/profile"
import { getHomeWorkspaceByUserId } from "@/db/workspaces"
import { supabase } from "@/lib/supabase/browser-client"
import { TablesUpdate } from "@/supabase/types"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"
import { fetchHostedModels } from "@/lib/models/fetch-models"

export default function SetupPage() {
  const { setProfile, setAvailableHostedModels } = useContext(PentestGPTContext)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const user = session.user
      const profile = await getProfileByUserId(user.id)
      setProfile(profile)

      if (!profile.has_onboarded) {
        const updateProfilePayload: TablesUpdate<"profiles"> = {
          ...profile,
          has_onboarded: true
        }
        await updateProfile(profile.id, updateProfilePayload)
      }

      const data = await fetchHostedModels()
      if (data) {
        setAvailableHostedModels(data.hostedModels)
      }

      const homeWorkspaceId = await getHomeWorkspaceByUserId(user.id)
      router.push(`/${homeWorkspaceId}/chat`)
    })()
  }, [router, setProfile, setAvailableHostedModels])

  return null
}
