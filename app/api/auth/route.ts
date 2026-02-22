import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // The password should be set in .env.local
        // For local dev fallback, we'll check against "portfolio2026"
        const validPassword = process.env.ADMIN_PASSWORD || "portfolio2026";

        if (password === validPassword) {
            // If password matches, set an HttpOnly cookie to establish a session

            const oneDay = 24 * 60 * 60 * 1000;

            cookies().set('admin_session', 'authenticated', {
                httpOnly: true, // Prevents JavaScript access
                secure: process.env.NODE_ENV === 'production', // Requires HTTPS on production
                sameSite: 'lax', // Protect CSRF
                path: '/',
                expires: new Date(Date.now() + oneDay) // Expire in 24 hours
            });

            return NextResponse.json({ success: true, message: "Login successful" });
        } else {
            return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ success: false, error: "An error occurred during login" }, { status: 500 });
    }
}

// Optional Logout Endpoint
export async function DELETE() {
    cookies().delete('admin_session');
    return NextResponse.json({ success: true, message: "Logged out" });
}
