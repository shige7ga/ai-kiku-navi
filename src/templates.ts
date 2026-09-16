export type PromptTemplate = {
  id: string
  name: string
  request: string
  fields: { id: string; label: string; placeholder: string; section: string }[]
}

export const templates: PromptTemplate[] = [
  {
    id: 'question', name: '技術的な質問', request: '以下の技術的な質問に回答してください。',
    fields: [
      { id: 'question', label: '知りたいこと', placeholder: '例：Reactのpropsとstateの違いを知りたい', section: '目的・依頼内容' },
      { id: 'context', label: '学習状況・使っている技術', placeholder: '例：JavaScriptの基礎を学び、Reactを勉強しています', section: '前提・現在の状況' },
      { id: 'notes', label: '調べたこと・わからない点', placeholder: '例：公式ドキュメントを読んだが、使い分けがわからない', section: '補足情報' },
    ],
  },
  {
    id: 'error', name: 'エラー相談', request: '以下のエラーについて、原因と解決手順を教えてください。',
    fields: [
      { id: 'goal', label: 'やりたいこと', placeholder: '例：フォームの送信後に結果を表示したい', section: '目的・依頼内容' },
      { id: 'error', label: 'エラーメッセージ・発生する操作', placeholder: 'エラー全文や、どの操作で発生したかを入力', section: '前提・現在の状況' },
      { id: 'environment', label: '使っている技術・環境', placeholder: '例：React、TypeScript、Chrome', section: '前提・現在の状況' },
      { id: 'tried', label: '試したこと・関連するコード', placeholder: '例：変数名を確認したが解決しなかった', section: '補足情報' },
    ],
  },
  {
    id: 'pr', name: 'PR文作成', request: '以下の変更内容をもとに、PRのタイトルと説明文を作成してください。',
    fields: [
      { id: 'changes', label: '変更したこと', placeholder: '例：入力フォームに必須項目のチェックを追加', section: '目的・依頼内容' },
      { id: 'background', label: '変更の背景・目的', placeholder: '例：未入力のまま送信できてしまうため', section: '前提・現在の状況' },
      { id: 'checks', label: '動作確認・補足', placeholder: '例：未入力時にエラーが表示されることを確認', section: '補足情報' },
    ],
  },
  {
    id: 'notion', name: 'Notion用まとめ', request: '以下の内容を、Notionに貼り付けやすい見出しと箇条書きで整理してください。',
    fields: [
      { id: 'content', label: 'まとめたい内容・メモ', placeholder: '学習メモや調べた内容を貼り付けてください', section: '目的・依頼内容' },
      { id: 'context', label: '用途・読む人', placeholder: '例：自分の学習記録として後から見返したい', section: '前提・現在の状況' },
      { id: 'notes', label: '特に残したいポイント', placeholder: '例：コマンドの使い方と注意点', section: '補足情報' },
    ],
  },
  {
    id: 'codex', name: 'Codexへの実装依頼', request: '以下の要件に沿って実装してください。',
    fields: [
      { id: 'feature', label: '実装したい機能', placeholder: '例：生成した文章をコピーするボタンを追加したい', section: '目的・依頼内容' },
      { id: 'context', label: '技術構成・現在の実装', placeholder: '例：React + TypeScript。結果を表示する画面は実装済み', section: '前提・現在の状況' },
      { id: 'constraints', label: '制約・完了条件', placeholder: '例：ライブラリは追加せず、コピー完了の表示を出す', section: '補足情報' },
    ],
  },
  {
    id: 'idea', name: 'アイデア整理', request: '以下のアイデアを整理し、具体化するための提案をしてください。',
    fields: [
      { id: 'idea', label: '考えているアイデア', placeholder: '例：学習の継続を助けるアプリを作りたい', section: '目的・依頼内容' },
      { id: 'audience', label: '対象の人・解決したい悩み', placeholder: '例：学習の計画を立てるのが苦手なIT初学者', section: '前提・現在の状況' },
      { id: 'constraints', label: '条件・迷っていること', placeholder: '例：2週間で作れる範囲に絞りたい', section: '補足情報' },
    ],
  },
  {
    id: 'summary', name: '文章要約', request: '以下の文章の要点を、元の内容に忠実に要約してください。',
    fields: [
      { id: 'text', label: '要約したい文章', placeholder: 'ここに文章を貼り付けてください', section: '目的・依頼内容' },
      { id: 'context', label: '要約の用途・読む人', placeholder: '例：チーム内で記事の内容を共有したい', section: '前提・現在の状況' },
      { id: 'notes', label: '注目したい内容・文字数の目安', placeholder: '例：結論と理由を中心に300文字程度', section: '補足情報' },
    ],
  },
]

export function generatePrompt(template: PromptTemplate, values: Record<string, string>, format: string, detail: string): string {
  const blocks = ['目的・依頼内容', '前提・現在の状況', '補足情報'].flatMap((section) => {
    const entries = template.fields
      .filter((field) => field.section === section && values[field.id]?.trim())
      .map((field) => `${field.label}：\n${values[field.id].trim()}`)
    if (section === '目的・依頼内容') entries.unshift(template.request)
    return entries.length ? [`【${section}】\n${entries.join('\n\n')}`] : []
  })
  const preferences = [format.trim() && `回答形式：${format.trim()}`, detail.trim() && `詳しさ：${detail.trim()}`].filter(Boolean)
  if (preferences.length) blocks.push(`【希望する回答形式・詳しさ】\n${preferences.join('\n')}`)
  return blocks.join('\n\n')
}
