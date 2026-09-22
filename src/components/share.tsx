import { useRef, useState } from 'preact/hooks'
import { encode } from 'uqr'
import { IconBrandChrome, IconBrandWhatsapp, IconCheck, IconCopy, IconQrcode, IconShare, IconWorld, IconX } from '@tabler/icons-preact'

/** Public address of the app. Always share this one, even from a dev server or the installed app. */
export const SITE_URL = 'https://amirping.github.io/wa9tech-el-masyed/'

const SHARE_TEXT = 'وقتاش المصيد: أحسن أيام وبلايص الصيد بالقصبة في الشط'
const isAndroid = () => /Android/i.test(navigator.userAgent)

/** Inside the installed app, a normal link would reopen the app itself. On Android an intent forces Chrome. */
const browserUrl = () =>
  isAndroid()
    ? `intent://${SITE_URL.replace(/^https:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
    : SITE_URL

function QrCode({ text, size = 232 }: { text: string; size?: number }) {
  const { data, size: n } = encode(text, { ecc: 'M', border: 2 })
  let d = ''
  data.forEach((row, y) => row.forEach((on, x) => on && (d += `M${x} ${y}h1v1h-1z`)))
  // Always dark on white, whatever the theme: phone cameras read that best.
  return (
    <svg class="qr" width={size} height={size} viewBox={`0 0 ${n} ${n}`} shape-rendering="crispEdges" role="img" aria-label="كود QR للتطبيقة">
      <rect width={n} height={n} fill="#fff" />
      <path d={d} fill="#0e2a3b" />
    </svg>
  )
}

export function ShareButton() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)
  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  const open = () => {
    setCopied(false)
    dialog.current?.showModal()
  }
  const close = () => dialog.current?.close()

  const share = async () => {
    try {
      await navigator.share({ title: 'وقتاش المصيد', text: SHARE_TEXT, url: SITE_URL })
    } catch {
      // Cancelled by the user: nothing to do.
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <button class="refresh share-btn" onClick={open} aria-haspopup="dialog">
        <IconQrcode size={18} stroke={2} /> بارتاجي
      </button>
      <dialog
        ref={dialog}
        class="share-sheet"
        aria-labelledby="share-title"
        onClick={(e) => e.target === dialog.current && close()}
      >
        <div class="share-body">
          <div class="share-head">
            <h2 id="share-title">بارتاجي مع صحابك</h2>
            <button class="icon-btn" onClick={close} aria-label="سكّر">
              <IconX size={22} stroke={2} />
            </button>
          </div>
          <QrCode text={SITE_URL} />
          <p class="share-hint">خلّي صاحبك يصوّر الكود بكاميرا التليفون متاعو.</p>
          <p class="share-url" dir="ltr">{SITE_URL.replace(/^https:\/\//, '')}</p>
          <div class="share-actions">
            {canShare && (
              <button class="btn" onClick={share}>
                <IconShare size={20} stroke={2} /> ابعث
              </button>
            )}
            <a class="btn whatsapp" href={`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT}\n${SITE_URL}`)}`} target="_blank" rel="noopener">
              <IconBrandWhatsapp size={20} stroke={2} /> واتساب
            </a>
            <button class="btn ghost" onClick={copy}>
              {copied ? <IconCheck size={20} stroke={2} /> : <IconCopy size={20} stroke={2} />}
              {copied ? 'تنسخ' : 'انسخ الرابط'}
            </button>
            <a class="btn ghost" href={browserUrl()} target="_blank" rel="noopener">
              {isAndroid() ? <IconBrandChrome size={20} stroke={2} /> : <IconWorld size={20} stroke={2} />}
              {isAndroid() ? 'حلّ في Chrome' : 'حلّ في المتصفح'}
            </a>
          </div>
        </div>
      </dialog>
    </>
  )
}
