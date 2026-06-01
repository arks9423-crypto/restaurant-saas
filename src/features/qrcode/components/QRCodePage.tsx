import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import { Download, Printer, QrCode } from 'lucide-react'
import { useAuthStore } from '@/shared/store/authStore'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardBody } from '@/shared/components/ui/Card'

export function QRCodePage() {
  const { t, i18n } = useTranslation()
  const { restaurant } = useAuthStore()
  const qrRef = useRef<HTMLDivElement>(null)

  const menuUrl = `${window.location.origin}/menu/${restaurant?.slug}`
  const restaurantName = i18n.language === 'ar' ? restaurant?.name_ar : restaurant?.name_en

  function handleDownload() {
    if (!qrRef.current) return
    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const size = 512
    canvas.width = size
    canvas.height = size + 80

    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size + 80)

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size)
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(restaurantName || '', size / 2, size + 40)
      ctx.font = '16px Arial'
      ctx.fillStyle = '#6b7280'
      ctx.fillText(t('qr.scan_to_order'), size / 2, size + 65)

      const a = document.createElement('a')
      a.download = `qr-${restaurant?.slug}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !qrRef.current) return
    const svg = qrRef.current.querySelector('svg')
    if (!svg) return
    const svgHtml = svg.outerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR - ${restaurantName}</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif; }
            .container { text-align: center; padding: 40px; }
            h1 { font-size: 32px; margin-bottom: 8px; color: #1f2937; }
            p { color: #6b7280; margin-bottom: 24px; font-size: 18px; }
            svg { width: 350px; height: 350px; }
            .footer { margin-top: 16px; font-size: 16px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${restaurantName}</h1>
            <p>${t('qr.scan_to_order')}</p>
            ${svgHtml}
            <p class="footer">${menuUrl}</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('qr.title')}</h1>

      <Card>
        <CardBody className="flex flex-col items-center gap-6 py-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
              <QrCode size={32} className="text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{restaurantName}</h2>
            <p className="text-gray-500 mt-1 text-sm">{t('qr.description')}</p>
          </div>

          <div
            ref={qrRef}
            className="bg-white p-6 rounded-2xl border-4 shadow-md"
            style={{ borderColor: restaurant?.theme_color || '#f97316' }}
          >
            <QRCode
              value={menuUrl}
              size={260}
              fgColor="#1f2937"
              bgColor="#ffffff"
              level="H"
            />
          </div>

          <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-2 rounded-lg break-all text-center max-w-sm">
            {menuUrl}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download size={18} />
              {t('qr.download')}
            </Button>
            <Button className="flex-1" onClick={handlePrint}>
              <Printer size={18} />
              {t('qr.print')}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="text-sm text-gray-600 leading-relaxed">
            💡 {i18n.language === 'ar'
              ? 'ضع رمز QR على باب مطعمك أو على الطاولات أو في مواقف السيارات (البركنات) ليتمكن الزبائن من الطلب مباشرة بمسح الرمز.'
              : 'Place the QR code on your restaurant door, tables, or parking spots so customers can order directly by scanning it.'}
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
