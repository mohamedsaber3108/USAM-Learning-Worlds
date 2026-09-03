/**
 * Turns raw backend/network error responses into short, friendly,
 * age-appropriate copy (this app is used by learners aged 8-14).
 *
 * Never show `err.response.data.message` directly in the UI — that string
 * comes straight from the API/validation layer and can be technical,
 * scary, or leak implementation details ("ECONNREFUSED", "duplicate key
 * value violates unique constraint", etc). Route every catch block for a
 * user-facing form through this instead.
 */

const STATUS_MESSAGES: Record<number, string> = {
  400: "That doesn't look quite right. Please check the form and try again.",
  401: 'Your email or password is incorrect. Give it another try.',
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: 'That already exists — try a different one.',
  413: "That's a bit too big to save. Try shortening it.",
  422: "That doesn't look quite right. Please check the form and try again.",
  429: "You're going a bit fast! Wait a moment and try again.",
  500: 'Something went wrong on our end. Please try again in a moment.',
  502: 'Something went wrong on our end. Please try again in a moment.',
  503: "We're doing some maintenance right now. Please try again shortly.",
}

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.'
const OFFLINE_MESSAGE = "We can't reach the server right now. Check your internet and try again."

// Known backend message fragments we want to re-word in friendlier terms,
// rather than showing the raw string from the API straight through.
const KNOWN_FRAGMENTS: Array<[RegExp, string]> = [
  [/email.*(already|exists|taken|in use)/i, 'That email is already registered. Try signing in instead.'],
  [/invalid credentials|incorrect password|user not found/i, 'Your email or password is incorrect. Give it another try.'],
  [/password.*(short|weak|length)/i, 'Your password needs to be at least 8 characters.'],
  [/rate limit|too many/i, "You're going a bit fast! Wait a moment and try again."],
  [/network error/i, OFFLINE_MESSAGE],
]

export function getFriendlyErrorMessage(err: unknown, fallback: string = DEFAULT_MESSAGE): string {
  const anyErr = err as any

  // No response at all usually means a network/offline issue (axios sets
  // `err.request` but no `err.response` in that case).
  if (anyErr && !anyErr.response && anyErr.request) {
    return OFFLINE_MESSAGE
  }

  const status: number | undefined = anyErr?.response?.status
  const rawMessage: string | undefined = Array.isArray(anyErr?.response?.data?.message)
    ? anyErr.response.data.message[0]
    : anyErr?.response?.data?.message

  if (rawMessage) {
    for (const [pattern, friendly] of KNOWN_FRAGMENTS) {
      if (pattern.test(rawMessage)) return friendly
    }
  }

  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status]
  }

  return fallback
}
