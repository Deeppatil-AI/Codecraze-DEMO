import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const features = [
  {
    icon: '📍',
    bg: 'bg-violet-100',
    title: 'Real-time Availability',
    desc: 'Monitor slot status live across all locations — no refresh needed.',
  },
  {
    icon: '📅',
    bg: 'bg-blue-100',
    title: 'Easy Slot Booking',
    desc: 'Reserve your spot in seconds from any device, anywhere.',
  },
  {
    icon: '🔒',
    bg: 'bg-indigo-100',
    title: 'Secure Payments',
    desc: 'Card or UPI — bank-grade encryption protects every transaction.',
  },
  {
    icon: '📋',
    bg: 'bg-emerald-100',
    title: 'Booking History',
    desc: 'Track active and past bookings from a clean personal dashboard.',
  },
];

const stats = [
  { value: '1,200+', label: 'Parking Slots' },
  { value: '50K+', label: 'Happy Drivers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9 ★', label: 'Avg. Rating' },
];

const Hero = () => (
  <>
    {/* ── Hero ─────────────────────────────────────────── */}
    <section className="hero-bg relative min-h-[92vh] flex flex-col items-center justify-center pt-[60px] overflow-hidden">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-purple-500/20 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-1/4 -right-24 w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-[100px]" />

      <div className="relative w-full max-w-5xl mx-auto px-5 sm:px-8 py-20 text-center">
        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-up">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          1,200+ Slots Available Right Now
        </div> */}

        {/* Heading */}
        <h1 className="text-[52px] sm:text-[68px] lg:text-[80px] font-extrabold text-white leading-[1.05] tracking-[-0.03em] mb-6 animate-fade-up delay-1">
          Smart Parking<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-200 to-blue-300">
            Made Easy
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-[17px] text-white/55 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up delay-2">
          Find and reserve parking spaces in real time.
          No hassle, no waiting — just drive up and park.
        </p>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-fade-up delay-3">
          <Link
            to="/book"
            id="hero-book-btn"
            className="btn-primary text-[15px] px-7 py-3.5 rounded-xl"
          >
            Book a Slot <FaArrowRight className="text-xs opacity-80" />
          </Link>
          <Link
            to="/book"
            id="hero-availability-btn"
            className="btn-ghost text-[15px] px-7 py-3.5 rounded-xl !bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
          >
            Check Availability
          </Link>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 overflow-hidden rounded-2xl border border-white/10 animate-fade-up delay-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="py-5 px-6 bg-white/[0.05] backdrop-blur-sm text-center border-r border-white/10 last:border-r-0"
            >
              <p className="text-[26px] font-extrabold text-white tracking-tight leading-none">{s.value}</p>
              <p className="text-[11px] text-white/45 font-medium mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(244, 243, 251, 0.7)" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(244, 243, 251, 0.5)" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(244, 243, 251, 0.3)" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#f4f3fb" />
          </g>
        </svg>
      </div>
    </section>

    {/* ── Feature Cards ─────────────────────────────────── */}
    <section className="bg-[#f4f3fb] py-20 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <div className="text-center mb-12">
          {/* <span className="badge mb-4">✦ Why ParkMate</span> */}
          <h2 className="text-[32px] sm:text-[40px] font-extrabold text-gray-900 tracking-tight leading-tight mt-3">
            Everything you need for <span className="gradient-text">smart parking</span>
          </h2>
          <p className="text-gray-500 text-[15px] mt-3 max-w-md mx-auto">
            Designed for modern drivers — fast, reliable, beautifully simple.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`card p-6 cursor-default animate-fade-up`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 text-xl`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-[14px] leading-snug mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Hero;
