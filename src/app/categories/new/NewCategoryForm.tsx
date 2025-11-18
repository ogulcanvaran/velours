'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface NewCategoryFormProps {
  parentCategories: Category[];
}

export default function NewCategoryForm({ parentCategories }: NewCategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: 'none'
  });

  // Kategori adından slug oluştur
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Kategori adı gereklidir!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
          parentId: formData.parentId === 'none' ? null : formData.parentId
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Kategori başarıyla oluşturuldu!');
        router.push('/categories');
      } else {
        alert(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      console.error('Kategori oluşturma hatası:', error);
      alert('❌ Kategori oluşturulurken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Kategori Bilgileri</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kategori Adı */}
          <div className="space-y-2">
            <Label htmlFor="name">Kategori Adı *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Örn: Kadın Giyim"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL için)</Label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="kadin-giyim"
            />
            <p className="text-sm text-gray-500">
              URL'de kullanılacak. Otomatik oluşturulur, değiştirebilirsiniz.
            </p>
          </div>

          {/* Üst Kategori */}
          <div className="space-y-2">
            <Label htmlFor="parentId">Üst Kategori (İsteğe bağlı)</Label>
            <Select 
              value={formData.parentId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Üst kategori seçin (isteğe bağlı)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ana Kategori</SelectItem>
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama (İsteğe bağlı)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Kategori hakkında kısa açıklama..."
              rows={3}
            />
          </div>

          {/* Butonlar */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Kategori Oluştur'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/categories')}
            >
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}