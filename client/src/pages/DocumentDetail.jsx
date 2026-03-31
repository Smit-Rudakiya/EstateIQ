import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, AlertTriangle, CheckCircle, Clock, ArrowLeft, Shield, ScrollText, Brain, Hash, Calendar, DollarSign, Building2, Users, Loader } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ENTITY_CONFIG = {
    MONEY: { icon: DollarSign, color: '#10B981', label: 'Amounts & Prices' },
    DATE: { icon: Calendar, color: '#6366F1', label: 'Dates & Periods' },
    ORG: { icon: Building2, color: '#F59E0B', label: 'Organizations' },
    PERSON: { icon: Users, color: '#EC4899', label: 'People / Names' },
    GPE: { icon: Building2, color: '#8B5CF6', label: 'Locations' },
    LAW: { icon: Shield, color: '#EF4444', label: 'Legal References' },
    CARDINAL: { icon: Hash, color: '#14B8A6', label: 'Numbers' },
    PERCENT: { icon: Hash, color: '#F97316', label: 'Percentages' },
};

// Priority order for showing entities
const ENTITY_ORDER = ['MONEY', 'DATE', 'PERSON', 'ORG', 'GPE', 'LAW', 'CARDINAL', 'PERCENT'];

const DocumentDetail = () => {
    const { id } = useParams();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                setDoc(res.data);
            } catch (err) {
                toast.error('Document not found');
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
        // Poll for analysis updates if still analyzing
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                setDoc(res.data);
                if (res.data.status !== 'analyzing') clearInterval(interval);
            } catch { clearInterval(interval); }
        }, 3000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <div className="page" style={{ paddingTop: '100px', textAlign: 'center' }}><Loader className="spin" size={32} /> Loading...</div>;
    if (!doc) return <div className="page" style={{ paddingTop: '100px', textAlign: 'center' }}>Document not found.</div>;

    const { analysis, status } = doc;

    return (
        <div className="page" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg)' }}>
            <div className="container" style={{ maxWidth: '960px', padding: '32px 20px' }}>
                {/* Header */}
                <Link to="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '20px' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '22px', margin: 0 }}>{doc.originalName}</h1>
                        <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '13px' }}>
                            {(doc.fileSize / 1024).toFixed(0)} KB • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <span style={{
                            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                            background: status === 'analyzed' ? '#D1FAE5' : status === 'analyzing' ? '#FEF3C7' : status === 'failed' ? '#FEE2E2' : '#E0E7FF',
                            color: status === 'analyzed' ? '#065F46' : status === 'analyzing' ? '#92400E' : status === 'failed' ? '#991B1B' : '#3730A3',
                        }}>
                            {status === 'analyzing' && <><Loader size={12} className="spin" style={{ marginRight: '4px', verticalAlign: 'middle' }} /></>}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Analyzing State */}
                {status === 'analyzing' && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <Brain size={48} color="var(--primary)" style={{ animation: 'pulse 1.5s infinite' }} />
                        <h3 style={{ marginTop: '16px' }}>Analyzing Document...</h3>
                        <p style={{ color: 'var(--text-light)' }}>Our NLP engine is extracting insights from your document. This usually takes 10-30 seconds.</p>
                    </div>
                )}

                {/* Failed State */}
                {status === 'failed' && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FEF2F2', borderRadius: '16px', border: '1px solid #FECACA' }}>
                        <AlertTriangle size={48} color="#EF4444" />
                        <h3 style={{ marginTop: '16px', color: '#991B1B' }}>Analysis Failed</h3>
                        <p style={{ color: '#B91C1C' }}>{doc.analysisError || 'An unexpected error occurred during analysis.'}</p>
                    </div>
                )}

                {/* Analyzed — Show Results */}
                {status === 'analyzed' && analysis && (
                    <>
                        {/* Tab Navigation */}
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--card-bg)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                            {[
                                { key: 'summary', label: 'Summary', icon: Brain },
                                { key: 'alerts', label: `Alerts (${analysis.alerts?.length || 0})`, icon: AlertTriangle },
                                { key: 'clauses', label: `Clauses (${analysis.clauses?.length || 0})`, icon: ScrollText },
                                { key: 'entities', label: 'Entities', icon: Users },
                            ].map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                        background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                                        color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
                                        fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s',
                                    }}>
                                    <tab.icon size={14} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Summary Tab */}
                        {activeTab === 'summary' && (
                            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                    <Brain size={20} color="var(--primary)" /> Document Summary
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {(analysis.summary || '').split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10).map((sentence, i) => (
                                        <div key={i} style={{
                                            display: 'flex', gap: '12px', padding: '14px 16px', borderRadius: '10px',
                                            background: i % 2 === 0 ? 'var(--bg)' : 'transparent',
                                            borderLeft: '3px solid',
                                            borderLeftColor: ['var(--primary)', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i % 5],
                                        }}>
                                            <span style={{ 
                                                fontSize: '11px', fontWeight: 700, color: '#fff', minWidth: '22px', height: '22px',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                background: ['var(--primary)', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i % 5],
                                            }}>{i + 1}</span>
                                            <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--dark)', fontSize: '14px' }}>{sentence.trim()}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Stats Row */}
                                <div style={{ display: 'flex', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                                    {[
                                        { value: analysis.wordCount?.toLocaleString(), label: 'Words', color: 'var(--primary)' },
                                        { value: analysis.charCount?.toLocaleString(), label: 'Characters', color: 'var(--primary)' },
                                        { value: analysis.alerts?.length || 0, label: 'Alerts', color: '#F59E0B' },
                                        { value: analysis.clauses?.length || 0, label: 'Clauses', color: '#8B5CF6' },
                                        { value: analysis.entities ? Object.keys(analysis.entities).length : 0, label: 'Entity Types', color: '#EC4899' },
                                    ].map((stat, i) => (
                                        <div key={i} style={{ textAlign: 'center', flex: '1 1 80px', padding: '12px 8px', background: 'var(--bg)', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Alerts Tab */}
                        {activeTab === 'alerts' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {analysis.alerts?.length > 0 ? analysis.alerts.map((alert, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px', borderRadius: '12px',
                                        background: '#FEF3C7', border: '1px solid #FDE68A',
                                    }}>
                                        <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <p style={{ margin: 0, fontSize: '14px', color: '#92400E', lineHeight: 1.6 }}>{alert.message}</p>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '40px', background: '#D1FAE5', borderRadius: '12px' }}>
                                        <CheckCircle size={32} color="#059669" />
                                        <p style={{ color: '#065F46', marginTop: '12px' }}>No warnings detected in this document.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Clauses Tab */}
                        {activeTab === 'clauses' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {analysis.clauses?.length > 0 ? analysis.clauses.map((clause, i) => (
                                    <div key={i} style={{
                                        padding: '18px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)',
                                        borderLeft: '4px solid #8B5CF6',
                                    }}>
                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#7C3AED', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <ScrollText size={14} /> {clause.label}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>"{clause.snippet}"</p>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <ScrollText size={32} color="var(--text-light)" />
                                        <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>No specific clauses were identified in this document.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Entities Tab */}
                        {activeTab === 'entities' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {analysis.entities && Object.keys(analysis.entities).length > 0 ? (
                                    ENTITY_ORDER
                                        .filter(key => analysis.entities[key]?.length > 0)
                                        .map(key => {
                                            const config = ENTITY_CONFIG[key] || { icon: Hash, color: '#6B7280', label: key };
                                            const Icon = config.icon;
                                            const values = analysis.entities[key];
                                            const displayVals = values.slice(0, 8);
                                            const remaining = values.length - 8;
                                            return (
                                                <div key={key} style={{
                                                    padding: '20px', borderRadius: '14px', background: 'var(--card-bg)',
                                                    border: '1px solid var(--border)', borderLeft: `4px solid ${config.color}`,
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '8px',
                                                            background: config.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <Icon size={16} color={config.color} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--dark)' }}>{config.label}</div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{values.length} detected</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {displayVals.map((v, i) => (
                                                            <span key={i} style={{
                                                                padding: '5px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                                                                background: config.color + '12', color: config.color,
                                                                border: `1px solid ${config.color}25`,
                                                            }}>{v}</span>
                                                        ))}
                                                        {remaining > 0 && (
                                                            <span style={{
                                                                padding: '5px 14px', borderRadius: '8px', fontSize: '12px',
                                                                background: 'var(--bg)', color: 'var(--text-light)',
                                                                border: '1px solid var(--border)', fontStyle: 'italic',
                                                            }}>+{remaining} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px' }}>
                                        <Users size={32} color="var(--text-light)" />
                                        <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>No named entities extracted.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Not analyzed (uploaded only, no PDF/DOCX) */}
                {status === 'uploaded' && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <FileText size={48} color="var(--text-light)" />
                        <h3 style={{ marginTop: '16px' }}>No Analysis Available</h3>
                        <p style={{ color: 'var(--text-light)' }}>This file type is not supported for NLP analysis. Only PDF and DOCX documents can be analyzed.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentDetail;
