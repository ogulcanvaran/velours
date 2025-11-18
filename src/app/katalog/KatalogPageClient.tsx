'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KatalogMatcher from "./KatalogMatcher";
import BulkUpload from "./BulkUpload";

interface KatalogPageClientProps {
  catalogImages: string[];
  products: any[];
}

export default function KatalogPageClient({ 
  catalogImages, 
  products 
}: KatalogPageClientProps) {
  const handleUploadComplete = () => {
    // Sayfayı yenile
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Katalog Fotoğraf Yönetimi</h1>
        <p className="text-gray-600 mt-2">
          Katalog fotoğraflarını yükleyin ve ürünlerle eşleştirin
        </p>
      </div>

      <div className="grid gap-6">
        {/* Toplu Yükleme */}
        <BulkUpload onUploadComplete={handleUploadComplete} />

        {/* Bilgi Kartı */}
        <Card>
          <CardHeader>
            <CardTitle>Nasıl Kullanılır?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> Yukarıdaki yükleme alanından fotoğrafları seçin ve yükleyin</p>
              <p><strong>2.</strong> Yüklenen her fotoğraf için uygun ürünü seçin</p>
              <p><strong>3.</strong> "Eşleştir" butonuna tıklayın</p>
              <p><strong>4.</strong> Fotoğraf otomatik olarak <code>public/urun-gorsel/[SKU]/</code> klasörüne taşınır</p>
            </div>
          </CardContent>
        </Card>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{catalogImages.length}</div>
              <div className="text-sm text-gray-600">Katalog Fotoğrafı</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-sm text-gray-600">Toplam Ürün</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {products.reduce((sum: number, p: any) => sum + p.images.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Mevcut Fotoğraf</div>
            </CardContent>
          </Card>
        </div>

        {/* Eşleştirme Arayüzü */}
        {catalogImages.length > 0 ? (
          <KatalogMatcher 
            catalogImages={catalogImages}
            products={products.map((p: any) => ({
              id: p.id,
              name: p.name,
              sku: p.sku || '',
              category: p.category.name,
              imageCount: p.images.length
            }))}
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <p className="text-lg mb-2">Katalog klasörü boş</p>
                <p className="text-sm">
                  Yukarıdaki yükleme alanını kullanarak fotoğraf yükleyin
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}