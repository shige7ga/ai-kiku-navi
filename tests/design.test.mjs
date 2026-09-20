import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { applyPreset, changeColumns, defaultSettings, generateDesignPrompt, layoutTracks, presets } from '../src/design/settings.ts'
import DesignForm, { ColorSettings, LayoutSettings, PresetSelect } from '../src/components/DesignForm.tsx'
import DesignPreview from '../src/components/DesignPreview.tsx'
import PromptTabs from '../src/components/PromptTabs.tsx'
import AppHeader from '../src/components/AppHeader.tsx'
import SelectField from '../src/components/SelectField.tsx'
import ReferenceSites from '../src/components/ReferenceSites.tsx'
import PromptResult from '../src/components/PromptResult.tsx'
import { generatePrompt, templates } from '../src/templates.ts'

function findElements(node, predicate) {
  if (!node || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap((child) => findElements(child, predicate))
  return [...(predicate(node) ? [node] : []), ...findElements(node.props?.children, predicate)]
}
const render = (component, props) => renderToStaticMarkup(createElement(component, props))

test('全4タブを選択でき、選択状態が表示される', () => {
  let selected = 'design'
  const tree = PromptTabs({ category: selected, onChange: (category) => { selected = category } })
  const buttons = findElements(tree, (node) => node.props?.role === 'tab')
  assert.equal(buttons.length, 4)
  for (const button of buttons) {
    button.props.onClick()
    const html = render(PromptTabs, { category: selected, onChange() {} })
    assert.match(html, new RegExp(`id="tab-${selected}"[^>]*aria-selected="true"`))
  }
  assert.equal(selected, 'saved')
})

test('7プリセットは色・角丸・影・余白・ボタン・カードを反映し入力内容を保持する', () => {
  let settings = { ...defaultSettings, service: '学習を記録するアプリ' }
  const tree = PresetSelect({ settings, onChange: (value) => { settings = value } })
  const buttons = findElements(tree, (node) => node.type === 'button')
  assert.equal(buttons.length, 7)
  for (const [index, button] of buttons.entries()) {
    button.props.onClick()
    for (const key of ['colors', 'radius', 'shadow', 'spacing', 'button', 'card', 'font']) assert.deepEqual(settings[key], presets[index][key])
    assert.equal(settings.service, '学習を記録するアプリ')
  }
  assert.equal(applyPreset(settings, '不明'), settings)
})

test('カラム変更で配置をリセットし、プレビューの構造と配置が変わる', () => {
  let settings = defaultSettings
  const tree = LayoutSettings({ settings, onChange: (value) => { settings = value } })
  findElements(tree, (node) => node.type === 'select')[0].props.onChange({ target: { value: '3' } })
  assert.equal(settings.pattern, 'サイド + メイン + サイド')
  assert.equal(layoutTracks(settings, 'PC'), '1fr 2fr 1fr')
  assert.equal(layoutTracks(settings, 'Tablet'), '1fr 2fr')
  assert.equal(layoutTracks(settings, 'Mobile'), '1fr')
  const before = render(DesignPreview, { settings })
  const after = render(DesignPreview, { settings: { ...settings, pattern: '3等分', placement: '全幅で下に並べる' } })
  assert.notEqual(before, after)
  assert.match(after, /grid-template-columns:1fr 1fr 1fr/)
  assert.match(after, /mock-full/)
  assert.equal(changeColumns(settings, '1').pattern, 'メインのみ')
})

test('カラー入力が3端末のプレビューに反映される', () => {
  let settings = defaultSettings
  const tree = ColorSettings({ settings, onChange: (value) => { settings = value } })
  findElements(tree, (node) => node.props?.id === 'color-main')[0].props.onChange({ target: { value: '#123456' } })
  const html = render(DesignPreview, { settings })
  assert.equal((html.match(/--mock-main:#123456/g) || []).length, 3)
  for (const device of ['PC', 'Tablet', 'Mobile']) assert.match(html, new RegExp(`<figcaption>${device}</figcaption>`))
})

test('ヘッダー・下部メニュー・角丸・余白・モバイル設定を表示に反映する', () => {
  const settings = { ...defaultSettings, header: 'なし', mobileHeader: false, bottomNav: false, bottomAction: true, radius: '大きめ', spacing: 'ゆったり', mobileSingle: false, mobileVertical: false }
  const html = render(DesignPreview, { settings })
  assert.doesNotMatch(html, /class="mock-header"/)
  assert.doesNotMatch(html, /class="mock-bottom-nav"/)
  assert.match(html, /class="mock-bottom-action"/)
  assert.match(html, /--mock-radius:13px/)
  assert.match(html, /--mock-gap:13px/)
  assert.match(html, /grid-template-columns:1fr 1fr/)
  assert.equal(layoutTracks(settings, 'Mobile'), '1fr 2fr')
})

test('未入力のまま生成でき、不正な色コードでは生成を止める', () => {
  let count = 0
  const submit = (settings) => {
    const tree = DesignForm({ settings, onChange() {}, onGenerate() { count++ } })
    findElements(tree, (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} })
  }
  submit(defaultSettings)
  submit({ ...defaultSettings, colors: { ...defaultSettings.colors, main: '#xx' } })
  assert.equal(count, 1)
  assert.match(generateDesignPrompt(defaultSettings), /汎用的なWebアプリ/)
})

test('入力とすべての主要設定を自然文のPromptへ反映する', () => {
  const settings = { ...defaultSettings, service: '毎日の記録', purpose: '継続したい', target: '初学者', keywords: '明るい', references: [{ id: 'site1', url: 'https://example.com', notes: '余白を参考' }], avoid: '点滅', technologies: ['React', 'その他'], otherTechnology: 'Vue.js', notes: '独自の条件', bottomAction: true }
  const prompt = generateDesignPrompt(settings)
  for (const value of ['毎日の記録', '継続したい', '初学者', '明るい', 'https://example.com', '余白を参考', '点滅', 'React', 'Vue.js', '独自の条件', '#225e8e', '画面下部に固定']) assert.ok(prompt.includes(value), value)
  for (const title of ['作成するサービス', '目的', 'ターゲット', 'デザインコンセプト', 'カラー', 'Typography', 'UI', 'レイアウト', 'PC / Tablet / Mobile', '参考サイト', '避けたいデザイン', '使用技術', 'その他の指示']) assert.ok(prompt.includes(`【${title}】`))
})

test('結果欄は編集・コピー・保存操作を受け付ける', async () => {
  let edited = ''; let copied = false; let saved = false
  const tree = PromptResult({ result: '生成した本文', name: 'テスト', notice: '', error: '', resultRef: { current: null }, setResult(value) { edited = value }, setName() {}, setNotice() {}, setError() {}, async copy() { copied = true }, save() { saved = true } })
  findElements(tree, (node) => node.props?.id === 'result')[0].props.onChange({ target: { value: '編集済み本文' } })
  await findElements(tree, (node) => node.type === 'button' && node.props.onClick)[0].props.onClick()
  findElements(tree, (node) => node.type === 'form')[0].props.onSubmit()
  assert.equal(edited, '編集済み本文')
  assert.ok(copied && saved)
})

test('既存の7テンプレートが生成できる', () => {
  assert.equal(templates.length, 7)
  for (const template of templates) assert.ok(generatePrompt(template, { [template.fields[0].id]: '入力内容' }, '箇条書き', '簡潔').includes('入力内容'))
})


test('ヘッダーにはアプリ名と4つのタブだけを表示する', () => {
  const html = render(AppHeader, { category: 'design', onChange() {} })
  assert.match(html, /<header/)
  assert.match(html, /<h1>AIきくナビ<\/h1>/)
  assert.equal((html.match(/role="tab"/g) || []).length, 4)
  assert.doesNotMatch(html, /<p[ >]/)
})

test('その他を選んだ場合だけ自由入力を表示し、選択・編集できる', () => {
  let value = '学生'; let customValue = ''
  const props = { label: 'ターゲット', example: '地域の人', value, options: ['学生', '社会人'], onChange(next) { value = next }, onCustomChange(next) { customValue = next } }
  assert.doesNotMatch(render(SelectField, props), /<input/)
  const select = findElements(SelectField(props), (node) => node.type === 'select')[0]
  select.props.onChange({ target: { value: 'その他' } })
  assert.equal(value, 'その他')
  const otherProps = { ...props, value }
  assert.match(render(SelectField, otherProps), /<input/)
  findElements(SelectField(otherProps), (node) => node.type === 'input')[0].props.onChange({ target: { value: '地域の人' } })
  assert.equal(customValue, '地域の人')
  assert.doesNotMatch(render(SelectField, { ...props, value: '学生', customValue }), /<input/)
})

test('自由入力した各設定と追加指示をPromptへ反映し、選び直した項目の自由入力を除外する', () => {
  const fields = ['purpose', 'target', 'font', 'radius', 'shadow', 'spacing', 'button', 'card', 'navigation', 'pattern', 'placement']
  const settings = { ...defaultSettings, custom: {}, notes: '検索機能を追加する' }
  for (const key of fields) {
    settings[key] = 'その他'
    settings.custom[key] = `${key}の独自条件`
  }
  const prompt = generateDesignPrompt(settings)
  for (const key of fields) assert.ok(prompt.includes(`${key}の独自条件`), key)
  assert.ok(prompt.includes('検索機能を追加する'))
  assert.doesNotMatch(generateDesignPrompt({ ...settings, target: '学生' }), /targetの独自条件/)
  assert.doesNotMatch(generateDesignPrompt({ ...settings, custom: {} }), /undefined/)
  const html = render(DesignPreview, { settings })
  assert.doesNotMatch(html, /undefined|NaN/)
  assert.match(html, /mock-card/)
})

test('複数の参考サイトを追加・編集・削除し、記入済み項目をPromptへ含める', () => {
  let sites = [{ id: 'first', url: 'https://example.com', notes: '余白' }]
  const tree = () => ReferenceSites({ sites, onChange(next) { sites = next } })
  findElements(tree(), (node) => node.type === 'button' && node.props.children === '参考サイトを追加')[0].props.onClick()
  assert.equal(sites.length, 2)
  assert.notEqual(sites[0].id, sites[1].id)
  findElements(tree(), (node) => node.type === 'input')[1].props.onChange({ target: { value: 'https://second.example.com' } })
  findElements(tree(), (node) => node.type === 'textarea')[1].props.onChange({ target: { value: '配色' } })
  const prompt = generateDesignPrompt({ ...defaultSettings, references: [...sites, { id: 'blank', url: ' ', notes: '' }] })
  for (const value of ['1. URL：https://example.com', '2. URL：https://second.example.com', '余白', '配色']) assert.ok(prompt.includes(value))
  assert.doesNotMatch(prompt, /3\. URL/)
  findElements(tree(), (node) => node.type === 'button' && node.props['aria-label'] === '参考サイト1を削除')[0].props.onClick()
  assert.equal(sites.length, 1)
  assert.equal(sites[0].notes, '配色')
  assert.match(generateDesignPrompt({ ...defaultSettings, references: [] }), /【参考サイト】\n指定なし/)
})

test('生成文は技術指定・動作するコード・ファイル単位の提示・レスポンシブ対応を要求する', () => {
  const prompt = generateDesignPrompt({ ...defaultSettings, technologies: ['React', 'Tailwind CSS'] })
  for (const phrase of ['実際に動くWebページ', 'ソースコードをすぐに出力', '長い説明より実装に使えるコードを優先', '指定した技術構成を使用', 'PC / Tablet / Mobileすべてでレスポンシブ対応', '一般的な構成で補完', '必要なファイルごとにファイル名', '省略のないコードブロック', 'React / Tailwind CSS']) assert.ok(prompt.includes(phrase), phrase)
})
