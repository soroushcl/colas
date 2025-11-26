'use client';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<{
        message: string;
        type: ToastType;
        isOpen: boolean;
    }>({
        message: '',
        type: 'success',
        isOpen: false,
    });

    const showToast = useCallback((message: string, type: ToastType) => {
        setToast({
            message,
            type,
            isOpen: true,
        });
    }, []);

    const showSuccess = useCallback((message: string) => {
        showToast(message, 'success');
    }, [showToast]);

    const showError = useCallback((message: string) => {
        showToast(message, 'error');
    }, [showToast]);

    const handleClose = useCallback(() => {
        setToast(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
            {children}
            <Toast
                message={toast.message}
                type={toast.type}
                isOpen={toast.isOpen}
                onClose={handleClose}
            />
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

