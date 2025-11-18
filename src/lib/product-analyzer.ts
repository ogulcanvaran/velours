// Ürün Analiz ve Gruplandırma Sistemi

export interface ProductRow {
  'Satıcı Stok Kodu'?: string;
  'Stok Kodu'?: string;
  'SKU'?: string;
  'Ürün Adı'?: string;
  'Ürün / Hizmet Adı'?: string;
  'Ana Kategori'?: string;
  'Fiyat'?: string;
  'En Alt Kategori'?: string;
  'En Temel Kategori'?: string;
  'Marka'?: string;
  [key: string]: any; // Diğer sütunlar için
}

export interface ProductGroup {
  baseProductName: string;
  baseSKU: string;
  category: string;
  brand: string;
  basePrice: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  size: string;
  sku: string;
  stockCode: string;
  price: string;
  fullName: string;
}

export class ProductAnalyzer {
  
  // Ürün adından beden bilgisini çıkar
  static extractSizeFromName(productName: string): { baseName: string; size: string } {
    // Güvenlik kontrolü
    if (!productName || typeof productName !== 'string') {
      return { baseName: 'Bilinmeyen Ürün', size: '1' };
    }
    
    // Geniş beden kalıpları - kelime arasında ve sonunda
    const sizePatterns = [
      // Sütyen bedenleri (sonunda)
      /\s+(75|80|85|90|95|100|105|110)$/,
      // Harfli bedenler (sonunda)
      /\s+(XXL|XL|L|M|S|XS)$/i,
      // Kombinasyon bedenler (sonunda)
      /\s+(L\/XL|S\/M)$/i,
      // Harfli bedenler (kelime arasında - boşlukla çevrili)
      /\s+(XXL|XL|L|M|S|XS)\s+/i,
      // Kombinasyon bedenler (kelime arasında)
      /\s+(L\/XL|S\/M)\s+/i,
      // Sütyen bedenleri (kelime arasında)
      /\s+(75|80|85|90|95|100|105|110)\s+/
    ];
    
    for (const pattern of sizePatterns) {
      const match = productName.match(pattern);
      if (match) {
        const size = match[1].toUpperCase();
        const baseName = productName.replace(pattern, ' ').replace(/\s+/g, ' ').trim();
        
        // Debug için beden çıkarma işlemini logla
        console.log(`Beden çıkarıldı: "${productName}" → Base: "${baseName}", Beden: "${size}"`);
        
        return { baseName, size };
      }
    }
    
    // Beden bulunamadı - STD yerine 'GENEL' kullanalım
    console.log(`Beden bulunamadı: "${productName}" → GENEL beden atandı`);
    return { baseName: productName, size: 'GENEL' };
    
    return { baseName: productName, size: 'STD' };
  }

  // Stok kodundan beden bilgisini çıkar
  static extractSizeFromStockCode(stockCode: string): { baseCode: string; size: string } {
    // Güvenlik kontrolü
    if (!stockCode || typeof stockCode !== 'string') {
      return { baseCode: 'UNKNOWN', size: '1' };
    }
    
    const sizeMatch = stockCode.match(/(\d+)$/);
    if (sizeMatch) {
      const size = sizeMatch[1];
      const baseCode = stockCode.replace(/\d+$/, '').trim();
      return { baseCode, size };
    }
    return { baseCode: stockCode, size: '1' };
  }

  // Ürün adını temizle ve normalize et
  static normalizeProductName(name: string): string {
    // Güvenlik kontrolü
    if (!name || typeof name !== 'string') {
      return 'BILINMEYEN_URUN';
    }
    
    return name
      .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluk yap
      .trim()
      .toUpperCase();
  }

  // Ürünleri gruplandır
  static groupProducts(products: ProductRow[]): ProductGroup[] {
    const groups: { [key: string]: ProductGroup } = {};

    products.forEach(product => {
      // Güvenlik kontrolleri
      if (!product || typeof product !== 'object') {
        console.warn('Geçersiz ürün verisi:', product);
        return;
      }

      // Yeni Excel formatı için sütun isimleri
      const stockCode = product['Stok Kodu'] || product['Satıcı Stok Kodu'] || '';
      const productName = product['Ürün / Hizmet Adı'] || product['Ürün Adı'] || 'Bilinmeyen Ürün';
      const category = product['Ana Kategori'] || 'Genel';
      const brand = product['Marka'] || 'Bilinmeyen Marka';
      const sku = product['SKU'] || stockCode || '';
      const price = product['Alış Fiyatı'] || product['Fiyat'] || '0';

      // Ürün adından beden bilgisini çıkar (stok kodu yerine)
      const { baseName, size } = this.extractSizeFromName(productName);
      const normalizedName = this.normalizeProductName(baseName);
      
      // Debug için ilk birkaç ürünü logla
      if (Object.keys(groups).length < 10) {
        console.log(`Ürün analizi:`, {
          original: productName,
          baseName,
          size,
          normalized: normalizedName,
          groupKey: `${normalizedName}_${category}_${brand}`
        });
      }
      
      // Grup anahtarı: normalize edilmiş isim + kategori + marka
      const groupKey = `${normalizedName}_${category}_${brand}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          baseProductName: baseName, // Temizlenmiş ürün adını kullan
          baseSKU: sku.replace(/[A-Z0-9]+$/, ''), // SKU'dan son kısmı kaldır
          category: category,
          brand: brand,
          basePrice: price,
          variants: []
        };
        
        // Debug için grup oluşturulduğunda logla
        console.log(`Yeni grup oluşturuldu: "${baseName}" (${size})`);
      } else {
        // Debug için mevcut gruba ekleme
        console.log(`Mevcut gruba eklendi: "${baseName}" (${size})`);
      }

      // Varyasyon ekle
      groups[groupKey].variants.push({
        size: size,
        sku: sku || stockCode,
        stockCode: stockCode,
        price: price,
        fullName: productName
      });
    });

    // Ürün adına göre alfabetik sırala
    return Object.values(groups).sort((a, b) => 
      a.baseProductName.localeCompare(b.baseProductName, 'tr', { sensitivity: 'base' })
    );
  }

  // Beden sıralaması
  static sortSizes(sizes: string[]): string[] {
    const sizeOrder = [
      'XS', 'S', 'M', 'L', 'XL', 'XXL', 'S/M', 'L/XL',
      '75', '80', '85', '90', '95', '100', '105', '110',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      'GENEL'
    ];
    
    return sizes.sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a);
      const bIndex = sizeOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }

  // Analiz raporu oluştur
  static generateAnalysisReport(products: ProductRow[]): {
    totalProducts: number;
    uniqueProducts: number;
    duplicateCount: number;
    categories: string[];
    brands: string[];
    priceRange: { min: number; max: number };
  } {
    // Güvenlik kontrolü
    if (!products || !Array.isArray(products)) {
      return {
        totalProducts: 0,
        uniqueProducts: 0,
        duplicateCount: 0,
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 0 }
      };
    }

    const groups = this.groupProducts(products);
    const prices = products
      .map(p => parseFloat(p?.['Fiyat'] || '0'))
      .filter(p => !isNaN(p) && p > 0);
    
    const categories = [...new Set(products
      .map(p => p?.['Ana Kategori'])
      .filter(c => c && typeof c === 'string')
    )] as string[];
    
    const brands = [...new Set(products
      .map(p => p?.['Marka'])
      .filter(b => b && typeof b === 'string')
    )] as string[];

    // Debug için
    console.log('Analiz detayları:', {
      totalProducts: products.length,
      uniqueGroups: groups.length,
      sampleProduct: products[0],
      sampleGroup: groups[0]
    });
    
    return {
      totalProducts: products.length,
      uniqueProducts: groups.length,
      duplicateCount: products.length - groups.length,
      categories,
      brands,
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      }
    };
  }
}