import { LOGO_BASE64 } from "@/src/logoBase64";
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Globe, Users, ChevronRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-black px-4 py-2 border border-white/10">
            <img src={LOGO_BASE64} alt="NDA Logo" className="w-10 h-10 object-contain bg-white rounded-full p-0.5 shrink-0"  />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm leading-none tracking-wider text-white">NDA STAFF SECONDARY SCHOOL</span>
              <span className="text-[8px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-0.5">Global Academy</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-[0.2em] uppercase">
            <Link to="/about" className="text-white hover:text-red-500 transition-colors">About</Link>
            <Link to="/courses" className="text-white hover:text-red-500 transition-colors">Academics</Link>
            <Link to="/contact" className="text-white hover:text-red-500 transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login?role=admin" className="hidden md:block">
              <Button className="bg-transparent hover:bg-white/10 text-white border border-white/20 text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-3 h-full rounded-md shadow-md transition-all">
                Staff Login
              </Button>
            </Link>
            <Link to="/login?role=student">
              <Button className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-3 h-full rounded-md shadow-lg shadow-red-600/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                Student Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col lg:flex-row pt-20">
        {/* Image Content (75%) */}
        <div className="relative w-full lg:w-3/4 h-[50vh] lg:h-screen overflow-hidden">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img 
              src="https://i.ibb.co/XxRkHK4H/nda.jpg" 
              alt="School Students" 
              className="w-full h-full object-cover brightness-[0.95] contrast-[1.05] saturate-[1.1]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-red-600/5 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black lg:block hidden"></div>
        </div>
        
        {/* Caption Content (25%) */}
        <div className="w-full lg:w-1/4 flex items-center px-8 lg:px-12 py-12 lg:py-0 bg-black relative z-10">
          <div className="space-y-8 text-left max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-4"
            >
              <div className="h-[2px] w-8 bg-red-600 rounded-full"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">Innovation & Excellence</span>
            </motion.div>
  
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="text-5xl md:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight"
            >
               Empowering <br />
               Minds for <br />
               <span className="text-red-600 italic">Tomorrow.</span>
            </motion.h1>
  
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-base text-slate-300 font-medium leading-relaxed"
            >
              A world-class educational platform fostering innovation, academic brilliance, and character development for the modern era.
            </motion.p>
  
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="flex flex-col gap-4 pt-4 w-full"
            >
              <Link to="/login?role=student" className="w-full">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase rounded-md w-full shadow-xl shadow-red-600/20 group transition-all hover:-translate-y-1">
                  Enter Academy
                  <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link to="/about" className="w-full">
                <Button variant="outline" size="lg" className="border-white/10 hover:bg-white/10 text-white bg-transparent px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase rounded-md w-full transition-all">
                  Discover More
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="bg-black border-y border-white/10 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {[
            { value: '15k+', label: 'Active Students' },
            { value: '500+', label: 'Expert Staff' },
            { value: '99%', label: 'Pass Rate' },
            { value: '1st', label: 'Global Rank' },
          ].map((stat, i) => (
            <div key={i} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-serif font-bold text-red-600 mb-4">{stat.value}</div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">A Standard of <span className="text-red-600">Excellence</span></h2>
            <p className="text-slate-400 font-light leading-relaxed">
              Our platform brings together comprehensive administrative tools, rigorous academic standard enforcement, and seamless experiences for all stakeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Secure CBT Engine', desc: 'Enterprise-grade computer-based testing with real-time monitoring and anti-cheat capabilities.' },
              { icon: Globe, title: 'Cloud Infrastructure', desc: 'Secure, scalable, and always-available access from anywhere in the world.' },
              { icon: Users, title: 'Stakeholder Portals', desc: 'Dedicated seamless interfaces tailored for administrators, teachers, parents, and students.' },
            ].map((feature, i) => (
              <div key={i} className="group p-10 bg-zinc-950 rounded-2xl border border-white/5 hover:border-red-600/30 transition-all duration-500">
                <div className="w-14 h-14 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 mb-8 group-hover:bg-red-600 group-hover:text-white transition-colors duration-500">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{feature.desc}</p>
                <div className="mt-8 flex items-center text-[10px] font-bold uppercase tracking-widest text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-24 pb-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          <div className="md:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <img src={LOGO_BASE64} alt="NDA Logo" className="w-12 h-12 object-contain"  />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-tight">NDA STAFF SECONDARY SCHOOL</span>
                <span className="text-[9px] font-bold tracking-[0.3em] text-red-500 uppercase mt-1">Global Academy</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed font-light">
              Pioneering modern education management. Providing seamless administrative tools and beautiful experiences for schools worldwide.
            </p>
          </div>
          
          <div className="md:col-span-3 space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-300">Contact</h4>
            <div className="space-y-4 text-sm text-slate-400 font-light">
              <p>NDA Staff Secondary School <br />Kaduna, Nigeria</p>
              <p className="text-red-500">+234 (0) 800 000 0000</p>
              <p className="hover:text-white transition-colors cursor-pointer">info@ndastaffschool.edu.ng</p>
            </div>
          </div>

          <div className="md:col-span-4 space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-300">Platform</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 font-light">
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              <Link to="/courses" className="hover:text-white transition-colors">Features</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/login" className="hover:text-white transition-colors">Staff Portal</Link>
              <Link to="/login?role=student" className="hover:text-white transition-colors">Student Portal</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
          <span>&copy; {new Date().getFullYear()} NDA Staff Secondary School. All rights reserved.</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
