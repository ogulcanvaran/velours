import { prisma } from "@/lib/prisma";
import DatabaseExport from "./DatabaseExport";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ExportPage() {
  // Veritabanı istatistiklerini getir
  const stats = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.productVariant.count(),
    prisma.productImage.count(),
  ]);

  const [productCount, categoryCount, variantCount, imageCount] = stats;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Veritabanı Export</h1>
        <p className="text-gray-600 mt-2">
          Veritabanınızı yedekleyin ve farklı formatlarda export edin
        </p>
      </div>

      <DatabaseExport 
        stats={{
          products: productCount,
          categories: categoryCount,
          variants: variantCount,
          images: imageCount
        }}
      />
    </div>
  );
}