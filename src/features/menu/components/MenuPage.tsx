import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Image } from 'lucide-react'
import { useCategories, useMenuItems, useMenuMutations } from '@/features/menu/hooks/useMenu'
import { useAuthStore } from '@/shared/store/authStore'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Card, CardBody } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Modal } from '@/shared/components/ui/Modal'
import { formatPrice } from '@/shared/lib/utils'
import type { MenuCategory, MenuItem } from '@/supabase/types'

export function MenuPage() {
  const { t, i18n } = useTranslation()
  const { restaurant } = useAuthStore()
  const { categories } = useCategories(restaurant?.id)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const activeCategory = selectedCategory || categories[0]?.id
  const { items } = useMenuItems(activeCategory)
  const { addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem, toggleItemAvailability } =
    useMenuMutations(restaurant?.id)

  const [catModal, setCatModal] = useState(false)
  const [itemModal, setItemModal] = useState(false)
  const [editCat, setEditCat] = useState<MenuCategory | null>(null)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'cat' | 'item'; id: string } | null>(null)

  const [catForm, setCatForm] = useState({ name_ar: '', name_en: '' })
  const [itemForm, setItemForm] = useState({
    name_ar: '', name_en: '', description_ar: '', description_en: '',
    price: '', image_url: '', is_available: true,
  })

  function openCatModal(cat?: MenuCategory) {
    setEditCat(cat || null)
    setCatForm(cat ? { name_ar: cat.name_ar, name_en: cat.name_en } : { name_ar: '', name_en: '' })
    setCatModal(true)
  }

  function openItemModal(item?: MenuItem) {
    setEditItem(item || null)
    setItemForm(item ? {
      name_ar: item.name_ar, name_en: item.name_en,
      description_ar: item.description_ar || '', description_en: item.description_en || '',
      price: String(item.price), image_url: item.image_url || '', is_available: item.is_available,
    } : { name_ar: '', name_en: '', description_ar: '', description_en: '', price: '', image_url: '', is_available: true })
    setItemModal(true)
  }

  async function saveCat() {
    if (editCat) {
      await updateCategory(editCat.id, catForm)
    } else {
      await addCategory(catForm)
    }
    setCatModal(false)
  }

  async function saveItem() {
    const data = { ...itemForm, price: parseFloat(itemForm.price), category_id: activeCategory! }
    if (editItem) {
      await updateItem(editItem.id, data)
    } else {
      await addItem(data)
    }
    setItemModal(false)
  }

  const isAr = i18n.language === 'ar'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('menu.categories')}</h1>
        <Button onClick={() => openCatModal()} size="sm">
          <Plus size={16} /> {t('menu.add_category')}
        </Button>
      </div>

      {/* Categories tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {isAr ? cat.name_ar : cat.name_en}
          </button>
        ))}
      </div>

      {categories.length === 0 && (
        <Card><CardBody className="text-center py-12 text-gray-400">{t('menu.no_categories')}</CardBody></Card>
      )}

      {/* Category actions */}
      {activeCategory && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openCatModal(categories.find(c => c.id === activeCategory))}>
            <Pencil size={14} /> {t('menu.edit')}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteConfirm({ type: 'cat', id: activeCategory })}>
            <Trash2 size={14} /> {t('menu.delete')}
          </Button>
          <Button className="ms-auto" size="sm" onClick={() => openItemModal()}>
            <Plus size={16} /> {t('menu.add_item')}
          </Button>
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.image_url ? (
              <img src={item.image_url} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                <Image size={32} className="text-gray-300" />
              </div>
            )}
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{isAr ? item.name_ar : item.name_en}</p>
                  <p className="text-xs text-gray-400">{isAr ? item.name_en : item.name_ar}</p>
                </div>
                <Badge variant={item.is_available ? 'success' : 'danger'}>
                  {item.is_available ? t('menu.available') : t('menu.unavailable')}
                </Badge>
              </div>
              <p className="text-orange-600 font-bold">{formatPrice(item.price)}</p>
              {item.description_ar && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {isAr ? item.description_ar : item.description_en}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openItemModal(item)}>
                  <Pencil size={14} /> {t('menu.edit')}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleItemAvailability(item.id, !item.is_available)}
                  title={item.is_available ? t('menu.unavailable') : t('menu.available')}
                >
                  {item.is_available ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-400" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: 'item', id: item.id })}>
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
        {items.length === 0 && activeCategory && (
          <p className="text-gray-400 col-span-full text-center py-8">{t('menu.no_items')}</p>
        )}
      </div>

      {/* Category Modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title={editCat ? t('menu.edit') : t('menu.add_category')}>
        <div className="space-y-4">
          <Input label={t('menu.name_ar')} value={catForm.name_ar} onChange={(e) => setCatForm(f => ({ ...f, name_ar: e.target.value }))} required />
          <Input label={t('menu.name_en')} value={catForm.name_en} onChange={(e) => setCatForm(f => ({ ...f, name_en: e.target.value }))} required />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setCatModal(false)}>{t('menu.cancel')}</Button>
            <Button onClick={saveCat}>{t('menu.save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal open={itemModal} onClose={() => setItemModal(false)} title={editItem ? t('menu.edit') : t('menu.add_item')}>
        <div className="space-y-4">
          <Input label={t('menu.name_ar')} value={itemForm.name_ar} onChange={(e) => setItemForm(f => ({ ...f, name_ar: e.target.value }))} required />
          <Input label={t('menu.name_en')} value={itemForm.name_en} onChange={(e) => setItemForm(f => ({ ...f, name_en: e.target.value }))} required />
          <Input label={t('menu.description_ar')} value={itemForm.description_ar} onChange={(e) => setItemForm(f => ({ ...f, description_ar: e.target.value }))} />
          <Input label={t('menu.description_en')} value={itemForm.description_en} onChange={(e) => setItemForm(f => ({ ...f, description_en: e.target.value }))} />
          <Input label={t('menu.price')} type="number" step="0.001" min="0" value={itemForm.price} onChange={(e) => setItemForm(f => ({ ...f, price: e.target.value }))} required />
          <Input label={t('menu.image') + ' URL'} value={itemForm.image_url} onChange={(e) => setItemForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={itemForm.is_available} onChange={(e) => setItemForm(f => ({ ...f, is_available: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
            <span className="text-sm font-medium text-gray-700">{t('menu.available')}</span>
          </label>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setItemModal(false)}>{t('menu.cancel')}</Button>
            <Button onClick={saveItem}>{t('menu.save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={t('menu.confirm_delete')}>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t('common.no')}</Button>
          <Button variant="danger" onClick={async () => {
            if (deleteConfirm?.type === 'cat') await deleteCategory(deleteConfirm.id)
            else if (deleteConfirm?.type === 'item') await deleteItem(deleteConfirm.id)
            setDeleteConfirm(null)
          }}>{t('common.yes')}</Button>
        </div>
      </Modal>
    </div>
  )
}
