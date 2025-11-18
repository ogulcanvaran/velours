import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { name, description, categoryId, brand, status } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        brand,
        status
      },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Product update failed' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: { createdAt: 'asc' }
        },
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Product fetch failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await prisma.productImage.deleteMany({
      where: { productId: id }
    });

    await prisma.productVariant.deleteMany({
      where: { productId: id }
    });

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { error: 'Product delete failed' },
      { status: 500 }
    );
  }
}