import { PentestGPTContext } from "@/context/context"
import {
  type UIEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react"

export const useScroll = () => {
  const { isGenerating, chatMessages } = useContext(PentestGPTContext)

  const messagesStartRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isAutoScrolling = useRef(false)

  const [isAtBottom, setIsAtBottom] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    if (isGenerating) {
      setUserScrolled(false)
    }
  }, [isGenerating])

  useEffect(() => {
    if (isGenerating && !userScrolled) {
      scrollToBottom()
    }
  }, [chatMessages, isGenerating, userScrolled])

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(e => {
    const target = e.target as HTMLDivElement
    const bottom =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) <
      50

    setIsAtBottom(bottom)

    if (bottom) {
      setUserScrolled(false)
    } else if (!isAutoScrolling.current && target.scrollTop > 10) {
      setUserScrolled(true)
    }

    const isOverflow = target.scrollHeight > target.clientHeight
    setIsOverflowing(isOverflow)
  }, [])

  const scrollToBottom = useCallback(
    (forced: boolean = false) => {
      if (forced) {
        setUserScrolled(false)
      }
      if (!userScrolled || forced) {
        isAutoScrolling.current = true
        messagesEndRef.current?.scrollIntoView({
          behavior: forced ? "smooth" : "auto"
        })
        setTimeout(() => {
          isAutoScrolling.current = false
        }, 100)
      }
    },
    [userScrolled]
  )

  return {
    messagesEndRef,
    messagesStartRef,
    isAtBottom,
    userScrolled,
    isOverflowing,
    handleScroll,
    scrollToBottom,
    setIsAtBottom
  }
}
