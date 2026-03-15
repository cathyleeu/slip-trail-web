'use client'

import { Header } from '@components'
import { Avatar, Button, Card } from '@components/ui'
import { useAuth, useCategories, useProfile } from '@hooks'
import { useState } from 'react'

export default function SettingsPage() {
  const { profile } = useProfile()
  const { logout } = useAuth()
  const { settingsCategories, customCategories, addCustomCategory, removeCustomCategory } =
    useCategories()
  const [newCategory, setNewCategory] = useState({ emoji: '', label: '' })
  const [isAdding, setIsAdding] = useState(false)

  const handleAddCategory = () => {
    if (!newCategory.emoji.trim() || !newCategory.label.trim()) return

    const success = addCustomCategory({
      emoji: newCategory.emoji,
      label: newCategory.label,
    })

    if (success) {
      setNewCategory({ emoji: '', label: '' })
      setIsAdding(false)
    }
  }

  const handleRemoveCategory = (id: string) => {
    removeCustomCategory(id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Settings" />

      <div className="p-4 space-y-6">
        {/* FIXME: Profile Section */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Profile
          </h2>
          <div className="flex items-center gap-4">
            <Avatar name={profile?.name} size="lg" />
            <div>
              <p className="font-semibold text-gray-900">{profile?.name || 'User'}</p>
              <p className="text-sm text-gray-500">Edit profile coming soon</p>
            </div>
          </div>
        </Card>

        {/* Category Customization */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Receipt Categories
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Customize how your receipts are categorized. Add your own categories below.
          </p>

          {/* Default Categories */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Default categories</p>
            <div className="flex flex-wrap gap-2">
              {settingsCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600"
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Your custom categories</p>
              <div className="flex flex-wrap gap-2">
                {customCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full text-sm text-blue-700 group"
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    <button
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="ml-1 text-blue-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Category */}
          {isAdding ? (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="🎉"
                  value={newCategory.emoji}
                  onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                  className="w-14 px-3 py-2 border border-gray-200 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={2}
                />
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory.label}
                  onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    setNewCategory({ emoji: '', label: '' })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddCategory}
                  disabled={!newCategory.emoji.trim() || !newCategory.label.trim()}
                  className="flex-1"
                >
                  Add
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outlined" onClick={() => setIsAdding(true)} className="w-full">
              + Add Custom Category
            </Button>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Custom categories will be available when scanning receipts.
          </p>
        </Card>

        {/* App Info */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            About
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-gray-400">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span className="text-gray-400">2026.03</span>
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <div className="pt-4 pb-8 flex justify-center">
          <Button variant="ghost" onClick={logout} className="text-gray-500 hover:bg-transparent">
            Log out
          </Button>
        </div>
      </div>
    </div>
  )
}
