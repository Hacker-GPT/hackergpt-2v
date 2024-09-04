// import {
//   AccessToken,
//   AccessTokenOptions,
//   RoomServiceClient,
//   Room
// } from "livekit-server-sdk"
// import { generateRandomAlphanumeric } from "@/lib/utils"
// import { getAIProfile } from "@/lib/server/server-chat-helpers"
// import { checkRatelimitOnApi } from "@/lib/server/ratelimiter"

// export const dynamic = "force-dynamic"

// const {
//   LIVEKIT_API_KEY: apiKey,
//   LIVEKIT_API_SECRET: apiSecret,
//   LIVEKIT_URL: livekitUrl
// } = process.env

// const createToken = (userInfo: AccessTokenOptions, roomName: string) => {
//   const at = new AccessToken(apiKey, apiSecret, {
//     identity: userInfo.identity,
//     ttl: "1m"
//   })
//   at.addGrant({
//     room: roomName,
//     roomJoin: true,
//     canPublish: true,
//     canPublishData: true,
//     canSubscribe: true
//   })
//   return at.toJwt()
// }

// export async function GET(request: Request) {
//   try {
//     if (!apiKey || !apiSecret || !livekitUrl) {
//       return new Response(
//         "Environment variables LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL must be set",
//         { status: 500 }
//       )
//     }

//     const profile = await getAIProfile()

//     const rateLimitCheckResult = await checkRatelimitOnApi(
//       profile.user_id,
//       "voice-assistant"
//     )

//     if (rateLimitCheckResult !== null) {
//       return rateLimitCheckResult.response
//     }

//     const roomName = `room-${generateRandomAlphanumeric(4)}-${generateRandomAlphanumeric(4)}`
//     const identity = profile.user_id

//     // Initialize RoomServiceClient
//     const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret)

//     // Create a room
//     const roomOptions = {
//       name: roomName,
//       emptyTimeout: 60, // Close room 1 minute after the last participant leaves
//       maxParticipants: 2
//     }
//     await roomService.createRoom(roomOptions)

//     const token = await createToken({ identity }, roomName)
//     return new Response(
//       JSON.stringify({
//         accessToken: token,
//         url: livekitUrl
//       }),
//       {
//         headers: { "Content-Type": "application/json" }
//       }
//     )
//   } catch (e) {
//     console.error("Error generating token:", e)
//     return new Response((e as Error).message, { status: 500 })
//   }
// }
