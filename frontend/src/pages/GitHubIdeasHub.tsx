/**
 * GitHubIdeasHub — Showcase of all 8 Innovative Bharat GitHub Ideas
 *
 * Features showcased:
 *   1. Bharat Slang & Cultural Diff Inspector
 *   2. Interactive Bharat Dialect Atlas & Geo-Radar
 *   3. "Bharat Focus Group" Live WhatsApp Debate
 *   4. Global Ctrl+K Pro Command Palette
 *   5. Vernacular Audio Waveform & RJ Voice Studio
 *   6. Cultural Taboo & Sensitivity Matrix Guard
 *   7. 1-Click WhatsApp Festival Poster Studio
 *   8. Hinglish/Tanglish Live Transliteration Engine
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

interface Feature {
  id: string;
  number: string;
  icon: string;
  title: string;
  tagline: string;
  description: string;
  githubRepo: string;
  repoStars: string;
  category: string;
  categoryColor: string;
  impact: string;
  effort: 'Low' | 'Medium';
  path: string;
  gradient: string;
  accentColor: string;
  highlights: string[];
  preview?: string;
  ctaAction?: 'navigate' | 'ctrl+k';
}

const FEATURES: Feature[] = [
  {
    id: 'slang-diff',
    number: '01',
    icon: '\u2728',
    title: 'Bharat Slang & Cultural Diff',
    tagline: 'See WHY cultural rewrites score higher',
    description:
      'Side-by-side semantic diff of generic vs culturally localized copy. Hover any slang term to see its region, emotional resonance score, and why it outperforms corporate language.',
    githubRepo: 'lingodotdev/lingo.dev + anoopkunchukuttan/indic_nlp_library',
    repoStars: '\u2b50 2.1k + 1.4k',
    category: 'Cultural NLP',
    categoryColor: '#4ade80',
    impact: '\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f',
    effort: 'Medium',
    path: '/cultural-diff',
    gradient: 'linear-gradient(135deg,rgba(74,222,128,0.12),rgba(34,211,238,0.06))',
    accentColor: '#4ade80',
    highlights: ['Hinglish slang chips', 'Regional impact scores', 'Side-by-side diff view'],
    preview: 'Compare "\u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e \u091a\u093e\u092f" vs "\u0915\u0921\u0915 \u091a\u093e\u092f" \u2014 see why Ka\u1e0dak wins by +28%',
  },
  {
    id: 'dialect-atlas',
    number: '02',
    icon: '\ud83d\uddfa\ufe0f',
    title: 'Interactive Bharat Dialect Atlas',
    tagline: 'Clickable cultural radar for every state',
    description:
      'Glowing SVG map of India \u2014 hover or click any state to see active festivals, channel dominance, cultural tone, and local slang seeds. 1-click to target any state in a campaign.',
    githubRepo: 'sshyam-gupta/react-datamaps-india + geohacker/india',
    repoStars: '\u2b50 indie + topojson',
    category: 'Geo \u00b7 Visual',
    categoryColor: '#f97316',
    impact: '\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f',
    effort: 'Medium',
    path: '/dialect-atlas',
    gradient: 'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(251,191,36,0.06))',
    accentColor: '#f97316',
    highlights: ['29 state profiles', 'Festival calendar', 'Channel mix data', '1-click targeting'],
    preview: 'Maharashtra \u2192 Ganesh Utsav \u00b7 WhatsApp 72% \u00b7 "Kadak, Bindaas, Aamchi"',
  },
  {
    id: 'focus-group',
    number: '03',
    icon: '\ud83d\udcac',
    title: '"Bharat Focus Group" Debate Sim',
    tagline: '3 Indian personas debate your copy live',
    description:
      'Click "Run Focus Group" to launch a live animated WhatsApp-style debate between Ramesh (Kirana, Kanpur), Ananya (College Creator, Pune), and Murugan (Textile Merchant, Coimbatore).',
    githubRepo: 'The-Swarm-Corporation/Marketing-Swarm + camel-ai/camel',
    repoStars: '\u2b50 6k (camel-ai)',
    category: 'Multi-Agent',
    categoryColor: '#a855f7',
    impact: '\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f',
    effort: 'Medium',
    path: '/focus-group',
    gradient: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(34,211,238,0.06))',
    accentColor: '#a855f7',
    highlights: ['3 typed persona voices', 'Live voting ticker', 'Consensus BharatScore', 'WhatsApp UI'],
    preview: 'Ramesh: "\u0921\u093f\u0938\u094d\u0915\u093e\u0909\u0902\u091f \u0938\u093e\u092b\u093c \u0928\u0939\u0940\u0902 \u0926\u093f\u0916 \u0930\u0939\u093e!" \u00b7 Ananya: "Needs a punchy hook \ud83d\udd25"',
  },
  {
    id: 'command-palette',
    number: '04',
    icon: '\u2318',
    title: 'Global Ctrl+K Pro Command Palette',
    tagline: 'Power-user keyboard velocity for BharatMedia',
    description:
      'Press Ctrl+K / \u2318K from anywhere to instantly navigate pages, run a quick BharatScore audit on any ad text, switch target languages, and access recent campaigns.',
    githubRepo: 'pacocoursey/cmdk + janovekj/cmdkit',
    repoStars: '\u2b50 7.5k (cmdk)',
    category: 'Pro UX',
    categoryColor: '#94a3b8',
    impact: '\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f',
    effort: 'Low',
    path: '/dashboard',
    ctaAction: 'ctrl+k',
    gradient: 'linear-gradient(135deg,rgba(148,163,184,0.1),rgba(71,85,105,0.06))',
    accentColor: '#94a3b8',
    highlights: ['Glassmorphism modal', 'BharatScore instant audit', '10 language switcher', 'Arrow key nav'],
    preview: 'Type "Kadak Diwali offer" \u2192 BharatScore 84/100 in 0.1s',
  },
  {
    id: 'audio-studio',
    number: '05',
    icon: '\ud83c\udfa4',
    title: 'Vernacular Audio Waveform Studio',
    tagline: 'Voice-first content for Tier-2/3 India',
    description:
      'Choose from 4 regional voice personas (Kanpur Hawker, Mumbai Metro RJ, Tamil Paati, Bangalore Tech) and visualize audio with pulsing saffron & cyan waveform bars.',
    githubRepo: 'samhirtarif/react-audio-visualize + cutoff/audio-ui',
    repoStars: '\u2b50 Canvas-based',
    category: 'Multimodal',
    categoryColor: '#ef4444',
    impact: '\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f',
    effort: 'Medium',
    path: '/audio-studio',
    gradient: 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(249,115,22,0.06))',
    accentColor: '#ef4444',
    highlights: ['4 voice personas', 'Canvas waveform viz', 'WhatsApp audio export', 'Bilingual scripts'],
    preview: 'Mumbai RJ: "Kadak deal \u2014 sirf aaj ke liye! \ud83c\udfb5" \u2192 export as WhatsApp note',
  },
  {
    id: 'sensitivity',
    number: '06',
    icon: '\ud83d\udee1\ufe0f',
    title: 'Cultural Taboo & Sensitivity Matrix',
    tagline: 'Protect your brand from PR disasters',
    description:
      'Paste any campaign copy and run an automated 6-point cultural safety audit: Religious calendar, linguistic false friends, color symbolism, ASCI compliance, gender sensitivity, and regional taboos.',
    githubRepo: 'promptfoo/promptfoo',
    repoStars: '\u2b50 5.8k',
    category: 'AI Safety',
    categoryColor: '#fbbf24',
    impact: '\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f',
    effort: 'Low',
    path: '/sensitivity',
    gradient: 'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(248,113,113,0.06))',
    accentColor: '#fbbf24',
    highlights: ['6 audit categories', 'Flagged term chips', 'Real PR incident refs', 'Animated pass/fail'],
    preview: '"Chicken biryani Navratri 20% off" \u2192 \u26a0\ufe0f Religious conflict detected',
  },
  {
    id: 'poster-studio',
    number: '07',
    icon: '\ud83c\udfa8',
    title: '1-Click Festival Poster Studio',
    tagline: 'Branded WhatsApp status in 10 seconds',
    description:
      'Select Diwali, Eid, Pongal, Ganesh Utsav or Independence Day. Auto-arranges vernacular festive headline, Indian gold borders & Rangoli motifs, brand name + QR code.',
    githubRepo: 'bubkoo/html-to-image + fabricjs/fabric.js',
    repoStars: '\u2b50 4.8k + 27k',
    category: 'Viral Content',
    categoryColor: '#d946ef',
    impact: '\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f',
    effort: 'Medium',
    path: '/poster-studio',
    gradient: 'linear-gradient(135deg,rgba(217,70,239,0.12),rgba(168,85,247,0.06))',
    accentColor: '#d946ef',
    highlights: ['5 festival themes', 'Brand injection', '9:16 & 1:1 export', 'Rangoli motifs'],
    preview: 'Diwali Dhamaka \ud83e\udea4 \u2192 branded 9:16 PNG ready for WhatsApp Status',
  },
  {
    id: 'transliteration',
    number: '08',
    icon: '\u2328\ufe0f',
    title: 'Hinglish / Tanglish Transliterator',
    tagline: '3-way real-time script converter',
    description:
      'Type in Roman phonetics and instantly convert to: Native Devanagari/Dravidian script, Romanized Hinglish/Tanglish for Gen-Z captions, or Hybrid code-mixed banner text.',
    githubRepo: 'indic-transliteration/indic_transliteration_py + google/nisaba',
    repoStars: '\u2b50 1.2k + Google',
    category: 'Language Engine',
    categoryColor: '#22d3ee',
    impact: '\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f\ud83c\udf1f',
    effort: 'Low',
    path: '/transliteration',
    gradient: 'linear-gradient(135deg,rgba(34,211,238,0.12),rgba(99,102,241,0.06))',
    accentColor: '#22d3ee',
    highlights: ['Roman \u2192 Devanagari', 'Hinglish Gen-Z mode', 'Hybrid code-mix', '6 Indian scripts'],
    preview: '"Kadak deal" \u2192 "\u0915\u0921\u0915 \u0921\u0940\u0932" \u2192 "KADAK Deal \ud83d\udd25" in 0.2s',
  },
];

const PACKS = [
  { name: 'Cultural Intelligence Suite', emoji: '\ud83e\udde0', ids: ['slang-diff', 'dialect-atlas'], color: '#4ade80' },
  { name: 'Multi-Agent Live Experience', emoji: '\ud83e\udd16', ids: ['focus-group', 'command-palette'], color: '#a855f7' },
  { name: 'Voice & Visual Creator', emoji: '\ud83c\udfa8', ids: ['audio-studio', 'poster-studio'], color: '#ef4444' },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleLaunch = () => {
    if (feature.ctaAction === 'ctrl+k') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    } else {
      navigate(feature.path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: feature.gradient,
        border: `1px solid ${hovered ? feature.accentColor + '50' : feature.accentColor + '25'}`,
        borderRadius: '1.25rem',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s',
        boxShadow: hovered ? `0 8px 40px ${feature.accentColor}1a` : 'none',
      }}
    >
      {/* Number watermark */}
      <div style={{
        position: 'absolute', top: -8, right: 14,
        fontSize: '4rem', fontWeight: 900, opacity: 0.07,
        color: feature.accentColor, fontFamily: 'monospace',
        userSelect: 'none', lineHeight: 1,
      }}>
        {feature.number}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.9rem' }}>
        <div style={{
          width: 46, height: 46, borderRadius: '0.875rem',
          background: `${feature.accentColor}18`,
          border: `1px solid ${feature.accentColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
        }}>
          {feature.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: feature.accentColor, fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.1rem', lineHeight: 1.3 }}>
            {feature.title}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.73rem' }}>{feature.tagline}</div>
        </div>
      </div>

      {/* Category badge + effort */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{
          background: `${feature.accentColor}18`, color: feature.accentColor,
          border: `1px solid ${feature.accentColor}30`,
          borderRadius: 999, padding: '0.1rem 0.55rem', fontSize: '0.63rem', fontWeight: 700,
        }}>{feature.category}</span>
        <span style={{
          background: 'rgba(255,255,255,0.05)', color: '#64748b',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 999, padding: '0.1rem 0.55rem', fontSize: '0.63rem', fontWeight: 600,
        }}>{feature.effort} effort</span>
        <span style={{ fontSize: '0.68rem', color: '#475569' }}>{feature.impact}</span>
      </div>

      {/* Description */}
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '0.8rem', margin: '0 0 0.85rem' }}>
        {feature.description}
      </p>

      {/* Preview pill */}
      {feature.preview && (
        <div style={{
          background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '0.6rem', padding: '0.5rem 0.7rem',
          color: '#cbd5e1', fontSize: '0.73rem', fontStyle: 'italic',
          marginBottom: '0.85rem', lineHeight: 1.5,
        }}>
          {'\ud83d\udca1'} {feature.preview}
        </div>
      )}

      {/* Highlight chips */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        {feature.highlights.map(h => (
          <span key={h} style={{
            background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 4, padding: '0.1rem 0.45rem', fontSize: '0.67rem',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* GitHub repo credit */}
      <div style={{ color: '#475569', fontSize: '0.67rem', marginBottom: '0.9rem', fontFamily: 'monospace', lineHeight: 1.4 }}>
        {'\ud83d\udce6'} {feature.githubRepo} &middot; {feature.repoStars}
      </div>

      {/* Launch button */}
      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={handleLaunch}
        style={{
          width: '100%', padding: '0.65rem',
          background: `linear-gradient(135deg, ${feature.accentColor}cc, ${feature.accentColor}88)`,
          border: 'none', borderRadius: '0.65rem',
          color: '#fff', fontWeight: 800, fontSize: '0.82rem',
          cursor: 'pointer',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}
      >
        {feature.ctaAction === 'ctrl+k' ? '\u2318K \u2014 Try Now' : `\u2192 Launch ${feature.icon} ${feature.title.split(' ').slice(0, 3).join(' ')}`}
      </motion.button>
    </motion.div>
  );
}

export default function GitHubIdeasHub() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filtered = activeFilter === 'all'
    ? FEATURES
    : FEATURES.filter(f => {
        const pack = PACKS.find(p => p.name === activeFilter);
        return pack ? pack.ids.includes(f.id) : true;
      });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg,#050c10 0%,#08100a 40%,#0a0820 100%)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: '2rem 2.5rem 4rem', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', borderRadius: '0.5rem', padding: '0.4rem 0.9rem',
                cursor: 'pointer', fontSize: '0.82rem',
              }}
            >
              {'\u2190'} Dashboard
            </button>
            <span style={{
              background: 'linear-gradient(135deg,rgba(251,191,36,0.2),rgba(249,115,22,0.2))',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: 999, padding: '0.2rem 0.8rem',
              fontSize: '0.68rem', color: '#fbbf24', fontWeight: 800,
            }}>{'\ud83c\uddee\ud83c\uddf3'} BHARAT INNOVATION SUITE</span>
          </div>

          <div style={{ maxWidth: 760 }}>
            <h1 style={{
              color: '#fff', fontSize: '2.1rem', fontWeight: 900, margin: '0 0 0.5rem', lineHeight: 1.2,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              8 Innovative GitHub Ideas{' '}
              <span style={{ background: 'linear-gradient(90deg,#f97316,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                for BharatMedia
              </span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, lineHeight: 1.65 }}>
              Specialized, niche, and indie open-source mechanics for India's cultural diversity,
              voice-first Tier-2/3 markets, and hyperlocal marketing intelligence. Each feature is
              inspired by a real GitHub repository with proven community traction.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { value: '8', label: 'Features Built', color: '#f97316' },
              { value: '29', label: 'States Covered', color: '#4ade80' },
              { value: '10', label: 'Indian Languages', color: '#a855f7' },
              { value: '3', label: 'Feature Packs', color: '#22d3ee' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: s.color, fontSize: '1.7rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Pack Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#475569', fontSize: '0.78rem', marginRight: '0.25rem' }}>Filter:</span>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              background: activeFilter === 'all' ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeFilter === 'all' ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: activeFilter === 'all' ? '#f97316' : '#64748b',
              borderRadius: 999, padding: '0.4rem 1rem', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            {'\ud83c\udf10'} All 8 Features
          </button>
          {PACKS.map(pack => (
            <button
              key={pack.name}
              onClick={() => setActiveFilter(activeFilter === pack.name ? 'all' : pack.name)}
              style={{
                background: activeFilter === pack.name ? `${pack.color}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeFilter === pack.name ? pack.color + '50' : 'rgba(255,255,255,0.08)'}`,
                color: activeFilter === pack.name ? pack.color : '#64748b',
                borderRadius: 999, padding: '0.4rem 1rem', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
              }}
            >
              {pack.emoji} {pack.name}
            </button>
          ))}
        </motion.div>

        {/* Feature Grid */}
        <AnimatePresence mode="popLayout">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}>
            {filtered.map((feature, i) => (
              <FeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </div>
        </AnimatePresence>

        {/* Feature Packs Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ marginTop: '3rem' }}>
          <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            {'\ud83d\udce6'} Suggested Feature Packs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {PACKS.map(pack => {
              const packFeatures = FEATURES.filter(f => pack.ids.includes(f.id));
              return (
                <div key={pack.name} style={{
                  background: `${pack.color}08`,
                  border: `1px solid ${pack.color}25`,
                  borderRadius: '1rem', padding: '1.25rem',
                }}>
                  <div style={{ color: pack.color, fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.65rem' }}>
                    {pack.emoji} {pack.name}
                  </div>
                  {packFeatures.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                      <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                      <Link
                        to={f.path}
                        style={{ color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.color = pack.color)}
                        onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        {f.title}
                      </Link>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const feat = FEATURES.find(f => f.id === pack.ids[0]);
                      if (feat) navigate(feat.path);
                    }}
                    style={{
                      marginTop: '0.85rem', width: '100%',
                      background: `${pack.color}20`, border: `1px solid ${pack.color}40`,
                      borderRadius: '0.65rem', padding: '0.55rem',
                      color: pack.color, fontWeight: 700, fontSize: '0.8rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = `${pack.color}30`; }}
                    onMouseOut={e => { e.currentTarget.style.background = `${pack.color}20`; }}
                  >
                    Launch Pack {'\u2192'}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Ctrl+K CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          style={{
            marginTop: '2.5rem',
            background: 'linear-gradient(135deg,rgba(148,163,184,0.07),rgba(71,85,105,0.04))',
            border: '1px solid rgba(148,163,184,0.14)',
            borderRadius: '1.25rem', padding: '1.5rem 2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
          }}
        >
          <div>
            <div style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '1rem', marginBottom: '0.3rem' }}>
              {'\u2318'} Try the Command Palette {'\u2014'} anywhere, anytime
            </div>
            <div style={{ color: '#64748b', fontSize: '0.82rem' }}>
              Press{' '}
              <kbd style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 4, padding: '0.1rem 0.45rem',
                fontFamily: 'monospace', fontSize: '0.8rem', color: '#cbd5e1',
              }}>Ctrl+K</kbd>
              {' '}or{' '}
              <kbd style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 4, padding: '0.1rem 0.45rem',
                fontFamily: 'monospace', fontSize: '0.8rem', color: '#cbd5e1',
              }}>{'\u2318K'}</kbd>
              {' '}to open the global palette {'\u2014'} navigate, audit copy, switch languages instantly
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
            style={{
              background: 'linear-gradient(135deg,#475569,#334155)',
              border: '1px solid rgba(148,163,184,0.3)', borderRadius: '0.75rem',
              padding: '0.65rem 1.5rem', color: '#e2e8f0', fontWeight: 800,
              fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'monospace',
            }}
          >
            {'\u2318K'} Open Palette
          </motion.button>
        </motion.div>

      </main>
    </div>
  );
}
