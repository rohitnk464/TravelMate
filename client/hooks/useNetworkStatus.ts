"use client";

import { useState, useEffect } from "react";

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [isLowConnectivity, setIsLowConnectivity] = useState(false);

    useEffect(() => {
        // Initial check
        if (typeof window !== "undefined") {
            setIsOnline(navigator.onLine);
        }

        const handleOnline = () => {
            setIsOnline(true);
            // Verify actual connectivity (optional ping could go here)
        };

        const handleOffline = () => setIsOnline(false);

        // Experimental: Network Information API for "low connectivity"
        // @ts-ignore
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const updateConnectionStatus = () => {
            if (connection) {
                const slowConnections = ['slow-2g', '2g', '3g'];
                setIsLowConnectivity(slowConnections.includes(connection.effectiveType));
            }
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        if (connection) {
            connection.addEventListener('change', updateConnectionStatus);
            updateConnectionStatus();
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            if (connection) {
                connection.removeEventListener('change', updateConnectionStatus);
            }
        };
    }, []);

    return { isOnline, isLowConnectivity };
}
