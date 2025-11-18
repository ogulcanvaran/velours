# Velours Secrets - Deployment Guide

## 📦 Sunucuya Kurulum

### Gereksinimler
- Docker & Docker Compose
- Git (opsiyonel)

### Kurulum Adımları

1. **Dosyaları sunucuya yükle**
   ```bash
   # Tüm proje dosyalarını sunucuya kopyala
   scp -r velours-secrets/ user@server:/path/to/deployment/
   ```

2. **Sunucuda deployment çalıştır**
   ```bash
   cd velours-secrets
   chmod +x deploy.sh
   ./deploy.sh
   ```

   **Windows için:**
   ```cmd
   deploy.bat
   ```

3. **Erişim**
   - Uygulama: `http://server-ip:2005`
   - Database: `server-ip:7834`

### Önemli Dosyalar

- `docker-compose.prod.yml` - Production Docker yapılandırması
- `database_backup.sql` - Veritabanı yedeği
- `Dockerfile` - Uygulama container'ı
- `deploy.sh/bat` - Otomatik deployment script

### Environment Variables

Production için `.env` dosyasını güncelle:
```env
DATABASE_URL="postgresql://medusa:medusapass@localhost:7834/velours_secrets?schema=public"
NODE_ENV=production
```

### Troubleshooting

1. **Port çakışması**: docker-compose.prod.yml'de portları değiştir
2. **Database bağlantı hatası**: Container'ların ayakta olduğunu kontrol et
3. **Build hatası**: `docker system prune -a` ile temizle

#### 🔤 Türkçe Karakter Sorunu ve Çözümü

**Problem**: Türkçe karakterler (ç, ğ, ı, ö, ş, ü) database'de bozuk görünüyor (? işareti olarak).

**Kök Neden**: PostgreSQL container'ının varsayılan locale ayarları Türkçe karakterleri desteklemiyor.

**Çözüm**:

1. **PostgreSQL Container'ını Türkçe Locale ile Yapılandır**

   `Dockerfile.postgres` oluştur:
   ```dockerfile
   FROM postgres:16

   # Türkçe locale desteği ekle
   RUN apt-get update && \
       apt-get install -y locales && \
       sed -i '/tr_TR.UTF-8/s/^# //g' /etc/locale.gen && \
       locale-gen && \
       apt-get clean && \
       rm -rf /var/lib/apt/lists/*

   ENV LC_ALL=tr_TR.UTF-8
   ENV LANG=tr_TR.UTF-8
   ENV LANGUAGE=tr_TR.UTF-8
   ```

2. **Docker Compose Güncelle**

   `docker-compose.prod.yml` içinde:
   ```yaml
   postgres:
     build:
       context: .
       dockerfile: Dockerfile.postgres
     environment:
       POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=tr_TR.UTF-8 --lc-ctype=tr_TR.UTF-8"
       LC_ALL: tr_TR.UTF-8
       LANG: tr_TR.UTF-8
   ```

3. **Database Backup'ını Doğru Encoding ile Al**

   Orijinal database'den:
   ```bash
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   docker exec medusa-pg-16 pg_dump -U medusa -d velours_secrets --no-owner --no-privileges --clean --if-exists | Out-File -FilePath "utf8_backup.sql" -Encoding UTF8
   ```

4. **Backup'ı Doğru Client Encoding ile Yükle**

   ```bash
   # Container'a kopyala
   docker cp utf8_backup.sql velours-postgres-prod:/tmp/backup.sql
   
   # UTF8 client encoding ile yükle
   docker-compose exec postgres bash -c "export PGCLIENTENCODING=UTF8 && psql -U medusa -d velours_secrets -f /tmp/backup.sql"
   ```

**Doğrulama**:
```bash
# Database locale kontrolü
docker-compose exec postgres psql -U medusa -d velours_secrets -c "SELECT datname, datcollate, datctype FROM pg_database WHERE datname='velours_secrets';"

# Türkçe karakter testi
docker-compose exec postgres psql -U medusa -d velours_secrets -c "SELECT name FROM products WHERE name LIKE '%ç%' LIMIT 1;"
```

**Sonuç**: tr_TR.UTF-8 locale ile oluşturulan database + UTF8 client encoding = Mükemmel Türkçe karakter desteği ✅

### Güncelleme

Yeni versiyon için:
```bash
./deploy.sh
```

### Backup

Database backup:
```bash
docker exec velours-postgres-prod pg_dump -U medusa velours_secrets > backup.sql
```

## 🔧 Özellikler

- ✅ Otomatik database migration
- ✅ Production optimized build
- ✅ Docker containerization
- ✅ Volume persistence
- ✅ Auto-restart policy
- ✅ Environment separation