// import { WebhookReceiver, RoomServiceClient } from "livekit-server-sdk"
// import { supabase } from "@/lib/supabase/browser-client"

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

//   try {
//     const client = new RoomServiceClient(livekitUrl, apiKey, apiSecret)
//     const receiver = new WebhookReceiver(apiKey, apiSecret)
//     const body = await request.text()
//     const authorizationHeader =
//       request.headers.get("authorization") || undefined
//     const event = await receiver.receive(body, authorizationHeader)

//     if (!event.room) {
//       return new Response(
//         JSON.stringify({ error: "Event does not contain room information" }),
//         { status: 400 }
//       )
//     }

//     const roomName = event.room.name
//     const participantIdentity = event.participant?.identity

//     switch (event.event) {
//       case "room_started":
//         await recordEvent("room_started", roomName, undefined, true)
//         break
//       case "room_finished":
//         await recordEvent("room_finished", roomName, undefined, false)
//         break
//       case "participant_joined":
//         await recordEvent("participant_joined", roomName, participantIdentity)
//         break
//       case "participant_left":
//         if (participantIdentity && !participantIdentity.startsWith("agent")) {
//           await recordEvent("participant_left", roomName, participantIdentity)

//           try {
//             await client.deleteRoom(roomName)
//           } catch (deleteError) {
//             if (
//               deleteError instanceof Error &&
//               deleteError.message.includes("404")
//             ) {
//               // console.log(`Room ${roomName} already deleted or not found`)
//             } else {
//               console.error(`Failed to delete room: ${roomName}`, deleteError)
//             }
//           }
//         }
//         break
//       default:
//         return new Response(JSON.stringify({ message: "Event processed" }), {
//           status: 200
//         })
//     }

//     return new Response(JSON.stringify({ message: "Event processed" }), {
//       status: 200
//     })
//   } catch (error) {
//     console.error("Error processing webhook:", error)
//     return new Response(JSON.stringify({ error: "Failed to process event" }), {
//       status: 500
//     })
//   }
// }

// async function recordEvent(
//   eventType: string,
//   roomName: string,
//   participantIdentity?: string,
//   isActive: boolean = false
// ) {
//   if (participantIdentity && participantIdentity.startsWith("agent")) {
//     return
//   }

//   try {
//     const { error } = await supabase.from("voice_assistant_events").insert({
//       event_type: eventType,
//       room_name: roomName,
//       participant_identity: participantIdentity,
//       is_active: isActive
//     })

//     if (error) {
//       console.error(`Failed to record event: ${eventType}`, error)
//     }
//   } catch (err) {
//     console.error(`Unexpected error recording event: ${eventType}`, err)
//   }
// }
