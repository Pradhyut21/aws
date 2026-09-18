import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Play, Loader2, Video, FileText } from 'lucide-react';

interface Frame {
    time: string;
    visual: string;
    narration: string;
    emoji: string;
    transition: string;
}

const DEFAULT_FRAMES: Frame[] = [
    { time: '0:00', emoji: '🌅', visual: 'Opening shot: Product close-up with warm festival lighting', narration: 'नमस्ते! Diwali special offer from Raju Silk House, Varanasi!', transition: 'Fade in' },
    { time: '0:03', emoji: '🛍️', visual: 'Showcase 3 premium silk sarees with price tags', narration: 'Genuine Banarasi silk — starting from just ₹2,499', transition: 'Slide left' },
    { time: '0:07', emoji: '✨', visual: 'Satisfied customer trying on saree, smiling', narration: 'Over 500 happy customers this season!', transition: 'Zoom in' },
    { time: '0:11', emoji: '🎁', visual: 'Gift box with saree and discount sticker — 30% OFF', narration: 'Special 30% Diwali discount — only 3 days left!', transition: 'Flash' },
    { time: '0:14', emoji: '📱', visual: 'WhatsApp number + shop address on screen', narration: 'WhatsApp us at 9876543210. Happy Diwali! 🎆', transition: 'Fade out' },
];

interface VideoStoryboardProps {
    frames?: Frame[];
    title?: string;
    poster?: string;
}

export default function VideoStoryboard({ frames = DEFAULT_FRAMES, title = '15-Second Nova Reel Script', poster = '' }: VideoStoryboardProps) {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [viewMode, setViewMode] = useState<'script' | 'video'>('script');
    const [isRendering, setIsRendering] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [videoReady, setVideoReady] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const renderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const FRAME_DURATION = 3000;

    const play = () => {
        setPlaying(true);
        setCurrentFrame(0);
        setProgress(0);
    };

    const pause = () => {
        setPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    useEffect(() => {
        if (!playing) return;
        const start = Date.now();
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const frameIdx = Math.min(Math.floor(elapsed / FRAME_DURATION), frames.length - 1);
            const frameProgress = ((elapsed % FRAME_DURATION) / FRAME_DURATION) * 100;
            setCurrentFrame(frameIdx);
            setProgress(frameProgress);
            if (elapsed >= frames.length * FRAME_DURATION) {
                setPlaying(false);
                setCurrentFrame(0);
                setProgress(0);
                clearInterval(intervalRef.current!);
            }
        }, 50);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [playing, frames.length]);

    const handleRenderVideo = () => {
        setIsRendering(true);
        setRenderProgress(0);
        let progressVal = 0;
        renderIntervalRef.current = setInterval(() => {
            progressVal += Math.random() * 15;
            if (progressVal >= 100) {
                progressVal = 100;
                setIsRendering(false);
                setVideoReady(true);
                setViewMode('video');
                setPlaying(true);
                setCurrentFrame(0);
                if (renderIntervalRef.current) clearInterval(renderIntervalRef.current);
            }
            setRenderProgress(progressVal);
        }, 500);
    };

    useEffect(() => {
        return () => {
            if (renderIntervalRef.current) clearInterval(renderIntervalRef.current);
        };
    }, []);

    const frame = frames[currentFrame];

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold font-poppins text-white flex items-center gap-2">
                    🎬 {title}
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                        Nova Reel
                    </span>
                </h3>
                <button
                    onClick={playing ? pause : play}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={playing ? { background: 'rgba(255,68,68,0.15)', color: '#FF6666', border: '1px solid rgba(255,68,68,0.3)' }
                        : { background: 'rgba(0,255,136,0.15)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.3)' }}
                    disabled={viewMode === 'video'}
                >
                    {playing ? '⏸ Pause Script' : '▶ Preview Script'}
                </button>
            </div>

            {viewMode === 'script' && (
                <>
                    {/* Progress bar */}
                    <div className="h-1 bg-slate-800 rounded-full mb-5 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                width: `${((currentFrame * FRAME_DURATION) + (progress / 100) * FRAME_DURATION) / (frames.length * FRAME_DURATION) * 100}%`,
                                background: 'linear-gradient(90deg, #FF6B35, #F7C948)',
                            }}
                            transition={{ duration: 0.05 }}
                        />
                    </div>

                    {/* Frames timeline */}
                    <div className="flex gap-2 mb-5 overflow-x-auto pb-2 custom-scrollbar">
                        {frames.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => { setCurrentFrame(i); setPlaying(false); }}
                                className="flex-shrink-0 w-24 h-16 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all text-center"
                                style={{
                                    background: i === currentFrame ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.04)',
                                    borderColor: i === currentFrame ? '#FF6B3580' : 'rgba(255,255,255,0.08)',
                                    boxShadow: i === currentFrame ? '0 0 20px rgba(255,107,53,0.2)' : 'none',
                                }}
                            >
                                <span className="text-xl">{f.emoji}</span>
                                <span className="text-[10px] font-mono text-slate-400">{f.time}</span>
                            </button>
                        ))}
                    </div>

                    {/* Active frame detail */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentFrame}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {/* Visual description */}
                            <div className="rounded-xl p-4" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
                                <div className="text-xs text-cyan-400 font-mono mb-2 flex items-center gap-1">
                                    <span>🎥</span> VISUAL · {frame.time} · {frame.transition}
                                </div>
                                <p className="text-slate-200 text-sm leading-relaxed">{frame.visual}</p>
                            </div>

                            {/* Narration */}
                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.15)' }}>
                                <div className="text-xs text-orange-400 font-mono mb-2 flex items-center gap-1">
                                    <span>🎙️</span> NARRATION · Nova Sonic TTS
                                </div>
                                <p className="text-slate-200 text-sm leading-relaxed italic">"{frame.narration}"</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </>
            )}

            {/* Video Player View */}
            {viewMode === 'video' && videoReady && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-black aspect-video group"
                >
                    {/* Simulated Video Canvas */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
                        {poster ? (
                            <motion.img
                                src={poster}
                                alt="Video background"
                                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: frames.length * 3, ease: "linear", repeat: Infinity }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black" />
                        )}

                        {/* Frame Content Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/40">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentFrame}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                    className="max-w-xl"
                                >
                                    <div className="text-6xl mb-6 shadow-black drop-shadow-2xl">{frame.emoji}</div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-poppins capitalize leading-tight">
                                        {frame.narration}
                                    </h2>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Audio visualizer simulation */}
                        <div className="absolute bottom-16 left-0 right-0 py-2 flex justify-center gap-1 opacity-70">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 bg-cyan-400 rounded-full"
                                    animate={{ height: playing ? [10, Math.random() * 40 + 10, 10] : 10 }}
                                    transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Progress Bar (Video Mode) */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                        <motion.div
                            className="h-full bg-cyan-500"
                            style={{ width: `${((currentFrame * FRAME_DURATION) + (progress / 100) * FRAME_DURATION) / (frames.length * FRAME_DURATION) * 100}%` }}
                        />
                    </div>

                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold border border-white/10 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Nova Reel Engine
                        </span>
                    </div>

                    {/* Play/Pause Overlay Button */}
                    <button
                        onClick={playing ? pause : play}
                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all z-10"
                    >
                        {!playing && (
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center pl-1 border border-white/30 text-white shadow-2xl">
                                <Play size={32} />
                            </div>
                        )}
                    </button>

                    {/* Duration / Current Time */}
                    <div className="absolute bottom-4 left-4 text-white text-xs font-mono font-medium drop-shadow-md z-20">
                        {frame.time} / 0:15
                    </div>
                </motion.div>
            )}

            {/* Action Area */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {viewMode === 'script' ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                            <FileText size={14} className="text-cyan-400" />
                            Script ready for Amazon Nova Reel
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                            <CheckCircle size={14} className="text-green-400" />
                            Render complete. Ready to download or publish.
                        </div>
                    )}
                </div>

                <div className="w-full md:w-auto">
                    {!videoReady && !isRendering && (
                        <button
                            onClick={handleRenderVideo}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-black hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #FF6B35, #F7C948)' }}
                        >
                            <Video size={18} />
                            Generate Video from Script
                        </button>
                    )}

                    {isRendering && (
                        <div className="flex items-center gap-4 w-full md:w-64 bg-white/5 p-3 rounded-xl border border-white/10">
                            <Loader2 size={18} className="text-orange-400 animate-spin" />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300 font-medium">Rendering Nova Reel...</span>
                                    <span className="text-orange-400 font-mono">{Math.round(renderProgress)}%</span>
                                </div>
                                <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${renderProgress}%` }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {videoReady && (
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setViewMode('script')}
                                className={`flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${viewMode === 'script' ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                            >
                                View Script
                            </button>
                            <button
                                onClick={() => setViewMode('video')}
                                className={`flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${viewMode === 'video' ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                            >
                                View Video
                            </button>
                            <a
                                href="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                                download="campaign_video.mp4"
                                className="flex-none px-4 py-2 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                                title="Download Video"
                            >
                                ⬇️
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
