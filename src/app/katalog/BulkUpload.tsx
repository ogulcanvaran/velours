'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface BulkUploadProps {
  onUploadComplete: () => void;
}

export default function BulkUpload({ onUploadComplete }: BulkUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    if (imageFiles.length !== files.length) {
      alert('Sadece resim dosyaları kabul edilir (maksimum 10MB)');
    }
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const newProgress: { [key: string]: number } = {};

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        newProgress[file.name] = 0;
        setUploadProgress({ ...newProgress });

        const response = await fetch('/api/katalog/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          newProgress[file.name] = 100;
        } else {
          newProgress[file.name] = -1; // Error
        }
        
        setUploadProgress({ ...newProgress });
      }

      // Başarılı yüklemeler
      const successful = Object.entries(newProgress).filter(([_, progress]) => progress === 100);
      const failed = Object.entries(newProgress).filter(([_, progress]) => progress === -1);

      if (successful.length > 0) {
        alert(`✅ ${successful.length} fotoğraf başarıyla yüklendi!`);
        clearAll();
        onUploadComplete();
      }

      if (failed.length > 0) {
        alert(`❌ ${failed.length} fotoğraf yüklenemedi: ${failed.map(([name]) => name).join(', ')}`);
      }

    } catch (error) {
      console.error('Yükleme hatası:', error);
      alert('❌ Fotoğraflar yüklenirken hata oluştu!');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressColor = (progress: number) => {
    if (progress === -1) return 'bg-red-500';
    if (progress === 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getProgressText = (progress: number) => {
    if (progress === -1) return 'Hata';
    if (progress === 100) return 'Tamamlandı';
    return `${progress}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Toplu Fotoğraf Yükleme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dosya Seçme */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="bulk-file-input"
          />
          <label 
            htmlFor="bulk-file-input" 
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <ImageIcon className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium">Fotoğrafları seçin</p>
              <p className="text-sm text-gray-500">
                Birden fazla fotoğraf seçebilirsiniz (maksimum 10MB/dosya)
              </p>
            </div>
            <Button type="button" variant="outline">
              Dosya Seç
            </Button>
          </label>
        </div>

        {/* Seçilen Dosyalar */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Seçilen Dosyalar ({selectedFiles.length})</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                disabled={uploading}
              >
                Tümünü Temizle
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedFiles.map((file, index) => {
                const progress = uploadProgress[file.name] || 0;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <ImageIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      
                      {uploading && uploadProgress[file.name] !== undefined && (
                        <div className="mt-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{getProgressText(progress)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all ${getProgressColor(progress)}`}
                              style={{ width: progress === -1 ? '100%' : `${Math.max(progress, 0)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {!uploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Yükleme Butonu */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={uploadFiles}
                disabled={uploading || selectedFiles.length === 0}
                className="flex-1"
              >
                {uploading ? 'Yükleniyor...' : `${selectedFiles.length} Fotoğrafı Yükle`}
              </Button>
            </div>
          </div>
        )}

        {/* Bilgi */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Fotoğraflar <code>public/katalog/</code> klasörüne yüklenecek</p>
          <p>• Desteklenen formatlar: JPG, PNG, GIF, WebP</p>
          <p>• Maksimum dosya boyutu: 10MB</p>
          <p>• Yüklenen fotoğrafları aşağıdaki eşleştirme arayüzünde kullanabilirsiniz</p>
        </div>
      </CardContent>
    </Card>
  );
}