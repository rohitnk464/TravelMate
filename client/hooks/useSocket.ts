"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/config';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketInstance = io('http://localhost:5000', {
            transports: ['websocket'],
            reconnection: true,
        });

        socketInstance.on('connect', () => {
            console.log('Connected to socket server:', socketInstance.id);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return socket;
};
