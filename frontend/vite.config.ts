import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://localhost:4000',
                ws: true,
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 750,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('@react-three/drei')) {
                            return 'three-drei';
                        }
                        if (id.includes('@react-three/fiber')) {
                            return 'three-fiber';
                        }
                        if (id.includes('three')) {
                            return 'three-core';
                        }
                        if (id.includes('recharts') || id.includes('d3')) {
                            return 'charts-vendor';
                        }
                        if (id.includes('framer-motion')) {
                            return 'motion-vendor';
                        }
                        if (id.includes('lucide-react')) {
                            return 'icons-vendor';
                        }
                        if (
                            id.includes('react') ||
                            id.includes('react-dom') ||
                            id.includes('react-router-dom') ||
                            id.includes('scheduler')
                        ) {
                            return 'react-vendor';
                        }
                    }
                },
            },
        },
    },
});
