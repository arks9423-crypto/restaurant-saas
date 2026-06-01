import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/supabase/client'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { generateSlug } from '@/shared/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    nameAr: '',
    nameEn: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message || t('auth.register_error'))
      setLoading(false)
      return
    }

    if (!data.user) {
      setError(t('auth.register_error'))
      setLoading(false)
      return
    }

    // If email confirmation required, sign in immediately to get a session
    let userId = data.user.id
    if (!data.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInError || !signInData.session) {
        // Account created but needs email confirmation
        setError('Please check your email to confirm your account, then log in.')
        setLoading(false)
        return
      }
      userId = signInData.user.id
    }

    const slug = generateSlug(form.nameEn || form.nameAr)
    const { error: restaurantError } = await supabase.from('restaurants').insert({
      owner_id: userId,
      name_ar: form.nameAr,
      name_en: form.nameEn,
      slug,
      subscription_status: 'trial',
      subscription_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (restaurantError) {
      setError(restaurantError.message || t('auth.register_error'))
      setLoading(false)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
            <UtensilsCrossed size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('app_name')}</h1>
          <p className="text-gray-500 mt-1">{t('app_tagline')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('auth.register')}</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              id="nameAr"
              label={t('auth.restaurant_name_ar')}
              value={form.nameAr}
              onChange={update('nameAr')}
              required
              placeholder="مطعم النخيل"
            />
            <Input
              id="nameEn"
              label={t('auth.restaurant_name_en')}
              value={form.nameEn}
              onChange={update('nameEn')}
              required
              placeholder="Al Nakheel Restaurant"
            />
            <Input
              id="email"
              type="email"
              label={t('auth.email')}
              value={form.email}
              onChange={update('email')}
              required
              autoComplete="email"
            />
            <Input
              id="password"
              type="password"
              label={t('auth.password')}
              value={form.password}
              onChange={update('password')}
              required
              minLength={6}
              autoComplete="new-password"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? t('auth.registering') : t('auth.register')}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-orange-600 font-medium hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
