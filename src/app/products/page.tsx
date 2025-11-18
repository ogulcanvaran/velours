import { prisma } from "@/lib/prisma";
import ProductsPageClient from "./ProductsPageClient";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const {
    search = '',
    category = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params;

  // Filtreleme koşulları
  const whereConditions: any = {};

  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (category) {
    whereConditions.categoryId = category;
  }

  if (status) {
    whereConditions.status = status;
  }

  // Sıralama
  const orderBy: any = {};
  if (sortBy === 'name') {
    orderBy.name = sortOrder;
  } else if (sortBy === 'category') {
    orderBy.category = { name: sortOrder };
  } else if (sortBy === 'variants') {
    orderBy.variants = { _count: sortOrder };
  } else {
    orderBy[sortBy] = sortOrder;
  }

  const products = await prisma.product.findMany({
    where: whereConditions,
    include: {
      category: true,
      variants: true,
      images: true,
    },
    orderBy,
  });

  // Kategorileri getir (filter için)
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  // Decimal değerleri string'e çevir (client component için)
  const serializedProducts = products.map((product: any) => ({
    ...product,
    variants: product.variants.map((variant: any) => ({
      ...variant,
      price: variant.price?.toString() || null,
    }))
  }));

  return (
    <ProductsPageClient 
      initialProducts={serializedProducts}
      categories={categories}
      currentParams={params}
    />
  );
}