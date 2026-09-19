import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { ToastProvider } from './components/ui/ToastProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <App />
                {/* Sonner — polished stacking toasts for AI pipeline events */}
                <Toaster
                    theme="dark"
                    richColors
                    expand={true}
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: 'rgba(13,27,64,0.97)',
                            border: '1px solid rgba(255,107,53,0.25)',
                            color: '#f1f5f9',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            backdropFilter: 'blur(20px)',
                        },
                        classNames: {
                            title: 'font-semibold text-sm',
                            description: 'text-slate-400 text-xs',
                        },
                    }}
                />
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>
);
