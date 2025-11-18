'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploadSection from './ImageUploadSection';
import EditProductModal from './EditProductModal';

interface Category {
  id: string;
  name: string;
}

interface ProductVariant {
  id: string;
  name: string;
  size: string;
  color?: string;
  material?: string;
  price: string;
  stock: number;
}

interface ProductImage {
  id: string;
  filename: string;
  url: string;
  alt: string;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  description?: string;
  categoryId: string;
  brand: string | null;
  status: string;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
}

interface ProductPageClientProps {
  initialProduct: Product;
  categories: Category[];
}

export default function ProductPageClient({ initialProduct, categories }: ProductPageClientProps) {
  const [product, setProduct] = useState(initialProduct);

  const refreshProduct = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}`);
      if (response.ok) {
        const updatedProduct = await response.json();
        setProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Ürün yenileme hatası:', error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-gray-600">SKU: {product.sku || 'Henüz atanmamış'}</p>
      </div>

      <div className="grid gap-6">
        {/* Ürün Bilgileri */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Ürün Bilgileri</CardTitle>
              <EditProductModal 
                product={product}
                categories={categories}
                onUpdate={refreshProduct}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Kategori:</strong> {product.category.name}
              </div>
              <div>
                <strong>Durum:</strong> {product.status}
              </div>
              <div>
                <strong>Varyasyon Sayısı:</strong> {product.variants.length}
              </div>
              <div>
                <strong>Fotoğraf Sayısı:</strong> {product.images.length}
              </div>
              <div>
                <strong>Marka:</strong> {product.brand || 'Belirtilmemiş'}
              </div>
              {product.description && (
                <div className="col-span-2">
                  <strong>Açıklama:</strong> {product.description}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Varyasyonlar */}
        <Card>
          <CardHeader>
            <CardTitle>Varyasyonlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-50">Beden</th>
                    <th className="border border-gray-300 p-2 bg-gray-50">SKU</th>
                    <th className="border border-gray-300 p-2 bg-gray-50">Fiyat</th>
                    <th className="border border-gray-300 p-2 bg-gray-50">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant: any) => (
                    <tr key={variant.id}>
                      <td className="border border-gray-300 p-2">{variant.size}</td>
                      <td className="border border-gray-300 p-2 font-mono text-sm">{variant.sku}</td>
                      <td className="border border-gray-300 p-2">₺{variant.price}</td>
                      <td className="border border-gray-300 p-2">{variant.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Fotoğraf Yükleme */}
        <ImageUploadSection product={{
          id: product.id,
          name: product.name,
          sku: product.sku || 'temp-sku',
          images: product.images.map(img => ({
            id: img.id,
            filename: img.filename,
            url: img.url,
            alt: img.alt || '',
            sortOrder: img.sortOrder
          }))
        }} />
      </div>
    </div>
  );
}