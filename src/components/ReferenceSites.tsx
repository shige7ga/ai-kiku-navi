import type { ReferenceSite } from '../design/settings'

export default function ReferenceSites({ sites, onChange }: { sites: ReferenceSite[]; onChange: (sites: ReferenceSite[]) => void }) {
  function update(id: string, key: 'url' | 'notes', value: string) {
    onChange(sites.map((site) => site.id === id ? { ...site, [key]: value } : site))
  }
  return <fieldset>
    <legend>参考サイト</legend>
    {sites.map((site, index) => <div className="reference-site" key={site.id}>
      <label htmlFor={`${site.id}-url`}>参考サイトURL {index + 1}</label>
      <input id={`${site.id}-url`} value={site.url} placeholder="例：https://example.com" onChange={(event) => update(site.id, 'url', event.target.value)} />
      <label htmlFor={`${site.id}-notes`}>参考にしたい部分 {index + 1}</label>
      <textarea id={`${site.id}-notes`} rows={2} value={site.notes} placeholder="例：カードUIと余白の取り方" onChange={(event) => update(site.id, 'notes', event.target.value)} />
      <button type="button" aria-label={`参考サイト${index + 1}を削除`} onClick={() => onChange(sites.filter((item) => item.id !== site.id))}>削除</button>
    </div>)}
    <button type="button" onClick={() => onChange([...sites, { id: crypto.randomUUID(), url: '', notes: '' }])}>参考サイトを追加</button>
  </fieldset>
}
