import ContactForm from '../Components/ContactForm';

const contactInfo = [
  { emoji: '📞', bg: 'bg-violet-100', label: 'Call Us', value: '+91 98765 43210', sub: 'Mon–Sat, 9 AM–8 PM' },
  { emoji: '📧', bg: 'bg-blue-100', label: 'Email Us', value: 'support@parkmate.in', sub: 'Reply within 24h' },
  { emoji: '📍', bg: 'bg-indigo-100', label: 'Office', value: 'Bandra Kurla Complex', sub: 'Mumbai, MH 400051' },
  { emoji: '⏰', bg: 'bg-emerald-100', label: 'Support Hours', value: '24/7 Available', sub: 'Emergency helpline' },
];

const Contact = () => (
  <div className="page-bg pt-[60px]">
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        {/* <span className="badge mb-3">💬 Support</span> */}
        <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight mt-2">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-gray-500 text-[14px] mt-2 max-w-md mx-auto">
          Questions, feedback, or partnership inquiries — we'd love to hear from you.
        </p>
      </div>

      {/* Info Cards */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {contactInfo.map((info, i) => (
          <div
            key={i}
            className={`card p-5 text-center animate-fade-up`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`w-11 h-11 rounded-xl ${info.bg} flex items-center justify-center mx-auto mb-3 text-xl`}>
              {info.emoji}
            </div>
            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-1">{info.label}</p>
            <p className="text-[12px] font-semibold text-gray-900 mb-0.5 leading-snug">{info.value}</p>
            <p className="text-[11px] text-gray-400">{info.sub}</p>
          </div>
        ))}
      </div> */}

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-static p-6">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">Let's Talk 🤝</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
              Our team is always ready to assist with parking queries, technical issues, or any general questions about ParkMate.
            </p>

            <div className="space-y-3.5">
              {[
                { emoji: '📞', label: 'Phone', value: '+91 98765 43210' },
                { emoji: '📧', label: 'Email', value: 'support@parkmate.in' },
                { emoji: '📍', label: 'Location', value: 'BKC, Mumbai 400051' },
              ].map((item, i) => (
                <div key={i} className="row-hover flex items-center gap-3 py-2 px-1 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                    {item.emoji}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-none">{item.label}</p>
                    <p className="text-[13px] font-semibold text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="card-static overflow-hidden">
            <div className="w-full h-44">
              <iframe
                title="ParkMate Office"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.2!2d72.865!3d19.0698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBandra+Kurla+Complex!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 opacity-90 hover:opacity-100 transition-opacity duration-300"
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="px-5 py-3.5 flex items-center gap-2.5">
              <span className="text-base">📍</span>
              <div>
                <p className="text-[13px] font-semibold text-gray-800">Bandra Kurla Complex</p>
                <p className="text-[11px] text-gray-400">Mumbai, MH 400051</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  </div>
);

export default Contact;
