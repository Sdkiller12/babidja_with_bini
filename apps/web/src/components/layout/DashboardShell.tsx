'use client';

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, X, type LucideIcon } from 'lucide-react'
import Logo from '@/components/Logo'
import Avatar from '@/components/Avatar'

interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  iconColor?: string;
}

export function DashboardShell({
  navItems,
  userTitle,
  userName = 'Amadou Touré',
  sidebarBg = 'bg-white',
  sidebarText = 'text-gray-600',
  activeClass = 'bg-pastel text-secondary',
  hoverClass = 'hover:bg-gray-50',
  children
}: {
  navItems: DashboardNavItem[];
  userTitle: string;
  userName?: string;
  sidebarBg?: string;
  sidebarText?: string;
  activeClass?: string;
  hoverClass?: string;
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="flex min-w-0 items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button 
              className="grid size-10 min-h-[44px] min-w-[44px] shrink-0 place-items-center rounded-xl text-gray-500 hover:text-gray-900 md:hidden"
              aria-label="Ouvrir le menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="size-6" />
            </button>
            <div className="hidden md:block shrink-0">
              <Logo variant="pro" />
            </div>
            {/* Breadcrumbs */}
            {navItems.find(item => item.exact ? pathname === item.href : pathname.startsWith(item.href)) && (
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 border-l border-gray-200 pl-4 ml-2">
                <span className="truncate max-w-50">
                  {navItems.find(item => item.exact ? pathname === item.href : pathname.startsWith(item.href))?.label}
                </span>
              </div>
            )}
            {/* Mobile Logo fallback */}
            <div className="md:hidden flex-1 flex justify-center mr-6">
               <Logo variant="pro" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-semibold text-primary md:block">
              Le meilleur, à la manière ivoirienne
            </span>
            {userTitle && (
              <span className="hidden text-right text-xs leading-tight sm:block text-gray-900">
                <span className="block text-sm font-bold">{userName}</span>
                {userTitle}
              </span>
            )}
            <button aria-label="Notifications" className="text-gray-500 hover:text-gray-900">
              <Bell className="size-5" />
            </button>
            <Avatar name={userName} size="sm" />
          </div>
        </div>
      </header>
      <div className="flex flex-1 relative">
        {/* Overlay pour mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] transform flex-col border-r border-gray-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ease-in-out md:relative md:w-56 md:translate-x-0 md:max-w-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarBg}
        `}>
          <div className="mb-4 flex items-center justify-between md:hidden">
            <Logo variant="pro" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Fermer le menu"
              className={`${sidebarText} grid size-10 min-h-[44px] min-w-[44px] place-items-center rounded-xl`}
            >
              <X className="size-6" />
            </button>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex min-h-[44px] min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? activeClass : `${sidebarText} ${hoverClass}`
                  }`}
                >
                  <item.icon className={`size-5 shrink-0 ${item.iconColor || ''}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>
        
        <main className="w-full min-w-0 flex-1 overflow-x-clip bg-gray-50/50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
