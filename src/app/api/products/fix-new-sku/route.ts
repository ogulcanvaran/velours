import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SKUGenerator } from '@/lib/sku-generator';

export async function POST() {
  try {
    // Karışık SKU'ya sahip ürünleri bul (VS- ile başlamayanlar)
    const problematicProducts = await prisma.product.findMany({
      where: {
        AND: [
          { sku: { not: null } },
          { sku: { not: { startsWith: 'VS-' } } }
        ]
      },
      include: {
        category: true,
        variants: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`${problematicProducts.length} problematik ürün bulundu`);

    let updatedCount = 0;
    
    // VS- ile başlayan en son SKU numarasını bul
    const lastVSProduct = await prisma.product.findFirst({
      where: {
        sku: { startsWith: 'VS-' }
      },
      orderBy: { sku: 'desc' }
    });

    // Son numarayı çıkar (örn: VS-GECELIK-013 → 13)
    let startNumber = 1;
    if (lastVSProduct?.sku) {
      const match = lastVSProduct.sku.match(/-(\d+)$/);
      if (match) {
        startNumber = parseInt(match[1]) + 1;
      }
    }

    console.log(`Yeni SKU'lar ${startNumber} numarasından başlayacak`);

    for (let i = 0; i < problematicProducts.length; i++) {
      const product = problematicProducts[i];
      
      try {
        // Marka bilgisini ürün adından çıkar
        let brand = 'VELOURS SECRETS';
        const productName = product.name.toLowerCase();
        
        if (productName.includes('coccolarsi')) {
          brand = 'COCCOLARSI';
        } else if (productName.includes('berrak')) {
          brand = 'BERRAK';
        } else if (productName.includes('alfatex')) {
          brand = 'ALFATEX';
        } else if (productName.includes('arona')) {
          brand = 'ARONA';
        } else if (productName.includes('nightlight')) {
          brand = 'NIGHTLIGHT';
        }

        // Yeni SKU oluştur
        const skuConfig = {
          brand: brand,
          productName: product.name,
          category: product.category.name
        };
        
        const newSKU = SKUGenerator.generateSKU(skuConfig, startNumber + i, 'compact');

        console.log(`Eski SKU: ${product.sku} → Yeni SKU: ${newSKU}`);

        // Ürün SKU'sunu güncelle
        await prisma.product.update({
          where: { id: product.id },
          data: { sku: newSKU }
        });

        // Varyasyon SKU'larını güncelle
        for (const variant of product.variants) {
          const variantSKU = SKUGenerator.generateVariantSKU(newSKU, variant.size || '1');
          
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { sku: variantSKU }
          });
        }

        updatedCount++;
      } catch (error) {
        console.error(`Ürün SKU düzeltme hatası: ${product.name}`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated: updatedCount,
      total: problematicProducts.length,
      startNumber,
      message: `${updatedCount} ürünün SKU'su düzeltildi (${startNumber} numarasından başlayarak)`
    });

  } catch (error) {
    console.error('SKU düzeltme hatası:', error);
    return NextResponse.json(
      { error: 'SKU düzeltme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}