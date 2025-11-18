import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Varyasyon güncelleme
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { name, size, color, material, price, stock } = body;

        const updatedVariant = await prisma.productVariant.update({
            where: { id },
            data: {
                name,
                size,
                color,
                material,
                price: parseFloat(price),
                stock: parseInt(stock) || 0
            }
        });

        return NextResponse.json(updatedVariant);

    } catch (error) {
        console.error('Varyasyon güncelleme hatası:', error);
        return NextResponse.json(
            { error: 'Varyasyon güncellenirken hata oluştu' },
            { status: 500 }
        );
    }
}

// Varyasyon silme
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.productVariant.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Varyasyon silme hatası:', error);
        return NextResponse.json(
            { error: 'Varyasyon silinirken hata oluştu' },
            { status: 500 }
        );
    }
}