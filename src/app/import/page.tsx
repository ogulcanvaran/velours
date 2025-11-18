'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';
import { ProductAnalyzer, ProductRow, ProductGroup } from '@/lib/product-analyzer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExcelRow {
  [key: string]: any;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [data, setData] = useState<ExcelRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProductGroup[] | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const rowsToShow = 200;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'buffer' });
      
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      
      // "Listelerim" tab'ını otomatik seç, yoksa ilk tab'ı seç
      const targetSheet = wb.SheetNames.find(name => 
        name.toLowerCase().includes('listelerim') || 
        name.toLowerCase().includes('liste')
      ) || wb.SheetNames[0];
      
      setSelectedSheet(targetSheet);
      loadSheetData(wb, targetSheet);
      
    } catch (error) {
      console.error('Excel okuma hatası:', error);
      alert('Excel dosyası okunamadı!');
    } finally {
      setLoading(false);
    }
  };

  const loadSheetData = (wb: XLSX.WorkBook, sheetName: string) => {
    try {
      const worksheet = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setData(jsonData as ExcelRow[]);
      if (jsonData.length > 0) {
        const cols = Object.keys(jsonData[0] as object);
        setColumns(cols);
        // İlk 5 sütunu otomatik seç
        setSelectedColumns(cols.slice(0, 5));
      }
    } catch (error) {
      console.error('Sheet okuma hatası:', error);
      setData([]);
      setColumns([]);
      setSelectedColumns([]);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    if (workbook) {
      setSelectedSheet(sheetName);
      loadSheetData(workbook, sheetName);
    }
  };

  const exportToCSV = () => {
    if (data.length === 0 || selectedColumns.length === 0) {
      alert('Veri yok veya sütun seçilmemiş!');
      return;
    }

    // CSV başlık satırı
    const headers = selectedColumns.join(',');
    
    // CSV veri satırları
    const csvRows = data.slice(0, rowsToShow).map(row => {
      return selectedColumns.map(col => {
        const value = row[col] || '';
        // CSV için özel karakterleri escape et
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });

    // CSV içeriği (UTF-8 BOM ile)
    const csvContent = '\uFEFF' + [headers, ...csvRows].join('\n');
    
    // Dosya indirme
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `velours-secrets-${selectedSheet}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Analizli veriyi CSV olarak export et
  const exportAnalysisToCSV = () => {
    if (!analysisResult || analysisResult.length === 0) {
      alert('Önce analiz yapın!');
      return;
    }

    const headers = 'Ürün Adı,Kategori,Marka,Fiyat,Varyasyon Sayısı,Bedenler';
    
    const csvRows = analysisResult.map(group => {
      const sizes = ProductAnalyzer.sortSizes(group.variants.map(v => v.size)).join(' | ');
      return [
        `"${group.baseProductName}"`,
        `"${group.category}"`,
        `"${group.brand}"`,
        `"${group.basePrice}"`,
        `"${group.variants.length}"`,
        `"${sizes}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `velours-secrets-analiz-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Analizli veriyi Excel olarak export et
  const exportAnalysisToExcel = () => {
    if (!analysisResult || analysisResult.length === 0) {
      alert('Önce analiz yapın!');
      return;
    }

    const worksheetData = analysisResult.map((group, index) => ({
      'Sıra': index + 1,
      'Ürün Adı': group.baseProductName,
      'Kategori': group.category,
      'Marka': group.brand,
      'Fiyat': group.basePrice,
      'Varyasyon Sayısı': group.variants.length,
      'Bedenler': ProductAnalyzer.sortSizes(group.variants.map(v => v.size)).join(' | '),
      'SKU Listesi': group.variants.map(v => v.sku).join(' | ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analiz Sonucu');

    // Excel dosyasını indir
    XLSX.writeFile(workbook, `velours-secrets-analiz-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // PDF olarak export et (basit tablo yaklaşımı)
  const exportAnalysisToPDF = () => {
    if (!analysisResult || analysisResult.length === 0) {
      alert('Önce analiz yapın!');
      return;
    }

    try {
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
      
      // Başlık
      pdf.setFontSize(16);
      pdf.text('Velours Secrets - Ürün Analiz Raporu', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 20, 30);
      pdf.text(`Toplam Benzersiz Ürün: ${analysisResult.length}`, 150, 30);
      
      // Tablo başlıkları
      let yPosition = 50;
      const lineHeight = 8;
      const pageHeight = 200;
      
      pdf.setFontSize(10);
      pdf.text('#', 20, yPosition);
      pdf.text('Ürün Adı', 30, yPosition);
      pdf.text('Kategori', 120, yPosition);
      pdf.text('Marka', 160, yPosition);
      pdf.text('Fiyat', 200, yPosition);
      pdf.text('Varyasyon', 230, yPosition);
      pdf.text('Bedenler', 260, yPosition);
      
      // Çizgi çek
      pdf.line(20, yPosition + 2, 290, yPosition + 2);
      yPosition += 10;
      
      // Veri satırları
      analysisResult.forEach((group, index) => {
        if (yPosition > pageHeight) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const sizes = ProductAnalyzer.sortSizes(group.variants.map(v => v.size)).join(',');
        
        pdf.text((index + 1).toString(), 20, yPosition);
        pdf.text(group.baseProductName.substring(0, 35), 30, yPosition);
        pdf.text(group.category, 120, yPosition);
        pdf.text(group.brand, 160, yPosition);
        pdf.text(`₺${group.basePrice}`, 200, yPosition);
        pdf.text(group.variants.length.toString(), 230, yPosition);
        pdf.text(sizes.substring(0, 15), 260, yPosition);
        
        yPosition += lineHeight;
      });

      pdf.save(`velours-secrets-analiz-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu!');
    }
  };

  const analyzeProducts = () => {
    if (data.length === 0) {
      alert('Analiz edilecek veri yok!');
      return;
    }

    try {
      console.log('Analiz başlıyor, veri örneği:', data[0]);
      
      const productRows = data as ProductRow[];
      const groups = ProductAnalyzer.groupProducts(productRows);
      const report = ProductAnalyzer.generateAnalysisReport(productRows);
      
      setAnalysisResult(groups);
      setShowAnalysis(true);
      
      console.log('Analiz Raporu:', report);
      console.log('Gruplandırılmış Ürünler:', groups);
      
      if (report.totalProducts === 0) {
        alert('⚠️ Analiz tamamlandı ancak geçerli ürün bulunamadı!\n\nLütfen Excel dosyasının formatını kontrol edin.');
      } else {
        alert(`✅ Analiz Tamamlandı!\n\nToplam Ürün: ${report.totalProducts}\nBenzersiz Ürün: ${report.uniqueProducts}\nTekrar Eden: ${report.duplicateCount}\n\nKategoriler: ${report.categories.length}\nMarkalar: ${report.brands.length}`);
      }
      
    } catch (error) {
      console.error('Analiz hatası:', error);
      alert(`❌ Analiz sırasında hata oluştu!\n\nHata: ${error}\n\nLütfen Excel dosyasının formatını kontrol edin.`);
    }
  };



  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Excel Import</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Excel Dosyası Yükle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="excel-file">Excel Dosyası Seç</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </div>
              {loading && <p>Dosya okunuyor...</p>}
            </div>
          </CardContent>
        </Card>

        {sheetNames.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Excel Tab'ları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Tab Seç:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sheetNames.map(sheetName => (
                      <Button
                        key={sheetName}
                        variant={selectedSheet === sheetName ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSheetChange(sheetName)}
                      >
                        {sheetName}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                "{selectedSheet}" Tab'ı - Veri Önizleme ({data.length} satır)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Sütun Seçimi:</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {columns.map(col => (
                    <label key={col} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColumns([...selectedColumns, col]);
                          } else {
                            setSelectedColumns(selectedColumns.filter(c => c !== col));
                          }
                        }}
                      />
                      <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                        {col}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mb-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedColumns(columns)}
                  >
                    Tümünü Seç
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedColumns([])}
                  >
                    Hiçbirini Seçme
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto" style={{maxHeight: '600px'}}>
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-50 sticky left-0 z-10">#</th>
                      {selectedColumns.map(col => (
                        <th key={col} className="border border-gray-300 p-2 bg-gray-50 min-w-32">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, rowsToShow).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-mono text-sm bg-gray-50 sticky left-0">
                          {index + 1}
                        </td>
                        {selectedColumns.map(col => (
                          <td key={col} className="border border-gray-300 p-2 text-sm">
                            {String(row[col] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Gösterilen: {Math.min(rowsToShow, data.length)} / {data.length} satır
                {selectedColumns.length > 0 && ` | Seçili sütunlar: ${selectedColumns.length}`}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={exportToCSV} disabled={selectedColumns.length === 0}>
                  Ham Veri CSV İndir
                </Button>
                <Button onClick={analyzeProducts} variant="outline">
                  Ürünleri Analiz Et
                </Button>
                {analysisResult && (
                  <>
                    <Button 
                      onClick={() => setShowAnalysis(!showAnalysis)} 
                      variant={showAnalysis ? "default" : "outline"}
                    >
                      {showAnalysis ? 'Ham Veriyi Göster' : 'Analiz Sonucunu Göster'}
                    </Button>
                    <Button onClick={exportAnalysisToCSV} variant="secondary">
                      Analiz CSV İndir
                    </Button>
                    <Button onClick={exportAnalysisToExcel} variant="secondary">
                      Analiz Excel İndir
                    </Button>
                    <Button onClick={exportAnalysisToPDF} variant="secondary">
                      Analiz PDF İndir
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {analysisResult && showAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Gruplandırılmış Ürünler ({analysisResult.length} benzersiz ürün)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto" style={{maxHeight: '600px'}}>
                <table id="analysis-table" className="w-full border-collapse border border-gray-300">
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-50">#</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Ürün Adı</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Kategori</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Marka</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Fiyat</th>
                      <th className="border border-gray-300 p-2 bg-gray-50">Varyasyonlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResult.map((group, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-mono text-sm">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm font-medium">
                          {group.baseProductName}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {group.category}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {group.brand}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          ₺{group.basePrice}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {ProductAnalyzer.sortSizes(group.variants.map(v => v.size)).map(size => (
                              <span key={size} className="bg-blue-100 px-2 py-1 rounded text-xs">
                                {size}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {group.variants.length} varyasyon
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}