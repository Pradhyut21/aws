import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
    const { isRecording, audioBlob, waveformData, duration, error, start, stop, reset } = useVoiceRecorder();

    const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const handleStop = () => {
        stop();
        if (audioBlob) onRecordingComplete(audioBlob);
    };

    return (
        <div className="flex flex-col items-center gap-6 py-8">
            {/* Record button */}
            <div className="relative">
                {isRecording && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
                    </>
                )}
                <button
                    onClick={isRecording ? handleStop : start}
                    className="relative w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-300 shadow-2xl"
                    style={{
                        background: isRecording
                            ? 'radial-gradient(circle, #ff4444, #cc0000)'
                            : 'linear-gradient(135deg, #FF6B35, #F7C948)',
                        boxShadow: isRecording
                            ? '0 0 40px rgba(255,68,68,0.6)'
                            : '0 0 30px rgba(255,107,53,0.4)',
                        transform: isRecording ? 'scale(1.05)' : 'scale(1)',
                    }}
                >
                    {isRecording ? '⏹' : '🎙️'}
                </button>
            </div>

            {/* Status */}
            <AnimatePresence mode="wait">
                {isRecording ? (
                    <motion.div
                        key="recording"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <div className="flex items-center gap-2 text-red-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Recording... {formatDuration(duration)}
                        </div>
                        {/* Waveform */}
                        <div className="flex items-center gap-[2px] h-16 px-4">
                            {waveformData.map((height, i) => (
                                <div
                                    key={i}
                                    className="waveform-bar transition-all duration-75"
                                    style={{ height: `${height}%` }}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-slate-400">Click the button to stop recording</p>
                    </motion.div>
                ) : audioBlob ? (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <p className="text-green-400 font-semibold flex items-center gap-2">
                            <span>✅</span> Recording complete! ({formatDuration(duration)})
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => onRecordingComplete(audioBlob!)}
                                className="btn-primary text-sm py-2 px-4"
                            >
                                Use This Recording
                            </button>
                            <button onClick={reset} className="btn-outline text-sm py-2 px-4">
                                Re-record
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <p className="text-slate-300 font-medium">Tap the mic and speak in your language</p>
                        <p className="text-slate-500 text-sm mt-1">Hindi, Tamil, Bengali, Kannada, Telugu or any Indian language</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <p className="text-red-400 text-sm bg-red-950/30 px-4 py-2 rounded-lg">{error}</p>
            )}
        </div>
    );
}
