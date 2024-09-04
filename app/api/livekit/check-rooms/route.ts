// import { RoomServiceClient } from "livekit-server-sdk"
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

//   const client = new RoomServiceClient(livekitUrl, apiKey, apiSecret)

//   try {
//     const { data: rooms, error } = await supabase
//       .from("voice_assistant_events")
//       .select("*")
//       .eq("is_active", true)
//       .eq("event_type", "room_started")

//     if (error) {
//       console.error("Error fetching active rooms:", error)
//       return new Response(
//         JSON.stringify({ error: "Failed to fetch active rooms" }),
//         {
//           status: 500
//         }
//       )
//     }

//     if (!rooms || rooms.length === 0) {
//       return new Response(
//         JSON.stringify({ message: "No active rooms found" }),
//         {
//           status: 200
//         }
//       )
//     }

//     const now = Date.now()

//     for (const room of rooms) {
//       const creationTime = new Date(room.created_at).getTime()
//       const elapsedTime = now - creationTime

//       if (elapsedTime > 5 * 60 * 1000) {
//         try {
//           // Check if the room still exists on the LiveKit server
//           const livekitRooms = await client.listRooms()
//           const roomExists = livekitRooms.some(
//             livekitRoom => livekitRoom.name === room.room_name
//           )

//           if (roomExists) {
//             await client.deleteRoom(room.room_name)
//           }
//         } catch (deleteError) {
//           console.error(`Failed to delete room: ${room.room_name}`, deleteError)
//         }

//         // Set the room to non-active
//         const { error: updateError } = await supabase
//           .from("voice_assistant_events")
//           .update({ is_active: false })
//           .eq("room_name", room.room_name)
//           .eq("event_type", "room_started")

//         if (updateError) {
//           console.error(
//             `Failed to update room status: ${room.room_name}`,
//             updateError
//           )
//         }
//       }
//     }

//     return new Response(JSON.stringify({ message: "Room check completed" }), {
//       status: 200
//     })
//   } catch (error) {
//     console.error("Error checking rooms:", error)
//     return new Response(JSON.stringify({ error: "Failed to check rooms" }), {
//       status: 500
//     })
//   }
// }
