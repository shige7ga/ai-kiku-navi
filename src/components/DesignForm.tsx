import type { ReactNode } from 'react'
import { applyPreset, changeColumns, patterns, presets, uiOptions } from '../design/settings'
import SelectField from './SelectField'
import ReferenceSites from './ReferenceSites'
import type { Colors, Columns, CustomField, DesignSettings } from '../design/settings'

type Props = { settings: DesignSettings; onChange: (settings: DesignSettings) => void; onGenerate: () => void }
function Field({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return <label className="field">{label}<span className="field-help">{hint}</span>{children}</label>
}
export function PresetSelect({ settings, onChange }: Omit<Props, 'onGenerate'>) {
  return <fieldset>
    <legend>デザインプリセット</legend>
    <p className="hint">例：ナチュラル</p>
    <div className="preset-list">{presets.map((p) => <button type="button" key={p.name} aria-pressed={settings.preset === p.name} onClick={() => onChange(applyPreset(settings, p.name))}>
      <span className="swatch" style={{ background: p.colors.main }} />{p.name}</button>)}</div>
  </fieldset>
}
export function ColorSettings({ settings, onChange }: Omit<Props, 'onGenerate'>) {
  const labels: Record<keyof Colors, string> = { main: 'メインカラー', background: '背景色', accent: 'アクセント色', text: '文字色' }
  return <fieldset>
    <legend>カラー</legend>
    <p id="color-help" className="hint">例：#225e8e</p>
    <div className="color-grid">{(Object.keys(labels) as (keyof Colors)[]).map((key) => <div key={key}>
      <label htmlFor={`color-${key}`}>{labels[key]}</label>
      <div className="color-value">
        <input type="color" aria-label={`${labels[key]}を自由に選択`} value={/^#[0-9a-f]{6}$/i.test(settings.colors[key]) ? settings.colors[key] : '#000000'} onChange={(e) => onChange({ ...settings, colors: { ...settings.colors, [key]: e.target.value } })} />
        <input id={`color-${key}`} aria-describedby="color-help" value={settings.colors[key]} maxLength={7} onChange={(e) => onChange({ ...settings, colors: { ...settings.colors, [key]: e.target.value } })} />
      </div>
      <div className="color-swatches">{[...new Set(presets.map((p) => p.colors[key]))].map((color) => <button key={color} type="button" aria-label={`${labels[key]} ${color}`} aria-pressed={settings.colors[key] === color} style={{ background: color }} onClick={() => onChange({ ...settings, colors: { ...settings.colors, [key]: color } })} />)}</div>
    </div>)}</div>
  </fieldset>
}
export function LayoutSettings({ settings: s, onChange }: Omit<Props, 'onGenerate'>) {
  const custom = (key: CustomField, value: string) => onChange({ ...s, custom: { ...s.custom, [key]: value } })
  return <fieldset>
    <legend>レイアウト</legend>
    <Field label="PCのカラム数" hint="例：2カラム">
      <select value={s.columns} onChange={(e) => onChange(changeColumns(s, e.target.value as Columns))}>
        {['1', '2', '3'].map((n) => <option key={n} value={n}>{n}カラム</option>)}
      </select>
    </Field>
    <SelectField label="配置パターン" example="サイドバー + メイン" value={s.pattern} options={patterns[s.columns]}
      onChange={(value) => onChange({ ...s, pattern: value })} customValue={s.custom.pattern} onCustomChange={(value) => custom('pattern', value)} />
    <SelectField label="主要コンテンツの配置" example="メインの上部に大きなカード" value={s.placement}
      options={['メインにまとめる', '各カラムに分ける', '全幅で下に並べる']}
      onChange={(value) => onChange({ ...s, placement: value })} customValue={s.custom.placement} onCustomChange={(value) => custom('placement', value)} />
  </fieldset>
}
export default function DesignForm({ settings: s, onChange, onGenerate }: Props) {
  const update = <K extends keyof DesignSettings>(key: K, value: DesignSettings[K]) => onChange({ ...s, [key]: value })
  const text = (key: 'service' | 'keywords' | 'avoid' | 'otherTechnology' | 'notes', label: string, example: string) => (
    <Field label={label} hint={`例：${example}`}>
      <textarea rows={2} value={s[key]} placeholder={example} onChange={(e) => update(key, e.target.value)} />
    </Field>
  )
  const select = (key: CustomField, label: string, options: readonly string[], example: string) => (
    <SelectField key={key} label={label} example={example} value={s[key]} options={options}
      onChange={(value) => onChange({ ...s, [key]: value })} customValue={s.custom[key]}
      onCustomChange={(value) => update('custom', { ...s.custom, [key]: value })} />
  )
  const examples = {
    font: '明朝体とゴシック体の組み合わせ', radius: '上の角だけ丸く', shadow: '青みのある薄い影',
    spacing: '見出しの周りを広く', button: 'アイコン付きボタン', card: '画像を大きくしたカード', navigation: '折りたたみ式メニュー',
  }
  const labels = { font: 'フォント', radius: '角丸', shadow: '影', spacing: '余白感', button: 'ボタンデザイン', card: 'カードデザイン', navigation: 'ナビゲーション' }
  const mobile = { mobileSingle: '1カラム表示', mobileHeader: 'ヘッダーあり', bottomNav: 'ボトムナビゲーションあり', mobileVertical: 'カードを縦並び', bottomAction: '主要ボタンを画面下部へ配置' }
  const validColors = Object.values(s.colors).every((c) => /^#[0-9a-f]{6}$/i.test(c))
  return <section className="panel" aria-label="Webデザイン用フォーム">
    <form onSubmit={(e) => { e.preventDefault(); if (validColors) onGenerate() }}>
      <fieldset>
        <legend>基本情報</legend>
        {text('service', 'サービス概要', '毎日1つやりたいことを登録できるWebアプリ')}
        {select('purpose', '目的', ['使いやすいサービスを作る', '日々の記録を続けてもらう', 'サービスを知ってもらう', '商品を購入してもらう', '問い合わせを増やす'], '地域のイベントへの参加を増やす')}
        {select('target', 'ターゲットユーザー', ['初めて利用する人', 'IT初学者', '学生', '社会人', '子育て中の人', '幅広い年代の人'], '地域で活動するボランティア')}
        {text('keywords', 'デザインキーワード', '親しみやすい、落ち着いた、清潔感')}
      </fieldset>
      <PresetSelect settings={s} onChange={onChange} />
      <ColorSettings settings={s} onChange={onChange} />
      <details>
        <summary>UIデザイン</summary>
        {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => select(key, labels[key], uiOptions[key], examples[key]))}
        <SelectField label="ヘッダー" example="あり" value={s.header} options={uiOptions.header}
          onChange={(value) => update('header', value as DesignSettings['header'])} />
      </details>
      <LayoutSettings settings={s} onChange={onChange} />
      <details open>
        <summary>スマートフォン</summary>
        {(Object.keys(mobile) as (keyof typeof mobile)[]).map((key) => <label className="check-field" key={key}>
          <input type="checkbox" checked={s[key]} onChange={(e) => update(key, e.target.checked)} />{mobile[key]}
        </label>)}
      </details>
      <ReferenceSites sites={s.references} onChange={(sites) => update('references', sites)} />
      <details>
        <summary>使用技術・避けたいデザイン</summary>
        {text('avoid', '避けたいデザイン', '派手な点滅、小さすぎる文字')}
        <fieldset>
          <legend>使用技術</legend>
          <p className="hint">例：ReactとTailwind CSS</p>
          <label className="check-field">
            <input type="checkbox" checked={!s.technologies.length} onChange={() => update('technologies', [])} />指定なし
          </label>
          {['HTML / CSS', 'Tailwind CSS', 'React', 'Next.js', 'Ruby on Rails', 'その他'].map((t) => <label className="check-field" key={t}>
            <input type="checkbox" checked={s.technologies.includes(t)} onChange={(e) => update('technologies', e.target.checked ? [...s.technologies, t] : s.technologies.filter((v) => v !== t))} />{t}
          </label>)}
          {s.technologies.includes('その他') && text('otherTechnology', 'その他の使用技術', 'Vue.js')}
        </fieldset>
      </details>
      {text('notes', 'その他の指示', 'キーボードで操作できるようにする。検索フォームを追加する。')}
      {!validColors && <p className="error" role="alert">カラーコードを「#225e8e」の形式に直してください。</p>}
      <button type="submit" className="primary" disabled={!validColors}>Promptを作成</button>
    </form>
  </section>
}
