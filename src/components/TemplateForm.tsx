import type { FormEvent } from 'react'
import type { PromptTemplate } from '../templates'
type Props = {
  templateId: string; setTemplateId: (id: string) => void
  drafts: Record<string, Record<string, string>>; setDrafts: (drafts: Record<string, Record<string, string>>) => void
  format: string; setFormat: (value: string) => void; detail: string; setDetail: (value: string) => void
  template: PromptTemplate; values: Record<string, string>; availableTemplates: PromptTemplate[]
  generate: (event: FormEvent<HTMLFormElement>) => void
}
export default function TemplateForm({ templateId, setTemplateId, drafts, setDrafts, format, setFormat, detail, setDetail, template, values, availableTemplates, generate }: Props) {
  return (
    <section className="panel" aria-labelledby="input-heading">
      <h2 id="input-heading">1. 用途を選んで入力</h2>
      <form onSubmit={generate}>
        <label htmlFor="purpose">何を手伝ってほしいですか？</label>
        <select id="purpose" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
          {availableTemplates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <p className="hint">最初の項目だけ必須です。わかる範囲で入力してください。</p>
        {template.fields.map((field, index) => (
          <div className="field" key={`${template.id}-${field.id}`}>
            <label htmlFor={`field-${field.id}`}>{field.label} <span className="badge">{index === 0 ? '必須' : '任意'}</span>
            </label>
            <textarea id={`field-${field.id}`} rows={index === 0 ? 4 : 3} placeholder={field.placeholder}
              required={index === 0} value={values[field.id] ?? ''}
              onChange={(event) => setDrafts({ ...drafts, [templateId]: { ...values, [field.id]: event.target.value } })} />
          </div>
        ))}
        <div className="field">
          <label htmlFor="format">回答形式</label>
          <select id="format" value={format} onChange={(event) => setFormat(event.target.value)}>
            <option value="">指定しない</option>
            <option>見出しと箇条書き</option>
            <option>手順を順番に</option>
            <option>コード例と解説</option>
            <option>Markdown形式</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="detail">回答の詳しさ</label>
          <select id="detail" value={detail} onChange={(event) => setDetail(event.target.value)}>
            <option value="">指定しない</option>
            <option>初学者向けに、専門用語を説明しながら詳しく</option>
            <option>要点だけ簡潔に</option>
            <option>具体例を交えて説明</option>
          </select>
        </div>
        <button className="primary" type="submit" disabled={!values[template.fields[0].id]?.trim()}>プロンプトを生成</button>
      </form>
    </section>

  )
}
