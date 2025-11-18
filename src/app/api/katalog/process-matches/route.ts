import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { copyFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

interface ImageMatch {
  imageName: string;
  productId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { matches }: { matches: ImageMatch[] } = await request.json();

    if (!matches || matches.length === 0) {
      return NextResponse.json(
        { error: 'Eşleştirme verisi bulunamadı' },
        { status: 400 }
      );
    }

    let processed = 0;
    let failed = 0;
    const results = [];

    for (const match of matches) {
      try {
        // Ürünü ve SKU'sunu getir
        const product = await prisma.product.findUnique({
          where: { id: match.productId }
        });

        if (!product || !product.sku) {
          results.push(`❌ ${match.imageName}: Ürün bulunamadı`);
          failed++;
          continue;
        }

        // Kaynak dosya yolu
        const sourcePath = path.join(process.cwd(), 'public', 'katalog', match.imageName);
        
        if (!existsSync(sourcePath)) {
          results.push(`❌ ${match.imageName}: Dosya bulunamadı`);
          failed++;
          continue;
        }

        // Hedef dizini oluştur
        const targetDir = path.join(process.cwd(), 'public', 'urun-gorsel', product.sku);
        
        if (!existsSync(targetDir)) {
          await mkdir(targetDir, { recursive: true });
        }

        // Mevcut fotoğraf sayısını al
        const existingImagesCount = await prisma.productImage.count({
          where: { productId: match.productId }
        });

        // Yeni dosya adı
        const imageNumber = existingImagesCount + 1;
        const newFileName = `${product.sku}-${imageNumber}.jpg`;
        const targetPath = path.join(targetDir, newFileName);

        // Fotoğrafı optimize ederek kopyala
        await sharp(sourcePath)
          .jpeg({ quality: 95, progressive: true })
          .toFile(targetPath);

        // Veritabanına kaydet
        await prisma.productImage.create({
          data: {
            productId: match.productId,
            filename: newFileName,
            originalName: match.imageName,
            url: `/urun-gorsel/${product.sku}/${newFileName}`,
            alt: `${product.name} - Fotoğraf ${imageNumber}`,
            sortOrder: imageNumber
          }
        });

        // Kaynak dosyayı sil
        await unlink(sourcePath);

        results.push(`✅ ${match.imageName} → ${product.sku}/${newFileName}`);
        processed++;

      } catch (error) {
        console.error(`Eşleştirme hatası: ${match.imageName}`, error);
        results.push(`❌ ${match.imageName}: ${error}`);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      results
    });

  } catch (error) {
    console.error('Katalog eşleştirme hatası:', error);
    return NextResponse.json(
      { error: 'Eşleştirme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}