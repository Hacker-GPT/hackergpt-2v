// import { supabase } from "@/lib/supabase/browser-client"

// export const getUserRole = async (userId: string) => {
//   const { data: userRole, error } = await supabase
//     .from("user_role")
//     .select("*")
//     .eq("user_id", userId)
//     .maybeSingle()

//   if (error) {
//     throw new Error(error.message)
//   }

//   return userRole
// }
