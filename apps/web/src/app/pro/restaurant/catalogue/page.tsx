'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function RestaurantMenuPage() {
  const [categories, setCategories] = useState<any[]>([])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catalogue (Menu)</h1>
          <p className="text-sm text-gray-500">Gérez les catégories et les plats de votre restaurant.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle Catégorie
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie</h3>
          <p className="text-gray-500">Commencez par ajouter une catégorie à votre menu (ex: Entrées, Plats, Desserts).</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Liste des catégories ici */}
        </div>
      )}
    </div>
  )
}
