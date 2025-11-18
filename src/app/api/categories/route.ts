import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, slug, description, parentId } = await request.json();

    // Validasyon
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Kategori adı gereklidir' },
        { status: 400 }
      );
    }

    // Slug kontrolü - aynı slug var mı?
    const existingSlug = await prisma.category.findUnique({
      where: { slug: slug || name.toLowerCase().replace(/\s+/g, '-') }
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Kategori oluştur
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug || name.toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim(),
        description: description?.trim() || null,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true
      }
    });

    return NextResponse.json({
      message: 'Kategori başarıyla oluşturuldu',
      category
    });

  } catch (error) {
    console.error('Kategori oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Kategori oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        products: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Kategori listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategoriler getirilemedi' },
      { status: 500 }
    );
  }
}