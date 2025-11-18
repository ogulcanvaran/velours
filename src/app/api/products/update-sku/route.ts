import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SKUGenerator } from '@/lib/sku-generator';

export async function POST() {
  try {
    // Tüm ürünleri getir (SKU kontrolü yapmadan)
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Toplam ${products.length} ürün bulundu`);
    
    // SKU'su olmayan ürünleri filtrele
    const productsNeedingSKU = products.filter(p => !p.sku || p.sku.trim() === '');
    console.log(`SKU'ya ihtiyacı olan ${productsNeedingSKU.length} ürün`);

    let updatedCount = 0;

    for (let i = 0; i < productsNeedingSKU.length; i++) {
      const product = productsNeedingSKU[i];
      
      try {
        // Marka bilgisini ürün adından çıkar (basit yaklaşım)
        let brand = 'VELOURS SECRETS';
        if (product.name.toLowerCase().includes('coccolarsi')) {
          brand = 'COCCOLARSI';
        } else if (product.name.toLowerCase().includes('berrak')) {
          brand = 'BERRAK';
        }

        // SKU oluştur
        const skuConfig = {
          brand: brand,
          productName: product.name,
          category: product.category.name
        };
        
        const newSKU = SKUGenerator.generateSKU(skuConfig, i + 1, 'compact');

        // Ürün SKU'sunu güncelle
        await prisma.product.update({
          where: { id: product.id },
          data: { sku: newSKU }
        });

        // Varyasyon SKU'larını güncelle
        for (const variant of product.variants) {
          if (!variant.sku || variant.sku.trim() === '') {
            const variantSKU = SKUGenerator.generateVariantSKU(newSKU, variant.size || '1');
            
            await prisma.productVariant.update({
              where: { id: variant.id },
              data: { sku: variantSKU }
            });
          }
        }

        updatedCount++;
      } catch (error) {
        console.error(`Ürün SKU güncelleme hatası: ${product.name}`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated: updatedCount,
      total: products.length,
      needingSKU: productsNeedingSKU.length,
      message: `${updatedCount} ürün güncellendi (${products.length} toplam, ${productsNeedingSKU.length} güncellenmesi gereken)`
    });

  } catch (error) {
    console.error('SKU güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'SKU güncelleme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}