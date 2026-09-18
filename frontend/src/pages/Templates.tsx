import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

interface Template {
    id: string;
    emoji: string;
    name: string;
    category: string;
    language: string;
    businessType: string;
    idea: string;
    platforms: string[];
    color: string;
    tags: string[];
    uses: number;
}

const TEMPLATES: Template[] = [
    { id: 'diwali-retail', emoji: '🪔', name: 'Diwali Festival Sale', category: 'Festival', language: 'hi', businessType: 'retail', idea: 'Diwali sale special offer 30% off on all products in my shop in Varanasi. Silk sarees and gifts.', platforms: ['instagram', 'whatsapp', 'facebook'], color: '#F7C948', tags: ['Diwali', 'Sale', 'Hindi'], uses: 1243 },
    { id: 'restaurant-promo', emoji: '🍛', name: 'Restaurant Daily Special', category: 'Food', language: 'hi', businessType: 'food', idea: 'My restaurant serving authentic biryani today with 15% off. Invite family and friends.', platforms: ['whatsapp', 'instagram'], color: '#FF6B35', tags: ['Food', 'Promo', 'Local'], uses: 892 },
    { id: 'jewelry-launch', emoji: '💍', name: 'Jewelry New Collection', category: 'Fashion', language: 'ta', businessType: 'fashion', idea: 'New gold jewelry collection launch in my shop in Chennai. Festival season special designs.', platforms: ['instagram', 'facebook', 'youtube'], color: '#F7C948', tags: ['Jewelry', 'Tamil', 'Launch'], uses: 674 },
    { id: 'organic-farm', emoji: '🌾', name: 'Organic Farm Produce', category: 'Agriculture', language: 'pa', businessType: 'agriculture', idea: 'Fresh organic vegetables and fruits directly from our Punjab farm. Home delivery available.', platforms: ['whatsapp', 'facebook'], color: '#00FF88', tags: ['Organic', 'Farm', 'Punjab'], uses: 412 },
    { id: 'handicraft', emoji: '🧶', name: 'Artisan Handicraft', category: 'Crafts', language: 'hi', businessType: 'handicraft', idea: 'Handmade Banarasi craft products. Traditional artisan work for export and local buyers.', platforms: ['instagram', 'youtube'], color: '#A855F7', tags: ['Craft', 'Handmade', 'Export'], uses: 567 },
    { id: 'salon', emoji: '💇', name: 'Beauty Salon Offer', category: 'Beauty', language: 'ta', businessType: 'salon', idea: 'Special bridal makeup and hair package this wedding season. Book now for discounts.', platforms: ['instagram', 'whatsapp'], color: '#FF4DA6', tags: ['Beauty', 'Bridal', 'Discount'], uses: 798 },
    { id: 'tutor', emoji: '📚', name: 'School Tutoring Service', category: 'Education', language: 'bn', businessType: 'education', idea: 'Personal tuition classes for class 10-12 in Kolkata. Maths and Science. 100% board results.', platforms: ['facebook', 'whatsapp'], color: '#00D4FF', tags: ['Education', 'Bengali', 'Tuition'], uses: 334 },
    { id: 'auto-repair', emoji: '🔧', name: 'Auto Repair Workshop', category: 'Services', language: 'te', businessType: 'services', idea: 'Car and bike service and repair workshop in Hyderabad. Quick service, genuine parts, best prices.', platforms: ['whatsapp', 'facebook'], color: '#94A3B8', tags: ['Auto', 'Telugu', 'Service'], uses: 289 },
    { id: 'holi-promo', emoji: '🎨', name: 'Holi Celebration Deal', category: 'Festival', language: 'hi', businessType: 'retail', idea: 'Holi festival collection launch! Colors, sweets, special gifts. Shop open till midnight.', platforms: ['instagram', 'whatsapp', 'facebook', 'youtube'], color: '#FF6B35', tags: ['Holi', 'Festival', 'Colors'], uses: 1089 },
    { id: 'yoga-studio', emoji: '🧘', name: 'Yoga Studio Promo', category: 'Health', language: 'hi', businessType: 'health', idea: 'Morning yoga classes starting new batch. Beginner friendly. 7 AM daily in Pune.', platforms: ['instagram', 'facebook'], color: '#00FF88', tags: ['Yoga', 'Health', 'Pune'], uses: 445 },
    { id: 'tailoring', emoji: '🧵', name: 'Custom Tailoring', category: 'Fashion', language: 'mr', businessType: 'fashion', idea: 'Custom blouse stitching and dress tailoring in Mumbai. Delivery in 3 days guaranteed.', platforms: ['whatsapp', 'instagram'], color: '#F7C948', tags: ['Tailoring', 'Marathi', 'Mumbai'], uses: 623 },
    { id: 'bakery', emoji: '🍞', name: 'Local Bakery Treats', category: 'Food', language: 'gu', businessType: 'food', idea: 'Fresh baked bread and sweets from our family bakery in Ahmedabad. Online order available.', platforms: ['whatsapp', 'instagram', 'facebook'], color: '#FF6B35', tags: ['Bakery', 'Gujarati', 'Food'], uses: 512 },
];

const CATEGORIES = ['All', 'Festival', 'Food', 'Fashion', 'Agriculture', 'Crafts', 'Beauty', 'Education', 'Services', 'Health'];

const LANG_NAMES: Record<string, string> = { hi: 'Hindi', ta: 'Tamil', pa: 'Punjabi', bn: 'Bengali', te: 'Telugu', mr: 'Marathi', gu: 'Gujarati' };

export default function Templates() {
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const navigate = useNavigate();

    const filtered = TEMPLATES.filter(t => {
        const matchCat = category === 'All' || t.category === category;
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        return matchCat && matchSearch;
    });

    const useTemplate = (template: Template) => {
        // Store template data in sessionStorage to prefill NewCampaign
        sessionStorage.setItem('template', JSON.stringify({ input: template.idea, language: template.language, businessType: template.businessType }));
        navigate('/campaign/new');
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 ml-[220px] p-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-black font-poppins gradient-text">Campaign Templates</h1>
                    <p className="text-slate-400 mt-1">Start with a proven template — customized for your business</p>
                </motion.div>

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="🔍 Search templates..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-transparent border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 text-sm"
                    />
                    <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                                style={{
                                    background: category === cat ? 'linear-gradient(135deg, #FF6B35, #F7C948)' : 'rgba(255,255,255,0.06)',
                                    color: category === cat ? '#000' : '#94A3B8',
                                }}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-slate-500 text-xs mb-4">{filtered.length} templates</p>

                {/* Template grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {filtered.map((t, i) => (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.04 }}
                                className="glass-card p-5 cursor-pointer relative overflow-hidden"
                                style={{ borderColor: hoveredId === t.id ? `${t.color}50` : undefined }}
                                onMouseEnter={() => setHoveredId(t.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                whileHover={{ y: -4, scale: 1.02 }}
                            >
                                {/* Color accent line */}
                                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: t.color }} />

                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                        style={{ background: `${t.color}20` }}>
                                        {t.emoji}
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">{t.uses.toLocaleString()} uses</span>
                                </div>

                                <h3 className="font-bold font-poppins text-white text-sm mb-1">{t.name}</h3>
                                <p className="text-slate-400 text-xs mb-3 line-clamp-2">{t.idea.slice(0, 70)}...</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: `${t.color}15`, color: t.color }}>
                                        {LANG_NAMES[t.language]}
                                    </span>
                                    {t.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-slate-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Platforms */}
                                <div className="flex gap-1 mb-4">
                                    {t.platforms.map(p => (
                                        <span key={p} className="text-sm" title={p}>
                                            {p === 'instagram' ? '📸' : p === 'whatsapp' ? '💬' : p === 'facebook' ? '👍' : p === 'youtube' ? '▶️' : '📡'}
                                        </span>
                                    ))}
                                </div>

                                <button onClick={() => useTemplate(t)} className="w-full py-2 rounded-xl text-xs font-bold transition-all"
                                    style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}>
                                    Use This Template →
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
