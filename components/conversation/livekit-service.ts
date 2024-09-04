// export const fetchLivekitToken = async () => {
//   try {
//     const response = await fetch("/api/livekit/connect")
//     if (!response.ok) {
//       const errorData = await response.json()
//       if (response.status === 429 && errorData?.message) {
//         return {
//           token: null,
//           url: undefined,
//           error:
//             errorData.message || "Rate limit exceeded. Please try again later."
//         }
//       }
//       throw new Error("Network response was not ok")
//     }
//     const { accessToken, url } = await response.json()
//     return { token: accessToken, url, error: null }
//   } catch (error) {
//     console.error("Failed to fetch token:", error)
//     return {
//       token: null,
//       url: undefined,
//       error: "Failed to connect. Please try again."
//     }
//   }
// }

// export const disconnectFromLivekit = async () => {
//   try {
//     const roomName = localStorage.getItem("roomName")
//     if (!roomName) {
//       return { error: "Room name not found" }
//     }
//     const response = await fetch("/api/livekit/disconnect", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ roomName })
//     })
//     if (!response.ok) {
//       throw new Error("Network response was not ok")
//     }
//     return await response.json()
//   } catch (error) {
//     console.error("Failed to disconnect:", error)
//     return { error: "Failed to connect. Please try again." }
//   }
// }
