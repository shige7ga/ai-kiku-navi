export type PromptCategory = 'design' | 'learning' | 'github' | 'saved'
const tabs: { id: PromptCategory; label: string }[] = [{ id: 'design', label: 'Webデザイン用' }, { id: 'learning', label: '学習用' }, { id: 'github', label: 'GitHub用' }, { id: 'saved', label: '保存済み' }]
export default function PromptTabs({ category, onChange }: { category: PromptCategory; onChange: (category: PromptCategory) => void }) {
  return <div className="prompt-tabs" role="tablist" aria-label="Promptの用途">{tabs.map((tab, index) => <button type="button" role="tab" id={`tab-${tab.id}`} aria-controls="category-panel" aria-selected={category === tab.id} tabIndex={category === tab.id ? 0 : -1} key={tab.id} onClick={() => onChange(tab.id)} onKeyDown={(event) => {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    onChange(tabs[next].id)
    document.getElementById(`tab-${tabs[next].id}`)?.focus()
  }}>{tab.label}</button>)}</div>
}
