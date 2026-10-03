'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { logout } from '@/lib/features/userSlice';
import {
  Hotel,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  Star,
  ShieldCheck,
  Sparkles,
  Wifi,
  Waves,
  UtensilsCrossed,
  ConciergeBell,
  Menu,
  X,
  CheckCircle2,
  Lock,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import HotelBrand from '@/components/ui/HotelBrand';

const suites = [
  {
    id: 'ocean-deluxe',
    name: 'Ocean Grand Deluxe',
    tag: 'Signature Suite',
    detail: 'King bed · 2 guests · 65 m² · Private Ocean Terrace',
    price: '₹22,500',
    numericPrice: 22500,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
    amenities: ['Marble Soaking Tub', 'Daily High Tea', 'Ocean View Terrace', 'Dedicated Butler'],
  },
  {
    id: 'garden-villa',
    name: 'Garden Sanctuary Villa',
    tag: 'Family Suite',
    detail: '2 Queen beds · 4 guests · 95 m² · Private Plunge Pool',
    price: '₹28,000',
    numericPrice: 28000,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
    amenities: ['Private Heated Pool', 'Ensuite Spa Shower', 'Veranda Garden', 'Complimentary Breakfast'],
  },
  {
    id: 'presidential-penthouse',
    name: 'Presidential Royal Penthouse',
    tag: 'Limited Edition',
    detail: '2 King beds · 4 guests · 160 m² · 360° Panoramic View',
    price: '₹48,000',
    numericPrice: 48000,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
    amenities: ['Private Rooftop Deck', 'Personal Chef Service', 'Chauffeur Airport Transfer', 'Wine Cellar'],
  },
];

const experiences = [
  {
    icon: UtensilsCrossed,
    title: 'Michelin-Caliber Dining',
    desc: 'Seasonal tasting menus crafted by master chefs using locally sourced coastal ingredients.',
  },
  {
    icon: Waves,
    title: 'Holistic Spa & Thermal Baths',
    desc: 'Ayurvedic rituals, sound healing, and hydrotherapy designed for profound restoration.',
  },
  {
    icon: ConciergeBell,
    title: '24/7 Room Service & Support',
    desc: 'From in-room dining to travel planning, our staff takes care of everything you need.',
  },
  {
    icon: Wifi,
    title: 'Seamless Digital Living',
    desc: 'High-speed gigabit Wi-Fi, smart room automation, and in-app room service at your fingertips.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [previewSuite, setPreviewSuite] = useState<(typeof suites)[0] | null>(null);

  const portalHref =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'receptionist' || user?.role === 'staff'
      ? '/receptionist'
      : '/dashboard';

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleBookingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      guests: guests || '2',
    }).toString();
    router.push(`/login?redirect=/dashboard&${query}`);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#0f172a] flex flex-col selection:bg-amber-500 selection:text-white">
      {/* ────────────────── TOP NAVIGATION ────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <HotelBrand href="/" iconSize={22} textClassName="font-display text-2xl font-bold tracking-tight text-slate-950" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#suites" className="hover:text-amber-700 transition-colors">Suites & Villas</a>
            <a href="#experiences" className="hover:text-amber-700 transition-colors">Experiences</a>
            <a href="#story" className="hover:text-amber-700 transition-colors">Our Story</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={portalHref}
                  className="px-4 py-2.5 text-sm font-bold text-slate-800 hover:text-amber-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <LayoutDashboard size={15} /> {user.name || user.username}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2.5 text-sm font-bold text-slate-800 hover:text-amber-700 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="btn-gold">
                  Reserve Stay <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100"
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-3 font-semibold text-base text-slate-800">
              <a href="#suites" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">
                Suites & Villas
              </a>
              <a href="#experiences" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">
                Experiences & Wellness
              </a>
              <a href="#story" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">
                About LuxeStay
              </a>
              {user ? (
                <Link
                  href={portalHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-slate-100 text-amber-700 font-bold flex items-center justify-between"
                >
                  <span>{user.name || user.username}</span>
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100 text-amber-700 font-bold">
                  Sign In
                </Link>
              )}
            </div>
            <div className="pt-2 flex flex-col gap-2.5">
              {user ? (
                <>
                  <Link
                    href={portalHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full btn-gold justify-center text-xs font-bold py-3"
                  >
                    Go to Dashboard <ArrowRight size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <LogOut size={14} /> Sign Out ({user.name || user.username})
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 font-bold text-slate-800 border border-slate-300 rounded-full">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full btn-gold justify-center">
                    Book a Suite <ArrowRight size={15} />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ────────────────── HERO SECTION ────────────────── */}
      <section className="relative min-h-[640px] lg:min-h-[750px] flex items-center justify-center overflow-hidden">
        {/* Background Image with High-Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
            alt="LuxeStay Grand Resort and Lagoon"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 photo-scrim" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-widest mb-6">
            <Sparkles size={16} /> World Luxury Hotel Awards 2026 Winner
          </div>

          <h1 className="text-fluid-hero font-display font-medium tracking-tight text-white mb-6 drop-shadow-md">
            Where Serenity Meets <br />
            <span className="italic font-normal text-amber-200">Timeless Grandeur.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl font-medium text-slate-200 leading-relaxed mb-10 drop-shadow-xs">
            Immerse yourself in luxury rooms, scenic private balconies, and exceptional restaurant dining.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#suites" className="btn-gold text-sm px-8 py-3.5">
              Explore Our Suites <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────── INTERACTIVE BOOKING BAR ────────────────── */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 -mt-14 sm:-mt-16 w-full">
        <form
          onSubmit={handleBookingSearch}
          className="bg-white rounded-2xl sm:rounded-full p-4 sm:p-5 shadow-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
        >
          {/* Destination */}
          <div className="px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Destination
            </label>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin size={17} className="text-amber-600 shrink-0" />
              <span>LuxeStay Grand Resort</span>
            </div>
          </div>

          {/* Dates */}
          <div className="px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Check-In & Check-Out
            </label>
            <div className="flex items-center gap-2">
              <Calendar size={17} className="text-amber-600 shrink-0" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent border-none outline-none"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="px-4 py-2 border-b lg:border-b-0 lg:border-r border-slate-200">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Guests
            </label>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Users size={17} className="text-amber-600 shrink-0" />
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-bold text-slate-900"
              >
                <option value="1">1 Guest, 1 Suite</option>
                <option value="2">2 Guests, 1 Suite</option>
                <option value="3">3 Guests, Family Suite</option>
                <option value="4">4+ Guests, Penthouse</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="px-2">
            <button type="submit" className="w-full btn-gold py-3.5">
              Check Availability <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </section>

      {/* ────────────────── INTRO STORY ────────────────── */}
      <section id="story" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block">
              The Philosophy
            </span>
            <h2 className="text-fluid-title font-display font-medium text-slate-900 leading-tight">
              Hospitality curated <br />
              <span className="italic font-normal">around your rhythm.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed pt-2">
              At LuxeStay, luxury is not merely gold trim or ostentatious displays—it is the silence of an uninterrupted sunrise, linen crafted with intention, and an attentive team that anticipates your wishes before you voice them.
            </p>
            <div className="pt-4 flex items-center gap-6">
              <div>
                <strong className="block text-2xl sm:text-3xl font-bold font-display text-slate-900">
                  4.98 / 5
                </strong>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Guest Satisfaction
                </span>
              </div>
              <div className="w-px h-10 bg-slate-300" />
              <div>
                <strong className="block text-2xl sm:text-3xl font-bold font-display text-slate-900">
                  100%
                </strong>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Verified Reviews
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                alt="LuxeStay Evening Terrace"
                fill
                sizes="(max-width: 640px) 100vw, 350px"
                className="object-cover"
              />
            </div>
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg mt-0 sm:mt-8">
              <Image
                src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80"
                alt="Luxury suite interior"
                fill
                sizes="(max-width: 640px) 100vw, 350px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── SUITES SHOWCASE ────────────────── */}
      <section id="suites" className="py-20 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
                Accommodations
              </span>
              <h2 className="text-fluid-title font-display font-medium text-slate-900">
                Signature Suites & Villas
              </h2>
            </div>
            <p className="text-slate-600 max-w-md text-sm sm:text-base">
              Each residence features custom architectural finishes, acoustic soundproofing, and panoramic vistas.
            </p>
          </div>

          {/* Responsive Suite Grid: auto-adapts to small laptops, gaming screens, and phones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {suites.map((suite) => (
              <div
                key={suite.id}
                className="luxury-card overflow-hidden flex flex-col group"
              >
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <Image
                    src={suite.image}
                    alt={suite.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {suite.tag}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 group-hover:text-amber-800 transition-colors">
                      {suite.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      {suite.detail}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {suite.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-600 block">
                        Nightly Rate
                      </span>
                      <span className="text-xl font-bold text-slate-900 font-display">
                        {suite.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewSuite(suite)}
                        className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <Link
                        href={`/register?suite=${suite.id}`}
                        className="btn-gold py-2 px-4 text-xs"
                      >
                        Book <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── BESPOKE EXPERIENCES ────────────────── */}
      <section id="experiences" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
            The LuxeStay Lifestyle
          </span>
          <h2 className="text-fluid-title font-display font-medium text-slate-900">
            Experiences Curated Without Compromise
          </h2>
          <p className="text-slate-600 mt-4 text-base sm:text-lg">
            Every moment at our resort is tailored to provide an extraordinary sense of calm, delight, and personal rejuvenation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-colors"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────── REVIEWS & TRUST ────────────────── */}
      <section className="bg-[#0b0f17] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-4 md:pt-0">
              <Star className="text-amber-400 mx-auto mb-2" size={24} />
              <p className="font-display text-3xl font-bold">4.9 / 5.0</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Conde Nast Traveler</p>
            </div>
            <div className="pt-4 md:pt-0">
              <ShieldCheck className="text-amber-400 mx-auto mb-2" size={24} />
              <p className="font-display text-3xl font-bold">Guaranteed</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Direct Booking Best Rate</p>
            </div>
            <div className="pt-4 md:pt-0">
              <Sparkles className="text-amber-400 mx-auto mb-2" size={24} />
              <p className="font-display text-3xl font-bold">Forbes 5-Star</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Hospitality Certified</p>
            </div>
            <div className="pt-4 md:pt-0">
              <ConciergeBell className="text-amber-400 mx-auto mb-2" size={24} />
              <p className="font-display text-3xl font-bold">24 / 7</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Dedicated Guest Butler</p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="bg-[#080b11] text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1 */}
            <div className="space-y-4 md:col-span-1">
              <HotelBrand href="/" iconSize={20} inverted={true} textClassName="font-display text-2xl font-bold text-white" />
              <p className="text-xs leading-relaxed text-slate-400">
                A prestigious sanctuary of curated luxury, world-class dining, and personal hospitality.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Account Access</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                <li><Link href="/login" className="hover:text-amber-400 transition-colors">Sign In</Link></li>
                <li><Link href="/receptionist" className="hover:text-amber-400 transition-colors">Front Desk Terminal</Link></li>
                <li><Link href="/admin" className="hover:text-amber-400 transition-colors">Admin Console</Link></li>
                <li><Link href="/register" className="hover:text-amber-400 transition-colors">Create Account</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Suites & Amenities</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                <li><a href="#suites" className="hover:text-amber-400 transition-colors">Ocean Grand Deluxe</a></li>
                <li><a href="#suites" className="hover:text-amber-400 transition-colors">Garden Sanctuary Villa</a></li>
                <li><a href="#suites" className="hover:text-amber-400 transition-colors">Presidential Penthouse</a></li>
                <li><a href="#experiences" className="hover:text-amber-400 transition-colors">Spa & Ayurvedic Wellness</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Contact & Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                LuxeStay Coastal Lagoon, Goa, India. <br />
                Direct Phone: +91 (800) 589-3782
              </p>
              <Link href="/register" className="btn-gold text-xs py-2 px-4 inline-flex">
                Book Reservation
              </Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 LuxeStay Hospitality International. All rights reserved.</p>
            <p className="text-[11px]">Designed for high-performance responsive web and native mobile apps.</p>
          </div>
        </div>
      </footer>

      {/* ────────────────── SUITE PREVIEW MODAL ────────────────── */}
      {previewSuite && (
        <Modal
          isOpen={!!previewSuite}
          onClose={() => setPreviewSuite(null)}
          title={previewSuite.name}
          subtitle={previewSuite.detail}
        >
          <div className="space-y-4">
            <div className="relative h-60 w-full rounded-xl overflow-hidden">
              <Image
                src={previewSuite.image}
                alt={previewSuite.name}
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Included Amenities
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {previewSuite.amenities.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 size={15} className="text-amber-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Nightly Price</span>
                <span className="text-2xl font-bold font-display text-slate-900">
                  {previewSuite.price}
                </span>
              </div>
              <Link
                href={`/register?suite=${previewSuite.id}`}
                className="btn-gold"
                onClick={() => setPreviewSuite(null)}
              >
                Book This Suite <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
