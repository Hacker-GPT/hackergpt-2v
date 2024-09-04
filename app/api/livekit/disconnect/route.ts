// import { getAIProfile } from "@/lib/server/server-chat-helpers"
// import { RoomServiceClient } from "livekit-server-sdk"

// const {
//   LIVEKIT_API_KEY: apiKey,
//   LIVEKIT_API_SECRET: apiSecret,
//   LIVEKIT_URL: livekitUrl
// } = process.env

// export async function POST(request: Request) {
//   if (!apiKey || !apiSecret || !livekitUrl) {
//     return new Response(
//       "Environment variables LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL must be set",
//       { status: 500 }
//     )
//   }
//   const client = new RoomServiceClient(livekitUrl, apiKey, apiSecret)

//   const requestJson = await request.json()
//   const { roomName } = requestJson

//   try {
//     await getAIProfile()
//   } catch (error) {
//     return new Response(JSON.stringify({ message: "Unauthorized" }), {
//       status: 401
//     })
//   }

//   try {
//     await client.deleteRoom(roomName)
//     return new Response(JSON.stringify({ message: "Room deleted" }), {
//       status: 200
//     })
//   } catch (error) {
//     return new Response(JSON.stringify({ message: "Error deleting room" }), {
//       status: 500
//     })
//   }
// }
