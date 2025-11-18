import { prisma } from "@/lib/prisma";
import KatalogPageClient from "./KatalogPageClient";
import { readdir } from 'fs/promises';
import path from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function KatalogPage() {
  // Katalog klasöründeki fotoğrafları getir
  let catalogImages: string[] = [];
  try {
    const catalogPath = path.join(process.cwd(), 'public', 'katalog');
    const files = await readdir(catalogPath);
    catalogImages = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
  } catch (error) {
    console.log('Katalog klasörü bulunamadı veya boş');
  }

  // Tüm ürünleri getir
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <KatalogPageClient 
      catalogImages={catalogImages}
      products={products}
    />
  );
}