'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClickableImage } from "@/components/ui/lightbox";
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  sku: string;
  images: Array<{
    id: string;
    filename: string;
    url: string;
    alt: string;
    sortOrder: number;
  }>;
}

interface ImageUploadSectionProps {
  product: Product;
}

export default function ImageUploadSection({ product }: ImageUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(product.images);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) {
      alert('Lütfen fotoğraf seçin!');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/products/${product.id}/images`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        // Yeni fotoğrafları listeye ekle
        setImages(prev => [...prev, ...result.images]);
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        alert(`✅ ${result.uploaded} fotoğraf başarıyla yüklendi!`);
      } else {
        alert(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload hatası:', error);
      alert('Fotoğraf yükleme sırasında hata oluştu!');
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}/images?imageId=${imageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        alert('✅ Fotoğraf başarıyla silindi!');
      } else {
        const result = await response.json();
        alert(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Fotoğraf silinirken hata oluştu!');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ürün Fotoğrafları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Fotoğraf Yükleme */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-upload">Fotoğraf Seç (Çoklu seçim yapabilirsiniz)</Label>
              <Input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>

            {/* Seçilen Dosyalar Önizleme */}
            {selectedFiles.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Seçilen Fotoğraflar ({selectedFiles.length}):</h4>
                <div className="grid grid-cols-4 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Seçilen ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                      >
                        ×
                      </button>
                      <p className="text-xs mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={uploadImages} 
              disabled={uploading || selectedFiles.length === 0}
              className="w-full"
            >
              {uploading ? 'Fotoğraflar Yükleniyor...' : `${selectedFiles.length} Fotoğrafı Yükle`}
            </Button>
          </div>

          {/* Mevcut Fotoğraflar */}
          <div>
            <h4 className="font-semibold mb-4">Mevcut Fotoğraflar ({images.length})</h4>
            {images.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz fotoğraf yüklenmemiş</p>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <ClickableImage
                      src={image.url}
                      alt={image.alt || ''}
                      width={200}
                      height={200}
                      className="w-full h-32"
                    />
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Fotoğrafı Sil"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                      {image.filename}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dizin Bilgisi */}
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-semibold mb-2">Fotoğraf Bilgileri:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Dizin:</strong> 
                <code className="bg-white px-2 py-1 rounded ml-2">
                  public/urun-gorsel/{product.sku}/
                </code>
              </div>
              <div>
                <strong>Dosya Formatı:</strong> 
                <code className="bg-white px-2 py-1 rounded ml-2">
                  {product.sku}-1.jpg, {product.sku}-2.jpg, ...
                </code>
              </div>
              <p className="text-gray-600 mt-2">
                Fotoğraflar SKU adıyla numaralandırılır ve veritabanında referansları tutulur.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}