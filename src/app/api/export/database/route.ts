import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { format, tables, includeRelations } = await request.json();

    // Seçilen tabloları export et
    const exportData: any = {
      metadata: {
        exportDate: new Date().toISOString(),
        format,
        includeRelations,
        tables: Object.keys(tables).filter(key => tables[key])
      },
      data: {}
    };

    // Kategoriler
    if (tables.categories) {
      exportData.data.categories = await prisma.category.findMany({
        include: includeRelations ? {
          parent: true,
          children: true,
          products: true
        } : undefined
      });
    }

    // Ürünler
    if (tables.products) {
      exportData.data.products = await prisma.product.findMany({
        include: includeRelations ? {
          category: true,
          variants: true,
          images: true
        } : undefined
      });
    }

    // Varyasyonlar
    if (tables.variants) {
      exportData.data.variants = await prisma.productVariant.findMany({
        include: includeRelations ? {
          product: true
        } : undefined
      });
    }

    // Fotoğraflar
    if (tables.images) {
      exportData.data.images = await prisma.productImage.findMany({
        include: includeRelations ? {
          product: true,
          variant: true
        } : undefined
      });
    }

    // Decimal değerleri string'e çevir
    const serializedData = JSON.parse(JSON.stringify(exportData, (key, value) => {
      if (typeof value === 'object' && value !== null && value.constructor.name === 'Decimal') {
        return value.toString();
      }
      return value;
    }));

    if (format === 'json') {
      // JSON formatında export
      const jsonString = JSON.stringify(serializedData, null, 2);
      
      return new NextResponse(jsonString, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="velours-secrets-backup-${new Date().toISOString().slice(0, 10)}.json"`
        }
      });
    } else if (format === 'sql') {
      // SQL formatında export
      let sqlContent = `-- Velours Secrets Database Export\n-- Export Date: ${new Date().toISOString()}\n\n`;
      
      // Kategoriler için SQL
      if (tables.categories && exportData.data.categories) {
        sqlContent += `-- Categories\n`;
        sqlContent += `DELETE FROM categories;\n`;
        for (const category of exportData.data.categories) {
          const values = [
            `'${category.id}'`,
            `'${category.name.replace(/'/g, "''")}'`,
            `'${category.slug}'`,
            category.description ? `'${category.description.replace(/'/g, "''")}'` : 'NULL',
            category.parentId ? `'${category.parentId}'` : 'NULL',
            `'${category.createdAt}'`,
            `'${category.updatedAt}'`
          ];
          sqlContent += `INSERT INTO categories (id, name, slug, description, "parentId", "createdAt", "updatedAt") VALUES (${values.join(', ')});\n`;
        }
        sqlContent += `\n`;
      }

      // Ürünler için SQL
      if (tables.products && exportData.data.products) {
        sqlContent += `-- Products\n`;
        sqlContent += `DELETE FROM products;\n`;
        for (const product of exportData.data.products) {
          const values = [
            `'${product.id}'`,
            `'${product.name.replace(/'/g, "''")}'`,
            `'${product.slug}'`,
            product.description ? `'${product.description.replace(/'/g, "''")}'` : 'NULL',
            product.sku ? `'${product.sku}'` : 'NULL',
            product.brand ? `'${product.brand}'` : 'NULL',
            `'${product.status}'`,
            `'${product.categoryId}'`,
            `'${product.createdAt}'`,
            `'${product.updatedAt}'`
          ];
          sqlContent += `INSERT INTO products (id, name, slug, description, sku, brand, status, "categoryId", "createdAt", "updatedAt") VALUES (${values.join(', ')});\n`;
        }
        sqlContent += `\n`;
      }

      // Varyasyonlar için SQL
      if (tables.variants && exportData.data.variants) {
        sqlContent += `-- Product Variants\n`;
        sqlContent += `DELETE FROM product_variants;\n`;
        for (const variant of exportData.data.variants) {
          const values = [
            `'${variant.id}'`,
            `'${variant.productId}'`,
            `'${variant.name.replace(/'/g, "''")}'`,
            variant.sku ? `'${variant.sku}'` : 'NULL',
            variant.price ? `${variant.price}` : 'NULL',
            variant.stock ? `${variant.stock}` : 'NULL',
            variant.size ? `'${variant.size}'` : 'NULL',
            variant.color ? `'${variant.color}'` : 'NULL',
            variant.material ? `'${variant.material}'` : 'NULL',
            `'${variant.createdAt}'`,
            `'${variant.updatedAt}'`
          ];
          sqlContent += `INSERT INTO product_variants (id, "productId", name, sku, price, stock, size, color, material, "createdAt", "updatedAt") VALUES (${values.join(', ')});\n`;
        }
        sqlContent += `\n`;
      }

      // Fotoğraflar için SQL
      if (tables.images && exportData.data.images) {
        sqlContent += `-- Product Images\n`;
        sqlContent += `DELETE FROM product_images;\n`;
        for (const image of exportData.data.images) {
          const values = [
            `'${image.id}'`,
            image.productId ? `'${image.productId}'` : 'NULL',
            image.variantId ? `'${image.variantId}'` : 'NULL',
            `'${image.filename}'`,
            image.originalName ? `'${image.originalName.replace(/'/g, "''")}'` : 'NULL',
            `'${image.url}'`,
            image.alt ? `'${image.alt.replace(/'/g, "''")}'` : 'NULL',
            `${image.sortOrder}`,
            `'${image.createdAt}'`
          ];
          sqlContent += `INSERT INTO product_images (id, "productId", "variantId", filename, "originalName", url, alt, "sortOrder", "createdAt") VALUES (${values.join(', ')});\n`;
        }
        sqlContent += `\n`;
      }

      return new NextResponse(sqlContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="velours-secrets-backup-${new Date().toISOString().slice(0, 10)}.sql"`
        }
      });
    }

    return NextResponse.json({ error: 'Desteklenmeyen format' }, { status: 400 });

  } catch (error) {
    console.error('Database export hatası:', error);
    return NextResponse.json(
      { error: 'Export işlemi başarısız oldu' },
      { status: 500 }
    );
  }
}