import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { generatePrompt, templates } from './templates'
import { loadTemplates, saveTemplate } from './storage'
import type { SavedTemplate } from './storage'
import './App.css'

function App() {
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
      await navigator.clipboard.writeText(result)
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
    <main>
      <header className="page-header">
        <p className="eyebrow">AIへの「聞きたい」を、伝わる形に。</p>
        <h1>AIきくナビ</h1>
        <p>用途を選んで入力するだけで、AIにそのまま渡せるプロンプトを作れます。</p>
        <p className="flow">用途を選ぶ → 入力する → 生成する → コピー／保存</p>
      </header>
      <div className="workspace">
        <section className="panel" aria-labelledby="input-heading">
          <h2 id="input-heading">1. 用途を選んで入力</h2>
          <form onSubmit={generate}>
            <label htmlFor="purpose">何を手伝ってほしいですか？</label>
            <select id="purpose" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
              {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <p className="hint">最初の項目だけ必須です。わかる範囲で入力してください。</p>
            {template.fields.map((field, index) => (
              <div className="field" key={`${template.id}-${field.id}`}>
                <label htmlFor={`field-${field.id}`}>{field.label} <span className="badge">{index === 0 ? '必須' : '任意'}</span></label>
                <textarea id={`field-${field.id}`} rows={index === 0 ? 4 : 3} placeholder={field.placeholder}
                  required={index === 0} value={values[field.id] ?? ''}
                  onChange={(event) => setDrafts({ ...drafts, [templateId]: { ...values, [field.id]: event.target.value } })} />
              </div>
            ))}
            <div className="field">
              <label htmlFor="format">回答形式</label>
              <select id="format" value={format} onChange={(event) => setFormat(event.target.value)}>
                <option value="">指定しない</option>
                <option>見出しと箇条書き</option><option>手順を順番に</option><option>コード例と解説</option><option>Markdown形式</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="detail">回答の詳しさ</label>
              <select id="detail" value={detail} onChange={(event) => setDetail(event.target.value)}>
                <option value="">指定しない</option>
                <option>初学者向けに、専門用語を説明しながら詳しく</option><option>要点だけ簡潔に</option><option>具体例を交えて説明</option>
              </select>
            </div>
            <button className="primary" type="submit" disabled={!values[template.fields[0].id]?.trim()}>プロンプトを生成</button>
          </form>
        </section>
        <section className="panel" aria-labelledby="result-heading">
          <h2 id="result-heading">2. 確認してコピー・保存</h2>
          <p className="hint">生成した文章はここで編集できます。AIへの送信は行いません。</p>
          <label htmlFor="result">生成したプロンプト</label>
          <textarea id="result" ref={resultRef} className="result" rows={17} value={result}
            placeholder="入力して「プロンプトを生成」を押すと、ここに表示されます。"
            onChange={(event) => { setResult(event.target.value); setNotice(''); setError('') }} />
          <button type="button" className="primary" disabled={!result.trim()} onClick={copy}>プロンプトをコピー</button>
          <form className="save-form" onSubmit={save}>
            <label htmlFor="template-name">自分用テンプレートの名前</label>
            <input id="template-name" value={name} maxLength={80} required placeholder="例：Reactのエラー相談"
              onChange={(event) => setName(event.target.value)} />
            <button type="submit" disabled={!result.trim() || !name.trim()}>この本文を保存</button>
          </form>
          <p className="feedback" role="status">{notice}</p>
          {error && <p className="error" role="alert">{error}</p>}
        </section>
      </div>
      <section className="panel saved-panel" aria-labelledby="saved-heading">
        <h2 id="saved-heading">自分用テンプレート</h2>
        <p className="hint">このブラウザーに保存されます。「再利用」で本文を読み込み、編集・コピーできます。</p>
        {initialStorage.error && <p className="error" role="alert">{initialStorage.error}</p>}
        {saved.length === 0 ? <p className="empty">まだ保存したテンプレートはありません。</p> : (
          <ul className="saved-list">
            {saved.map((item) => (
              <li key={item.id}>
                <div><h3>{item.name}</h3><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString('ja-JP')}</time></div>
                <button type="button" onClick={() => reuse(item)} aria-label={`${item.name}を再利用`}>再利用</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
