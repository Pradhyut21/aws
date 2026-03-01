import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

// Calendar data: upcoming scheduled posts
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const today = new Date(); // always real current date

interface ScheduledPost {
    day: number;
    title: string;
    platform: string;
    emoji: string;
    color: string;
    time: string;
}

const SCHEDULED: ScheduledPost[] = [
    { day: 26, title: 'Diwali Silk Sarees', platform: 'Instagram', emoji: '📸', color: '#E1306C', time: '7:00 PM' },
    { day: 26, title: 'Biryani Promo', platform: 'WhatsApp', emoji: '💚', color: '#25D366', time: '9:00 AM' },
    { day: 28, title: 'Handloom Launch', platform: 'Facebook', emoji: '👍', color: '#1877F2', time: '12:00 PM' },
    { day: 1, title: 'Holi Special', platform: 'YouTube', emoji: '▶️', color: '#FF0000', time: '6:00 PM' },
    { day: 3, title: 'Organic Farm', platform: 'Instagram', emoji: '📸', color: '#E1306C', time: '8:00 AM' },
    { day: 7, title: 'Ram Navami Campaign', platform: 'WhatsApp', emoji: '💚', color: '#25D366', time: '9:00 AM' },
    { day: 10, title: 'Summer Sale', platform: 'Facebook', emoji: '👍', color: '#1877F2', time: '12:00 PM' },
    { day: 14, title: 'Jewelry Collection', platform: 'Instagram', emoji: '📸', color: '#E1306C', time: '7:30 PM' },
    { day: 18, title: 'Monthly Offer', platform: 'WhatsApp', emoji: '💚', color: '#25D366', time: '10:00 AM' },
];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export default function Calendar() {
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
    const navigate = useNavigate();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };

    const postsForDay = (day: number) => SCHEDULED.filter(p => p.day === day);
    const selectedPosts = selectedDay ? postsForDay(selectedDay) : [];

    const UPCOMING = SCHEDULED.slice(0, 5);

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 ml-[220px] p-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black font-poppins gradient-text">Campaign Calendar</h1>
                        <p className="text-slate-400 mt-1">Schedule and track your campaigns</p>
                    </div>
                    <button onClick={() => navigate('/campaign/new')} className="btn-primary flex items-center gap-2">
                        ＋ Schedule Campaign
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar grid */}
                    <div className="lg:col-span-2 glass-card p-6">
                        {/* Month nav */}
                        <div className="flex items-center justify-between mb-5">
                            <button onClick={prevMonth} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all">←</button>
                            <h2 className="font-black font-poppins text-white text-lg">
                                {months[currentMonth]} {currentYear}
                            </h2>
                            <button onClick={nextMonth} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all">→</button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="text-center text-xs font-mono text-slate-500 py-1">{d}</div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Empty cells for first-day offset */}
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}

                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                const posts = postsForDay(day);
                                const isToday = day === today.getDate() && currentMonth === today.getMonth();
                                const isSelected = day === selectedDay;
                                return (
                                    <motion.button
                                        key={day}
                                        onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                        whileHover={{ scale: 1.05 }}
                                        className="rounded-xl p-1.5 min-h-[52px] text-left transition-all relative"
                                        style={{
                                            background: isSelected ? 'rgba(255,107,53,0.2)' : isToday ? 'rgba(247,201,72,0.12)' : posts.length > 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                                            border: isSelected ? '1px solid rgba(255,107,53,0.5)' : isToday ? '1px solid rgba(247,201,72,0.4)' : '1px solid transparent',
                                        }}
                                    >
                                        <span className="text-xs font-semibold" style={{ color: isToday ? '#F7C948' : isSelected ? '#FF6B35' : '#E2E8F0' }}>
                                            {day}
                                        </span>
                                        {posts.slice(0, 2).map((p, i) => (
                                            <div key={i} className="w-full h-1.5 rounded-full mt-0.5" style={{ background: p.color + 'BB' }} />
                                        ))}
                                        {posts.length > 2 && <div className="text-[9px] text-slate-500 mt-0.5">+{posts.length - 2}</div>}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className="space-y-4">
                        {/* Selected day posts */}
                        {selectedDay && (
                            <div className="glass-card p-5">
                                <h3 className="font-bold font-poppins text-white mb-3 text-sm">
                                    {months[currentMonth]} {selectedDay} — {selectedPosts.length > 0 ? `${selectedPosts.length} campaign${selectedPosts.length !== 1 ? 's' : ''}` : 'No campaigns'}
                                </h3>
                                {selectedPosts.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-slate-500 text-sm mb-3">Nothing scheduled</p>
                                        <button onClick={() => navigate('/campaign/new')} className="btn-outline text-xs py-2 px-4">
                                            + Schedule for this day
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedPosts.map((p, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                                className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${p.color}12`, border: `1px solid ${p.color}30` }}>
                                                <span className="text-xl">{p.emoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-semibold truncate">{p.title}</p>
                                                    <p className="text-slate-400 text-xs">{p.platform} · {p.time}</p>
                                                </div>
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Upcoming */}
                        <div className="glass-card p-5">
                            <h3 className="font-bold font-poppins text-white mb-3 text-sm">⏰ Next 5 Posts</h3>
                            <div className="space-y-2">
                                {UPCOMING.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}20` }}>
                                            <span className="text-base">{p.emoji}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-300 text-xs truncate">{p.title}</p>
                                            <p className="text-slate-500 text-xs">{months[currentMonth]} {p.day} · {p.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="glass-card p-5">
                            <h3 className="font-bold font-poppins text-white mb-3 text-sm">📊 This Month</h3>
                            {[
                                { label: 'Scheduled', value: SCHEDULED.length, color: '#FF6B35' },
                                { label: 'Published', value: 6, color: '#00FF88' },
                                { label: 'Draft', value: 2, color: '#F7C948' },
                            ].map(s => (
                                <div key={s.label} className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400 text-xs">{s.label}</span>
                                    <span className="font-bold font-poppins text-sm" style={{ color: s.color }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
