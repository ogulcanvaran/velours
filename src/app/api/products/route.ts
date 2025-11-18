import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, slug, description, categoryId, sku, status, brand } = await request.json();

    // Aynı isimde ürün var mı kontrol et
    const existingProduct = await prisma.product.findFirst({
      where: { 
        AND: [
          { name },
          { categoryId }
        ]
      }
    });

    if (existingProduct) {
      return NextResponse.json(existingProduct);
    }

    // Benzersiz slug oluştur
    const baseSlug = slug || name.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let uniqueSlug = baseSlug;
    let counter = 1;

    // Slug benzersiz olana kadar dene
    while (true) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: uniqueSlug }
      });

      if (!existingSlug) break;
      
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Otomatik SKU oluştur (eğer verilmemişse)
    let finalSKU = sku;
    if (!finalSKU) {
      // Kategori bilgisini al
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      // SKU oluştur
      const { SKUGenerator } = await import('@/lib/sku-generator');
      const skuConfig = {
        brand: brand || 'VELOURS SECRETS',
        productName: name,
        category: category?.name || 'GENEL'
      };

      // Mevcut ürün sayısını al (sıra numarası için)
      const productCount = await prisma.product.count();
      const nextNumber = productCount + 1;

      finalSKU = SKUGenerator.generateSKU(skuConfig, nextNumber, 'compact');

      // SKU benzersizlik kontrolü
      let counter = 1;
      let uniqueSKU = finalSKU;
      
      while (true) {
        const existingSKU = await prisma.product.findUnique({
          where: { sku: uniqueSKU }
        });

        if (!existingSKU) {
          finalSKU = uniqueSKU;
          break;
        }
        
        // Eğer aynı SKU varsa, sayıyı artır
        const nextSeq = nextNumber + counter;
        uniqueSKU = SKUGenerator.generateSKU(skuConfig, nextSeq, 'compact');
        counter++;
      }
    }

    // Yeni ürün oluştur
    const product = await prisma.product.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        categoryId,
        sku: finalSKU,
        brand,
        status: status || 'ACTIVE'
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Ürün oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Ürün oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        images: true,
        _count: {
          select: { variants: true, images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Ürün listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Ürünler listelenemedi' },
      { status: 500 }
    );
  }
}