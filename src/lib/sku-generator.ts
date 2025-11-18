// SKU Oluşturucu Sistem

export interface SKUConfig {
  brand: string;
  productName: string;
  category: string;
  material?: string;
  color?: string;
  type?: string;
}

export class SKUGenerator {
  
  // Türkçe karakterleri temizle ve kısalt
  static cleanText(text: string, maxLength: number = 10): string {
    return text
      .toUpperCase()
      .replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S')
      .replace(/I/g, 'I').replace(/İ/g, 'I').replace(/Ö/g, 'O').replace(/Ç/g, 'C')
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, maxLength);
  }

  // Marka kısaltması
  static getBrandCode(brand: string): string {
    const brandCodes: { [key: string]: string } = {
      'VELOURS SECRETS': 'VS',
      'COCCOLARSI': 'CC',
      'BERRAK': 'BR'
    };
    
    return brandCodes[brand.toUpperCase()] || this.cleanText(brand, 3);
  }

  // Kategori kısaltması
  static getCategoryCode(category: string): string {
    const categoryCodes: { [key: string]: string } = {
      'İÇ GİYİM': 'IC',
      'FANTEZI GİYİM': 'FZ',
      'ÇORAP': 'CR',
      'PIJAMA': 'PJ',
      'GECELIK': 'GC',
      'SÜTYEN': 'ST',
      'KÜLOT': 'KL',
      'BOXER': 'BX'
    };
    
    return categoryCodes[category.toUpperCase()] || this.cleanText(category, 3);
  }

  // Ürün türü çıkar - Daha anlaşılır
  static getProductType(productName: string): string {
    const types: { [key: string]: string } = {
      'PIJAMA': 'PIJAMA',
      'GECELIK': 'GECELIK',
      'SÜTYEN': 'SUTYEN',
      'KÜLOT': 'KULOT',
      'TANGA': 'TANGA',
      'BOXER': 'BOXER',
      'ÇORAP': 'CORAP',
      'BRODE': 'BRODE',
      'BABYDOLL': 'BABYDOLL',
      'JARTIYER': 'JARTIYER',
      'KOSTÜM': 'KOSTUM',
      'TAKIMI': 'TAKIM',
      'TAKIM': 'TAKIM'
    };

    const upperName = productName.toUpperCase();
    for (const [key, code] of Object.entries(types)) {
      if (upperName.includes(key)) {
        return code;
      }
    }
    
    return 'URUN'; // Genel ürün
  }

  // Malzeme/özellik çıkar
  static getMaterial(productName: string): string {
    const materials: { [key: string]: string } = {
      'SATEN': 'SAT',
      'İPEK': 'IPK',
      'DANTEL': 'DNT',
      'PAMUK': 'PMK',
      'BRODE': 'BRD',
      'LAZER': 'LZR'
    };

    const upperName = productName.toUpperCase();
    for (const [key, code] of Object.entries(materials)) {
      if (upperName.includes(key)) {
        return code;
      }
    }
    
    return '';
  }

  // Renk çıkar - Daha anlaşılır
  static getColor(productName: string): string {
    const colors: { [key: string]: string } = {
      'SİYAH': 'SIYAH',
      'BEYAZ': 'BEYAZ',
      'KIRMIZI': 'KIRMIZI',
      'BORDO': 'BORDO',
      'PEMBE': 'PEMBE',
      'KREM': 'KREM',
      'PUDRA': 'PUDRA',
      'YEŞİL': 'YESIL',
      'YEŞIL': 'YESIL',
      'KAHVE': 'KAHVE'
    };

    const upperName = productName.toUpperCase();
    for (const [key, code] of Object.entries(colors)) {
      if (upperName.includes(key)) {
        return code;
      }
    }
    
    return '';
  }

  // Format 1: Basit ve Anlaşılır
  static generateCompactSKU(config: SKUConfig, sequence: number): string {
    const brand = this.getBrandCode(config.brand);
    const type = this.getProductType(config.productName);
    const seq = sequence.toString().padStart(3, '0');

    // Basit format: MARKA-TÜR-NUMARA
    return `${brand}-${type}-${seq}`;
  }

  // Format 2: Orta Detay
  static generateDetailedSKU(config: SKUConfig, sequence: number): string {
    const brand = this.getBrandCode(config.brand);
    const type = this.getProductType(config.productName);
    const color = this.getColor(config.productName);
    const seq = sequence.toString().padStart(3, '0');

    // Orta format: MARKA-TÜR-RENK-NUMARA (renk varsa)
    const parts = [brand, type];
    if (color) parts.push(color);
    parts.push(seq);

    return parts.join('-');
  }

  // Format 3: Global Standart
  static generateGlobalSKU(config: SKUConfig, sequence: number): string {
    const brand = this.getBrandCode(config.brand);
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = sequence.toString().padStart(4, '0');

    return `${brand}${year}${seq}`;
  }

  // Ana SKU oluşturucu
  static generateSKU(config: SKUConfig, sequence: number, format: 'compact' | 'detailed' | 'global' = 'compact'): string {
    switch (format) {
      case 'detailed':
        return this.generateDetailedSKU(config, sequence);
      case 'global':
        return this.generateGlobalSKU(config, sequence);
      default:
        return this.generateCompactSKU(config, sequence);
    }
  }

  // Varyasyon SKU'su (ana SKU + beden)
  static generateVariantSKU(baseSKU: string, size: string): string {
    return `${baseSKU}-${size}`;
  }
}