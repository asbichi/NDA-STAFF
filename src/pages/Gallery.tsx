import { LOGO_BASE64 } from "@/src/logoBase64";
import { GraduationCap, Award, ShieldCheck, Zap, ChevronDown, ChevronUp, User, Home, BookOpen, Mail, LayoutGrid, Eye, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface GalleryMember {
  id: string;
  name: string;
  title: string;
  role: 'management' | 'pta';
  imageUrl: string;
  description: string;
  order: number;
}

const SEED_MEMBERS = [
  {
    name: 'Major General Oluyemi Olatoye',
    title: 'Commandant',
    role: 'management' as const,
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    description: 'Providing strategic leadership and ensuring high standards of discipline and educational excellence at the NDA Staff Secondary School.',
    order: 1
  },
  {
    name: 'Mrs. Helen John',
    title: 'School Principal',
    role: 'management' as const,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    description: 'Directing academic and administrative operations, fostering a learning environment built on discipline, integrity, and diligence.',
    order: 2
  },
  {
    name: 'Major C. D. Yusuf',
    title: 'Vice Principal Academic',
    role: 'management' as const,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    description: 'Dedicated to fostering academic excellence, innovation in curriculum delivery, and ensuring a robust learning environment where every student can achieve their highest potential.',
    order: 3
  },
  {
    name: 'Mrs. Elizabeth Ibrahim',
    title: 'Vice Principal Administration',
    role: 'management' as const,
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    description: 'Coordinating general administration, student welfare, extracurricular programs, and managing school staff affairs.',
    order: 4
  },
  {
    name: 'Dr. Farouk Umar',
    title: 'PTA Chairman',
    role: 'pta' as const,
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    description: 'Promoting mutual understanding and strong partnership between school management, teachers, and parents for student growth.',
    order: 5
  },
  {
    name: 'Mrs. Amina Bello',
    title: 'PTA Vice Chair',
    role: 'pta' as const,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    description: 'Assisting in governing PTA initiatives, organizing community engagement projects, and acting as liaison with parent groups.',
    order: 6
  },
  {
    name: 'Mr. Charles Nwosu',
    title: 'General Secretary PTA',
    role: 'pta' as const,
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    description: 'A pivotal link between the parent body and the school management, driving clear communication and successfully organizing initiatives that strengthen the school community.',
    order: 7
  },
  {
    name: 'Alhaji Shehu Garba',
    title: 'PTA Treasurer',
    role: 'pta' as const,
    imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop',
    description: 'Ensuring transparent financial records, managing PTA funds, budgets, and reporting financial status during general assembly meetings.',
    order: 8
  }
];

export default function Gallery() {
  const [members, setMembers] = useState<GalleryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'management' | 'pta'>('all');
  const [selectedMember, setSelectedMember] = useState<GalleryMember | null>(null);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true);
        const colRef = collection(db, 'gallery_members');
        const q = query(colRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        let list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GalleryMember[];

        // Check if Commandant is in the list
        const commandantExists = list.some(m => m.title.toLowerCase().includes('commandant'));

        if (!commandantExists) {
          // Add missing Commandant
          const commandantItem = {
            name: 'Major General Oluyemi Olatoye',
            title: 'Commandant',
            role: 'management' as const,
            imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
            description: 'Providing strategic leadership and ensuring high standards of discipline and educational excellence at the NDA Staff Secondary School.',
            order: 1
          };
          const docRef = await addDoc(colRef, { ...commandantItem, createdAt: serverTimestamp() });
          list = [{ id: docRef.id, ...commandantItem }, ...list];
        }

        // If collection was empty initially (and no SEED_MEMBERS were in DB), add others
        if (snapshot.empty) {
            // Need to add others too
            for (const item of SEED_MEMBERS.filter(m => !m.title.toLowerCase().includes('commandant'))) {
                const docRef = await addDoc(colRef, { ...item, createdAt: serverTimestamp() });
                list.push({ id: docRef.id, ...item });
            }
        }

        setMembers(list);
      } catch (err) {
        console.error("Error fetching gallery members:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

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

  const filteredMembers = members.filter(member => {
    if (activeTab === 'all') return true;
    return member.role === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-primary text-white sticky top-0 z-50 shadow-lg">
        <Link to="/" className="flex items-center gap-3 bg-black px-3 py-1.5 border border-white/10">
          <img src={LOGO_BASE64} alt="NDA Logo" className="w-8 h-8 object-contain bg-white rounded-full p-0.5 shrink-0"  />
          <span className="font-serif font-bold text-sm tracking-wider uppercase text-white">NDA STAFF SECONDARY SCHOOL</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-blue-300 transition-colors hidden md:block">HOME</Link>
          <Link to="/about" className="hover:text-blue-300 transition-colors hidden md:block">ABOUT</Link>
          <Link to="/courses" className="hover:text-blue-300 transition-colors hidden md:block">ACADEMICS</Link>
          <Link to="/gallery" className="text-blue-300 border-b-2 border-blue-300 pb-1 hover:text-blue-400 transition-colors hidden md:block">GALLERY</Link>
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
                      to="/courses"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 border-t border-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      Academics
                    </Link>
                    <Link 
                      to="/gallery"
                      onClick={() => setIsLoginDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 border-t border-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all font-semibold text-blue-600"
                    >
                      <LayoutGrid className="w-4 h-4 text-blue-500" />
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

      {/* Hero Header */}
      <div className="bg-primary text-white py-16 px-6 text-center border-b border-white/10 relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            MEET OUR <span className="text-blue-400">LEADERS</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-300 mt-4 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed"
          >
            The dedicated team of administrators, educators, and PTA Executives shaping the academic journey and institutional excellence of NDA Staff Secondary School.
          </motion.p>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Tab Switchers */}
        <div className="flex justify-center gap-2 md:gap-4 mb-12">
          {[
            { id: 'all', label: 'All Members' },
            { id: 'management', label: 'School Management' },
            { id: 'pta', label: 'PTA EXCOs' }
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? "default" : "outline"}
              className={`rounded-full px-6 py-2 text-xs uppercase tracking-wider font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10 hover:bg-blue-700' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500 text-sm tracking-wider uppercase font-medium">Loading Gallery...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
            <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Members Found</h3>
            <p className="text-slate-500 mt-1 text-sm">Members will appear here once added by school administrators.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredMembers.map((member) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  key={member.id}
                  className="group"
                >
                  <Card className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white flex flex-col h-full hover:-translate-y-1">
                    {/* Image Area */}
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                      <img 
                        src={member.imageUrl} 
                        alt={member.name} 
                        className="object-cover object-top w-full h-full group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop'; }}
                      />
                      {/* Dark overlay with hover view button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button 
                          onClick={() => setSelectedMember(member)}
                          className="bg-white/90 hover:bg-white text-slate-800 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg"
                        >
                          <Eye className="w-4 h-4 mr-2 text-blue-600" />
                          View Profile
                        </Button>
                      </div>

                      {/* Badge in image top right */}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className={member.role === 'management' ? 'bg-blue-600 hover:bg-blue-600 text-white' : 'bg-green-600 hover:bg-green-600 text-white'}>
                          {member.role === 'management' ? 'MANAGEMENT' : 'PTA EXCO'}
                        </Badge>
                      </div>
                    </div>

                    {/* Member Details */}
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="mb-2">
                        <h3 className="text-lg font-black text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">{member.name}</h3>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{member.title}</p>
                      </div>
                      <p className="text-slate-500 text-sm mt-3 leading-relaxed line-clamp-3 flex-1">{member.description}</p>
                      <Button
                        onClick={() => setSelectedMember(member)}
                        variant="ghost"
                        className="w-full mt-4 justify-between text-xs font-bold uppercase tracking-wider hover:text-blue-600 p-0 hover:bg-transparent"
                      >
                        <span>Full Biography</span>
                        <span>&rarr;</span>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Profile Detail Dialog */}
      <Dialog open={selectedMember !== null} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl">
          {selectedMember && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Profile Image */}
              <div className="relative aspect-square md:aspect-auto md:h-full min-h-[250px] bg-slate-100">
                <img 
                  src={selectedMember.imageUrl} 
                  alt={selectedMember.name} 
                  className="object-cover object-top w-full h-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop'; }}
                />
                <div className="absolute top-4 left-4">
                  <Badge className={selectedMember.role === 'management' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}>
                    {selectedMember.role === 'management' ? 'MANAGEMENT' : 'PTA EXCO'}
                  </Badge>
                </div>
              </div>

              {/* Right Profile Details */}
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <DialogHeader className="p-0 text-left">
                    <DialogTitle className="text-2xl font-black text-slate-800 leading-tight">{selectedMember.name}</DialogTitle>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{selectedMember.title}</p>
                  </DialogHeader>
                  <p className="text-slate-600 text-sm mt-6 leading-relaxed whitespace-pre-line">{selectedMember.description}</p>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6 flex justify-between items-center text-xs text-slate-400">
                  <span>NDA Staff Secondary School</span>
                  <Button variant="outline" size="sm" onClick={() => setSelectedMember(null)} className="rounded-full">Close</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-6 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-blue-200 mb-4">&copy; {new Date().getFullYear()} NDA Staff Secondary School Kaduna. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm opacity-60">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/courses" className="hover:text-white">Academics</Link>
            <Link to="/gallery" className="hover:text-white">Gallery</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
