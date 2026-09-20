import type { CSSProperties } from 'react'
import { layoutTracks } from '../design/settings'
import type { DesignSettings } from '../design/settings'

type Device = 'PC' | 'Tablet' | 'Mobile'
export function DevicePreview({ settings: s, device }: { settings: DesignSettings; device: Device }) {
  const mobile = device === 'Mobile'
  const single = s.columns === '1' || (mobile && s.mobileSingle)
  const mainIndex = single || s.pattern === 'メイン + サイドバー' ? 0 : 1
  const styles = {
    '--mock-main': s.colors.main, '--mock-bg': s.colors.background, '--mock-accent': s.colors.accent, '--mock-text': s.colors.text,
    '--mock-radius': { なし: '0px', 小さめ: '3px', 標準: '7px', 大きめ: '13px', その他: '7px' }[s.radius],
    '--mock-gap': { コンパクト: '4px', 標準: '8px', ゆったり: '13px', その他: '8px' }[s.spacing],
    '--mock-shadow': { なし: 'none', 控えめ: '0 1px 3px #0002', 標準: '0 3px 6px #0003', 強め: '0 4px 9px #0005', その他: '0 1px 3px #0002' }[s.shadow],
    fontFamily: s.font === '上品な明朝体' ? 'serif' : s.font === 'やわらかな丸ゴシック体' ? '"Hiragino Maru Gothic ProN", cursive' : 'sans-serif',
  } as CSSProperties
  const cards = <div className="mock-cards" style={{ gridTemplateColumns: mobile && !s.mobileVertical ? '1fr 1fr' : '1fr' }}>{['今日のおすすめ', '新しいお知らせ'].map((title) => <div className="mock-card" data-card={s.card === 'その他' ? '白い面' : s.card} key={title}>
    <div className="mock-picture" />
    <strong>{title}</strong>
    <div className="mock-line" />
  </div>)}</div>
  const action = <div className="mock-button" data-button={s.button === 'その他' ? '塗りつぶし' : s.button}>はじめる</div>
  const nav = <div className="mock-menu">ホーム ・ 一覧 ・ 保存</div>
  const showHeader = mobile ? s.mobileHeader : s.header === 'あり'
  return <figure className={`device device-${device.toLowerCase()}`}>
    <figcaption>{device}</figcaption>
    <div className="mock-screen" style={styles}>
      {showHeader && <div className="mock-header">
        <strong>{s.service.trim() || 'わたしのサービス'}</strong>{(s.navigation === 'ヘッダー内' || s.navigation === 'その他') && nav}</div>}
      {!showHeader && (s.navigation === 'ヘッダー内' || s.navigation === 'その他') && nav}
      <div className="mock-layout" style={{ gridTemplateColumns: layoutTracks(s, device) }}>
        {Array.from({ length: single ? 1 : Number(s.columns) }, (_, index) => <div key={index} className={index === mainIndex ? 'mock-main' : 'mock-side'}>
          {index === mainIndex ? <>
            <strong>メインコンテンツ</strong>{single && s.navigation === 'サイドバー' && nav}{(!mobile || !s.bottomAction) && action}</> : <>
            <strong>サイドバー</strong>{s.navigation === 'サイドバー' && nav}<div className="mock-line" />
            <div className="mock-line" />
          </>}
          {(s.placement === '各カラムに分ける' || ((s.placement === 'メインにまとめる' || s.placement === 'その他') && index === mainIndex)) && cards}
        </div>)}
        {s.placement === '全幅で下に並べる' && <div className="mock-full">{cards}</div>}
      </div>
      {mobile && s.bottomAction && <div className="mock-bottom-action">{action}</div>}
      {mobile && s.bottomNav && <div className="mock-bottom-nav">⌂ ホーム  ☆ 保存  ☰ メニュー</div>}
    </div>
  </figure>
}
export default function DesignPreview({ settings }: { settings: DesignSettings }) {
  return <section className="preview-panel" aria-label="デザインプレビュー">
    <div className="device-previews">{(['PC', 'Tablet', 'Mobile'] as const).map((device) => <DevicePreview key={device} settings={settings} device={device} />)}</div>
  </section>
}
