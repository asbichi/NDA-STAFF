import { LOGO_BASE64 } from "@/src/logoBase64";
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, FileText, MonitorPlay, 
  LogOut, User, Award, Calendar, Clock, ArrowRight,
  ShieldCheck, TrendingUp, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface StudentInfo {
  regNo: string;
  name: string;
  class: string;
  gender: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentInfo | null>(null);

  useEffect(() => {
    const savedStudent = localStorage.getItem('student_session');
    if (!savedStudent) {
      navigate('/login');
      return;
    }
    setStudent(JSON.parse(savedStudent));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('student_session');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 bg-black px-3 py-2 border border-white/10">
          <img src={LOGO_BASE64} alt="NDA Logo" className="w-8 h-8 object-contain bg-white rounded-full p-0.5 shrink-0"  />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm leading-none tracking-wider text-white">NDA STAFF SECONDARY SCHOOL</span>
            <span className="text-[8px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-0.5">Student Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">{student.name || 'Student'}</span>
            <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{student.regNo} | {student.class.toUpperCase()}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 space-y-12">
        {/* Welcome Section */}
        <section className="flex flex-col md:row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">Welcome, {student.name.split(' ')[0]}</h1>
            <p className="text-slate-500 mt-2 font-light">Access your academic resources and track your progress.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </motion.div>
        </section>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CBT Exam Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-1"
          >
            <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary mb-4">
                    <MonitorPlay className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-serif font-bold text-primary">CBT Examination Portal</CardTitle>
                  <CardDescription>Take your scheduled computer-based tests and assessments.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>Active Session: 2023/2024</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <span>Secure Environment Enabled</span>
                    </div>
                  </div>
                </CardContent>
              </div>
              <CardContent className="pt-0">
                <Link to="/exam/mock-exam-id">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6 px-12 text-xs font-bold uppercase tracking-[0.2em] rounded-none group">
                    Enter Exam Hall
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Report Sheet Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1"
          >
            <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-accent/5 flex items-center justify-center text-accent mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-serif font-bold text-primary">Academic Report Card</CardTitle>
                  <CardDescription>View, print, and download your termly academic performance and assessment reports.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Award className="w-4 h-4 text-accent" />
                      <span>Latest: 1st Term Report Published</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <span>Official Digitally Signed Document</span>
                    </div>
                  </div>
                </CardContent>
              </div>
              <CardContent className="pt-0">
                <Link to="/student/report">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-primary font-bold py-6 px-12 text-xs font-bold uppercase tracking-[0.2em] rounded-none group">
                    View Report Sheet
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform text-primary" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-none">
            <CardHeader className="border-b border-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Academic Guidelines</CardTitle>
                <BookOpen className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Examination Rules</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-500 font-light">
                  <li>Ensure you have a stable internet connection before starting the exam.</li>
                  <li>Do not refresh the page or navigate away during the examination.</li>
                  <li>All questions are compulsory unless stated otherwise.</li>
                  <li>Your progress is automatically saved.</li>
                  <li>Results will be published by the administrator after the examination period.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-none">
            <CardHeader className="border-b border-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Notifications</CardTitle>
                <Bell className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {[
                { title: 'New Exam Scheduled', desc: 'Mathematics Mid-term exam is now active.', time: '1h ago' },
                { title: 'System Maintenance', desc: 'The CBT portal will undergo maintenance this weekend.', time: '3d ago' },
              ].map((note, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-1 h-auto bg-accent/20 group-hover:bg-accent transition-colors"></div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary">{note.title}</h4>
                    <p className="text-xs text-slate-500 font-light">{note.desc}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{note.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          <div className="flex items-center gap-3">
            <img src={LOGO_BASE64} alt="NDA Logo" className="w-8 h-8 object-contain"  />
            <span>NDA Staff Secondary School</span>
          </div>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
