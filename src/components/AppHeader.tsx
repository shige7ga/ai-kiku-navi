import PromptTabs from './PromptTabs'
import type { PromptCategory } from './PromptTabs'

export default function AppHeader({ category, onChange }: { category: PromptCategory; onChange: (category: PromptCategory) => void }) {
  return <header className="app-header">
    <div className="header-content">
      <h1>AIきくナビ</h1>
      <PromptTabs category={category} onChange={onChange} />
    </div>
  </header>
}
