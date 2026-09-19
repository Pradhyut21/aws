import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import CommandPalette from './components/ui/CommandPalette';

const Landing = lazy(() => import('./pages/Landing'));

const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewCampaign = lazy(() => import('./pages/NewCampaign'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Templates = lazy(() => import('./pages/Templates'));
const Share = lazy(() => import('./pages/Share'));
// V3 pages
const BharatBrain = lazy(() => import('./pages/BharatBrain'));
const ExperimentLab = lazy(() => import('./pages/ExperimentLab'));
const AgentTrace = lazy(() => import('./pages/AgentTrace'));
const MarketPulse = lazy(() => import('./pages/MarketPulse'));
const PersonaReview = lazy(() => import('./pages/PersonaReview'));
// GitHub Ideas — 8 Innovative Features
const DialectAtlas = lazy(() => import('./pages/DialectAtlas'));
const BharatFocusGroup = lazy(() => import('./pages/BharatFocusGroup'));
const CulturalDiffInspector = lazy(() => import('./pages/CulturalDiffInspector'));
const AudioWaveStudio = lazy(() => import('./pages/AudioWaveStudio'));
const SensitivityMatrix = lazy(() => import('./pages/SensitivityMatrix'));
const PosterStudio = lazy(() => import('./pages/PosterStudio'));
const TransliterationEngine = lazy(() => import('./pages/TransliterationEngine'));
const GitHubIdeasHub = lazy(() => import('./pages/GitHubIdeasHub'));

function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    <div
                        className="absolute inset-1 rounded-full border border-yellow-500/40 border-t-transparent animate-spin"
                        style={{ animationDirection: 'reverse' }}
                    />
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
        { key: 'b', description: 'BharatBrain', handler: () => navigate('/brain') },
        { key: 'e', description: 'Experiment Lab', handler: () => navigate('/experiments') },
        { key: 'm', description: 'Market Pulse', handler: () => navigate('/market-pulse') },
        { key: 'f', description: 'Focus Group', handler: () => navigate('/focus-group') },
        { key: 'p', description: 'Poster Studio', handler: () => navigate('/poster-studio') },
        { key: 'i', description: 'Ideas Hub', handler: () => navigate('/ideas') },
    ]);
    return null;
}

export default function App() {
    return (
        <ErrorBoundary>
            <GlobalShortcuts />
            {/* Global ⌘K Command Palette — available on every page */}
            <CommandPalette />
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
                    {/* V3 routes */}
                    <Route path="/brain" element={<BharatBrain />} />
                    <Route path="/experiments" element={<ExperimentLab />} />
                    <Route path="/trace" element={<AgentTrace />} />
                    <Route path="/trace/:campaignId" element={<AgentTrace />} />
                    <Route path="/market-pulse" element={<MarketPulse />} />
                    <Route path="/persona-review/:campaignId" element={<PersonaReview />} />
                    {/* GitHub Ideas — 8 Innovative Features */}
                    <Route path="/dialect-atlas" element={<DialectAtlas />} />
                    <Route path="/focus-group" element={<BharatFocusGroup />} />
                    <Route path="/cultural-diff" element={<CulturalDiffInspector />} />
                    <Route path="/audio-studio" element={<AudioWaveStudio />} />
                    <Route path="/sensitivity" element={<SensitivityMatrix />} />
                    <Route path="/poster-studio" element={<PosterStudio />} />
                    <Route path="/transliteration" element={<TransliterationEngine />} />
                    <Route path="/ideas" element={<GitHubIdeasHub />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}
