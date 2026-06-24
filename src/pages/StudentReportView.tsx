import { LOGO_BASE64 } from "@/src/logoBase64";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Printer, Download, Loader2, 
  Award, User, Calendar, BookOpen, ShieldCheck,
  Smartphone, FileText, CheckCircle2, ChevronRight, Sparkles, BookCheck, ClipboardList,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import html2pdf from 'html2pdf.js';

interface Subject {
  name: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

interface StudentReportData {
  name: string;
  admissionNo: string;
  class: string;
  arm: string;
  term: string;
  session: string;
  gender: string;
  attendance: string;
  position: string;
  subjects: Subject[];
  teacherComment: string;
  principalComment: string;
}

export default function StudentReportView() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<StudentReportData | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'print' | 'phone'>('print');
  const [expandedSubjects, setExpandedSubjects] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const savedStudent = localStorage.getItem('student_session');
    if (!savedStudent) {
      navigate('/login');
      return;
    }
    const studentInfo = JSON.parse(savedStudent);
    setStudent(studentInfo);
    fetchReport(studentInfo);

    // Auto-detect mobile screen and default to phone view
    if (window.innerWidth < 1024) {
      setViewMode('phone');
    }
  }, [navigate]);

  const fetchReport = async (studentInfo: any) => {
    try {
      setLoading(true);
      const session = "2023/2024";
      const term = "1st Term";
      
      const scoresRef = collection(db, 'scores');
      const q = query(
        scoresRef, 
        where('studentId', '==', studentInfo.regNo),
        where('session', '==', session),
        where('term', '==', term)
      );
      
      const querySnapshot = await getDocs(q);
      const subjects: Subject[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        subjects.push({
          name: data.subject,
          ca: data.ca,
          exam: data.exam,
          total: data.total,
          grade: data.grade,
          remark: data.total >= 70 ? 'Excellent' : data.total >= 60 ? 'Very Good' : data.total >= 50 ? 'Credit' : 'Pass'
        });
      });

      if (subjects.length === 0) {
        // Fallback to mock if no scores found for demo
        setReportData({
          name: studentInfo.name,
          admissionNo: studentInfo.regNo,
          class: studentInfo.class.toUpperCase(),
          arm: 'A',
          term: term,
          session: session,
          gender: studentInfo.gender || 'Not Specified',
          attendance: '95/100',
          position: '4th',
          subjects: [
            { name: 'Mathematics', ca: 25, exam: 52, total: 77, grade: 'A', remark: 'Excellent' },
            { name: 'English Language', ca: 22, exam: 48, total: 70, grade: 'A', remark: 'Excellent' },
            { name: 'Basic Science', ca: 18, exam: 45, total: 63, grade: 'B', remark: 'Very Good' },
          ],
          teacherComment: 'An exceptional student with great potential.',
          principalComment: 'Keep up the good work.'
        });
      } else {
        setReportData({
          name: studentInfo.name,
          admissionNo: studentInfo.regNo,
          class: studentInfo.class.toUpperCase(),
          arm: 'A',
          term: term,
          session: session,
          gender: studentInfo.gender || 'Not Specified',
          attendance: '95/100',
          position: 'Calculating...',
          subjects: subjects,
          teacherComment: 'Performance based on recorded scores.',
          principalComment: 'Approved for release.'
        });
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    
    // Temporarily announce downloading
    const toastId = toast.loading("Generating your official PDF report sheet...");
    
    const opt = {
      margin: [0, 0, 0, 0] as [number, number, number, number],
      filename: `Report_Sheet_${student?.regNo || 'Student'}.pdf`,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0,
        onclone: (documentClone: Document) => {
          const previewContainer = documentClone.querySelector('.student-report-preview-container');
          if (previewContainer) {
            (previewContainer as HTMLElement).style.padding = '0';
            (previewContainer as HTMLElement).style.margin = '0';
            (previewContainer as HTMLElement).style.boxShadow = 'none';
          }
          const pages = documentClone.querySelectorAll('.report-sheet-page');
          pages.forEach((page: any) => {
            page.style.boxShadow = 'none';
            page.style.height = '296mm';
            page.style.minHeight = '296mm';
            page.style.maxHeight = '296mm';
            page.style.margin = '0';
          });
        }
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const, compress: true },
      pagebreak: { mode: 'css' as const, avoid: ['.report-sheet-page'] }
    };

    html2pdf().from(element).set(opt).save()
      .then(() => {
        toast.dismiss(toastId);
        toast.success("PDF report downloaded successfully!");
      })
      .catch((err: any) => {
        console.error(err);
        toast.dismiss(toastId);
        toast.error("Failed to generate PDF. Please try again.");
      });
  };

  const handlePrint = () => {
    try {
      toast.info("If the print dialog doesn't appear, please click the 'Open App in New Tab' icon at the top right of this preview panel.", { duration: 5000 });
      setTimeout(() => {
        window.focus();
        window.print();
      }, 500);
    } catch (e) {
      console.error("Print error:", e);
      toast.error("Could not open print dialog. Please try using the PDF download button instead.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preparing your report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  const totalScore = reportData.subjects.reduce((sum, sub) => sum + sub.total, 0);
  const avgScore = (totalScore / (reportData.subjects.length || 1)).toFixed(1);

  return (
    <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 student-report-preview-container">
      {/* Controls & Nav Header */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link to="/student/dashboard">
          <Button variant="ghost" className="text-slate-500 hover:text-primary pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* View Mode Switcher and Actions */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-none border border-slate-200">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setViewMode('print')}
              className={`rounded-none text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 h-8 px-3 ${
                viewMode === 'print' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              📄 A4 Print View
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setViewMode('phone')}
              className={`rounded-none text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 h-8 px-3 ${
                viewMode === 'phone' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              📱 Phone View
            </Button>
          </div>

          {/* Mobile view dropdown switcher */}
          <div className="sm:hidden relative inline-block text-left w-full max-w-[200px]">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'print' | 'phone')}
              className="w-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest h-9 px-3 rounded-none appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                backgroundSize: '12px'
              }}
            >
              <option value="print">📄 A4 Print View</option>
              <option value="phone">📱 Phone View</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="border-primary/20 text-primary rounded-none h-9 text-xs uppercase tracking-widest font-bold">
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print
            </Button>
            <Button onClick={handleDownload} className="bg-primary text-white rounded-none h-9 text-xs uppercase tracking-widest font-bold">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Screen Views */}
      <div className="print:block">
        <AnimatePresence mode="wait">
          {viewMode === 'print' ? (
            /* Standard A4 Print View (On-screen) */
            <div className="w-full overflow-x-auto pb-6 custom-scrollbar flex justify-start lg:justify-center">
              <motion.div 
                key="print-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto bg-white shadow-2xl flex flex-col p-12 border-[12px] border-double relative overflow-hidden print:shadow-none print:border-none print:p-0 shrink-0" 
                style={{ borderColor: '#2563eb', width: '210mm', height: '296mm', boxSizing: 'border-box', pageBreakInside: 'avoid' }}
              >
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <img src={LOGO_BASE64} alt="" className="w-[600px] h-[600px] object-contain grayscale"  />
              </div>

              {/* Header */}
              <div className="flex justify-between items-start border-b-4 pb-8 mb-10" style={{ borderColor: '#2563eb' }}>
                <div className="w-32">
                  <img src={LOGO_BASE64} alt="NDA Logo" className="w-28 h-28 object-contain"  />
                </div>
                <div className="flex-1 text-center px-8">
                  <h1 className="text-4xl font-serif font-black tracking-tighter text-red-600 mb-1">NDA Staff Secondary School</h1>
                  <p className="text-[11px] font-bold tracking-[0.2em] text-red-500/80 uppercase mb-0.5">Knowledge · Discipline · Excellence</p>
                  <p className="text-[11px] font-medium text-red-400 mb-4 italic">Nigerian Defence Academy, Kaduna State, Nigeria</p>
                  <div className="flex justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    <span>{reportData.session} Session</span>
                    <span className="w-1.5 h-1.5 bg-accent rounded-full self-center"></span>
                    <span>{reportData.term}</span>
                  </div>
                </div>
                <div className="w-32 flex justify-end">
                  <div className="w-20 h-24 border-2 p-0.5 shadow-md relative overflow-hidden flex items-center justify-center bg-white animate-fade-in" style={{ borderColor: '#2563eb' }}>
                    {student?.passportPhoto ? (
                      <img 
                        src={student.passportPhoto} 
                        alt="Student Passport" 
                        className="w-full h-full object-cover" 
                        style={{ imageRendering: 'pixelated' }} 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[8px] font-bold text-center uppercase tracking-tighter bg-slate-50 text-slate-400 gap-1">
                        <Award className="w-8 h-8 text-accent" />
                        <span>Official</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Info Grid */}
              <div className="grid grid-cols-3 gap-y-6 gap-x-12 mb-12 bg-slate-50/50 p-8 border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Student Name</p>
                  <p className="text-sm font-bold text-primary">{reportData.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Admission No</p>
                  <p className="text-sm font-bold text-primary">{reportData.admissionNo}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Gender</p>
                  <p className="text-sm font-bold text-primary">{reportData.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Class</p>
                  <p className="text-sm font-bold text-primary">{reportData.class} {reportData.arm}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Attendance</p>
                  <p className="text-sm font-bold text-primary">{reportData.attendance}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Position</p>
                  <p className="text-sm font-bold text-accent">{reportData.position}</p>
                </div>
              </div>

              {/* Scores Table */}
              <div className="mb-12">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest border border-primary">Subject</th>
                      <th className="p-4 text-center text-[10px] font-bold uppercase tracking-widest border border-primary">CA (40)</th>
                      <th className="p-4 text-center text-[10px] font-bold uppercase tracking-widest border border-primary">Exam (60)</th>
                      <th className="p-4 text-center text-[10px] font-bold uppercase tracking-widest border border-primary">Total (100)</th>
                      <th className="p-4 text-center text-[10px] font-bold uppercase tracking-widest border border-primary">Grade</th>
                      <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest border border-primary">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.subjects.map((sub, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                        <td className="p-4 text-sm font-bold text-primary border border-slate-200">{sub.name}</td>
                        <td className="p-4 text-center text-sm font-medium border border-slate-200">{sub.ca}</td>
                        <td className="p-4 text-center text-sm font-medium border border-slate-200">{sub.exam}</td>
                        <td className="p-4 text-center text-sm font-bold border border-slate-200" style={{ color: sub.total >= 50 ? '#2563eb' : '#ef4444' }}>{sub.total}</td>
                        <td className="p-4 text-center border border-slate-200">
                          <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black border border-primary/10">
                            {sub.grade}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium italic text-slate-500 border border-slate-200">{sub.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Comments Section */}
              <div className="grid grid-cols-2 gap-12 mb-16">
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 border-l-4 border-primary">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Form Teacher's Comment</p>
                    <p className="text-sm italic font-serif text-primary">"{reportData.teacherComment}"</p>
                  </div>
                  <div className="pt-8 border-t border-dashed border-slate-300">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Teacher's Signature</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 border-l-4 border-accent">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Principal's Comment</p>
                    <p className="text-sm italic font-serif text-primary">"{reportData.principalComment}"</p>
                  </div>
                  <div className="pt-8 border-t border-dashed border-slate-300">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Principal's Signature & Stamp</p>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex justify-between items-end pt-8 border-t-2 border-slate-100 mt-auto">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Generated on {new Date().toLocaleDateString()} | NDA Staff School Portal
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Official Digital Document</span>
                </div>
              </div>
            </motion.div>
          </div>
          ) : (
            /* Custom Responsive Phone View (Rendered inside smartphone preview on desktop, and full screen on mobile) */
            <motion.div 
              key="phone-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md mx-auto relative lg:my-8 print:hidden"
            >
              {/* Optional Outer iPhone frame styling for large screens */}
              <div className="lg:border-[14px] lg:border-slate-800 lg:rounded-[40px] lg:shadow-2xl lg:bg-slate-900 lg:overflow-hidden lg:relative lg:aspect-[9/19.5]">
                {/* Simulated iPhone Speaker and Camera bar */}
                <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50"></div>
                
                {/* Phone screen canvas */}
                <div className="bg-slate-50 min-h-[700px] lg:max-h-[820px] lg:overflow-y-auto custom-scrollbar flex flex-col pb-8">
                  {/* Custom Mobile Header banner */}
                  <div className="bg-gradient-to-b from-primary to-blue-900 text-white p-6 pb-8 relative rounded-b-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded-full p-1 flex items-center justify-center">
                          <img src={LOGO_BASE64} alt="NDA Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                          <h2 className="font-serif font-bold text-xs uppercase tracking-tight leading-none text-red-500">NDA STAFF SCHOOL</h2>
                          <p className="text-[8px] font-black tracking-widest text-accent uppercase leading-none mt-1">Terminal Report Card</p>
                        </div>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
                        Active
                      </span>
                    </div>

                    <div className="space-y-1.5 mt-6">
                      <h3 className="text-lg font-serif font-bold tracking-tight text-white leading-tight">{reportData.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        <span>{reportData.admissionNo}</span>
                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                        <span>{reportData.class} {reportData.arm}</span>
                      </div>
                    </div>
                  </div>

                  {/* High Level Metrics Grid */}
                  <div className="px-4 -mt-5">
                    <div className="bg-white p-4 shadow-md border border-slate-100 rounded-xl grid grid-cols-4 gap-2 text-center">
                      <div className="flex flex-col justify-between p-1.5 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Average</span>
                        <span className="text-sm font-serif font-black text-primary mt-1">{avgScore}%</span>
                      </div>
                      <div className="flex flex-col justify-between p-1.5 bg-amber-50/50 border border-amber-100 rounded-lg">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Position</span>
                        <span className="text-sm font-serif font-black text-amber-700 mt-1">{reportData.position}</span>
                      </div>
                      <div className="flex flex-col justify-between p-1.5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Presence</span>
                        <span className="text-xs font-serif font-black text-emerald-700 mt-1.5 leading-none">{reportData.attendance}</span>
                      </div>
                      <div className="flex flex-col justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Total</span>
                        <span className="text-sm font-serif font-black text-slate-700 mt-1">{totalScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subject List Cards */}
                  <div className="px-4 mt-6 space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Subject Breakdown</h4>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const allExpanded = Object.keys(expandedSubjects).length === reportData.subjects.length;
                            if (allExpanded) {
                              setExpandedSubjects({});
                            } else {
                              const next: Record<number, boolean> = {};
                              reportData.subjects.forEach((_, i) => { next[i] = true; });
                              setExpandedSubjects(next);
                            }
                          }}
                          className="h-6 text-[8px] font-black uppercase tracking-widest text-primary p-1 bg-slate-100 hover:bg-slate-200"
                        >
                          {Object.keys(expandedSubjects).length === reportData.subjects.length ? "Collapse All" : "Expand All"}
                        </Button>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{reportData.subjects.length} Subjects</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {reportData.subjects.map((sub, idx) => {
                        const isExpanded = !!expandedSubjects[idx];
                        return (
                          <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div 
                              onClick={() => setExpandedSubjects(prev => ({ ...prev, [idx]: !prev[idx] }))}
                              className="flex items-center justify-between cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-primary shrink-0" />}
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">{sub.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center justify-center w-6 h-6 font-serif font-bold text-[10px] rounded-full border ${
                                  sub.grade === 'A' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                  sub.grade === 'B' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                  sub.grade === 'C' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                  {sub.grade}
                                </span>
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden mt-3 pt-3 border-t border-slate-50"
                                >
                                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold mb-3">
                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                      <span className="text-[8px] text-slate-400 block mb-0.5">CA (40)</span>
                                      <span className="text-slate-700">{sub.ca}</span>
                                    </div>
                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                      <span className="text-[8px] text-slate-400 block mb-0.5">Exam (60)</span>
                                      <span className="text-slate-700">{sub.exam}</span>
                                    </div>
                                    <div className="p-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                                      <span className="text-[8px] text-blue-400 block mb-0.5">Total (100)</span>
                                      <span className="text-primary font-extrabold">{sub.total}</span>
                                    </div>
                                  </div>

                                  <div className="text-[10px] italic text-slate-400 flex items-center justify-between">
                                    <span>Remarks:</span>
                                    <span className="font-bold text-slate-600 not-italic uppercase tracking-widest text-[8px]">{sub.remark}</span>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Staff Assessments / Comments */}
                  <div className="px-4 mt-6 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Remarks & Approvals</h4>

                    {/* Teacher Card */}
                    <div className="bg-white border-l-4 border-primary rounded-r-xl p-4 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-2">
                        <BookCheck className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Class Teacher's Comment</span>
                      </div>
                      <p className="text-xs italic text-slate-600 leading-relaxed font-serif">"{reportData.teacherComment}"</p>
                      <div className="mt-3 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Signature: Signed</span>
                        <span>Official</span>
                      </div>
                    </div>

                    {/* Principal Card */}
                    <div className="bg-white border-l-4 border-accent rounded-r-xl p-4 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Award className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-accent">Principal's Verdict</span>
                      </div>
                      <p className="text-xs italic text-slate-600 leading-relaxed font-serif">"{reportData.principalComment}"</p>
                      <div className="mt-3 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Seal: Approved & Stamped</span>
                        <span>NDA STAFF SCHOOL</span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Footer */}
                  <div className="px-4 mt-8 text-center text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400 space-y-2">
                    <div className="flex items-center justify-center gap-1 text-emerald-600 bg-emerald-50 py-2 rounded-lg border border-emerald-100">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Official Digitally Signed Document</span>
                    </div>
                    <p>© {new Date().getFullYear()} NDA STAFF SECONDARY SCHOOL</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
        This is our dedicated, absolute hidden offscreen DOM node that ALWAYS renders the 
        traditional double-bordered A4 high-fidelity paper layout.
        When downloading a PDF or Triggering a Native print, we pull directly from this ref.
        This resolves the critical issue where mobile viewports would export a squeezed, mobile-scaled PDF!
      */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <div ref={reportRef} className="report-sheet-page bg-white flex flex-col p-12 border-[12px] border-double relative overflow-hidden" style={{ borderColor: '#2563eb', width: '210mm', height: '296mm', boxSizing: 'border-box' }}>
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <img src={LOGO_BASE64} alt="" className="w-[600px] h-[600px] object-contain grayscale"  />
          </div>

          {/* Header */}
          <div className="flex justify-between items-start border-b-4 pb-8 mb-10" style={{ borderColor: '#2563eb' }}>
            <div className="w-32">
              <img src={LOGO_BASE64} alt="NDA Logo" className="w-28 h-28 object-contain"  />
            </div>
            <div className="flex-1 text-center px-8">
              <h1 className="text-4xl font-serif font-black tracking-tighter text-red-600 mb-1">NDA Staff Secondary School</h1>
              <p className="text-[11px] font-bold tracking-[0.2em] text-red-500/80 uppercase mb-0.5">Knowledge · Discipline · Excellence</p>
              <p className="text-[11px] font-medium text-red-400 mb-4 italic">Nigerian Defence Academy, Kaduna State, Nigeria</p>
              <div className="flex justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <span>{reportData.session} Session</span>
                <span className="w-1.5 h-1.5 bg-accent rounded-full self-center"></span>
                <span>{reportData.term}</span>
              </div>
            </div>
            <div className="w-32 flex justify-end">
              <div className="w-20 h-24 border-2 p-0.5 shadow-md relative overflow-hidden flex items-center justify-center bg-white" style={{ borderColor: '#2563eb' }}>
                {student?.passportPhoto ? (
                  <img 
                    src={student.passportPhoto} 
                    alt="Student Passport" 
                    className="w-full h-full object-cover" 
                    style={{ imageRendering: 'pixelated' }} 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[8px] font-bold text-center uppercase tracking-tighter bg-slate-50 text-slate-400 gap-1">
                    <Award className="w-8 h-8 text-accent" />
                    <span>Official</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-3 gap-y-6 gap-x-12 mb-12 bg-slate-50/50 p-8 border border-slate-100">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Student Name</p>
              <p className="text-sm font-bold text-primary">{reportData.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Admission No</p>
              <p className="text-sm font-bold text-primary">{reportData.admissionNo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Gender</p>
              <p className="text-sm font-bold text-primary">{reportData.gender}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Class</p>
              <p className="text-sm font-bold text-primary">{reportData.class} {reportData.arm}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Attendance</p>
              <p className="text-sm font-bold text-primary">{reportData.attendance}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Position</p>
              <p className="text-sm font-bold text-accent">{reportData.position}</p>
            </div>
          </div>

          {/* Scores Table */}
          <div className="mb-12">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest border border-primary">Subject</th>
                  <th className="p-4 text-center text-[10px] font-bold uppercase tracking-widest border border-primary">CA (40)</th>
                  <th className="p-4 text-center text-[10px] font-bold uppercase tracking-widest border border-primary">Exam (60)</th>
                  <th className="p-4 text-center text-[10px] font-bold uppercase tracking-widest border border-primary">Total (100)</th>
                  <th className="p-4 text-center text-[10px] font-bold uppercase tracking-widest border border-primary">Grade</th>
                  <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest border border-primary">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {reportData.subjects.map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                    <td className="p-4 text-sm font-bold text-primary border border-slate-200">{sub.name}</td>
                    <td className="p-4 text-center text-sm font-medium border border-slate-200">{sub.ca}</td>
                    <td className="p-4 text-center text-sm font-medium border border-slate-200">{sub.exam}</td>
                    <td className="p-4 text-center text-sm font-bold border border-slate-200" style={{ color: sub.total >= 50 ? '#2563eb' : '#ef4444' }}>{sub.total}</td>
                    <td className="p-4 text-center border border-slate-200">
                      <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black border border-primary/10">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium italic text-slate-500 border border-slate-200">{sub.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comments Section */}
          <div className="grid grid-cols-2 gap-12 mb-16">
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 border-l-4 border-primary">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Form Teacher's Comment</p>
                <p className="text-sm italic font-serif text-primary">"{reportData.teacherComment}"</p>
              </div>
              <div className="pt-8 border-t border-dashed border-slate-300">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Teacher's Signature</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 border-l-4 border-accent">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Principal's Comment</p>
                <p className="text-sm italic font-serif text-primary">"{reportData.principalComment}"</p>
              </div>
              <div className="pt-8 border-t border-dashed border-slate-300">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Principal's Signature & Stamp</p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex justify-between items-end pt-8 border-t-2 border-slate-100 mt-auto">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Generated on {new Date().toLocaleDateString()} | NDA Staff School Portal
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Official Digital Document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
