import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Sadece resim dosyaları kabul edilir' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan büyük olamaz' },
        { status: 400 }
      );
    }

    // Katalog klasörünü oluştur
    const catalogDir = path.join(process.cwd(), 'public', 'katalog');
    try {
      await mkdir(catalogDir, { recursive: true });
    } catch (error) {
      // Klasör zaten varsa hata vermez
    }

    // Dosya adını temizle ve benzersiz yap
    const originalName = file.name;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .substring(0, 50);
    
    // Aynı isimde dosya varsa timestamp ekle
    const timestamp = Date.now();
    const fileName = `${baseName}_${timestamp}${extension}`;
    const filePath = path.join(catalogDir, fileName);

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: 'Dosya başarıyla yüklendi',
      fileName,
      originalName,
      size: file.size,
      path: `/katalog/${fileName}`
    });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}