'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClickableImage } from "@/components/ui/lightbox";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  imageCount: number;
}

interface KatalogMatcherProps {
  catalogImages: string[];
  products: Product[];
}

interface ImageMatch {
  imageName: string;
  productId: string | null;
}

export default function KatalogMatcher({ catalogImages, products }: KatalogMatcherProps) {
  const [matches, setMatches] = useState<ImageMatch[]>(
    catalogImages.map(img => ({ imageName: img, productId: null }))
  );
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string>('');

  const updateMatch = (imageName: string, productId: string | null) => {
    setMatches(prev => prev.map(match => 
      match.imageName === imageName 
        ? { ...match, productId }
        : match
    ));
  };

  const processMatches = async () => {
    const validMatches = matches.filter(m => m.productId);
    
    if (validMatches.length === 0) {
      alert('Hiç eşleştirme yapılmamış!');
      return;
    }

    setProcessing(true);
    setResult('');

    try {
      const response = await fetch('/api/katalog/process-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: validMatches })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Başarılı!\n${data.processed} fotoğraf işlendi\n${data.failed} hata`);
        
        // Başarılı eşleştirmeleri listeden kaldır
        setMatches(prev => prev.filter(m => !validMatches.some(vm => vm.imageName === m.imageName)));
      } else {
        setResult(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Hata: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const getProductName = (productId: string | null) => {
    if (!productId) return null;
    return products.find(p => p.id === productId);
  };

  const selectedCount = matches.filter(m => m.productId).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Fotoğraf Eşleştirme ({selectedCount}/{matches.length})
          </CardTitle>
          <Button 
            onClick={processMatches}
            disabled={processing || selectedCount === 0}
          >
            {processing ? 'İşleniyor...' : `${selectedCount} Fotoğrafı Eşleştir`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sonuç Mesajı */}
          {result && (
            <div className="bg-gray-50 p-4 rounded">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {/* Fotoğraf Listesi */}
          <div className="grid gap-4">
            {matches.map((match) => {
              const selectedProduct = getProductName(match.productId);
              
              return (
                <div key={match.imageName} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Fotoğraf */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <ClickableImage
                          src={`/katalog/${match.imageName}`}
                          alt={match.imageName}
                          width={150}
                          height={150}
                        />
                      </div>
                      <p className="text-xs mt-2 text-center break-all">
                        {match.imageName}
                      </p>
                    </div>

                    {/* Ürün Seçimi */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ürün Seç:</label>
                      <select
                        value={match.productId || ''}
                        onChange={(e) => updateMatch(match.imageName, e.target.value || null)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">-- Ürün Seçin --</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.sku}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seçilen Ürün Bilgisi */}
                    <div className="text-sm">
                      {selectedProduct ? (
                        <div className="bg-green-50 p-3 rounded">
                          <div className="font-medium">{selectedProduct.name}</div>
                          <div className="text-gray-600">SKU: {selectedProduct.sku}</div>
                          <div className="text-gray-600">Kategori: {selectedProduct.category}</div>
                          <div className="text-gray-600">Mevcut Fotoğraf: {selectedProduct.imageCount}</div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded text-gray-500">
                          Ürün seçilmedi
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {matches.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tüm fotoğraflar eşleştirildi! 🎉
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}