export type SavedTemplate = {
  id: string
  name: string
  body: string
  createdAt: string
}

const STORAGE_KEY = 'ai-kiku-navi.templates'

function isSavedTemplate(value: unknown): value is SavedTemplate {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && !!item.id.trim()
    && typeof item.name === 'string' && !!item.name.trim()
    && typeof item.body === 'string' && !!item.body.trim()
    && typeof item.createdAt === 'string' && Number.isFinite(Date.parse(item.createdAt))
}

export function loadTemplates(): SavedTemplate[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return []
  const data: unknown = JSON.parse(raw)
  if (!Array.isArray(data) || !data.every(isSavedTemplate)) {
    throw new Error('保存データの形式が正しくありません。')
  }
  return data
}

export function saveTemplate(template: SavedTemplate): SavedTemplate[] {
  // 最新の保存内容を読み、他のタブで保存したデータも保持する。
  const next = [template, ...loadTemplates()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
