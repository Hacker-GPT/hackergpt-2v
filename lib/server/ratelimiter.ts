// must not describe 'use server' here to avoid security issues.
import { epochTimeToNaturalLanguage } from "../utils"
import { getRedis } from "./redis"
import { isPremiumUser } from "./subscription-utils"

export type RateLimitResult =
  | {
      allowed: true
      remaining: number
      timeRemaining: null
    }
  | {
      allowed: false
      remaining: 0
      timeRemaining: number
    }

/**
 * rate limiting by sliding window algorithm.
 *
 * check if the user is allowed to make a request.
 * if the user is allowed, decrease the remaining count by 1.
 */
export async function ratelimit(
  userId: string,
  model: string
): Promise<RateLimitResult> {
  if (!isRateLimiterEnabled()) {
    return { allowed: true, remaining: -1, timeRemaining: null }
  }
  const isPremium = await isPremiumUser(userId)
  return _ratelimit(model, userId, isPremium)
}

function isRateLimiterEnabled(): boolean {
  return process.env.RATELIMITER_ENABLED?.toLowerCase() !== "false"
}

export async function _ratelimit(
  model: string,
  userId: string,
  isPremium: boolean
): Promise<RateLimitResult> {
  try {
    const storageKey = _makeStorageKey(userId, model)
    const [remaining, timeRemaining] = await getRemaining(
      userId,
      model,
      isPremium
    )
    if (remaining === 0) {
      return { allowed: false, remaining, timeRemaining: timeRemaining! }
    }
    await _addRequest(storageKey)
    return { allowed: true, remaining: remaining - 1, timeRemaining: null }
  } catch (error) {
    console.error("Redis rate limiter error:", error)
    // Deny the request in case of Redis errors
    return { allowed: false, remaining: 0, timeRemaining: 60000 } // 1 minute cooldown
  }
}

export async function getRemaining(
  userId: string,
  model: string,
  isPremium: boolean
): Promise<[number, number | null]> {
  const storageKey = _makeStorageKey(userId, model)
  const timeWindow = getTimeWindow()
  const now = Date.now()
  const limit = _getLimit(model, isPremium)

  const redis = getRedis()
  const [[firstMessageTime], count] = await Promise.all([
    redis.zrange(storageKey, 0, 0, { withScores: true }),
    redis.zcard(storageKey)
  ])

  if (!firstMessageTime) {
    return [limit, null]
  }

  const windowEndTime = Number(firstMessageTime) + timeWindow
  if (now >= windowEndTime) {
    // The window has expired, no need to reset the count here
    return [limit, null]
  }

  const remaining = Math.max(0, limit - count)
  return [remaining, remaining === 0 ? windowEndTime - now : null]
}

function getTimeWindow(): number {
  const key = "RATELIMITER_TIME_WINDOW_MINUTES"
  return Number(process.env[key]) * 60 * 1000
}

function _getLimit(model: string, isPremium: boolean): number {
  let limit
  const fixedModelName = _getFixedModelName(model)
  const limitKey = `RATELIMITER_LIMIT_${fixedModelName}_${isPremium ? "PREMIUM" : "FREE"}`
  limit =
    process.env[limitKey] === undefined
      ? isPremium
        ? 30
        : 15
      : Number(process.env[limitKey])
  if (isNaN(limit) || limit < 0) {
    throw new Error("Invalid limit configuration")
  }
  return limit
}

async function _addRequest(key: string) {
  const now = Date.now()
  const timeWindow = getTimeWindow()

  const redis = getRedis()
  try {
    const [firstMessageTime] = await redis.zrange(key, 0, 0, {
      withScores: true
    })

    if (!firstMessageTime || now - Number(firstMessageTime) >= timeWindow) {
      // Start a new window
      await redis
        .multi()
        .del(key)
        .zadd(key, { score: now, member: now })
        .expire(key, Math.ceil(timeWindow / 1000))
        .exec()
    } else {
      // Add to existing window
      await redis.zadd(key, { score: now, member: now })
    }
  } catch (error) {
    console.error("Redis _addRequest error:", error)
    throw error // Re-throw to be caught in _ratelimit
  }
}

function _getFixedModelName(model: string): string {
  return (model.startsWith("gpt-4") ? "gpt-4" : model)
    .replace(/-/g, "_")
    .toUpperCase()
}

function _makeStorageKey(userId: string, model: string): string {
  const fixedModelName = _getFixedModelName(model)
  return `ratelimit:${userId}:${fixedModelName}`
}

export function resetRateLimit(model: string, userId: string) {
  const storageKey = _makeStorageKey(userId, model)
  return getRedis().del(storageKey)
}

export function getRateLimitErrorMessage(
  timeRemaining: number,
  premium: boolean,
  model: string
): string {
  const remainingText = epochTimeToNaturalLanguage(timeRemaining)

  if (model === "terminal") {
    const baseMessage = `⚠️ You've reached the limit for terminal usage.\n\nTo ensure fair usage for all users, please wait ${remainingText} before trying again.`
    return !premium
      ? baseMessage
      : `${baseMessage}\n\n🚀 Consider upgrading to Pro for higher terminal usage limits and more features.`
  }

  let message = `⚠️ Usage Limit Reached for ${getModelName(model)}\n⏰ Access will be restored in ${remainingText}`

  if (premium) {
    if (model === "pentestgpt") {
      message += `\n\nIn the meantime, you can use PGPT-4 or GPT-4o`
    } else if (model === "pentestgpt-pro") {
      message += `\n\nIn the meantime, you can use GPT-4o or PGPT-3.5`
    } else if (model === "gpt-4") {
      message += `\n\nIn the meantime, you can use PGPT-4 or PGPT-3.5`
    }
  } else {
    message += `\n\n🔓 Want more? Upgrade to Pro and unlock a world of features:
- Higher usage limits
- Access to PGPT-4 and GPT-4o
- Access to file uploads, vision, web search and browsing
- Access to advanced plugins like SQLi Exploiter, XSS Exploiter, and more
- Access to terminal`
  }

  return message.trim()
}

function getModelName(model: string): string {
  const modelNames: { [key: string]: string } = {
    pentestgpt: "PGPT-3.5",
    "pentestgpt-pro": "PGPT-4",
    "gpt-4": "GPT-4",
    terminal: "terminal"
  }
  return modelNames[model] || model
}

export async function checkRatelimitOnApi(
  userId: string,
  model: string
): Promise<{ response: Response; result: RateLimitResult } | null> {
  const result = await ratelimit(userId, model)
  if (result.allowed) {
    return null
  }
  const premium = await isPremiumUser(userId)
  const message = getRateLimitErrorMessage(
    result.timeRemaining!,
    premium,
    model
  )
  const response = new Response(
    JSON.stringify({
      message: message,
      remaining: result.remaining,
      timeRemaining: result.timeRemaining
    }),
    {
      status: 429
    }
  )
  return { response, result }
}

export async function checkRateLimitWithoutIncrementing(
  userId: string,
  model: string
): Promise<RateLimitResult> {
  if (!isRateLimiterEnabled()) {
    return { allowed: true, remaining: -1, timeRemaining: null }
  }
  const isPremium = await isPremiumUser(userId)
  const [remaining, timeRemaining] = await getRemaining(
    userId,
    model,
    isPremium
  )
  if (remaining === 0) {
    return { allowed: false, remaining: 0, timeRemaining: timeRemaining! }
  }
  return { allowed: true, remaining, timeRemaining: null }
}
