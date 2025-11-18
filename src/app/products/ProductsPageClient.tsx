'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProductsFilter from "./ProductsFilter";
import ProductsTable from "./ProductsTable";

interface ProductsPageClientProps {
  initialProducts: any[];
  categories: any[];
  currentParams: any;
}

export default function ProductsPageClient({ 
  initialProducts, 
  categories, 
  currentParams 
}: ProductsPageClientProps) {
  const handleProductDeleted = () => {
    // Sayfayı yenile
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ürünler</h1>
        <Link href="/products/new">
          <Button>Yeni Ürün Ekle</Button>
        </Link>
      </div>

      {/* Filtreleme ve Arama */}
      <ProductsFilter 
        categories={categories}
        currentParams={currentParams}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Ürün Listesi ({initialProducts.length} ürün)
            {(currentParams.search || currentParams.category || currentParams.status) && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - Filtrelenmiş sonuçlar
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsTable 
            products={initialProducts} 
            onProductDeleted={handleProductDeleted}
          />
        </CardContent>
      </Card>
    </div>
  );
}