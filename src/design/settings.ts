export const uiOptions = {
  font: ['読みやすいゴシック体', 'やわらかな丸ゴシック体', '上品な明朝体', 'その他'],
  radius: ['なし', '小さめ', '標準', '大きめ', 'その他'],
  shadow: ['なし', '控えめ', '標準', '強め', 'その他'],
  spacing: ['コンパクト', '標準', 'ゆったり', 'その他'],
  button: ['塗りつぶし', '枠線', '丸いボタン', 'その他'],
  card: ['白い面', '枠線', '背景になじませる', 'その他'],
  header: ['あり', 'なし'],
  navigation: ['ヘッダー内', 'サイドバー', 'なし', 'その他'],
} as const
export type UISettings = { [K in keyof typeof uiOptions]: (typeof uiOptions)[K][number] }
export type Colors = { main: string; background: string; accent: string; text: string }
export const patterns = {
  '1': ['メインのみ'],
  '2': ['サイドバー + メイン', 'メイン + サイドバー'],
  '3': ['サイド + メイン + サイド', '3等分', 'メインを広くした3カラム'],
} as const
export type Columns = keyof typeof patterns
export type CustomField = 'purpose' | 'target' | 'pattern' | 'placement' | Exclude<keyof UISettings, 'header'>
export type ReferenceSite = { id: string; url: string; notes: string }
export type DesignSettings = UISettings & {
  preset: string; colors: Colors; service: string; purpose: string; target: string; keywords: string
  columns: Columns; pattern: string; placement: string
  mobileSingle: boolean; mobileHeader: boolean; bottomNav: boolean; mobileVertical: boolean; bottomAction: boolean
  custom: Partial<Record<CustomField, string>>; references: ReferenceSite[]; avoid: string; technologies: string[]; otherTechnology: string; notes: string
}
type Preset = { name: string; colors: Colors } & Pick<UISettings, 'radius' | 'shadow' | 'spacing' | 'button' | 'card' | 'font'>
const base: Omit<Preset, 'name' | 'colors'> = { radius: '標準', shadow: '控えめ', spacing: '標準', button: '塗りつぶし', card: '白い面', font: '読みやすいゴシック体' }
export const presets: Preset[] = [
  { ...base, name: 'シンプル', colors: { main: '#225e8e', background: '#f4f7fa', accent: '#d97706', text: '#243447' } },
  { ...base, name: 'SaaS', radius: '小さめ', shadow: '標準', colors: { main: '#4f46e5', background: '#eef2ff', accent: '#0f766e', text: '#1e293b' } },
  { ...base, name: 'ポップ', radius: '大きめ', shadow: '強め', button: '丸いボタン', font: 'やわらかな丸ゴシック体', colors: { main: '#be185d', background: '#fff7ed', accent: '#7c3aed', text: '#422006' } },
  { ...base, name: 'ナチュラル', spacing: 'ゆったり', shadow: 'なし', colors: { main: '#52734d', background: '#f5f3e9', accent: '#a65f32', text: '#344036' } },
  { ...base, name: 'ダーク', card: '背景になじませる', colors: { main: '#a5b4fc', background: '#111827', accent: '#fbbf24', text: '#f9fafb' } },
  { ...base, name: '高級感', radius: 'なし', spacing: 'ゆったり', button: '枠線', font: '上品な明朝体', colors: { main: '#806323', background: '#faf8f2', accent: '#883f48', text: '#292524' } },
  { ...base, name: 'ミニマル', radius: 'なし', shadow: 'なし', spacing: 'ゆったり', card: '枠線', button: '枠線', colors: { main: '#334155', background: '#ffffff', accent: '#475569', text: '#0f172a' } },
]
export function applyPreset(settings: DesignSettings, name: string): DesignSettings {
  const preset = presets.find((item) => item.name === name)
  if (!preset) return settings
  const { name: presetName, ...style } = preset
  return { ...settings, ...style, colors: { ...style.colors }, preset: presetName }
}
export const defaultSettings: DesignSettings = {
  ...base, preset: 'シンプル', colors: { ...presets[0].colors }, service: '', purpose: '使いやすいサービスを作る', target: '初めて利用する人', keywords: '',
  header: 'あり', navigation: 'ヘッダー内', columns: '2', pattern: patterns['2'][0], placement: 'メインにまとめる',
  mobileSingle: true, mobileHeader: true, bottomNav: true, mobileVertical: true, bottomAction: false,
  custom: {}, references: [{ id: 'reference-1', url: '', notes: '' }], avoid: '', technologies: [], otherTechnology: '', notes: '',
}
export function changeColumns(settings: DesignSettings, columns: Columns): DesignSettings {
  return { ...settings, columns, pattern: patterns[columns][0] }
}
export function layoutTracks(settings: DesignSettings, device: 'PC' | 'Tablet' | 'Mobile'): string {
  if (device === 'Mobile' && settings.mobileSingle) return '1fr'
  if (settings.columns === '1') return '1fr'
  if (device === 'Tablet') return settings.pattern === 'メイン + サイドバー' ? '2fr 1fr' : '1fr 2fr'
  if (settings.columns === '2') return settings.pattern === 'メイン + サイドバー' ? '2fr 1fr' : '1fr 2fr'
  return settings.pattern === '3等分' ? '1fr 1fr 1fr' : settings.pattern === 'メインを広くした3カラム' ? '1fr 3fr 1fr' : '1fr 2fr 1fr'
}
export function selectedValue(s: DesignSettings, key: CustomField): string {
  return s[key] === 'その他' ? s.custom[key]?.trim() || '指定なし（一般的な構成で補完）' : s[key]
}
export function generateDesignPrompt(s: DesignSettings): string {
  const fallback = (value: string, text = 'サービスに合う一般的な内容で補完してください。') => value.trim() || text
  const references = s.references.filter((site) => site.url.trim() || site.notes.trim())
  return `Web開発者として、以下のデザイン条件を反映し、実際に動くWebページの実装用ソースコードをすぐに出力してください。デザイン案の説明だけで終わらせず、長い説明より実装に使えるコードを優先してください。
指定した技術構成を使用し、PC / Tablet / Mobileすべてでレスポンシブ対応してください。不足している細かい仕様は一般的な構成で補完し、確認質問で作業を止めないでください。
必要なファイルごとにファイル名と省略のないコードブロックを提示してください。起動に必要な設定ファイルも含め、導入・実行手順だけを簡潔に添えてください。

【作成するサービス】
${fallback(s.service, 'サービス内容は未定です。汎用的なWebアプリを想定してください。')}
【目的】
${selectedValue(s, 'purpose')}
【ターゲット】
${selectedValue(s, 'target')}
【デザインコンセプト】
${s.preset}をベースに、${fallback(s.keywords, 'わかりやすさと操作のしやすさ')}を意識してください。以下の個別設定を優先してください。
【カラー】
メイン ${s.colors.main}、背景 ${s.colors.background}、アクセント ${s.colors.accent}、文字 ${s.colors.text}を使用してください。文字の読みやすいコントラストを確保してください。
【Typography】
${selectedValue(s, 'font')}を使い、見出しと本文の違いを明確にしてください。
【UI】
角丸：${selectedValue(s, 'radius')}、影：${selectedValue(s, 'shadow')}、余白：${selectedValue(s, 'spacing')}、ボタン：${selectedValue(s, 'button')}、カード：${selectedValue(s, 'card')}。ヘッダー：${s.header}、ナビゲーション：${selectedValue(s, 'navigation')}。ヘッダーがない場合、ヘッダー内のナビゲーションは本文の先頭へ配置してください。
【レイアウト】
カードなど主要コンテンツは「${selectedValue(s, 'placement')}」構成にしてください。
【PC / Tablet / Mobile】
PC：${s.columns}カラム（${selectedValue(s, 'pattern')}）。
Tablet：${s.columns === '1' ? '1カラムを維持' : '2カラムに整理し、3つ目の領域は下へ折り返す'}。
Mobile：${s.mobileSingle ? '1カラムに変更' : 'PCのカラム構成を維持し、狭い画面でも読めるよう調整'}。ヘッダー${s.mobileHeader ? 'あり' : 'なし'}、ボトムナビゲーション${s.bottomNav ? 'あり' : 'なし'}。カードは${s.mobileVertical ? '縦並び' : '2列'}、主要ボタンは${s.bottomAction ? '画面下部に固定し、本文と重ならないよう余白を確保' : 'メインコンテンツ内に配置'}してください。
【参考サイト】
${references.length ? references.map((site, index) => `${index + 1}. URL：${fallback(site.url, '指定なし')}\n参考にしたい部分：${fallback(site.notes, '指定なし')}`).join('\n') : '指定なし'}
【避けたいデザイン】
${fallback(s.avoid, '読みにくい文字、操作がわかりにくい配置は避けてください。')}
【使用技術】
${s.technologies.length ? s.technologies.map((t) => t === 'その他' ? fallback(s.otherTechnology, '未指定の技術は一般的な構成で補完してください') : t).join(' / ') : '指定なし。HTML / CSS / JavaScriptでブラウザー上で動く構成にしてください。'}
【その他の指示】
${fallback(s.notes, 'キーボード操作とレスポンシブ表示に配慮してください。')}`
}
