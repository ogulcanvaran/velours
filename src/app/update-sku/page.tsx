'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UpdateSKUPage() {
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<string>('');

  const updateAllSKUs = async (force = false) => {
    setUpdating(true);
    setResult('');

    try {
      const endpoint = force ? '/api/products/force-update-sku' : '/api/products/update-sku';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Başarılı!\n${data.message}\nToplam: ${data.total || 'N/A'}\nGüncellenen: ${data.updated}`);
      } else {
        setResult(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Hata: ${error}`);
    } finally {
      setUpdating(false);
    }
  };

  const fixNewSKUs = async () => {
    setUpdating(true);
    setResult('');

    try {
      const response = await fetch('/api/products/fix-new-sku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Yeni SKU'lar Düzeltildi!\n${data.message}\nToplam Problematik: ${data.total}\nDüzeltilen: ${data.updated}\nBaşlangıç Numarası: ${data.startNumber}`);
      } else {
        setResult(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Hata: ${error}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">SKU Güncelleme</h1>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Ürünlere SKU Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Boş SKU'ları Güncelle:</strong> SKU'su olmayan ürünleri günceller</p>
              <p><strong>Yeni SKU'ları Düzelt:</strong> VS- ile başlamayan karışık SKU'ları düzeltir</p>
              <p><strong>TÜM SKU'ları Zorla Güncelle:</strong> Tüm ürünlerin SKU'sunu yeniden oluşturur</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button 
                onClick={() => updateAllSKUs(false)} 
                disabled={updating}
                variant="outline"
              >
                {updating ? 'Güncelleniyor...' : 'Boş SKU\'ları Güncelle'}
              </Button>
              
              <Button 
                onClick={fixNewSKUs} 
                disabled={updating}
                variant="secondary"
              >
                {updating ? 'Düzeltiliyor...' : 'Yeni SKU\'ları Düzelt'}
              </Button>
              
              <Button 
                onClick={() => updateAllSKUs(true)} 
                disabled={updating}
              >
                {updating ? 'Güncelleniyor...' : 'TÜM SKU\'ları Zorla Güncelle'}
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <pre className="text-sm">{result}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}