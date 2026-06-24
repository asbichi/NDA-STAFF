import { LOGO_BASE64 } from "@/src/logoBase64";
import { GraduationCap, Award, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-primary text-white sticky top-0 z-50 shadow-lg">
        <Link to="/" className="flex items-center gap-3 bg-black px-3 py-1.5 border border-white/10">
          <img src={LOGO_BASE64} alt="NDA Logo" className="w-8 h-8 object-contain bg-white rounded-full p-0.5 shrink-0"  />
          <span className="font-serif font-bold text-sm tracking-wider uppercase text-white">NDA STAFF SECONDARY SCHOOL</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-blue-300 transition-colors">HOME</Link>
          <Link to="/courses" className="hover:text-blue-300 transition-colors">COURSES</Link>
          <Link to="/contact" className="hover:text-blue-300 transition-colors">CONTACT</Link>
          <Link to="/login">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">LOGIN</Button>
          </Link>
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
