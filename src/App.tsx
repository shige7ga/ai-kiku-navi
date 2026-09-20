import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { generatePrompt, templates } from './templates'
import { loadTemplates, saveTemplate } from './storage'
import type { SavedTemplate } from './storage'
import DesignForm from './components/DesignForm'
import DesignPreview from './components/DesignPreview'
import PromptResult from './components/PromptResult'
import TemplateForm from './components/TemplateForm'
import AppHeader from './components/AppHeader'
import type { PromptCategory } from './components/PromptTabs'
import { defaultSettings, generateDesignPrompt } from './design/settings'
import { copyPrompt } from './clipboard'
import './App.css'

function App() {
  const [category, setCategory] = useState<PromptCategory>('design')
  const [design, setDesign] = useState(defaultSettings)
  const [templateId, setTemplateId] = useState(templates[0].id)
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({})
  const [format, setFormat] = useState('見出しと箇条書き')
  const [detail, setDetail] = useState('初学者向けに、専門用語を説明しながら詳しく')
  const [result, setResult] = useState('')
  const [name, setName] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [initialStorage] = useState(() => {
    try { return { templates: loadTemplates(), error: '' } }
    catch { return { templates: [], error: '保存済みテンプレートを読み込めませんでした。ブラウザーの保存設定や保存データを確認してください。' } }
  })
  const [saved, setSaved] = useState<SavedTemplate[]>(initialStorage.templates)
  const resultRef = useRef<HTMLTextAreaElement>(null)
  const template = templates.find((item) => item.id === templateId)!
  const values = drafts[templateId] ?? {}

  function switchCategory(next: PromptCategory) {
    setCategory(next)
    if (next === 'github') setTemplateId('pr')
    if (next === 'learning' && templateId === 'pr') setTemplateId('question')
  }
  function generateDesign() {
    setResult(generateDesignPrompt(design))
    setName(`${design.preset}のWebデザイン`)
    setNotice('Promptを作成しました。内容を確認してコピーしてください。')
    setError('')
    resultRef.current?.focus()
  }

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values[template.fields[0].id]?.trim()) return
    setResult(generatePrompt(template, values, format, detail))
    setName(`${template.name}のテンプレート`)
    setError('')
    setNotice('プロンプトを生成しました。内容を確認してコピーしてください。')
    resultRef.current?.focus()
  }

  async function copy() {
    setNotice('')
    setError('')
    try {
      await copyPrompt(result)
      setNotice('プロンプトをコピーしました。AIの入力欄に貼り付けて使えます。')
    } catch {
      resultRef.current?.focus()
      resultRef.current?.select()
      setError('コピーできませんでした。結果欄の文章を選択して、手動でコピーしてください。')
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    setError('')
    if (!name.trim() || !result.trim()) {
      setError('テンプレート名と本文を入力してください。')
      return
    }
    try {
      setSaved(saveTemplate({ id: crypto.randomUUID(), name: name.trim(), body: result.trim(), createdAt: new Date().toISOString() }))
      setNotice('自分用テンプレートとして保存しました。')
    } catch {
      setError('保存できませんでした。ブラウザーの保存設定や空き容量を確認してください。本文はコピーして利用できます。')
    }
  }

  function reuse(item: SavedTemplate) {
    setResult(item.body)
    setName(item.name)
    setError('')
    setNotice('保存した本文を読み込みました。必要に応じて編集してコピーしてください。')
    resultRef.current?.focus()
  }

  return (
    <>
      <AppHeader category={category} onChange={switchCategory} />
      <main>
        {initialStorage.error && <p className="error" role="alert">{initialStorage.error}</p>}
        <div id="category-panel" role="tabpanel" aria-labelledby={`tab-${category}`}>
          {category === 'design' && <DesignPreview settings={design} />}
          {category === 'design' && <DesignForm settings={design} onChange={setDesign} onGenerate={generateDesign} />}
          {category === 'saved' && (
            <section className="panel saved-panel" aria-labelledby="saved-heading">
              <h2 id="saved-heading">自分用テンプレート</h2>
              <p className="hint">このブラウザーに保存されます。「再利用」で本文を読み込み、編集・コピーできます。</p>
              {saved.length === 0 ? <p className="empty">まだ保存したテンプレートはありません。</p> : (
                <ul className="saved-list">
                  {saved.map((item) => (
                    <li key={item.id}>
                      <div>
                        <h3>{item.name}</h3>
                        <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString('ja-JP')}</time>
                      </div>
                      <button type="button" onClick={() => reuse(item)} aria-label={`${item.name}を再利用`}>再利用</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          <div className={category === 'learning' || category === 'github' ? 'workspace' : 'result-workspace'}>
            {(category === 'learning' || category === 'github') && <TemplateForm {...{ templateId, setTemplateId, drafts, setDrafts, format, setFormat, detail, setDetail, template, values, generate }} availableTemplates={templates.filter((item) => category === 'github' ? item.id === 'pr' : item.id !== 'pr')} />}
            <PromptResult {...{ result, name, notice, error, resultRef, setResult, setName, setNotice, setError, copy, save }} />
          </div>

        </div>
      </main>
    </>
  )
}

export default App
