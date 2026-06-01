import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Palette, Phone } from 'lucide-react'
import { supabase } from '@/supabase/client'
import { useAuthStore } from '@/shared/store/authStore'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/shared/components/ui/Card'

const THEME_COLORS = [
  '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#64748b'
]

export function SettingsPage() {
  const { t } = useTranslation()
  const { restaurant, setRestaurant } = useAuthStore()
  const [form, setForm] = useState({
    name_ar: restaurant?.name_ar || '',
    name_en: restaurant?.name_en || '',
    phone: restaurant?.phone || '',
    theme_color: restaurant?.theme_color || '#f97316',
    logo_url: restaurant?.logo_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    if (!restaurant) return
    setSaving(true)
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        name_ar: form.name_ar,
        name_en: form.name_en,
        phone: form.phone || null,
        theme_color: form.theme_color,
        logo_url: form.logo_url || null,
      })
      .eq('id', restaurant.id)
      .select()
      .single()

    if (!error && data) {
      setRestaurant(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">{t('settings.restaurant_info')}</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label={t('auth.restaurant_name_ar')}
            value={form.name_ar}
            onChange={(e) => setForm(f => ({ ...f, name_ar: e.target.value }))}
          />
          <Input
            label={t('auth.restaurant_name_en')}
            value={form.name_en}
            onChange={(e) => setForm(f => ({ ...f, name_en: e.target.value }))}
          />
          <div className="relative">
            <Phone size={18} className="absolute start-3 top-8 text-gray-400" />
            <Input
              label={t('settings.phone')}
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              className="ps-9"
            />
          </div>
          <Input
            label={t('settings.logo') + ' URL'}
            value={form.logo_url}
            onChange={(e) => setForm(f => ({ ...f, logo_url: e.target.value }))}
            placeholder="https://..."
          />
          {form.logo_url && (
            <img src={form.logo_url} className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette size={18} />
            <h2 className="font-semibold text-gray-900">{t('settings.appearance')}</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-500 mb-3">{t('settings.theme_color')}</p>
          <div className="flex flex-wrap gap-3">
            {THEME_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setForm(f => ({ ...f, theme_color: color }))}
                className="w-10 h-10 rounded-xl border-2 transition-transform hover:scale-110"
                style={{
                  background: color,
                  borderColor: form.theme_color === color ? '#1f2937' : 'transparent',
                  transform: form.theme_color === color ? 'scale(1.15)' : undefined,
                }}
              />
            ))}
            <input
              type="color"
              value={form.theme_color}
              onChange={(e) => setForm(f => ({ ...f, theme_color: e.target.value }))}
              className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
              title="Custom color"
            />
          </div>
          <div className="mt-4 p-4 rounded-xl text-white font-bold text-center" style={{ background: form.theme_color }}>
            Preview
          </div>
        </CardBody>
      </Card>

      <Button onClick={save} loading={saving} size="lg" className="w-full">
        <Save size={18} />
        {saving ? t('settings.saving') : saved ? t('settings.saved') + ' ✓' : t('settings.save_changes')}
      </Button>
    </div>
  )
}
