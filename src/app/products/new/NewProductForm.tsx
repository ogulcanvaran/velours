'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
}

interface NewProductFormProps {
  categories: Category[];
}

interface ProductVariant {
  id: string;
  name: string;
  size: string;
  color?: string;
  material?: string;
  price: string;
  stock: string;
}

export default function NewProductForm({ categories }: NewProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Ürün bilgileri
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('VELOURS SECRETS');
  const [status, setStatus] = useState('ACTIVE');

  // Varyasyonlar
  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: '1', name: '', size: 'S/M', color: '', material: '', price: '', stock: '0' }
  ]);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: '',
      size: 'S/M',
      color: '',
      material: '',
      price: '',
      stock: '0'
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: string) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !categoryId) {
      alert('Ürün adı ve kategori zorunludur!');
      return;
    }

    if (variants.some(v => !v.price || parseFloat(v.price) <= 0)) {
      alert('Tüm varyasyonlar için geçerli fiyat giriniz!');
      return;
    }

    setLoading(true);

    try {
      // Ürün oluştur
      const productResponse = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          description,
          categoryId,
          brand,
          status
        })
      });

      if (!productResponse.ok) {
        throw new Error('Ürün oluşturulamadı');
      }

      const product = await productResponse.json();

      // Varyasyonları oluştur
      for (const variant of variants) {
        const variantName = variant.name || `${productName} - ${variant.size}`;
        
        await fetch('/api/variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            name: variantName,
            size: variant.size,
            color: variant.color || null,
            material: variant.material || null,
            price: parseFloat(variant.price),
            stock: parseInt(variant.stock) || 0
          })
        });
      }

      alert('✅ Ürün başarıyla oluşturuldu!');
      router.push(`/products/${product.id}`);

    } catch (error) {
      console.error('Ürün oluşturma hatası:', error);
      alert('❌ Ürün oluşturulurken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="productName">Ürün Adı *</Label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Örn: Saten Gecelik"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Açıklama</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ürün açıklaması..."
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryId">Kategori *</Label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Kategori Seçin</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="brand">Marka</Label>
            <select
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="VELOURS SECRETS">Velours Secrets</option>
              <option value="COCCOLARSI">Coccolarsi</option>
              <option value="BERRAK">Berrak</option>
              <option value="ALFATEX">Alfatex</option>
              <option value="ARONA">Arona</option>
              <option value="NIGHTLIGHT">Nightlight</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="status">Durum</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="ACTIVE">Aktif</option>
            <option value="DRAFT">Taslak</option>
            <option value="INACTIVE">Pasif</option>
          </select>
        </div>
      </div>

      {/* Varyasyonlar */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Varyasyonlar ({variants.length})</CardTitle>
            <Button type="button" onClick={addVariant} variant="outline" size="sm">
              + Varyasyon Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={variant.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Varyasyon {index + 1}</h4>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      variant="outline"
                      size="sm"
                    >
                      Sil
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Varyasyon Adı</Label>
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                      placeholder="Otomatik oluşturulacak"
                    />
                  </div>

                  <div>
                    <Label>Beden *</Label>
                    <select
                      value={variant.size}
                      onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Standart">Standart</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="S/M">S/M</option>
                      <option value="L/XL">L/XL</option>
                      <option value="2XL">2XL</option>
                      <option value="3XL">3XL</option>
                      <option value="4XL">4XL</option>
                      <option value="5XL">5XL</option>
                      <option value="6XL">6XL</option>
                      <option value="75">75</option>
                      <option value="80">80</option>
                      <option value="85">85</option>
                      <option value="90">90</option>
                      <option value="95">95</option>
                      <option value="100">100</option>
                    </select>
                  </div>

                  <div>
                    <Label>Renk</Label>
                    <Input
                      value={variant.color}
                      onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                      placeholder="Örn: Siyah, Beyaz"
                    />
                  </div>

                  <div>
                    <Label>Malzeme</Label>
                    <Input
                      value={variant.material}
                      onChange={(e) => updateVariant(variant.id, 'material', e.target.value)}
                      placeholder="Örn: Saten, Dantel"
                    />
                  </div>

                  <div>
                    <Label>Fiyat (₺) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label>Stok</Label>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Butonları */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          İptal
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Oluşturuluyor...' : 'Ürün Oluştur'}
        </Button>
      </div>
    </form>
  );
}