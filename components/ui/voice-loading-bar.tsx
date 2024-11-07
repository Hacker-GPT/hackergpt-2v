import React, { FC, memo } from "react"
import { IconLoader } from "@tabler/icons-react"

interface VoiceLoadingBarProps {
  isLoading: boolean
}

const VoiceLoadingBar: FC<VoiceLoadingBarProps> = ({ isLoading }) => {
  if (!isLoading) return null

  return (
    <div className="bg-secondary mt-3 flex min-h-[56px] items-center justify-center rounded-xl px-4 py-3">
      <IconLoader className="animate-spin text-gray-500" size={24} />
      <span className="ml-2 text-sm text-gray-500">Transcribing...</span>
    </div>
  )
}

VoiceLoadingBar.defaultProps = {
  isLoading: false
}

export default memo(VoiceLoadingBar)
