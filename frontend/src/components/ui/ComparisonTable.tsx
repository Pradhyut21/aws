import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPARISON_DATA } from '../../lib/mockData';

const COLUMNS = [
    { key: 'bharatMedia', label: 'BharatMedia', highlight: true },
    { key: 'chatGPT', label: 'ChatGPT' },
    { key: 'canva', label: 'Canva' },
    { key: 'socialTools', label: 'Social Tools' },
];

export default function ComparisonTable() {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <button onClick={() => setVisible(!visible)} className="btn-outline mb-6">
                {visible ? 'Hide Comparison' : 'See How We Compare →'}
            </button>

            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-auto rounded-2xl border border-white/10"
                    >
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="text-left p-4 text-slate-400 font-medium bg-[#0D1B40]">Feature</th>
                                    {COLUMNS.map(col => (
                                        <th key={col.key}
                                            className={`p-4 text-center font-semibold font-poppins ${col.highlight ? 'gradient-text text-base' : 'text-slate-300'}`}
                                            style={{ background: col.highlight ? 'rgba(255,107,53,0.08)' : '#0D1B40' }}
                                        >
                                            {col.label}
                                            {col.highlight && <span className="block text-[10px] font-normal text-orange-400/70">⭐ Best</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON_DATA.map((row, i) => (
                                    <motion.tr
                                        key={row.feature}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-t border-white/5 hover:bg-white/2 transition-colors"
                                    >
                                        <td className="p-4 text-slate-300">{row.feature}</td>
                                        {COLUMNS.map(col => (
                                            <td key={col.key}
                                                className="p-4 text-center"
                                                style={{ background: col.highlight ? 'rgba(255,107,53,0.04)' : 'transparent' }}
                                            >
                                                {(row as Record<string, unknown>)[col.key] ? (
                                                    <span className={`text-lg ${col.highlight ? 'text-green-400' : 'text-green-600/70'}`}>✓</span>
                                                ) : (
                                                    <span className="text-red-500/50 text-lg">✗</span>
                                                )}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
