import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Önce varyasyonları sil
    await prisma.productVariant.deleteMany();
    
    // Sonra ürünleri sil
    await prisma.product.deleteMany();
    
    // Kategorileri sil (isteğe bağlı)
    await prisma.category.deleteMany();

    return NextResponse.json({ 
      success: true, 
      message: 'Tüm ürünler silindi'
    });

  } catch (error) {
    console.error('Reset hatası:', error);
    return NextResponse.json(
      { error: 'Reset sırasında hata oluştu' },
      { status: 500 }
    );
  }
}