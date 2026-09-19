import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBrainDocs, uploadBrainDoc, deleteBrainDoc } from '../lib/api';

const DOC_TYPES = [
    { value: 'brand_guidelines', label: 'Brand Guidelines', icon: '🎨' },
    { value: 'product_catalog', label: 'Product Catalog', icon: '📦' },
    { value: 'persona', label: 'Customer Persona', icon: '👤' },
    { value: 'previous_campaign', label: 'Previous Campaign', icon: '📣' },
    { value: 'reviews', label: 'Customer Reviews', icon: '⭐' },
    { value: 'competitor', label: 'Competitor Info', icon: '🕵️' },
    { value: 'other', label: 'Other', icon: '📄' },
];

function fmtSize(b: number): string {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BharatBrain() {
    const navigate = useNavigate();
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [selectedType, setSelectedType] = useState('brand_guidelines');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchDocs = useCallback(async () => {
        try {
            setDocs(await getBrainDocs());
        } catch {
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocs();
    }, [fetchDocs]);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError('');
        setSuccess('');
        try {
            for (const file of Array.from(files)) {
                await uploadBrainDoc(file, selectedType);
            }
            setSuccess(`✅ ${files.length} document(s) uploaded to BharatBrain`);
            await fetchDocs();
        } catch (e: any) {
            setError(e?.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBrainDoc(id);
            setDocs(d => d.filter(doc => doc.id !== id));
        } catch {
            setError('Delete failed');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg,#0f0f1a 0%,#1a1030 50%,#0f1a1a 100%)',
                padding: '2rem',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            {/* Header */}
            <div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
            >
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#94a3b8',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                    }}
                >
                    ← Dashboard
                </button>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                        🧠 BharatBrain
                    </h1>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        Persistent business memory — upload brand docs, product catalogs, and
                        personas. AI uses these for every campaign.
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '340px 1fr',
                    gap: '1.5rem',
                    maxWidth: '1100px',
                }}
            >
                {/* Upload Panel */}
                <div
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                    }}
                >
                    <h2
                        style={{
                            color: '#e2e8f0',
                            fontSize: '1rem',
                            fontWeight: 600,
                            margin: '0 0 1rem',
                        }}
                    >
                        Upload Document
                    </h2>

                    {/* Type selector */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label
                            style={{
                                color: '#94a3b8',
                                fontSize: '0.8rem',
                                display: 'block',
                                marginBottom: '0.5rem',
                            }}
                        >
                            DOCUMENT TYPE
                        </label>
                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '0.5rem',
                                color: '#e2e8f0',
                                padding: '0.6rem 0.8rem',
                                fontSize: '0.9rem',
                            }}
                        >
                            {DOC_TYPES.map(t => (
                                <option key={t.value} value={t.value}>
                                    {t.icon} {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={e => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => {
                            e.preventDefault();
                            setDragOver(false);
                            handleUpload(e.dataTransfer.files);
                        }}
                        onClick={() => document.getElementById('brain-file-input')?.click()}
                        style={{
                            border: `2px dashed ${dragOver ? '#a78bfa' : 'rgba(167,139,250,0.3)'}`,
                            borderRadius: '0.75rem',
                            padding: '2rem 1rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: dragOver ? 'rgba(167,139,250,0.08)' : 'transparent',
                            transition: 'all 0.2s',
                        }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                            Drop files here or click to browse
                        </p>
                        <p style={{ color: '#475569', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                            PDF, DOCX, TXT, PNG, JPG
                        </p>
                    </div>
                    <input
                        id="brain-file-input"
                        type="file"
                        multiple
                        accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.csv"
                        style={{ display: 'none' }}
                        onChange={e => handleUpload(e.target.files)}
                    />

                    {uploading && (
                        <div
                            style={{
                                color: '#a78bfa',
                                fontSize: '0.85rem',
                                marginTop: '1rem',
                                textAlign: 'center',
                            }}
                        >
                            ⏳ Uploading to S3…
                        </div>
                    )}
                    {error && (
                        <div
                            style={{
                                color: '#f87171',
                                fontSize: '0.85rem',
                                marginTop: '0.75rem',
                                background: 'rgba(248,113,113,0.1)',
                                borderRadius: '0.5rem',
                                padding: '0.5rem 0.75rem',
                            }}
                        >
                            {error}
                        </div>
                    )}
                    {success && (
                        <div
                            style={{
                                color: '#4ade80',
                                fontSize: '0.85rem',
                                marginTop: '0.75rem',
                                background: 'rgba(74,222,128,0.1)',
                                borderRadius: '0.5rem',
                                padding: '0.5rem 0.75rem',
                            }}
                        >
                            {success}
                        </div>
                    )}

                    <div
                        style={{
                            marginTop: '1.5rem',
                            background: 'rgba(99,102,241,0.08)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: '0.5rem',
                            padding: '0.75rem',
                        }}
                    >
                        <p style={{ color: '#818cf8', fontSize: '0.75rem', margin: 0 }}>
                            <strong>How it works:</strong> Files are stored in{' '}
                            <strong>Amazon S3</strong> (per-user prefix, private). Metadata (name,
                            type, key) is stored in <strong>DynamoDB</strong>. The AI reads this
                            context before generating every campaign.
                        </p>
                    </div>
                </div>

                {/* Docs List */}
                <div>
                    <h2
                        style={{
                            color: '#e2e8f0',
                            fontSize: '1rem',
                            fontWeight: 600,
                            margin: '0 0 1rem',
                        }}
                    >
                        Knowledge Base{' '}
                        <span style={{ color: '#64748b', fontWeight: 400 }}>
                            ({docs.length} documents)
                        </span>
                    </h2>

                    {loading ? (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>
                            Loading…
                        </div>
                    ) : docs.length === 0 ? (
                        <div
                            style={{
                                color: '#64748b',
                                textAlign: 'center',
                                padding: '3rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px dashed rgba(255,255,255,0.08)',
                                borderRadius: '1rem',
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🧠</div>
                            <p style={{ margin: 0 }}>
                                No documents yet. Upload your brand guidelines to get started.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {docs.map((doc: any) => {
                                const typeInfo = DOC_TYPES.find(t => t.value === doc.type);
                                return (
                                    <div
                                        key={doc.id}
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '0.75rem',
                                            padding: '1rem 1.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {typeInfo?.icon ?? '📄'}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    color: '#e2e8f0',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                {doc.name}
                                            </div>
                                            <div
                                                style={{
                                                    color: '#64748b',
                                                    fontSize: '0.75rem',
                                                    marginTop: '0.1rem',
                                                }}
                                            >
                                                {typeInfo?.label} · {fmtSize(doc.size)} ·{' '}
                                                {new Date(doc.createdAt).toLocaleDateString(
                                                    'en-IN'
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                background: 'rgba(99,102,241,0.15)',
                                                color: '#818cf8',
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '999px',
                                                border: '1px solid rgba(99,102,241,0.3)',
                                            }}
                                        >
                                            S3 ✓
                                        </div>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            style={{
                                                background: 'rgba(239,68,68,0.1)',
                                                border: '1px solid rgba(239,68,68,0.2)',
                                                color: '#ef4444',
                                                borderRadius: '0.4rem',
                                                padding: '0.3rem 0.6rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
