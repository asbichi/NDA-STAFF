import { LOGO_BASE64 } from "@/src/logoBase64";
import { Book, Microscope, Calculator, Globe, Palette, Music, Cpu, Languages, Briefcase, Landmark, PenTool, ChevronDown, ChevronUp, GraduationCap, User, Home, Mail, Info, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const curriculum = {
  jss: [
    { icon: Calculator, name: 'Mathematics', desc: 'Core mathematics for junior secondary.' },
    { icon: Book, name: 'English Language', desc: 'Grammar, comprehension, and writing skills.' },
    { icon: Microscope, name: 'Basic Science', desc: 'Introduction to scientific principles.' },
    { icon: Cpu, name: 'Basic Technology', desc: 'Fundamentals of technology and engineering.' },
    { icon: Globe, name: 'Social Studies', desc: 'Understanding society and environment.' },
    { icon: Landmark, name: 'Civic Education', desc: 'Rights, duties, and civic responsibilities.' },
    { icon: Briefcase, name: 'Business Studies', desc: 'Introduction to business and commerce.' },
    { icon: Languages, name: 'French', desc: 'Basic French language skills.' },
  ],
  sss_science: [
    { icon: Microscope, name: 'Physics', desc: 'Study of matter, energy, and forces.' },
    { icon: Microscope, name: 'Chemistry', desc: 'Composition, properties, and reactions of matter.' },
    { icon: Microscope, name: 'Biology', desc: 'Study of living organisms and their vital processes.' },
    { icon: Calculator, name: 'Further Mathematics', desc: 'Advanced mathematical concepts.' },
    { icon: Cpu, name: 'Computer Science', desc: 'Programming and computational thinking.' },
  ],
  sss_art: [
    { icon: Book, name: 'Literature in English', desc: 'Analysis of prose, poetry, and drama.' },
    { icon: Landmark, name: 'Government', desc: 'Political systems and administration.' },
    { icon: Globe, name: 'History', desc: 'Study of past events and human affairs.' },
    { icon: Palette, name: 'Fine Arts', desc: 'Visual arts and creative expression.' },
    { icon: Languages, name: 'French', desc: 'Advanced French language skills.' },
  ],
  sss_commerce: [
    { icon: Briefcase, name: 'Economics', desc: 'Production, consumption, and transfer of wealth.' },
    { icon: Briefcase, name: 'Commerce', desc: 'Trade, business, and commercial activities.' },
    { icon: Calculator, name: 'Financial Accounting', desc: 'Recording and analyzing financial transactions.' },
    { icon: PenTool, name: 'Office Practice', desc: 'Administrative and office management skills.' },
  ]
};

export default function Courses() {
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
          <Link to="/about" className="hover:text-blue-300 transition-colors hidden md:block">ABOUT</Link>
          <Link to="/courses" className="text-blue-300 border-b-2 border-blue-300 pb-1 hover:text-blue-400 transition-colors hidden md:block font-bold">ACADEMICS</Link>
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
                      to="/about"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 border-t border-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      About Us
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

      {/* Header */}
      <header className="bg-primary text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6">Academic Curriculum</h1>
          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
            A comprehensive and balanced curriculum designed to foster intellectual growth and practical skills across all disciplines.
          </p>
        </div>
      </header>

      {/* Course Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          
          {/* JSS Section */}
          <div>
            <div className="mb-8">
              <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-100">JSS 1 - JSS 3</Badge>
              <h2 className="text-3xl font-bold text-primary">Junior Secondary Curriculum</h2>
              <p className="text-slate-500 mt-2">Foundational subjects for all junior secondary students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {curriculum.jss.map((sub, i) => (
                <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
                  <CardHeader className="bg-slate-50 group-hover:bg-blue-50 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <sub.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary">{sub.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-slate-500 text-sm leading-relaxed">{sub.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* SSS Science Section */}
          <div>
            <div className="mb-8 border-t pt-12">
              <Badge className="mb-2 bg-green-100 text-green-700 hover:bg-green-100">SSS 1 - SSS 3</Badge>
              <h2 className="text-3xl font-bold text-primary">Senior Secondary (Science)</h2>
              <p className="text-slate-500 mt-2">Specialized subjects for science department students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {curriculum.sss_science.map((sub, i) => (
                <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
                  <CardHeader className="bg-slate-50 group-hover:bg-green-50 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <sub.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary">{sub.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-slate-500 text-sm leading-relaxed">{sub.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* SSS Art Section */}
          <div>
            <div className="mb-8 border-t pt-12">
              <Badge className="mb-2 bg-purple-100 text-purple-700 hover:bg-purple-100">SSS 1 - SSS 3</Badge>
              <h2 className="text-3xl font-bold text-primary">Senior Secondary (Art)</h2>
              <p className="text-slate-500 mt-2">Specialized subjects for art and humanities students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {curriculum.sss_art.map((sub, i) => (
                <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
                  <CardHeader className="bg-slate-50 group-hover:bg-purple-50 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <sub.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary">{sub.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-slate-500 text-sm leading-relaxed">{sub.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* SSS Commerce Section */}
          <div>
            <div className="mb-8 border-t pt-12">
              <Badge className="mb-2 bg-orange-100 text-orange-700 hover:bg-orange-100">SSS 1 - SSS 3</Badge>
              <h2 className="text-3xl font-bold text-primary">Senior Secondary (Commerce)</h2>
              <p className="text-slate-500 mt-2">Specialized subjects for commercial department students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {curriculum.sss_commerce.map((sub, i) => (
                <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
                  <CardHeader className="bg-slate-50 group-hover:bg-orange-50 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <sub.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary">{sub.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-slate-500 text-sm leading-relaxed">{sub.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 mb-10 text-lg">Join NDA Staff Secondary School and experience a world-class education powered by modern technology.</p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg font-bold rounded-full shadow-xl">
              Apply Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-blue-200 mb-4">&copy; {new Date().getFullYear()} NDA Staff Secondary School Kaduna. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
