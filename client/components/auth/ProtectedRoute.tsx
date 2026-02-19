"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    role?: "USER" | "GUIDE" | "ADMIN";
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (role && user?.role !== role) {
            router.push("/unauthorized");
        }
    }, [isAuthenticated, user, role, router]);

    if (!isAuthenticated) return null;
    if (role && user?.role !== role) return null;

    return <>{children}</>;
}
