'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';
import { SKUGenerator } from '@/lib/sku-generator';

interface AnalyzedProduct {
  name: string;
  category: string;
  brand: string;
  price: string;
  variantCount: string;
  sizes: string;
}

export default function DatabaseImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<AnalyzedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [skuFormat, setSKUFormat] = useState<'compact' | 'detailed' | 'global'>('compact');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);

    try {
      const text = await uploadedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      const products: AnalyzedProduct[] = lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map(v => v.replace(/^"|"$/g, ''));
        
        return {
          name: cleanValues[0] || '',
          category: cleanValues[1] || '',
          brand: cleanValues[2] || '',
          price: cleanValues[3] || '',
          variantCount: cleanValues[4] || '',
          sizes: cleanValues[5] || ''
        };
      }).filter(p => p.name);

      setData(products);
    } catch (error) {
      console.error('CSV okuma hatası:', error);
      alert('CSV dosyası okunamadı!');
    } finally {
      setLoading(false);
    }
  };

  const importToDatabase = async () => {
    if (data.length === 0) {
      alert('Önce CSV dosyasını yükleyin!');
      return;
    }

    setImporting(true);

    try {
      // Önce kategorileri oluştur
      const categories = [...new Set(data.map(p => p.category))];
      const categoryMap: { [key: string]: string } = {};

      for (const categoryName of categories) {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: categoryName
          })
        });

        if (response.ok) {
          const category = await response.json();
          categoryMap[categoryName] = category.id;
        }
      }

      // Ürünleri oluştur
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < data.length; i++) {
        const product = data[i];
        try {
          const categoryId = categoryMap[product.category];
          if (!categoryId) {
            console.error(`Kategori bulunamadı: ${product.category}`);
            errorCount++;
            continue;
          }

          // SKU oluştur
          const skuConfig = {
            brand: product.brand,
            productName: product.name,
            category: product.category
          };
          const baseSKU = SKUGenerator.generateSKU(skuConfig, i + 1, skuFormat);

          // Ürün oluştur
          const productResponse = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: product.name,
              sku: baseSKU,
              categoryId: categoryId,
              status: 'ACTIVE'
            })
          });

          if (productResponse.ok) {
            const createdProduct = await productResponse.json();
            
            // Varyasyonları oluştur
            const sizes = product.sizes.split(' | ').filter(s => s.trim());
            
            for (const size of sizes) {
              const variantSKU = SKUGenerator.generateVariantSKU(baseSKU, size.trim());
              
              await fetch('/api/variants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productId: createdProduct.id,
                  name: `${product.name} - Beden ${size}`,
                  sku: variantSKU,
                  size: size.trim(),
                  price: parseFloat(product.price),
                  stock: 0
                })
              });
            }

            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Ürün import hatası: ${product.name}`, error);
          errorCount++;
        }
      }

      alert(`Import tamamlandı!\n\nBaşarılı: ${successCount}\nHatalı: ${errorCount}`);
      
    } catch (error) {
      console.error('Database import hatası:', error);
      alert('Veritabanına import sırasında hata oluştu!');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Veritabanı Import</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analiz Edilmiş CSV Dosyası Yükle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file">CSV Dosyası Seç</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </div>
              {loading && <p>Dosya okunuyor...</p>}
            </div>
          </CardContent>
        </Card>

        {data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>SKU Format Seçimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>SKU Formatı Seç:</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="skuFormat"
                        value="compact"
                        checked={skuFormat === 'compact'}
                        onChange={(e) => setSKUFormat(e.target.value as any)}
                      />
                      <span className="text-sm">
                        <strong>Basit:</strong> VS-PIJAMA-001
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="skuFormat"
                        value="detailed"
                        checked={skuFormat === 'detailed'}
                        onChange={(e) => setSKUFormat(e.target.value as any)}
                      />
                      <span className="text-sm">
                        <strong>Renkli:</strong> VS-PIJAMA-KREM-001
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="skuFormat"
                        value="global"
                        checked={skuFormat === 'global'}
                        onChange={(e) => setSKUFormat(e.target.value as any)}
                      />
                      <span className="text-sm">
                        <strong>Kısa:</strong> VS240001
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Örnek SKU Önizleme:</h4>
                  {data.slice(0, 3).map((product, index) => {
                    const skuConfig = {
                      brand: product.brand,
                      productName: product.name,
                      category: product.category
                    };
                    const exampleSKU = SKUGenerator.generateSKU(skuConfig, index + 1, skuFormat);
                    return (
                      <div key={index} className="text-sm mb-1">
                        <strong>{product.name.substring(0, 30)}...</strong> → <code className="bg-white px-2 py-1 rounded">{exampleSKU}</code>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Önizleme ({data.length} ürün)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto mb-4" style={{maxHeight: '400px'}}>
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-50">#</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Ürün Adı</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Kategori</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Marka</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Fiyat</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Varyasyon</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Bedenler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 50).map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-mono text-sm">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm font-medium">
                          {product.name}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {product.category}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {product.brand}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          ₺{product.price}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {product.variantCount}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {product.sizes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={importToDatabase} 
                  disabled={importing}
                  className="w-full"
                >
                  {importing ? 'Veritabanına Aktarılıyor...' : 'Veritabanına Aktar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}