import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Static dosyalar için cache header'ları ekle
  if (request.nextUrl.pathname.startsWith('/urun-gorsel/')) {
    const response = NextResponse.next();
    
    // Cache control headers
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/urun-gorsel/:path*',
  ],
};