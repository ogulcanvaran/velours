'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Database, 
  FileText, 
  Package, 
  Tags, 
  Image as ImageIcon,
  Layers,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface DatabaseExportProps {
  stats: {
    products: number;
    categories: number;
    variants: number;
    images: number;
  };
}

export default function DatabaseExport({ stats }: DatabaseExportProps) {
  const [exportFormat, setExportFormat] = useState('json');
  const [selectedTables, setSelectedTables] = useState({
    products: true,
    categories: true,
    variants: true,
    images: true
  });
  const [includeRelations, setIncludeRelations] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleTableToggle = (table: string, checked: boolean) => {
    setSelectedTables(prev => ({
      ...prev,
      [table]: checked
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    setExportStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/export/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: exportFormat,
          tables: selectedTables,
          includeRelations
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const extension = exportFormat === 'json' ? 'json' : 'sql';
        a.download = `velours-secrets-backup-${timestamp}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setExportStatus({
          type: 'success',
          message: 'Veritabanı başarıyla export edildi!'
        });
      } else {
        const error = await response.json();
        setExportStatus({
          type: 'error',
          message: error.error || 'Export işlemi başarısız oldu'
        });
      }
    } catch (error) {
      console.error('Export hatası:', error);
      setExportStatus({
        type: 'error',
        message: 'Export işlemi sırasında hata oluştu'
      });
    } finally {
      setExporting(false);
    }
  };

  const getSelectedCount = () => {
    return Object.values(selectedTables).filter(Boolean).length;
  };

  const getTotalRecords = () => {
    let total = 0;
    if (selectedTables.products) total += stats.products;
    if (selectedTables.categories) total += stats.categories;
    if (selectedTables.variants) total += stats.variants;
    if (selectedTables.images) total += stats.images;
    return total;
  };

  return (
    <div className="grid gap-6">
      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.products}</div>
                <div className="text-sm text-gray-600">Ürün</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Tags className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.categories}</div>
                <div className="text-sm text-gray-600">Kategori</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Layers className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.variants}</div>
                <div className="text-sm text-gray-600">Varyasyon</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.images}</div>
                <div className="text-sm text-gray-600">Fotoğraf</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Export Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Seçimi */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Formatı</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Format seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Tavsiye Edilen)</SelectItem>
                <SelectItem value="sql">SQL Dump</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {exportFormat === 'json' 
                ? 'JSON formatı daha esnek ve okunabilir, import işlemleri için idealdir.'
                : 'SQL dump formatı doğrudan veritabanına import edilebilir.'
              }
            </p>
          </div>

          {/* Tablo Seçimi */}
          <div className="space-y-3">
            <Label>Export Edilecek Tablolar</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="products"
                  checked={selectedTables.products}
                  onCheckedChange={(checked) => handleTableToggle('products', checked as boolean)}
                />
                <Label htmlFor="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Ürünler ({stats.products})
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="categories"
                  checked={selectedTables.categories}
                  onCheckedChange={(checked) => handleTableToggle('categories', checked as boolean)}
                />
                <Label htmlFor="categories" className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Kategoriler ({stats.categories})
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="variants"
                  checked={selectedTables.variants}
                  onCheckedChange={(checked) => handleTableToggle('variants', checked as boolean)}
                />
                <Label htmlFor="variants" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Varyasyonlar ({stats.variants})
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="images"
                  checked={selectedTables.images}
                  onCheckedChange={(checked) => handleTableToggle('images', checked as boolean)}
                />
                <Label htmlFor="images" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Fotoğraflar ({stats.images})
                </Label>
              </div>
            </div>
          </div>

          {/* İlişkiler */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="relations"
              checked={includeRelations}
              onCheckedChange={(checked) => setIncludeRelations(checked as boolean)}
            />
            <Label htmlFor="relations">
              Tablo ilişkilerini dahil et (Tavsiye edilir)
            </Label>
          </div>

          {/* Özet */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Export Özeti</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• {getSelectedCount()} tablo seçildi</p>
              <p>• Toplam {getTotalRecords()} kayıt export edilecek</p>
              <p>• Format: {exportFormat.toUpperCase()}</p>
              <p>• İlişkiler: {includeRelations ? 'Dahil' : 'Dahil değil'}</p>
            </div>
          </div>

          {/* Status Mesajı */}
          {exportStatus.type && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              exportStatus.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {exportStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{exportStatus.message}</span>
            </div>
          )}

          {/* Export Butonu */}
          <Button 
            onClick={handleExport}
            disabled={exporting || getSelectedCount() === 0}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Export Ediliyor...' : 'Veritabanını Export Et'}
          </Button>
        </CardContent>
      </Card>

      {/* Uyarılar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Önemli Notlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Export işlemi veritabanı boyutuna göre zaman alabilir</p>
            <p>• Fotoğraf dosyaları export'a dahil değildir, sadece dosya yolları export edilir</p>
            <p>• Export dosyasını güvenli bir yerde saklayın</p>
            <p>• Düzenli yedekleme yapmanız önerilir</p>
            <p>• JSON formatı daha esnek, SQL formatı daha hızlı import sağlar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}