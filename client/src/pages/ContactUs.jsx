import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './AboutContact.css';

const ContactUs = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/contact', form);
            toast.success(res.data.message);
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            toast.error(err.response?.data?.errors?.[0]?.msg || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page page">
            <div className="container">
                <div className="ac-header animate-fade-in">
                    <div className="section-label">Contact Us</div>
                    <h1 className="section-title">Get in Touch</h1>
                    <p className="section-subtitle">Have a question or need support? We'd love to hear from you.</p>
                </div>

                <div className="contact-grid">
                    <form className="contact-form card animate-fade-in" onSubmit={handleSubmit}>
                        <h3><MessageCircle size={20} /> Send us a message</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input className="form-input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input className="form-input" placeholder="What is this about?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message</label>
                            <textarea className="form-input" placeholder="Tell us more..." rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                            <Send size={18} /> {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>

                    <div className="contact-info animate-fade-in">
                        <div className="contact-info-card card">
                            <div className="contact-info-icon"><Mail size={22} /></div>
                            <h4>Email</h4>
                            <p>support@estateiq.com</p>
                            <p>info@estateiq.com</p>
                        </div>
                        <div className="contact-info-card card">
                            <div className="contact-info-icon"><Phone size={22} /></div>
                            <h4>Phone</h4>
                            <p>+91 22 4000 1234</p>
                            <p>Mon-Sat, 9am-6pm IST</p>
                        </div>
                        <div className="contact-info-card card">
                            <div className="contact-info-icon"><MapPin size={22} /></div>
                            <h4>Office</h4>
                            <p>Marwadi University</p>
                            <p>Rajkot, Gujarat 360003</p>
                        </div>
                    </div>
                </div>

                {/* Google Maps - Marwadi University */}
                <div className="contact-map animate-fade-in">
                    <h3 className="map-title"><MapPin size={20} /> Our Location</h3>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.169471508498!2d70.7778!3d22.3039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959ca0a2d8a3f3d%3A0x7f6e1b8b1b1b1b1b!2sMarwadi%20University!5e0!3m2!1sen!2sin!4v1709500000000!5m2!1sen!2sin"
                            width="100%"
                            height="400"
                            style={{ border: 0, borderRadius: '16px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Marwadi University Location"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
