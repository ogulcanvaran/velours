'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
}

interface ProductsFilterProps {
  categories: Category[];
  currentParams: {
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default function ProductsFilter({ categories, currentParams }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(currentParams.search || '');
  const [category, setCategory] = useState(currentParams.category || '');
  const [status, setStatus] = useState(currentParams.status || '');
  const [sortBy, setSortBy] = useState(currentParams.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState(currentParams.sortOrder || 'desc');
  const [showFilters, setShowFilters] = useState(false);

  const updateURL = () => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setSortBy('createdAt');
    setSortOrder('desc');
    router.push('/products');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== currentParams.search) {
        updateURL();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    updateURL();
  }, [category, status, sortBy, sortOrder]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Arama ve Filtreleme</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Filtreleri Gizle' : 'Filtreleri Göster'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Arama */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Ürün adı veya SKU ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              Ara
            </Button>
          </form>

          {/* Filtreler */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* Kategori Filtresi */}
              <div>
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Durum Filtresi */}
              <div>
                <Label htmlFor="status">Durum</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="DRAFT">Taslak</option>
                  <option value="INACTIVE">Pasif</option>
                  <option value="ARCHIVED">Arşiv</option>
                </select>
              </div>

              {/* Sıralama */}
              <div>
                <Label htmlFor="sortBy">Sırala</Label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="createdAt">Oluşturma Tarihi</option>
                  <option value="name">Ürün Adı</option>
                  <option value="category">Kategori</option>
                  <option value="updatedAt">Güncelleme Tarihi</option>
                </select>
              </div>

              {/* Sıralama Yönü */}
              <div>
                <Label htmlFor="sortOrder">Sıralama Yönü</Label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="desc">Azalan (Z-A, Yeni-Eski)</option>
                  <option value="asc">Artan (A-Z, Eski-Yeni)</option>
                </select>
              </div>
            </div>
          )}

          {/* Aktif Filtreler ve Temizle */}
          {(search || category || status || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
            <div className="flex flex-wrap gap-2 items-center pt-4 border-t">
              <span className="text-sm font-medium">Aktif Filtreler:</span>
              
              {search && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Arama: "{search}"
                </span>
              )}
              
              {category && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  Kategori: {categories.find(c => c.id === category)?.name}
                </span>
              )}
              
              {status && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                  Durum: {status}
                </span>
              )}
              
              {(sortBy !== 'createdAt' || sortOrder !== 'desc') && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                  Sıralama: {sortBy} ({sortOrder === 'asc' ? 'Artan' : 'Azalan'})
                </span>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="ml-auto"
              >
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}