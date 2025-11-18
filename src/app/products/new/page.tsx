import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewProductForm from "./NewProductForm";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  // Kategorileri getir
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yeni Ürün Ekle</h1>
        <p className="text-gray-600 mt-2">
          Yeni ürün oluşturun ve varyasyonlarını ekleyin
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Ürün Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <NewProductForm categories={categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}