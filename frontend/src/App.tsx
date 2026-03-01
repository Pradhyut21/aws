import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import Landing from './pages/Landing';

const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewCampaign = lazy(() => import('./pages/NewCampaign'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Templates = lazy(() => import('./pages/Templates'));
const Share = lazy(() => import('./pages/Share'));

function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    <div className="absolute inset-1 rounded-full border border-yellow-500/40 border-t-transparent animate-spin" style={{ animationDirection: 'reverse' }} />
                </div>
                <p className="text-slate-400 font-mono text-sm">Loading BharatMedia...</p>
            </div>
        </div>
    );
}

// Global keyboard shortcut handler
function GlobalShortcuts() {
    const navigate = useNavigate();
    useKeyboardShortcuts([
        { key: 'n', description: 'New campaign', handler: () => navigate('/campaign/new') },
        { key: 'd', description: 'Dashboard', handler: () => navigate('/dashboard') },
        { key: 'a', description: 'Analytics', handler: () => navigate('/analytics') },
        { key: 'c', description: 'Calendar', handler: () => navigate('/calendar') },
        { key: 't', description: 'Templates', handler: () => navigate('/templates') },
    ]);
    return null;
}

export default function App() {
    return (
        <ErrorBoundary>
            <GlobalShortcuts />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/campaign/new" element={<NewCampaign />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/c/:id" element={<Share />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}
