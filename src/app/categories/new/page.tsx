import { prisma } from "@/lib/prisma";
import NewCategoryForm from "./NewCategoryForm";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function NewCategoryPage() {
  // Üst kategorileri getir
  const parentCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yeni Kategori Ekle</h1>
        <p className="text-gray-600 mt-2">
          Yeni bir kategori oluşturun ve ürünlerinizi organize edin.
        </p>
      </div>

      <NewCategoryForm parentCategories={parentCategories} />
    </div>
  );
}