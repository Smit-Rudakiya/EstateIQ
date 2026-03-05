import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './DocumentUpload.css';

const DocumentUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFiles = [...e.dataTransfer.files].filter(f =>
            f.type === 'application/pdf' ||
            f.type === 'application/msword' ||
            f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        setFiles(prev => [...prev, ...droppedFiles]);
    }, []);

    const handleFileSelect = (e) => {
        setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return toast.error('Please select files to upload');
        setUploading(true);

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('document', file);
                const res = await api.post('/documents/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setUploaded(prev => [...prev, { name: file.name, status: 'success', data: res.data }]);
            } catch (err) {
                setUploaded(prev => [...prev, { name: file.name, status: 'error', error: err.response?.data?.message || 'Upload failed' }]);
            }
        }

        setFiles([]);
        setUploading(false);
        toast.success('Upload complete!');
    };

    const formatSize = (bytes) => {
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
        return (bytes / 1024).toFixed(0) + ' KB';
    };

    return (
        <div className="upload-page page">
            <div className="container">
                <div className="upload-header animate-fade-in">
                    <div className="section-label">Documents</div>
                    <h1 className="section-title">Upload <span className="gradient-text">Documents</span></h1>
                    <p className="section-subtitle">Securely upload your property contracts, agreements, and lease documents for AI-powered analysis.</p>
                </div>

                {/* Drop Zone */}
                <div
                    className={`drop-zone ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload size={40} />
                    <h3>Drag & drop files here</h3>
                    <p>or click to browse</p>
                    <input type="file" accept=".pdf,.doc,.docx" multiple onChange={handleFileSelect} className="drop-zone-input" />
                    <span className="drop-zone-hint">PDF, DOC, DOCX — Max 10MB per file</span>
                </div>

                {/* Selected Files */}
                {files.length > 0 && (
                    <div className="file-list animate-fade-in">
                        <h3>Selected Files ({files.length})</h3>
                        {files.map((file, i) => (
                            <div key={i} className="file-item">
                                <div className="file-item-icon"><FileText size={20} /></div>
                                <div className="file-item-info">
                                    <span className="file-item-name">{file.name}</span>
                                    <span className="file-item-size">{formatSize(file.size)}</span>
                                </div>
                                <button className="file-item-remove" onClick={() => removeFile(i)}><X size={16} /></button>
                            </div>
                        ))}
                        <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={uploading} style={{ width: '100%', marginTop: '16px' }}>
                            <Upload size={18} /> {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
                        </button>
                    </div>
                )}

                {/* Uploaded Results */}
                {uploaded.length > 0 && (
                    <div className="upload-results animate-fade-in">
                        <h3>Upload Results</h3>
                        {uploaded.map((item, i) => (
                            <div key={i} className={`upload-result-item ${item.status}`}>
                                {item.status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span>{item.name}</span>
                                <span className={`badge ${item.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                                    {item.status === 'success' ? 'Uploaded' : 'Failed'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentUpload;
