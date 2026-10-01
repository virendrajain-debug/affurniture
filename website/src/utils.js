export const stripHtml = (html) => {
  if (!html) return ''
  let text = String(html)
  const decode = (s) => {
    const area = document.createElement('textarea')
    area.innerHTML = s
    return area.value
  }
  for (let i = 0; i < 3; i++) {
    const noTags = text
      .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
    const decoded = decode(noTags)
    if (decoded === text) {
      text = noTags
      break
    }
    text = decoded
  }
  return text.replace(/\s+/g, ' ').trim()
}
