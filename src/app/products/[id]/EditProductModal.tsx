'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Plus, Trash2 } from 'lucide-react';

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

interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  brand: string | null;
  status: string;
  category: Category;
  variants: ProductVariant[];
}

interface EditProductModalProps {
  product: Product;
  categories: Category[];
  onUpdate: () => void;
}

export default function EditProductModal({ product, categories, onUpdate }: EditProductModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Ürün bilgileri
  const [productName, setProductName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [brand, setBrand] = useState(product.brand || 'VELOURS SECRETS');
  const [status, setStatus] = useState(product.status);

  // Varyasyonlar
  const [variants, setVariants] = useState<ProductVariant[]>(product.variants);

  // Modal açıldığında verileri sıfırla
  useEffect(() => {
    if (open) {
      setProductName(product.name);
      setDescription(product.description || '');
      setCategoryId(product.categoryId);
      setBrand(product.brand || 'VELOURS SECRETS');
      setStatus(product.status);
      setVariants(product.variants);
    }
  }, [open, product]);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      name: '',
      size: 'S/M',
      color: '',
      material: '',
      price: '0',
      stock: 0
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = async (variantId: string) => {
    if (variantId.startsWith('temp-')) {
      // Yeni eklenen varyasyon, sadece listeden çıkar
      setVariants(variants.filter(v => v.id !== variantId));
      return;
    }

    if (!confirm('Bu varyasyonu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/variants/${variantId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setVariants(variants.filter(v => v.id !== variantId));
      } else {
        alert('Varyasyon silinirken hata oluştu!');
      }
    } catch (error) {
      console.error('Varyasyon silme hatası:', error);
      alert('Varyasyon silinirken hata oluştu!');
    }
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: string | number) => {
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

    setLoading(true);

    try {
      // Ürün bilgilerini güncelle
      const productResponse = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
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
        throw new Error('Ürün güncellenemedi');
      }

      // Varyasyonları güncelle/oluştur
      for (const variant of variants) {
        const variantName = variant.name || `${productName} - ${variant.size}`;
        
        if (variant.id.startsWith('temp-')) {
          // Yeni varyasyon oluştur
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
              stock: parseInt(variant.stock.toString()) || 0
            })
          });
        } else {
          // Mevcut varyasyonu güncelle
          await fetch(`/api/variants/${variant.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: variantName,
              size: variant.size,
              color: variant.color || null,
              material: variant.material || null,
              price: parseFloat(variant.price),
              stock: parseInt(variant.stock.toString()) || 0
            })
          });
        }
      }

      alert('✅ Ürün başarıyla güncellendi!');
      setOpen(false);
      onUpdate(); // Sayfayı yenile

    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      alert('❌ Ürün güncellenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Düzenle
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-4xl w-[75vw] max-h-[90vh] overflow-y-auto"
        style={{ width: '700px', maxWidth: '700px' }}
      >
        <DialogHeader>
          <DialogTitle>Ürün Düzenle</DialogTitle>
          <DialogDescription>
            Ürün bilgilerini ve varyasyonlarını düzenleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Ürün Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Ürün Adı *</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="categoryId">Kategori *</Label>
                  <select
                    id="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
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
            </CardContent>
          </Card>

          {/* Varyasyonlar */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Varyasyonlar ({variants.length})</CardTitle>
                <Button type="button" onClick={addVariant} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Varyasyon Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">
                        Varyasyon {index + 1}
                        {variant.id.startsWith('temp-') && (
                          <span className="text-green-600 text-sm ml-2">(Yeni)</span>
                        )}
                      </h4>
                      <Button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                          value={variant.color || ''}
                          onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                          placeholder="Örn: Siyah, Beyaz"
                        />
                      </div>

                      <div>
                        <Label>Malzeme</Label>
                        <Input
                          value={variant.material || ''}
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
                          required
                        />
                      </div>

                      <div>
                        <Label>Stok</Label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Butonları */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}