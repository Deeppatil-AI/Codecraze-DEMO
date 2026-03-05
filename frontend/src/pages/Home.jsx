import Hero from '../Components/Hero';
import { Link } from 'react-router-dom';

const steps = [
  {
    num: '01',
    emoji: '🔍',
    title: 'Search Location',
    desc: 'Enter your destination and instantly find parking areas close to you.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    num: '02',
    emoji: '📅',
    title: 'Book Your Slot',
    desc: 'Pick your slot and time — reserve it in a single tap.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    num: '03',
    emoji: '🚗',
    title: 'Drive & Park',
    desc: 'Navigate to your reserved spot and pay securely. Done!',
    gradient: 'from-indigo-500 to-violet-600',
  },
];

const Home = () => (
  <div className="min-h-screen">
    <Hero />

    {/* ── How It Works ─────────────────────────────── */}
    <section className="bg-white py-20 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge">🚀 Simple Process</span>
          <h2 className="text-[32px] sm:text-[40px] font-extrabold text-gray-900 tracking-tight leading-tight mt-3">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-gray-500 text-[15px] mt-3 max-w-sm mx-auto">
            Three simple steps to park stress-free, every time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* connector */}
          <div className="hidden md:block absolute top-[38px] left-[33%] right-[33%] h-px bg-gradient-to-r from-violet-200 to-blue-200 z-0" />

          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`card p-7 text-center z-10 relative animate-fade-up`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className={`w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mx-auto mb-5 shadow-md text-2xl`}>
                {s.emoji}
              </div>
              <span className="text-[10px] font-bold text-violet-400 tracking-[0.1em] uppercase">{s.num}</span>
              <h3 className="font-bold text-gray-900 text-[15px] mt-1 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-[13px] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA Banner ───────────────────────────────── */}
    <section className="bg-[#f4f3fb] py-16 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-[24px] px-10 md:px-16 py-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 55%, #2563eb 100%)' }}
        >
          {/* decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/[0.04] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/[0.04] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <p className="text-white/60 text-[12px] font-semibold tracking-[0.1em] uppercase mb-3">Get Started Today</p>
          <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white tracking-tight leading-tight mb-3 relative">
            Ready to park smarter?
          </h2>
          <p className="text-white/60 max-w-sm mx-auto text-[14px] mb-8 relative">
            Join 50,000+ drivers who trust ParkMate for stress-free parking every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
            <Link
              to="/book"
              className="inline-flex items-center justify-center gap-2 bg-white text-violet-700 font-bold text-[14px] px-7 py-3.5 rounded-xl hover:bg-violet-50 transition-all duration-200 shadow-md hover:-translate-y-0.5"
            >
              🚀 Get Started Free
            </Link>
            <Link
              to="/availability"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/25 hover:border-white/50 text-white/85 hover:text-white font-semibold text-[14px] px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              View Parking Map
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* ── Footer ─────────────────────────────────── */}
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg icon-purple flex items-center justify-center text-xs">🚗</div>
          <span className="font-bold gradient-text text-[15px]">ParkMate</span>
          <span className="text-gray-200 text-sm mx-1">|</span>
          <span className="text-[12px] text-gray-400">Smart Parking Made Easy</span>
        </div>
        <p className="text-gray-400 text-[12px]">© 2026 ParkMate · Made with ❤️ for smarter cities</p>
      </div>
    </footer>
  </div>
);

export default Home;
