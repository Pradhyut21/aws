import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ROICalculator() {
    const [orderValue, setOrderValue] = useState(800);
    const [ctr, setCtr] = useState(3.5);
    const [reach, setReach] = useState(24000);

    const clicks = Math.round(reach * (ctr / 100));
    const conversions = Math.round(clicks * 0.08); // 8% conversion
    const revenue = conversions * orderValue;
    const campaignCost = 43; // ₹0.43 * 100 paisa
    const roi = ((revenue - campaignCost) / campaignCost * 100).toFixed(0);

    const Slider = ({ label, value, min, max, step, onChange, prefix = '', suffix = '' }:
        { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; prefix?: string; suffix?: string }) => (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className="text-white font-bold font-poppins text-sm">{prefix}{value.toLocaleString()}{suffix}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(90deg, #FF6B35 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 0%)` }}
            />
        </div>
    );

    return (
        <div className="glass-card p-6">
            <h3 className="font-bold font-poppins text-white mb-1 flex items-center gap-2">
                💰 ROI Calculator
            </h3>
            <p className="text-slate-400 text-xs mb-5">Estimate revenue from your campaign</p>

            <Slider label="Avg. Order Value" value={orderValue} min={200} max={10000} step={100} onChange={setOrderValue} prefix="₹" />
            <Slider label="Click-Through Rate" value={ctr} min={0.5} max={15} step={0.5} onChange={setCtr} suffix="%" />
            <Slider label="Estimated Reach" value={reach} min={1000} max={500000} step={1000} onChange={setReach} />

            {/* Results */}
            <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                    { label: 'People Reached', value: reach.toLocaleString(), color: '#00D4FF' },
                    { label: 'Link Clicks', value: clicks.toLocaleString(), color: '#F7C948' },
                    { label: 'Estimated Orders', value: conversions.toLocaleString(), color: '#FF6B35' },
                    { label: 'Estimated Revenue', value: `₹${revenue.toLocaleString()}`, color: '#00FF88' },
                ].map(stat => (
                    <div key={stat.label} className="p-3 rounded-xl text-center"
                        style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                        <p className="font-black font-poppins text-lg" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            <motion.div
                className="mt-4 p-3 rounded-xl text-center"
                animate={{ boxShadow: ['0 0 10px rgba(0,255,136,0.15)', '0 0 25px rgba(0,255,136,0.35)', '0 0 10px rgba(0,255,136,0.15)'] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)' }}
            >
                <p className="text-slate-400 text-xs mb-1">Campaign cost: <strong className="text-white">₹{campaignCost}</strong></p>
                <p className="text-2xl font-black font-poppins text-green-400">ROI: {Number(roi).toLocaleString()}%</p>
            </motion.div>
        </div>
    );
}
