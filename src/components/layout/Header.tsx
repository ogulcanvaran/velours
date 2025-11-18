'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

// Sayfa başlıklarını tanımla
const pageTitle: { [key: string]: string } = {
  '/': 'Ana Sayfa',
  '/products': 'Ürün Listesi',
  '/products/gallery': 'Ürün Galerisi',
  '/products/new': 'Yeni Ürün Ekle',
  '/categories': 'Kategoriler',
  '/categories/new': 'Yeni Kategori Ekle',
  '/import': 'Excel Import',
  '/import/database': 'Veritabanı Import',
  '/update-sku': 'SKU Güncelle',
  '/katalog': 'Katalog Yönetimi',
  '/export': 'Veritabanı Export',
};

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  // Dinamik sayfa başlığı
  const getCurrentPageTitle = () => {
    // Önce tam eşleşme ara
    if (pageTitle[pathname]) {
      return pageTitle[pathname];
    }
    
    // Dinamik rotalar için (örn: /products/123)
    if (pathname.startsWith('/products/') && pathname !== '/products/new') {
      return 'Ürün Detayı';
    }
    if (pathname.startsWith('/categories/') && pathname !== '/categories/new') {
      return 'Kategori Detayı';
    }
    
    return 'Velours Secrets';
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">
            {getCurrentPageTitle()}
          </h1>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Ürün, kategori ara..."
              className="w-64 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Search button for mobile */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Bildirimler</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Yeni ürün eklendi</p>
                  <p className="text-xs text-gray-500">2 dakika önce</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Stok uyarısı</p>
                  <p className="text-xs text-gray-500">5 dakika önce</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm text-blue-600">
                Tüm bildirimleri gör
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button variant="ghost" size="sm">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Help */}
          <Button variant="ghost" size="sm">
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-gray-500">admin@velours.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}