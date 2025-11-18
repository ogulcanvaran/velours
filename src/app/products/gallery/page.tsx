import { prisma } from "@/lib/prisma";
import ProductGallery from "./ProductGallery";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ProductGalleryPage() {
  // Sadece fotoğrafı olan ürünleri getir
  const products = await prisma.product.findMany({
    where: {
      images: {
        some: {} // En az bir fotoğrafı olan ürünler
      }
    },
    include: {
      category: true,
      variants: true,
      images: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Decimal değerleri string'e çevir
  const serializedProducts = products.map((product: any) => ({
    ...product,
    variants: product.variants.map((variant: any) => ({
      ...variant,
      price: variant.price?.toString() || null,
    }))
  }));

  return <ProductGallery products={serializedProducts} />;
}