import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const session = await auth();
    const publicRoutes = ['/login', '/api/auth'];
    const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

    if (!session && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*).*)'],
};
