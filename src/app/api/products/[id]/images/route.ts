import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = id;
    
    // Ürünü ve SKU'sunu getir
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.sku) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı veya SKU yok' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Fotoğraf seçilmedi' },
        { status: 400 }
      );
    }

    // Ürün dizinini oluştur
    const publicDir = path.join(process.cwd(), 'public');
    const uploadDir = path.join(publicDir, 'urun-gorsel');
    const productDir = path.join(uploadDir, product.sku);
    
    // Dizinleri oluştur
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    if (!existsSync(productDir)) {
      await mkdir(productDir, { recursive: true });
    }

    // Mevcut fotoğraf sayısını al (sıralama için)
    const existingImagesCount = await prisma.productImage.count({
      where: { productId }
    });

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        continue; // Sadece resim dosyalarını işle
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Dosya adı: SKU-1.jpg, SKU-2.jpg, SKU-3.jpg...
      const imageNumber = existingImagesCount + i + 1;
      const fileName = `${product.sku}-${imageNumber}.jpg`;
      const filePath = path.join(productDir, fileName);

      // Sharp ile kalite kaybı olmadan optimize et
      await sharp(buffer)
        .jpeg({ quality: 95, progressive: true })
        .toFile(filePath);

      // Veritabanına kaydet
      const imageRecord = await prisma.productImage.create({
        data: {
          productId: productId,
          filename: fileName,
          originalName: file.name,
          url: `/urun-gorsel/${product.sku}/${fileName}`,
          alt: `${product.name} - Fotoğraf ${imageNumber}`,
          sortOrder: imageNumber
        }
      });

      uploadedImages.push(imageRecord);
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedImages.length,
      images: uploadedImages
    });

  } catch (error) {
    console.error('Fotoğraf yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Fotoğraf yükleme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}

// Ürün fotoğraflarını listele
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = id;
    
    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(images);

  } catch (error) {
    console.error('Fotoğraf listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Fotoğraflar listelenemedi' },
      { status: 500 }
    );
  }
}

// Fotoğraf sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Fotoğraf ID gerekli' },
        { status: 400 }
      );
    }

    // Fotoğraf kaydını getir
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true }
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Fotoğraf bulunamadı' },
        { status: 404 }
      );
    }

    // Dosyayı sil
    const filePath = path.join(process.cwd(), 'public', 'urun-gorsel', image.product?.sku || '', image.filename);
    
    try {
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Dosya silme hatası:', fileError);
    }

    // Veritabanından sil
    await prisma.productImage.delete({
      where: { id: imageId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Fotoğraf silme hatası:', error);
    return NextResponse.json(
      { error: 'Fotoğraf silinirken hata oluştu' },
      { status: 500 }
    );
  }
}