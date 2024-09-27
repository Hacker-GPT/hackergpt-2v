import { LLM } from "@/types"

export const PGPT3_5: LLM = {
  modelId: "mistral-medium",
  modelName: "PentestGPT 3.5",
  shortModelName: "PGPT-3.5",
  provider: "mistral",
  hostedId: "mistral-medium",
  imageInput: true
}

export const PGPT4: LLM = {
  modelId: "mistral-large",
  modelName: "PentestGPT 4",
  shortModelName: "PGPT-4",
  provider: "mistral",
  hostedId: "mistral-large",
  imageInput: true
}

export const HACKERAI_LLM_LIST: LLM[] = [PGPT3_5, PGPT4]
