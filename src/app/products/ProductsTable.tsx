'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  status: string;
  category: {
    name: string;
  };
  variants: any[];
  images: any[];
}

interface ProductsTableProps {
  products: Product[];
  onProductDeleted: () => void;
}

export default function ProductsTable({ products, onProductDeleted }: ProductsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteProduct = async (product: Product) => {
    const confirmMessage = `"${product.name}" ürününü silmek istediğinizden emin misiniz?\n\n⚠️ Bu işlem geri alınamaz!\n- ${product.variants.length} varyasyon silinecek\n- ${product.images.length} fotoğraf silinecek\n- Fotoğraf klasörü silinecek`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingId(product.id);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}\n\nSilinen:\n- ${result.deletedVariants} varyasyon\n- ${result.deletedImages} fotoğraf`);
        onProductDeleted(); // Sayfayı yenile
      } else {
        alert(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('❌ Ürün silinirken hata oluştu!');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Ürün Adı</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Varyasyon Sayısı</TableHead>
          <TableHead>Fotoğraf Sayısı</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              Henüz ürün eklenmemiş
            </TableCell>
          </TableRow>
        ) : (
          products.map((product, index) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-sm">{index + 1}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.sku || '-'}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>{product.variants.length}</TableCell>
              <TableCell>{product.images.length}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : product.status === 'DRAFT'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/products/${product.id}`}>
                    <Button variant="outline" size="sm">
                      Düzenle
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProduct(product)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? 'Siliniyor...' : 'Sil'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}