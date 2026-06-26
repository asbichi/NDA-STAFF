import { LOGO_BASE64 } from "@/src/logoBase64";
import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Clock, Globe, ChevronDown, ChevronUp, GraduationCap, User, Home, BookOpen, Info, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function Contact() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
  };

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
          <Link to="/about" className="hover:text-blue-300 transition-colors hidden md:block">ABOUT</Link>
          <Link to="/courses" className="hover:text-blue-300 transition-colors hidden md:block">COURSES</Link>
          <Link to="/gallery" className="hover:text-blue-300 transition-colors hidden md:block">GALLERY</Link>
          <Link to="/contact" className="text-blue-300 border-b-2 border-blue-300 pb-1 hover:text-blue-400 transition-colors hidden md:block font-bold">CONTACT</Link>
          
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
                      to="/about"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 border-t border-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      About Us
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

      <main className="flex-1 max-w-7xl mx-auto w-full py-20 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h1 className="text-5xl font-black text-primary mb-6">Get in Touch</h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
              Have questions about our CBT system, admissions, or curriculum? Our team is here to help you every step of the way.
            </p>

            <div className="space-y-8">
              {[
                { icon: MapPin, title: 'Our Location', detail: 'NDA Staff Secondary School, Kaduna State, Nigeria' },
                { icon: Phone, title: 'Phone Number', detail: '+234 (0) 800 000 0000' },
                { icon: Mail, title: 'Email Address', detail: 'info@NDA.academy' },
                { icon: Clock, title: 'Working Hours', detail: 'Mon - Fri: 8:00 AM - 4:00 PM' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-lg mb-1">{item.title}</h3>
                    <p className="text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 p-8 bg-primary rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-blue-400" />
                  Global Reach
                </h3>
                <p className="text-blue-100/80 leading-relaxed">
                  We are proud to serve students from across Nigeria and beyond, providing a platform for excellence that knows no borders.
                </p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-10">
              <h2 className="text-3xl font-bold text-primary mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <Input placeholder="John Doe" className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <Input type="email" placeholder="john@example.com" className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Subject</label>
                  <Input placeholder="How can we help?" className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Message</label>
                  <Textarea placeholder="Type your message here..." className="min-h-[150px] bg-slate-50 border-slate-200 focus:bg-white transition-all" required />
                </div>
                <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-blue-200 mb-4">&copy; {new Date().getFullYear()} NDA Staff Secondary School Kaduna. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
