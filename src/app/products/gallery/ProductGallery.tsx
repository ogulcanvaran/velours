'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Badge bileşenini inline tanımla
const Badge = ({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'secondary'; 
  className?: string; 
}) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
    variant === 'secondary' 
      ? 'bg-gray-100 text-gray-800' 
      : 'bg-blue-100 text-blue-800'
  } ${className}`}>
    {children}
  </span>
);
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, Package, Tag, Image as ImageIcon } from "lucide-react";
import { Lightbox } from "@/components/ui/lightbox";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  status: string;
  category: {
    id: string;
    name: string;
  };
  variants: any[];
  images: {
    id: string;
    url: string;
    alt: string | null;
  }[];
}

interface ProductGalleryProps {
  products: Product[];
}

export default function ProductGallery({ products }: ProductGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Kategorileri çıkar
  const categories = Array.from(new Set(products.map(p => p.category.name)))
    .map(name => ({ name, id: name }));

  // Filtreleme
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category.name === selectedCategory;
    
    const matchesStatus = selectedStatus === 'all' || 
      product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Lightbox açma
  const openLightbox = (images: string[], startIndex: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  // Fiyat aralığını hesapla
  const getPriceRange = (variants: any[]) => {
    if (variants.length === 0) return null;
    
    const prices = variants
      .map(v => parseFloat(v.price || '0'))
      .filter(p => p > 0);
    
    if (prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) {
      return `₺${min.toFixed(2)}`;
    }
    return `₺${min.toFixed(2)} - ₺${max.toFixed(2)}`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ürün Galerisi</h1>
        <p className="text-gray-600">
          Fotoğrafı olan ürünlerin görsel galerisi ({filteredProducts.length} ürün)
        </p>
      </div>

      {/* Filtreler */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Arama */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Ürün adı veya SKU ile ara..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Kategori Filtresi */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.name} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Durum Filtresi */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="DRAFT">Taslak</SelectItem>
              <SelectItem value="INACTIVE">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ürün Kartları */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-500">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Filtrelere uygun ürün bulunamadı'
                : 'Henüz fotoğrafı olan ürün yok'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const mainImage = product.images[0];
            const priceRange = getPriceRange(product.variants);

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  {/* Ana Fotoğraf */}
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={mainImage.url}
                      alt={mainImage.alt || product.name}
                      fill
                      className="object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => openLightbox(
                        product.images.map(img => img.url),
                        0
                      )}
                    />
                    
                    {/* Fotoğraf Sayısı Badge */}
                    {product.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {product.images.length}
                      </div>
                    )}

                    {/* Durum Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'ACTIVE' 
                        ? 'bg-green-500 text-white' 
                        : product.status === 'DRAFT'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {product.status}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {/* Ürün Adı */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* SKU */}
                  {product.sku && (
                    <p className="text-sm text-gray-500 mb-2 font-mono">
                      SKU: {product.sku}
                    </p>
                  )}

                  {/* Kategori */}
                  <div className="flex items-center gap-1 mb-2">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {product.category.name}
                    </span>
                  </div>

                  {/* Varyasyon Sayısı */}
                  <div className="flex items-center gap-1 mb-3">
                    <Package className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {product.variants.length} varyasyon
                    </span>
                  </div>

                  {/* Fiyat Aralığı */}
                  {priceRange && (
                    <p className="text-lg font-bold text-green-600 mb-3">
                      {priceRange}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="p-4 pt-0 flex gap-2">
                  {/* Fotoğrafları Görüntüle */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openLightbox(
                      product.images.map(img => img.url),
                      0
                    )}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Görüntüle
                  </Button>

                  {/* Düzenle */}
                  <Link href={`/products/${product.id}`}>
                    <Button variant="default" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Düzenle
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
    </div>
  );
}