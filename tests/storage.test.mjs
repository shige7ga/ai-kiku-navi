import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadTemplates, saveTemplate } from '../src/storage.ts'
import { copyPrompt } from '../src/clipboard.ts'

Object.defineProperty(globalThis, 'localStorage', { value: undefined, configurable: true, writable: true })
Object.defineProperty(globalThis.navigator, 'clipboard', { value: undefined, configurable: true, writable: true })

test('既存の保存本文を維持して追加保存でき、再読み込みで復元できる', () => {
  const data = new Map()
  globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  const old = { id: 'old', name: '既存', body: '学習の本文', createdAt: '2026-01-01T00:00:00Z' }
  const design = { ...old, id: 'design', name: 'Webデザイン', body: '編集したデザイン本文' }
  assert.deepEqual(loadTemplates(), [])
  saveTemplate(old)
  assert.deepEqual(saveTemplate(design), [design, old])
  assert.deepEqual(loadTemplates(), [design, old])
})

test('破損データや容量不足はエラーとなり既存データを上書きしない', () => {
  let wrote = false
  globalThis.localStorage = { getItem: () => '{broken', setItem() { wrote = true } }
  assert.throws(loadTemplates)
  assert.throws(() => saveTemplate({ id: 'a', name: 'a', body: 'a', createdAt: new Date().toISOString() }))
  assert.equal(wrote, false)
  globalThis.localStorage = { getItem: () => '[]', setItem() { throw new Error('容量不足') } }
  assert.throws(() => saveTemplate({ id: 'a', name: 'a', body: 'a', createdAt: new Date().toISOString() }))
})

test('コピーは編集済み本文をClipboard APIへ渡し失敗を呼び出し側へ伝える', async () => {
  let copied = ''
  globalThis.navigator.clipboard = { async writeText(text) { copied = text } }
  await copyPrompt('編集済みのPrompt')
  assert.equal(copied, '編集済みのPrompt')
  globalThis.navigator.clipboard = { async writeText() { throw new Error('許可なし') } }
  await assert.rejects(copyPrompt('本文'), /許可なし/)
})
