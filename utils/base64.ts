/**
 * Helpers for UTF-8 safe base64 encoding/decoding.
 * window.btoa/atob only support Latin1, so we manually normalize strings.
 */

export const encodeToBase64 = (value: string): string => {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(value)

  if (typeof window === "undefined") {
    return Buffer.from(bytes).toString("base64")
  }

  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return window.btoa(binary)
}

export const decodeFromBase64 = (value: string): string => {
  if (typeof window === "undefined") {
    return Buffer.from(value, "base64").toString("utf-8")
  }

  const binary = window.atob(value)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}
