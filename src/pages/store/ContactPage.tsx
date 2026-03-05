import { useState } from 'react';
import { MessageCircle, Mail, Send, ChevronDown, ChevronUp, MapPin, Clock, Phone } from 'lucide-react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', orderNumber: '', message: '' });
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
    const [submitted, setSubmitted] = useState(false);

    const faqs = [
        { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. Express delivery is available for select locations within 1-2 days.' },
        { q: 'Can I customize my order?', a: 'Yes! We offer custom crochet pieces. Contact us via WhatsApp with your requirements and our artisans will create something special for you.' },
        { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for unused items in original packaging. Custom orders are non-returnable.' },
        { q: 'How do I track my order?', a: 'Once shipped, you will receive a tracking link via email and WhatsApp. You can also contact us with your order number for updates.' },
    ];

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitted(true);
        setForm({ name: '', orderNumber: '', message: '' });
        setTimeout(() => setSubmitted(false), 3000);
    }

    return (
        <div className="animate-fade-in">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blush-100 to-ivory px-4 py-10 text-center">
                <h1 className="font-display text-2xl font-bold text-charcoal mb-2">We're Here to Help</h1>
                <p className="text-sm text-gray-600">Get in touch with us anytime</p>
            </section>

            <div className="px-4 py-6 space-y-6">
                {/* Quick Contact */}
                <div className="grid grid-cols-2 gap-3">
                    <a href="https://wa.me/919876543210" target="_blank" className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
                        <MessageCircle size={22} className="text-emerald-600" />
                        <div><p className="text-sm font-semibold text-emerald-700">WhatsApp</p><p className="text-xs text-emerald-600">Quick Chat</p></div>
                    </a>
                    <a href="mailto:contact@phoolviaa.com" className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors">
                        <Mail size={22} className="text-blue-600" />
                        <div><p className="text-sm font-semibold text-blue-700">Email Us</p><p className="text-xs text-blue-600">24hr Reply</p></div>
                    </a>
                </div>

                {/* Contact Form */}
                <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">Send a Message</h2>
                    {submitted ? (
                        <div className="text-center py-6"><span className="text-4xl mb-2 block">✉️</span><p className="text-emerald-600 font-medium">Message sent! We'll get back to you soon.</p></div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
                            <input type="text" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} placeholder="Order Number (optional)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your message..." rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none" required />
                            <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2"><Send size={16} />Send Message</button>
                        </form>
                    )}
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="font-semibold text-gray-900 mb-3">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100">
                                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                                    <span className="text-sm font-medium text-gray-900 pr-4">{faq.q}</span>
                                    {expandedFaq === i ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                                </button>
                                {expandedFaq === i && <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Studio Location */}
                <section className="bg-blush-50 rounded-2xl p-5 mb-8">
                    <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-blush-500" /> Studio Location
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">PHOOLVIAA Studio<br />Near City Center, India</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={12} />Mon-Sat: 10AM-7PM</span>
                        <span className="flex items-center gap-1"><Phone size={12} />+91 98765 43210</span>
                    </div>
                </section>
            </div>
        </div>
    );
}
