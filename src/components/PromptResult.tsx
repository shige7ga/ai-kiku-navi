import type { FormEvent, RefObject } from 'react'
type Props = {
  result: string; name: string; notice: string; error: string
  resultRef: RefObject<HTMLTextAreaElement | null>
  setResult: (value: string) => void; setName: (value: string) => void
  setNotice: (value: string) => void; setError: (value: string) => void
  copy: () => Promise<void>; save: (event: FormEvent<HTMLFormElement>) => void
}
export default function PromptResult({ result, name, notice, error, resultRef, setResult, setName, setNotice, setError, copy, save }: Props) {
  return (
    <section className="panel" aria-label="Promptの編集・保存">
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
  )
}
