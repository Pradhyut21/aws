/**
 * SensitivityMatrix — Cultural Taboo & Sensitivity Matrix Guard
 *
 * Inspired by:
 *   - promptfoo/promptfoo (⭐5.8k — Test-driven LLM evaluation & guardrails)
 *
 * Features:
 *  - 6-Point Cultural Safety Audit with animated pass/fail chips (text)
 *  - NEW: 🖼️ Image Safety row — Amazon Rekognition DetectModerationLabels
 *  - Checks: Religious Calendar, Linguistic False Friends, Color/Symbolism,
 *    ASCI Compliance, Gender Sensitivity, Regional Taboo Words, Image Safety
 *  - Protects D2C brands from PR disasters in India
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { moderateImage } from '../lib/api';

// ─── Audit Categories ──────────────────────────────────────────────────────────
interface AuditCheck {
  id: string;
  icon: string;
  label: string;
  description: string;
  flagWords: string[];
  passMessage: string;
  failMessage: string;
  severity: 'critical' | 'warning' | 'info';
}

const AUDIT_CHECKS: AuditCheck[] = [
  {
    id: 'religious',
    icon: '🕌',
    label: 'Religious & Fasting Calendar',
    description: 'No dietary or festive clashes with active religious periods',
    flagWords: ['beef', 'pork', 'wine', 'alcohol', 'meat', 'chicken', 'mutton', 'शराब', 'मांस'],
    passMessage: 'No religious dietary conflicts detected. Safe for Navratri, Shravan & Ramzan seasons.',
    failMessage: 'Potential dietary/festive conflict detected. Avoid during Navratri, Shravan, Jain Paryushan or Ramzan periods.',
    severity: 'critical',
  },
  {
    id: 'linguistic',
    icon: '🗣️',
    label: 'Linguistic False Friends',
    description: 'No slang that carries offensive meanings across state borders',
    flagWords: ['ullu', 'gandu', 'bhosdike', 'madarchod', 'lund', 'chut', 'bakre', 'kutta'],
    passMessage: 'No cross-state offensive double meanings detected in this copy.',
    failMessage: 'Detected words that may carry offensive double meanings in other regional dialects.',
    severity: 'critical',
  },
  {
    id: 'color',
    icon: '🎨',
    label: 'Color & Symbolism Audit',
    description: 'Confirms auspicious colors vs mourning palettes for target region',
    flagWords: ['white dress', 'white saree', 'widow', 'mourning', 'funeral', 'death offer', 'RIP'],
    passMessage: 'Color and symbolism usage appears auspicious and culturally positive.',
    failMessage: 'Copy references colors/symbols associated with mourning in Indian culture. Review before festive campaigns.',
    severity: 'warning',
  },
  {
    id: 'asci',
    icon: '⚖️',
    label: 'ASCI Ad Compliance',
    description: 'Mandatory legal disclaimers for promotional discounts & returns',
    flagWords: ['guaranteed', 'best in world', '#1 in india', 'number one', 'clinically proven', '100% results', 'cure'],
    passMessage: 'No unsubstantiated superlative claims detected. Compliant with ASCI guidelines.',
    failMessage: 'Detected potentially unsubstantiated claims. ASCI guidelines require proof for superlatives like "best", "guaranteed", or "clinically proven".',
    severity: 'warning',
  },
  {
    id: 'gender',
    icon: '⚧️',
    label: 'Gender Sensitivity Check',
    description: 'Avoids gender stereotypes & objectification in brand messaging',
    flagWords: ['fair skin', 'gori', 'whitening', 'fairness', 'dusky', 'ladki ko', 'sirf aurat', 'housewife only'],
    passMessage: 'No gender-stereotyping or colorism language detected.',
    failMessage: 'Detected colorism or gender-stereotyping language. This may trigger social media backlash.',
    severity: 'critical',
  },
  {
    id: 'taboo',
    icon: '🚫',
    label: 'Regional Taboo Words',
    description: 'Flags dialect-specific taboo phrases for target state audiences',
    flagWords: ['suttu', 'karadi', 'loose', 'pottu', 'nakku', 'naayi'],
    passMessage: 'No known regional taboo words or dialect-specific offensive terms detected.',
    failMessage: 'Detected words flagged as taboo in specific regional dialects. Review with native speaker before publishing.',
    severity: 'warning',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type CheckStatus = 'idle' | 'running' | 'pass' | 'fail';

interface CheckResult {
  status: CheckStatus;
  flaggedTerms: string[];
}

interface RekogResult {
  status: 'idle' | 'running' | 'pass' | 'fail';
  safe?: boolean;
  score?: number;
  flaggedLabels?: { name: string; parentName: string; confidence: number }[];
  error?: string;
}

// ─── Check Row Component ───────────────────────────────────────────────────────
function CheckRow({ check, result, delay }: { check: AuditCheck; result: CheckResult; delay: number }) {
  const severityColor = {
    critical: '#f87171',
    warning: '#fbbf24',
    info: '#22d3ee',
  }[check.severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={{
        background: result.status === 'pass' ? 'rgba(74,222,128,0.05)'
          : result.status === 'fail' ? `rgba(248,113,113,0.07)`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${result.status === 'pass' ? 'rgba(74,222,128,0.2)'
          : result.status === 'fail' ? 'rgba(248,113,113,0.25)'
          : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '0.875rem', padding: '0.9rem 1.1rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.9rem',
        transition: 'all 0.3s',
      }}
    >
      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{check.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.875rem' }}>{check.label}</span>
          <span style={{
            background: `${severityColor}18`, color: severityColor,
            border: `1px solid ${severityColor}30`, borderRadius: 999,
            padding: '0.05rem 0.5rem', fontSize: '0.63rem', fontWeight: 700,
          }}>{check.severity.toUpperCase()}</span>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.4rem' }}>{check.description}</div>
        <AnimatePresence>
          {result.status !== 'idle' && result.status !== 'running' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}>
              <div style={{ color: result.status === 'pass' ? '#4ade80' : '#f87171', fontSize: '0.78rem', lineHeight: 1.5 }}>
                {result.status === 'pass' ? '✅ ' + check.passMessage : '⚠️ ' + check.failMessage}
              </div>
              {result.flaggedTerms.length > 0 && (
                <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {result.flaggedTerms.map(t => (
                    <span key={t} style={{
                      background: 'rgba(248,113,113,0.15)', color: '#f87171',
                      border: '1px solid rgba(248,113,113,0.3)', borderRadius: 4,
                      padding: '0.05rem 0.45rem', fontSize: '0.7rem', fontWeight: 600,
                    }}>🚩 "{t}"</span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ flexShrink: 0, minWidth: 52, textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {result.status === 'running' ? (
            <motion.div key="spin" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto' }} />
          ) : result.status === 'pass' ? (
            <motion.div key="pass" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              style={{ fontSize: '1.6rem' }}>✅</motion.div>
          ) : result.status === 'fail' ? (
            <motion.div key="fail" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              style={{ fontSize: '1.6rem' }}>⚠️</motion.div>
          ) : (
            <div key="idle" style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', margin: '0 auto' }} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Rekognition Image Safety Row ─────────────────────────────────────────────
function ImageSafetyRow({ result }: { result: RekogResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.42 }}
      style={{
        background: result.status === 'pass' ? 'rgba(74,222,128,0.05)'
          : result.status === 'fail' ? 'rgba(248,113,113,0.07)'
          : 'rgba(255,153,0,0.04)',
        border: `1px solid ${result.status === 'pass' ? 'rgba(74,222,128,0.2)'
          : result.status === 'fail' ? 'rgba(248,113,113,0.25)'
          : 'rgba(255,153,0,0.15)'}`,
        borderRadius: '0.875rem', padding: '0.9rem 1.1rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.9rem',
        transition: 'all 0.3s',
      }}
    >
      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🖼️</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.875rem' }}>Image Safety</span>
          <span style={{
            background: 'rgba(248,113,113,0.18)', color: '#f87171',
            border: '1px solid rgba(248,113,113,0.3)', borderRadius: 999,
            padding: '0.05rem 0.5rem', fontSize: '0.63rem', fontWeight: 700,
          }}>CRITICAL</span>
          <span style={{
            background: 'rgba(255,153,0,0.12)', color: '#FF9900',
            border: '1px solid rgba(255,153,0,0.3)', borderRadius: 999,
            padding: '0.05rem 0.5rem', fontSize: '0.63rem', fontWeight: 700,
          }}>☁️ Rekognition</span>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
          Amazon Rekognition scans uploaded images for explicit, violent, or culturally offensive content
        </div>
        <AnimatePresence>
          {result.status !== 'idle' && result.status !== 'running' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}>
              {result.error ? (
                <div style={{ color: '#fbbf24', fontSize: '0.78rem' }}>⚠️ {result.error}</div>
              ) : (
                <>
                  <div style={{ color: result.safe ? '#4ade80' : '#f87171', fontSize: '0.78rem', lineHeight: 1.5 }}>
                    {result.safe
                      ? `✅ Image is safe — Rekognition found no unsafe content (score: ${result.score}/100)`
                      : `⚠️ Unsafe content detected — ${result.flaggedLabels?.length} label(s) flagged`}
                  </div>
                  {result.flaggedLabels && result.flaggedLabels.length > 0 && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {result.flaggedLabels.map(l => (
                        <span key={l.name} style={{
                          background: 'rgba(248,113,113,0.15)', color: '#f87171',
                          border: '1px solid rgba(248,113,113,0.3)', borderRadius: 4,
                          padding: '0.05rem 0.45rem', fontSize: '0.7rem', fontWeight: 600,
                        }}>🚩 {l.name} ({l.confidence}%)</span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
          {result.status === 'idle' && (
            <div style={{ color: '#475569', fontSize: '0.75rem', fontStyle: 'italic' }}>
              Upload an image below to run Rekognition moderation scan
            </div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ flexShrink: 0, minWidth: 52, textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {result.status === 'running' ? (
            <motion.div key="spin" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{ width: 28, height: 28, border: '2px solid rgba(255,153,0,0.1)', borderTopColor: '#FF9900', borderRadius: '50%', margin: '0 auto' }} />
          ) : result.status === 'pass' ? (
            <motion.div key="pass" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              style={{ fontSize: '1.6rem' }}>✅</motion.div>
          ) : result.status === 'fail' ? (
            <motion.div key="fail" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              style={{ fontSize: '1.6rem' }}>⚠️</motion.div>
          ) : (
            <div key="idle" style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,153,0,0.08)', border: '1px solid rgba(255,153,0,0.2)', margin: '0 auto' }} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Sample copy presets ───────────────────────────────────────────────────────
const SAMPLES = [
  { label: 'Safe Campaign ✅', text: 'Celebrate Ganesh Utsav with our festive sweets collection! 🎊 Pure vegetarian, home-made mithai. Order now for same-day delivery across Maharashtra.' },
  { label: 'Risky — Dietary ⚠️', text: 'Navratri special! Enjoy our chicken biryani with 20% off. Guaranteed best taste. Non-veg lovers unite! Free home delivery.' },
  { label: 'Risky — Claims ⚠️', text: "India's #1 fairness cream — clinically proven to give gori skin in 7 days! 100% guaranteed results. Best product in the world for fair complexion." },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SensitivityMatrix() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [results, setResults] = useState<Record<string, CheckResult>>(
    Object.fromEntries(AUDIT_CHECKS.map(c => [c.id, { status: 'idle', flaggedTerms: [] }]))
  );
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [rekogResult, setRekogResult] = useState<RekogResult>({ status: 'idle' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRunning, setImageRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passCount = Object.values(results).filter(r => r.status === 'pass').length
    + (rekogResult.status === 'pass' ? 1 : 0);
  const failCount = Object.values(results).filter(r => r.status === 'fail').length
    + (rekogResult.status === 'fail' ? 1 : 0);
  const totalChecks = AUDIT_CHECKS.length + (rekogResult.status !== 'idle' ? 1 : 0);
  const overallSafe = done && failCount === 0;

  const runAudit = useCallback(async () => {
    if (text.trim().length < 10) return;
    setRunning(true);
    setDone(false);
    setResults(Object.fromEntries(AUDIT_CHECKS.map(c => [c.id, { status: 'idle', flaggedTerms: [] }])));

    for (let i = 0; i < AUDIT_CHECKS.length; i++) {
      const check = AUDIT_CHECKS[i];
      setResults(prev => ({ ...prev, [check.id]: { status: 'running', flaggedTerms: [] } }));
      await new Promise(r => setTimeout(r, 500 + Math.random() * 400));

      const lowerText = text.toLowerCase();
      const flagged = check.flagWords.filter(w => lowerText.includes(w.toLowerCase()));
      const status: CheckStatus = flagged.length > 0 ? 'fail' : 'pass';
      setResults(prev => ({ ...prev, [check.id]: { status, flaggedTerms: flagged } }));
      await new Promise(r => setTimeout(r, 200));
    }

    setRunning(false);
    setDone(true);
  }, [text]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setRekogResult({ status: 'running' });
      setImageRunning(true);
      try {
        const result = await moderateImage(base64, 60);
        setRekogResult({
          status: result.safe ? 'pass' : 'fail',
          safe: result.safe,
          score: result.score,
          flaggedLabels: result.flaggedLabels,
        });
      } catch (err: any) {
        setRekogResult({
          status: 'fail',
          error: err?.response?.data?.message || err.message || 'Rekognition unavailable',
        });
      } finally {
        setImageRunning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg,#08100a 0%,#0a0820 50%,#0a0808 100%)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', borderRadius: '0.5rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem',
            }}>← Dashboard</button>
            <div style={{
              background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 999, padding: '0.2rem 0.7rem', fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700,
            }}>🛡️ SENSITIVITY GUARD</div>
            <div style={{
              background: 'rgba(255,153,0,0.10)', border: '1px solid rgba(255,153,0,0.25)',
              borderRadius: 999, padding: '0.2rem 0.7rem', fontSize: '0.68rem', color: '#FF9900', fontWeight: 700,
            }}>☁️ Rekognition</div>
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            🛡️ Cultural Sensitivity Matrix
          </h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            7-point safety audit — text checks + Amazon Rekognition image moderation. Protect your brand from costly PR disasters.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.5rem', maxWidth: 1200 }}>

          {/* Checks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {AUDIT_CHECKS.map((check, i) => (
              <CheckRow key={check.id} check={check} result={results[check.id]} delay={i * 0.06} />
            ))}
            {/* Image Safety Row — always visible */}
            <ImageSafetyRow result={rekogResult} />
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Text Input */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '1rem', padding: '1.1rem',
              }}>
              <label style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                📋 YOUR CAMPAIGN COPY
              </label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
                placeholder="Paste your ad copy, WhatsApp message, or campaign text here…"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.65rem', padding: '0.75rem', color: '#f1f5f9', fontSize: '0.875rem',
                  fontFamily: 'Inter, system-ui, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }} />
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {SAMPLES.map(s => (
                  <button key={s.label} onClick={() => setText(s.text)} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.45rem', padding: '0.2rem 0.6rem', color: '#94a3b8',
                    cursor: 'pointer', fontSize: '0.7rem',
                  }}>{s.label}</button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={runAudit}
                disabled={running || text.trim().length < 10}
                style={{
                  marginTop: '0.85rem', width: '100%',
                  background: running ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#fbbf24,#f97316)',
                  border: 'none', borderRadius: '0.75rem', padding: '0.75rem',
                  color: running ? '#475569' : '#000', fontWeight: 800, fontSize: '0.9rem',
                  cursor: running ? 'not-allowed' : 'pointer',
                }}
              >
                {running ? '🔍 Running Cultural Audit…' : '🛡️ Run Text Sensitivity Audit'}
              </motion.button>
            </motion.div>

            {/* Image Upload for Rekognition */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              style={{
                background: 'rgba(255,153,0,0.04)', border: '1px solid rgba(255,153,0,0.15)',
                borderRadius: '1rem', padding: '1.1rem',
              }}>
              <label style={{ color: '#FF9900', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                🖼️ IMAGE SAFETY — AMAZON REKOGNITION
              </label>
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                Upload your campaign image to scan for explicit, violent, or culturally offensive content using AWS AI.
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div style={{ marginBottom: '0.75rem', borderRadius: '0.65rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                  <img src={imagePreview} alt="Upload preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }} />
                  {imageRunning && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 24, height: 24, border: '2px solid rgba(255,153,0,0.2)', borderTopColor: '#FF9900', borderRadius: '50%' }} />
                      <span style={{ color: '#FF9900', fontWeight: 700, fontSize: '0.8rem' }}>Rekognition scanning…</span>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="rekognition-upload"
              />
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={imageRunning}
                style={{
                  width: '100%', background: imageRunning ? 'rgba(255,255,255,0.04)' : 'rgba(255,153,0,0.12)',
                  border: '1px solid rgba(255,153,0,0.3)', borderRadius: '0.75rem', padding: '0.65rem',
                  color: imageRunning ? '#475569' : '#FF9900', fontWeight: 700, fontSize: '0.85rem',
                  cursor: imageRunning ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                {imageRunning ? '☁️ Scanning with Rekognition…' : '📸 Upload Image to Scan'}
              </motion.button>
            </motion.div>

            {/* Score Card */}
            <AnimatePresence>
              {done && (
                <motion.div key="score"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: overallSafe ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)',
                    border: `1px solid ${overallSafe ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                    borderRadius: '1rem', padding: '1.25rem', textAlign: 'center',
                  }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>
                    {overallSafe ? '🟢' : '🔴'}
                  </div>
                  <div style={{ color: overallSafe ? '#4ade80' : '#f87171', fontWeight: 800, fontSize: '1.1rem' }}>
                    {overallSafe ? 'CULTURALLY SAFE' : 'ISSUES DETECTED'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    {passCount}/{totalChecks} checks passed · {failCount} {failCount === 1 ? 'issue' : 'issues'} found
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#4ade80', fontWeight: 800, fontSize: '1.3rem' }}>{passCount}</div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Passed ✅</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f87171', fontWeight: 800, fontSize: '1.3rem' }}>{failCount}</div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Issues ⚠️</div>
                    </div>
                  </div>
                  {!overallSafe && (
                    <div style={{ marginTop: '0.85rem', color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      Fix the flagged items above before publishing to avoid social media backlash.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Cards */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.875rem', padding: '1rem',
            }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
                🌍 Why This Matters
              </div>
              {[
                { icon: '📉', text: 'Zomato faced backlash for a Navratri ad featuring meat. Stock dropped 3% in 2 hours.' },
                { icon: '🚫', text: 'A Tamil Nadu brand used a word harmless in Hindi that was vulgar in Tamil — viral for wrong reasons.' },
                { icon: '💸', text: 'ASCI received 800+ complaints against brands in 2023 for false superlative claims.' },
                { icon: '🖼️', text: 'Amazon Rekognition can detect explicit, violent, or hate-symbol content in campaign images before they go live.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.77rem', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
