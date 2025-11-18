'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Package,
  Tags,
  Upload,
  Database,
  RefreshCw,
  Image,
  Download,
  Home,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Grid,
  List
} from 'lucide-react';

const navigation = [
  {
    name: 'Ana Sayfa',
    href: '/',
    icon: Home,
  },
  {
    name: 'Ürünler',
    icon: Package,
    children: [
      {
        name: 'Ürün Listesi',
        href: '/products',
        icon: List,
      },
      {
        name: 'Ürün Galerisi',
        href: '/products/gallery',
        icon: Grid,
      },
      {
        name: 'Yeni Ürün',
        href: '/products/new',
        icon: Package,
      },
    ]
  },
  {
    name: 'Kategoriler',
    href: '/categories',
    icon: Tags,
  },
  {
    name: 'Veritabanı',
    icon: Database,
    children: [
      {
        name: 'Excel Import',
        href: '/import',
        icon: Upload,
      },
      {
        name: 'DB Import',
        href: '/import/database',
        icon: Database,
      },
      {
        name: 'DB Export',
        href: '/export',
        icon: Download,
      },
      {
        name: 'SKU Güncelle',
        href: '/update-sku',
        icon: RefreshCw,
      },
    ]
  },
  {
    name: 'Katalog',
    href: '/katalog',
    icon: Image,
  },
];

interface SidebarProps {
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ className, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Ürünler', 'Veritabanı']); // Ürünler ve Veritabanı menüleri varsayılan açık
  const pathname = usePathname();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          {!collapsed && (
            <Link href="/" className="text-xl font-bold text-white">
              Velours Secrets
            </Link>
          )}
          
          {/* Collapse button - desktop only */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.name);
            
            // Ana menü öğesi için aktif kontrolü
            const isMainActive = item.href ? pathname === item.href : false;
            
            // Alt menü öğeleri için aktif kontrolü
            const hasActiveChild = hasChildren && item.children?.some(child => pathname === child.href);
            const shouldHighlight = isMainActive || hasActiveChild;

            if (hasChildren) {
              return (
                <div key={item.name}>
                  {/* Ana menü öğesi */}
                  <button
                    onClick={() => !collapsed && toggleExpanded(item.name)}
                    className={cn(
                      'flex items-center w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      shouldHighlight
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                      collapsed ? 'justify-center' : 'justify-between'
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <div className="flex items-center">
                      <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && (
                      <div className="ml-auto">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Alt menü öğeleri */}
                  {!collapsed && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = pathname === child.href;

                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={onMobileClose}
                            className={cn(
                              'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              isChildActive
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            )}
                          >
                            <ChildIcon className="h-4 w-4 mr-3" />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Alt menüsü olmayan normal öğeler
            return (
              <Link
                key={item.name}
                href={item.href!}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isMainActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                  collapsed ? 'justify-center' : 'justify-start'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          <div className={cn(
            'flex items-center text-xs text-gray-400',
            collapsed ? 'justify-center' : 'justify-start'
          )}>
            {!collapsed && (
              <span>© 2024 Velours Secrets</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}