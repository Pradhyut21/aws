import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onDismiss: (id: string) => void;
}

const ToastIcon = ({ type }: { type: ToastType }) => {
    switch (type) {
        case 'success':
            return (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'error':
            return (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        case 'warning':
            return (
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        case 'info':
        default:
            return (
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
};

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`flex items-center p-4 mb-4 text-gray-800 bg-white rounded-lg shadow-lg dark:text-gray-200 dark:bg-gray-800 border-l-4 ${type === 'success' ? 'border-green-500' :
                    type === 'error' ? 'border-red-500' :
                        type === 'warning' ? 'border-yellow-500' :
                            'border-blue-500'
                }`}
            role="alert"
        >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
                <ToastIcon type={type} />
            </div>
            <div className="ml-3 text-sm font-normal">{message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={() => onDismiss(id)}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[], onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
};
