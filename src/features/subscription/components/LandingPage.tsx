import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  UtensilsCrossed, QrCode, Bell, LayoutDashboard,
  Smartphone, Globe, CheckCircle2, ArrowLeft
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { setLanguage } from '@/shared/lib/i18n'

export function LandingPage() {
  const { t, i18n } = useTranslation()

  const features = [
    { icon: UtensilsCrossed, text: t('landing.feature1') },
    { icon: QrCode, text: t('landing.feature2') },
    { icon: Bell, text: t('landing.feature3') },
    { icon: LayoutDashboard, text: t('landing.feature4') },
    { icon: Smartphone, text: t('landing.feature5') },
    { icon: Globe, text: t('landing.feature6') },
  ]

  const steps = [
    { num: '1', title: t('landing.step1_title'), desc: t('landing.step1_desc') },
    { num: '2', title: t('landing.step2_title'), desc: t('landing.step2_desc') },
    { num: '3', title: t('landing.step3_title'), desc: t('landing.step3_desc') },
  ]

  const plans = [
    {
      name: t('subscription.basic'),
      price: '5',
      features: [t('landing.feature1'), t('landing.feature2'), t('landing.feature4')],
      popular: false,
    },
    {
      name: t('subscription.pro'),
      price: '12',
      features: [
        t('landing.feature1'), t('landing.feature2'), t('landing.feature3'),
        t('landing.feature4'), t('landing.feature5'), t('landing.feature6'),
      ],
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-xl">{t('app_name')}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </button>
            <Link to="/login">
              <Button variant="outline" size="sm">{t('auth.login')}</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">{t('landing.get_started')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>🚀</span>
            SaaS Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {t('landing.hero_title')}
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-base px-8">
                {t('landing.get_started')}
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <Link to="/menu/demo">
              <Button variant="outline" size="lg" className="text-base px-8">
                Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('landing.how_it_works')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('landing.features_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <f.icon size={22} className="text-orange-600" />
                </div>
                <p className="font-medium text-gray-800">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('landing.pricing_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 border-2 ${plan.popular ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}
              >
                {plan.popular && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                    ⭐ Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-orange-600">{plan.price}</span>
                  <span className="text-gray-400">{t('subscription.per_month')}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full">
                    {t('landing.get_started')}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-orange-500 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{t('landing.cta_title')}</h2>
          <p className="text-orange-100 mb-8 text-lg">{t('landing.cta_subtitle')}</p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="text-base px-8 text-orange-600">
              {t('landing.get_started')}
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        © 2025 {t('app_name')} — {t('app_tagline')}
      </footer>
    </div>
  )
}
