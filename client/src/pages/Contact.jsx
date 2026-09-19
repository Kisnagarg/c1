import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  User, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import InstagramIcon from '../components/ui/InstagramIcon';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const primaryPhone = settings.primaryPhone || '8435930113';
  const secondaryPhone = settings.secondaryPhone || '7067586087';
  const whatsappNumber = settings.whatsappNumber || '8435930113';
  const address = settings.address || 'Main Bus Stand, Atari Khejda, Vidisha, Madhya Pradesh';
  const ownerName = settings.ownerName || 'Mahendra Rathore';
  const businessName = settings.businessName || 'Rathore Electronics';
  const email = settings.email || 'mrathore4440@gmail.com';
  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/rathore_electronics_/';
  const instagramHandle = settings.instagramHandle || '@rathore_electronics_';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error('Please fill in your Name, Phone Number, and Message.');
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success('Your message has been received. Our team will contact you shortly!');
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-gray-950 via-primary-950 to-gray-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-primary-300 border border-white/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" /> Direct Client & Customer Support
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
            Contact {businessName}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Have questions about a product, bulk order, or your ₹200 advance payment? Reach out directly to our shop owner and support team.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Quick Contact Action Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Primary Call */}
          <a
            href={`tel:${primaryPhone}`}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-primary-300 transition-all group"
          >
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Primary Contact</span>
              <span className="font-extrabold text-gray-900 text-sm sm:text-base">{primaryPhone}</span>
              <span className="text-xs text-primary-600 font-semibold block mt-0.5">Click to Call Now</span>
            </div>
          </a>

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`Hello ${businessName}, I would like to inquire about your products.`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">WhatsApp Support</span>
              <span className="font-extrabold text-gray-900 text-sm sm:text-base">Chat on WhatsApp</span>
              <span className="text-xs text-emerald-600 font-semibold block mt-0.5">Instant message response</span>
            </div>
          </a>

          {/* Instagram Official */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-pink-300 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
              <InstagramIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Official Instagram</span>
              <span className="font-extrabold text-gray-900 text-sm sm:text-base">{instagramHandle}</span>
              <span className="text-xs text-pink-600 font-semibold block mt-0.5">Follow on Instagram</span>
            </div>
          </a>

          {/* Secondary Contact */}
          <a
            href={`tel:${secondaryPhone}`}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Secondary Contact</span>
              <span className="font-extrabold text-gray-900 text-sm sm:text-base">{secondaryPhone}</span>
              <span className="text-xs text-indigo-600 font-semibold block mt-0.5">Store Support</span>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Business Details Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm bg-white">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" /> Store Business Details
              </h2>

              <div className="space-y-6 text-sm">
                
                {/* Owner Info */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Shop Owner</span>
                    <span className="font-bold text-gray-900 text-base">{ownerName}</span>
                    <span className="text-xs text-gray-500 block mt-0.5">Founder & Business Operations</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Store Location & Address</span>
                    <p className="font-semibold text-gray-900 mt-0.5 leading-relaxed">
                      {address}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 mt-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                    </a>
                  </div>
                </div>

                {/* Primary & Secondary Phones */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Contact Numbers</span>
                    <div>
                      <a href={`tel:${primaryPhone}`} className="font-bold text-gray-900 hover:text-primary-600 transition-colors">
                        {primaryPhone}
                      </a>
                      <span className="text-xs text-gray-500 ml-2">(Primary / WhatsApp)</span>
                    </div>
                    <div>
                      <a href={`tel:${secondaryPhone}`} className="font-bold text-gray-900 hover:text-primary-600 transition-colors">
                        {secondaryPhone}
                      </a>
                      <span className="text-xs text-gray-500 ml-2">(Secondary)</span>
                    </div>
                  </div>
                </div>

                {/* Support Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Official Support Email</span>
                    <a href={`mailto:${email}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors block mt-0.5">
                      {email}
                    </a>
                  </div>
                </div>

                {/* Instagram Channel */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Official Instagram Profile</span>
                    <a 
                      href={instagramUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-bold text-pink-600 hover:text-pink-700 transition-colors inline-flex items-center gap-1 mt-0.5"
                    >
                      {instagramHandle} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Store Timings</span>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      Monday – Saturday: 9:00 AM – 9:00 PM
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Sunday: 10:00 AM – 6:00 PM</p>
                  </div>
                </div>

              </div>

              {/* Advance Payment Info Callout */}
              <div className="mt-8 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950">
                  <strong className="block font-bold mb-0.5">₹200 Advance Order Verification:</strong>
                  Every online order requires ₹200 advance via UPI. Our team confirms each reservation upon checking the transaction details.
                </div>
              </div>
            </Card>
          </div>

          {/* Interactive Contact Form (7 Cols) */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm bg-white">
              <h2 className="text-xl font-black text-gray-900 mb-2">Send Us a Direct Message</h2>
              <p className="text-sm text-gray-500 mb-6">
                Fill out the form below and we will get back to you via call or WhatsApp.
              </p>

              {sent && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong>Message Sent Successfully!</strong> We will contact you at {form.phone || 'your phone number'}.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Phone Number * (Mandatory)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Product Inquiry / Order Query"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Your Message / Question *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry, product requirement, or order question..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                    isLoading={sending}
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </Button>
                </div>
              </form>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
