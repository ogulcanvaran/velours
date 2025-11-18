import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SKUGenerator } from '@/lib/sku-generator';

export async function POST() {
  try {
    // TÜM ürünleri getir (SKU olsun olmasın)
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      },
      orderBy: { createdAt: 'asc' }
    });

    let updatedCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        // Marka bilgisini ürün adından çıkar
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

        // Ürün SKU'sunu ZORLA güncelle
        await prisma.product.update({
          where: { id: product.id },
          data: { sku: newSKU }
        });

        // Varyasyon SKU'larını ZORLA güncelle
        for (const variant of product.variants) {
          const variantSKU = SKUGenerator.generateVariantSKU(newSKU, variant.size || '1');
          
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { sku: variantSKU }
          });
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
      message: `${updatedCount} ürün zorla güncellendi`
    });

  } catch (error) {
    console.error('SKU zorla güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'SKU zorla güncelleme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}