import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: true,
      parent: true,
      children: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kategoriler</h1>
        <Link href="/categories/new">
          <Button>Yeni Kategori Ekle</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategori Listesi ({categories.length} kategori)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Kategori Adı</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Üst Kategori</TableHead>
                <TableHead>Alt Kategori Sayısı</TableHead>
                <TableHead>Ürün Sayısı</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Henüz kategori eklenmemiş
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category: any, index: number) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono text-sm">{index + 1}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.parent?.name || '-'}</TableCell>
                    <TableCell>{category.children.length}</TableCell>
                    <TableCell>{category.products.length}</TableCell>
                    <TableCell>
                      <Link href={`/categories/${category.id}`}>
                        <Button variant="outline" size="sm">
                          Düzenle
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}