import React, { ReactNode, ErrorInfo } from 'react';
import { motion } from 'framer-motion';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 max-w-md w-full text-center"
                    >
                        <div className="text-5xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold gradient-text mb-3">Something went wrong</h1>
                        <p className="text-slate-400 mb-6">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary w-full"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="btn-outline w-full mt-3"
                        >
                            Go Back
                        </button>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
