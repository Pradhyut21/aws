import { motion } from 'framer-motion';
import type { ContentItem } from '../../lib/types';
import { useState } from 'react';

interface CampaignCardProps {
    item: ContentItem;
    onCopy?: (text: string) => void;
    onPublish?: (id: string) => void;
}

const PLATFORM_SHARE: Record<string, (caption: string, imgUrl: string) => string> = {
    instagram: () => `https://www.instagram.com/`,
    facebook: (caption) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://bharatmedia.in')}&quote=${encodeURIComponent(caption)}`,
    whatsapp: (caption) => `https://wa.me/?text=${encodeURIComponent(caption)}`,
    youtube: () => `https://studio.youtube.com/`,
    twitter: (caption) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`,
};

export default function CampaignCard({ item, onCopy, onPublish }: CampaignCardProps) {
    const [copied, setCopied] = useState(false);
    const [published, setPublished] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleCopy = () => {
        if (item.caption) {
            navigator.clipboard.writeText(item.caption);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            onCopy?.(item.caption);
        }
    };

    const handlePublish = () => {
        setPublished(true);
        onPublish?.(item.id);
        const shareUrl = PLATFORM_SHARE[item.platform]?.(item.caption || '', item.url);
        if (shareUrl) window.open(shareUrl, '_blank');
    };

    const platformColors: Record<string, string> = {
        instagram: '#E1306C', facebook: '#1877F2',
        whatsapp: '#25D366', youtube: '#FF0000', twitter: '#1DA1F2',
    };
    const color = platformColors[item.platform] || '#FF6B35';

    // Fallback image: gradient placeholder if loremflickr fails
    const fallbackBg = `linear-gradient(135deg, ${color}30, rgba(0,0,0,0.4))`;

    return (
        <motion.div
            className="glass-card overflow-hidden group"
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            {/* Image */}
            <div className="relative overflow-hidden h-48" style={{ background: imgError ? fallbackBg : undefined }}>
                {!imgError ? (
                    <img
                        src={item.url}
                        alt={item.caption || 'Campaign image'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: fallbackBg }}>
                        <span className="text-4xl">{item.platform === 'instagram' ? '📸' : item.platform === 'whatsapp' ? '💬' : item.platform === 'youtube' ? '🎬' : '📢'}</span>
                        <span className="text-xs text-slate-400 capitalize">{item.platform}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                <div
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold capitalize"
                    style={{ background: `${color}30`, color }}
                >
                    {item.platform}
                </div>
                {published && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-900/60">
                        <span className="text-4xl">✅</span>
                    </div>
                )}
            </div>

            {/* Caption */}
            {item.caption && (
                <div className="p-4">
                    <p className="text-slate-300 text-sm line-clamp-3">{item.caption}</p>
                </div>
            )}

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
                <button
                    onClick={handleCopy}
                    className="flex-1 py-2 text-sm rounded-lg font-medium transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: copied ? '#00FF88' : '#F5F5F5' }}
                >
                    {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
                <a
                    href={item.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-sm rounded-lg font-medium text-center transition-all hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F5F5' }}
                >
                    ⬇️ Download
                </a>
                <button
                    onClick={handlePublish}
                    disabled={published}
                    className="flex-1 py-2 text-sm rounded-lg font-semibold transition-all"
                    style={{
                        background: published ? 'rgba(0,255,136,0.15)' : `${color}25`,
                        color: published ? '#00FF88' : color,
                    }}
                >
                    {published ? 'Live! ✅' : `🚀 Share`}
                </button>
            </div>
        </motion.div>
    );
}
