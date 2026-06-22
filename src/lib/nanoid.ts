export function nanoid(size = 21): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let id = ""
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  bytes.forEach((b) => { id += chars[b % chars.length] })
  return id
}
