import { prisma } from "@/lib/prisma";
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
      images: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  // Kategorileri getir (modal için)
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  // Decimal tiplerini string'e çevir
  const serializedProduct = {
    ...product,
    variants: product.variants.map(variant => ({
      ...variant,
      price: variant.price.toString()
    }))
  };

  return (
    <ProductPageClient 
      initialProduct={serializedProduct}
      categories={categories}
    />
  );
}