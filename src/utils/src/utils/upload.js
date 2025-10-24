const BASE = 'https://43.165.181.179:9090'

export const UPLOAD_URL = `${BASE}/files/upload`

export function normalizeFileUrl(url) {
  if (!url) return url
  return url.replace(/^http:\/\/(localhost:9090|43\.165\.181\.179:9090)/, 'https://43.165.181.179:9090')
}
