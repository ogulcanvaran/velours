import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Velours Secrets</h1>
        <p className="text-xl text-muted-foreground">Ürün Yönetim Sistemi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ürünler</CardTitle>
            <CardDescription>
              Ürünleri görüntüle, düzenle ve yönet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/products">
              <Button className="w-full">Ürünleri Görüntüle</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategoriler</CardTitle>
            <CardDescription>
              Ürün kategorilerini organize et
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/categories">
              <Button className="w-full">Kategorileri Yönet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fotoğraflar</CardTitle>
            <CardDescription>
              Ürün fotoğraflarını düzenle ve eşle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/images">
              <Button className="w-full">Fotoğrafları Yönet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Excel Import</CardTitle>
            <CardDescription>
              Mevcut ürün listesini yükle ve düzenle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/import">
              <Button className="w-full">Excel Yükle</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Veritabanı Import</CardTitle>
            <CardDescription>
              Analiz edilmiş ürünleri veritabanına aktar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/import/database">
              <Button className="w-full">DB'ye Aktar</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Katalog Eşleştirme</CardTitle>
            <CardDescription>
              Katalog fotoğraflarını ürünlerle eşleştir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/katalog">
              <Button className="w-full">Katalog Aç</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Export</CardTitle>
            <CardDescription>
              WooCommerce için CSV dosyası oluştur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/export">
              <Button className="w-full">CSV Oluştur</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}