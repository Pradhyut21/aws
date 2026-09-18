import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ToastProps, ToastType } from './Toast.js';

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast: ToastProps = { id, message, type, onDismiss: () => {} };
        setToasts(prev => [...prev, toast]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const success = useCallback((message: string, duration = 3000) => showToast(message, 'success', duration), [showToast]);
    const error = useCallback((message: string, duration = 3000) => showToast(message, 'error', duration), [showToast]);
    const info = useCallback((message: string, duration = 3000) => showToast(message, 'info', duration), [showToast]);
    const warning = useCallback((message: string, duration = 3000) => showToast(message, 'warning', duration), [showToast]);

    const handleDismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
            {children}
            <ToastContainer toasts={toasts.map(t => ({ ...t, onDismiss: handleDismiss }))} onDismiss={handleDismiss} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
