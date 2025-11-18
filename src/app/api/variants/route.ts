import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { productId, name, size, color, material, price, stock, sku } = await request.json();

    // Aynı ürün ve beden kombinasyonu var mı kontrol et
    const existingVariant = await prisma.productVariant.findFirst({
      where: { 
        AND: [
          { productId },
          { size }
        ]
      }
    });

    if (existingVariant) {
      return NextResponse.json(existingVariant);
    }

    // Otomatik varyasyon SKU oluştur (eğer verilmemişse)
    let finalSKU = sku;
    if (!finalSKU) {
      // Ana ürünün SKU'sunu al
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (product?.sku) {
        // Varyasyon SKU'su oluştur: Ana SKU + Beden
        const { SKUGenerator } = await import('@/lib/sku-generator');
        finalSKU = SKUGenerator.generateVariantSKU(product.sku, size);

        // SKU benzersizlik kontrolü
        let counter = 1;
        let uniqueSKU = finalSKU;
        
        while (true) {
          const existingSKU = await prisma.productVariant.findUnique({
            where: { sku: uniqueSKU }
          });

          if (!existingSKU) {
            finalSKU = uniqueSKU;
            break;
          }
          
          // Eğer aynı SKU varsa, sayı ekle
          uniqueSKU = `${product.sku}-${size}-${counter}`;
          counter++;
        }
      }
    }

    // Yeni varyasyon oluştur
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name,
        size,
        color,
        material,
        price,
        stock: stock || 0,
        sku: finalSKU
      }
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Varyasyon oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Varyasyon oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        },
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error('Varyasyon listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Varyasyonlar listelenemedi' },
      { status: 500 }
    );
  }
}