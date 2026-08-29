import { useState, type FormEvent } from 'react';
import { supabase } from '@/hooks/useSupabase';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrMsg('Please fill in all required fields.');
      setStatus('error');
      return;
    }
    if (!formData.email.includes('@')) {
      setErrMsg('Please enter a valid email.');
      setStatus('error');
      return;
    }

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
            status: 'new',
          }
        ]);

      if (error) {
        setErrMsg('Failed to send message: ' + error.message);
        setStatus('error');
      } else {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (err) {
      setErrMsg('Error sending message: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background-50 pt-14 md:pt-20">
      {/* Hero */}
      <section className="section-padding py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-heading text-2xl md:text-4xl text-foreground-50">Contact Us</h1>
          <p className="text-sm md:text-base text-foreground-400 mt-4 leading-relaxed">
            Got a question, collaboration idea, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="section-padding pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-primary-500/15 text-primary-400 flex items-center justify-center shrink-0">
                <i className="ri-mail-line text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground-200">Email</h3>
                <p className="text-sm text-foreground-400">hello@tribedala.co.ke</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-accent-500/15 text-accent-400 flex items-center justify-center shrink-0">
                <i className="ri-map-pin-line text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground-200">Location</h3>
                <p className="text-sm text-foreground-400">Kisumu, Kenya</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-secondary-500/15 text-secondary-400 flex items-center justify-center shrink-0">
                <i className="ri-phone-line text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground-200">Phone</h3>
                <p className="text-sm text-foreground-400">+254 700 000 000</p>
              </div>
            </div>

            <div className="pt-4 border-t border-background-300/30">
              <h3 className="text-sm font-medium text-foreground-200 mb-3">Follow Us</h3>
              <div className="flex items-center gap-2">
                {[
                  { icon: 'ri-instagram-line', label: 'Instagram' },
                  { icon: 'ri-youtube-line', label: 'YouTube' },
                  { icon: 'ri-twitter-x-line', label: 'X' },
                  { icon: 'ri-tiktok-line', label: 'TikTok' },
                  { icon: 'ri-spotify-line', label: 'Spotify' },
                ].map((s) => (
                  <a key={s.label} href="#" aria-label={s.label} className="w-9 h-9 rounded-full bg-background-100 hover:bg-primary-500 flex items-center justify-center text-foreground-400 hover:text-background-50 transition-all duration-200">
                    <i className={`${s.icon} text-sm`} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
              {status === 'success' && (
                <div className="p-3 rounded-md bg-green-500/10 border border-green-500/30 text-sm text-green-400">
                  Message sent! We&apos;ll get back to you within 48 hours.
                </div>
              )}
              {status === 'error' && errMsg && (
                <div className="p-3 rounded-md bg-accent-500/10 border border-accent-500/30 text-sm text-accent-400">
                  {errMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-foreground-200 mb-1.5">Name *</label>
                  <input id="contact-name" type="text" name="name" value={formData.name} onChange={(e) => update('name', e.target.value)} required className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-foreground-200 mb-1.5">Email *</label>
                  <input id="contact-email" type="email" name="email" value={formData.email} onChange={(e) => update('email', e.target.value)} required className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" placeholder="you@email.com" />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground-200 mb-1.5">Subject</label>
                <input id="contact-subject" type="text" name="subject" value={formData.subject} onChange={(e) => update('subject', e.target.value)} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" placeholder="What's this about?" />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-foreground-200 mb-1.5">Message *</label>
                <textarea id="contact-message" name="message" value={formData.message} onChange={(e) => update('message', e.target.value)} required rows={5} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none" placeholder="Tell us what's on your mind..." />
              </div>

              <button type="submit" className="btn-primary text-sm">
                <i className="ri-send-plane-line mr-2" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
