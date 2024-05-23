class SingletonAudioPlayer {
  private static instance: SingletonAudioPlayer
  private audio: HTMLAudioElement | null = null
  private isLoading: boolean = false
  private isPlaying: boolean = false
  private subscribers: ((isLoading: boolean, isPlaying: boolean) => void)[] = []

  private constructor() {}

  public static getInstance(): SingletonAudioPlayer {
    if (!SingletonAudioPlayer.instance) {
      SingletonAudioPlayer.instance = new SingletonAudioPlayer()
    }
    return SingletonAudioPlayer.instance
  }

  private notifySubscribers() {
    this.subscribers.forEach(subscriber =>
      subscriber(this.isLoading, this.isPlaying)
    )
  }

  public subscribe(
    subscriber: (isLoading: boolean, isPlaying: boolean) => void
  ) {
    this.subscribers.push(subscriber)
    // Immediately notify new subscriber of current state
    subscriber(this.isLoading, this.isPlaying)
  }

  public unsubscribe(
    subscriber: (isLoading: boolean, isPlaying: boolean) => void
  ) {
    this.subscribers = this.subscribers.filter(sub => sub !== subscriber)
  }

  public async playAudio(messageContent: string) {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }

    this.isLoading = true
    this.isPlaying = false
    this.notifySubscribers()

    try {
      const response = await fetch("/api/v2/chat/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: messageContent })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      this.audio = new Audio(audioUrl)

      this.audio.play()
      this.isLoading = false
      this.isPlaying = true
      this.notifySubscribers()

      this.audio.onended = () => {
        this.isPlaying = false
        this.notifySubscribers()
      }
    } catch (error) {
      console.error("Error generating speech:", error)
      this.isLoading = false
      this.isPlaying = false
      this.notifySubscribers()
    }
  }

  public stopAudio() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
    this.isPlaying = false
    this.notifySubscribers()
  }
}

export default SingletonAudioPlayer.getInstance()
