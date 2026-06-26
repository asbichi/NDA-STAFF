import { LOGO_BASE64 } from "@/src/logoBase64";
import { GraduationCap, Award, ShieldCheck, Zap, ChevronDown, ChevronUp, User, Home, BookOpen, Mail, Info, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function About() {
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setIsLoginDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-primary text-white sticky top-0 z-50 shadow-lg">
        <Link to="/" className="flex items-center gap-3 bg-black px-3 py-1.5 border border-white/10">
          <img src={LOGO_BASE64} alt="NDA Logo" className="w-8 h-8 object-contain bg-white rounded-full p-0.5 shrink-0"  />
          <span className="font-serif font-bold text-sm tracking-wider uppercase text-white">NDA STAFF SECONDARY SCHOOL</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-blue-300 transition-colors hidden md:block">HOME</Link>
          <Link to="/about" className="text-blue-300 border-b-2 border-blue-300 pb-1 hover:text-blue-400 transition-colors hidden md:block font-bold">ABOUT</Link>
          <Link to="/courses" className="hover:text-blue-300 transition-colors hidden md:block">COURSES</Link>
          <Link to="/gallery" className="hover:text-blue-300 transition-colors hidden md:block">GALLERY</Link>
          <Link to="/contact" className="hover:text-blue-300 transition-colors hidden md:block">CONTACT</Link>
          
          {/* Desktop Login Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login?role=admin">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary text-xs uppercase tracking-wider px-3 h-9">Staff Login</Button>
            </Link>
            <Link to="/login?role=student">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-wider px-3 h-9">Student Portal</Button>
            </Link>
          </div>

          {/* Mobile Login Dropdown */}
          <div className="relative md:hidden" ref={loginDropdownRef}>
            <Button
              onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary text-xs uppercase tracking-wider px-3 h-9 flex items-center gap-1"
            >
              <span>Menu</span>
              {isLoginDropdownOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>

            <AnimatePresence>
              {isLoginDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl z-50 rounded-md overflow-hidden text-slate-800"
                >
                  <div className="p-1 flex flex-col gap-1">
                    <Link 
                      to="/"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <Home className="w-4 h-4 text-slate-400" />
                      Home
                    </Link>
                    <Link 
                      to="/courses"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 border-t border-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      Courses
                    </Link>
                    <Link 
                      to="/gallery"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 border-t border-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <LayoutGrid className="w-4 h-4 text-slate-400" />
                      Gallery
                    </Link>
                    <Link 
                      to="/contact"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 border-t border-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <Mail className="w-4 h-4 text-slate-400" />
                      Contact
                    </Link>
                    
                    {/* Divider for logins */}
                    <div className="border-t border-slate-100 my-1"></div>

                    <Link 
                      to="/login?role=student"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-blue-50 transition-all"
                    >
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      Student Portal
                    </Link>
                    <Link 
                      to="/login?role=admin"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 border-t border-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Staff Login
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-white border-b">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-primary leading-tight mb-6">
              Empowering the <span className="text-blue-600">Next Generation</span> of Leaders.
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              NDA Staff Secondary School Kaduna is committed to academic excellence, character development, and the integration of modern technology in education. Our CBT platform is a testament to our forward-thinking approach.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-primary hover:bg-blue-900 text-white px-8">Our Mission</Button>
              <Button size="lg" variant="outline" className="border-primary text-primary">Learn More</Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://picsum.photos/seed/school/800/600" 
              alt="School Building" 
              className="rounded-3xl shadow-2xl object-cover w-full h-[500px]"
              
            />
            <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-8 rounded-2xl shadow-xl hidden md:block">
              <p className="text-4xl font-bold">25+</p>
              <p className="text-sm uppercase tracking-widest opacity-80">Years of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">Our Core Values</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We believe in fostering an environment where students can thrive academically and socially.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: GraduationCap, title: 'Academic Rigor', desc: 'Challenging curriculum designed to prepare students for global success.' },
              { icon: Award, title: 'Integrity', desc: 'Building character and promoting honesty in all academic pursuits.' },
              { icon: ShieldCheck, title: 'Security', desc: 'A safe and secure environment for learning and examination.' },
              { icon: Zap, title: 'Innovation', desc: 'Leveraging cutting-edge technology like our CBT system.' }
            ].map((value, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{value.title}</h3>
                <p className="text-slate-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-blue-200 mb-4">&copy; {new Date().getFullYear()} NDA Staff Secondary School Kaduna. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm opacity-60">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/courses" className="hover:text-white">Courses</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
