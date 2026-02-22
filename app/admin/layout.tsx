import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Admin Dashboard | Arkaprabha Banerjee",
    description: "Secure Content Management System",
}

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        // We intentionally isolate the admin panel from CustomCursor and SmoothScroll to prevent form-input bugs
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div className="noise-overlay" aria-hidden="true" />
            {children}
        </div>
    )
}
