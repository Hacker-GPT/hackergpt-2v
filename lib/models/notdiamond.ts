// type Message = {
//   role: "user" | "assistant" | "system"
//   content: string
// }

// type LLMProvider = {
//   provider: string
//   model: string
// }

// type ProviderType = "openai" | "pentestgpt4"

// type ProviderConfig = {
//   providers: LLMProvider[]
//   defaultModel: string
//   tradeoff?: "cost" | "latency"
// }

// const PROVIDER_CONFIGS: Record<ProviderType, ProviderConfig> = {
//   openai: {
//     providers: [
//       { provider: "openai", model: "gpt-4o" },
//       { provider: "openai", model: "gpt-4o-mini" }
//     ],
//     defaultModel: "gpt-4o",
//     tradeoff: "cost"
//   },
//   pentestgpt4: {
//     providers: [
//       { provider: "togetherai", model: "Meta-Llama-3.1-405B-Instruct-Turbo" },
//       { provider: "togetherai", model: "Meta-Llama-3.1-70B-Instruct-Turbo" }
//     ],
//     defaultModel: "Meta-Llama-3.1-405B-Instruct-Turbo",
//     tradeoff: "cost"
//   }
// }

// const NOTDIAMOND_TO_OPENROUTER_MAPPING: Record<string, string> = {
//   "Meta-Llama-3.1-405B-Instruct-Turbo": "meta-llama/llama-3.1-405b-instruct",
//   "Meta-Llama-3.1-70B-Instruct-Turbo": "meta-llama/llama-3.1-70b-instruct"
// }

// function isNotDiamondModel(
//   model: string
// ): model is keyof typeof NOTDIAMOND_TO_OPENROUTER_MAPPING {
//   return model in NOTDIAMOND_TO_OPENROUTER_MAPPING
// }

// async function selectModel(
//   messages: Message[],
//   providers: LLMProvider[],
//   defaultModel: string,
//   tradeoff?: "cost" | "latency"
// ): Promise<string> {
//   if (!process.env.NOTDIAMOND_API_KEY) return defaultModel

//   try {
//     const body: any = {
//       messages,
//       llm_providers: providers,
//       timeout: 3
//     }

//     if (tradeoff) {
//       body.tradeoff = tradeoff
//     }

//     const response = await fetch(
//       "https://not-diamond-server.onrender.com/v2/modelRouter/modelSelect",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.NOTDIAMOND_API_KEY}`
//         },
//         body: JSON.stringify(body)
//       }
//     )

//     if (!response.ok) {
//       console.error(
//         `NotDiamond API error (${response.status}): ${await response.text()}`
//       )
//       return defaultModel
//     }

//     const {
//       providers: [{ model: selectedModel }]
//     } = await response.json()
//     return isNotDiamondModel(selectedModel)
//       ? NOTDIAMOND_TO_OPENROUTER_MAPPING[selectedModel]
//       : selectedModel
//   } catch (error) {
//     console.error("NotDiamond error:", error)
//     return defaultModel
//   }
// }

// function transformMessages(messages: any[]): Message[] {
//   return messages.map(msg => ({
//     role: msg.role as "user" | "assistant" | "system",
//     content: Array.isArray(msg.content)
//       ? msg.content
//           .filter((c: any) => c.type === "text")
//           .map((c: any) => c.text)
//           .join(" ")
//       : msg.content
//   }))
// }

// export async function getSelectedModel(
//   messages: any[],
//   providerType: ProviderType
// ): Promise<string> {
//   const config = PROVIDER_CONFIGS[providerType]
//   return selectModel(
//     transformMessages(messages),
//     config.providers,
//     config.defaultModel,
//     config.tradeoff
//   )
// }
