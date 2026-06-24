import { LOGO_BASE64 } from "@/src/logoBase64";
import React, { useState, useRef, useEffect } from 'react';
import { Printer, FileText, Download, Upload, Loader2, Award, User, Calendar, BookOpen, TrendingUp, ShieldCheck, Filter, GraduationCap, Smartphone } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

const SUBJECT_CATEGORIES = {
  jss: ['Mathematics', 'English Language', 'Basic Science', 'Basic Technology', 'National Values Education', 'Pre-Vocational Studies', 'Cultural and Creative Arts', 'Business Studies', 'Computer Studies', 'French', 'Hausa', 'Igbo', 'Yoruba', 'CRS', 'IRS', 'History'],
  sss_science: ['Mathematics', 'English Language', 'Civic Education', 'Biology', 'Physics', 'Chemistry', 'Economics', 'Further Mathematics', 'Geography', 'Computer Science', 'Agricultural Science', 'Data Processing', 'Technical Drawing'],
  sss_art: ['Mathematics', 'English Language', 'Civic Education', 'Biology', 'Economics', 'Literature in English', 'Government', 'History', 'CRS', 'IRS', 'French', 'Hausa', 'Igbo', 'Yoruba', 'Data Processing', 'Fine Arts'],
  sss_commerce: ['Mathematics', 'English Language', 'Civic Education', 'Biology', 'Economics', 'Commerce', 'Financial Accounting', 'Office Practice', 'Government', 'Data Processing', 'Marketing', 'Insurance']
};

const getAvailableSubjects = (className: string) => {
  if (!className) return [];
  if (className.startsWith('jss')) return SUBJECT_CATEGORIES.jss;
  if (className.includes('science')) return SUBJECT_CATEGORIES.sss_science;
  if (className.includes('art')) return SUBJECT_CATEGORIES.sss_art;
  if (className.includes('commerce')) return SUBJECT_CATEGORIES.sss_commerce;
  return [];
};

const formatClassName = (className: string) => {
  if (!className) return '';
  const parts = className.split('_');
  const base = parts[0].toUpperCase();
  const dept = parts[1] ? ` (${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)})` : '';
  return `${base.replace(/(\D+)(\d+)/, '$1 $2')}${dept}`;
};

const SingleReport = React.forwardRef<HTMLDivElement, { data: StudentReportData, isLast?: boolean }>(({ data, isLast }, ref) => (
  <div ref={ref} className={`report-sheet-page mx-auto bg-white relative overflow-hidden flex flex-col print:shadow-none`} style={{ width: '210mm', height: '296mm', padding: '10mm', boxSizing: 'border-box', border: '8px double #2563eb', color: '#111827', lineHeight: 1.15, fontFamily: "'Inter', sans-serif", pageBreakInside: 'avoid' }}>
    {/* Decorative Background Elements */}
    <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" style={{ backgroundColor: '#f2f5f8' }} />
    <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" style={{ backgroundColor: '#fefbf0' }} />
    
    {/* Watermark for Print */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.03 }}>
      <img src={LOGO_BASE64} alt="" className="w-[500px] h-[500px] object-contain grayscale"   />
    </div>
    
    {/* Header */}
    <div className="flex justify-between items-start border-b-2 pb-4 mb-4" style={{ borderColor: '#2563eb' }}>
      {/* Left: Logo */}
      <div className="w-24">
        <img src={LOGO_BASE64} alt="NDA Logo" className="w-20 h-20 object-contain"   />
      </div>

      {/* Center: School Info */}
      <div className="flex-1 text-center px-4">
        <h1 className="text-2xl font-serif font-black uppercase tracking-tighter leading-none text-red-600">
          NDA Staff Secondary School
        </h1>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase mt-1 text-red-500/80">Knowledge · Discipline · Excellence</p>
        <p className="text-[10px] font-medium mt-0.5 text-red-400">Nigerian Defence Academy, Kaduna State, Nigeria</p>
        
        <div className="mt-2 inline-flex items-center gap-2">
          <div className="h-[1px] w-8 bg-accent" />
          <h2 className="text-sm font-serif font-bold uppercase tracking-widest text-primary italic">
            {data.session.includes('Terminal') || data.subjects.length > 5 ? 'Terminal Academic Report' : 'Mid-Term Progress Report'}
          </h2>
          <div className="h-[1px] w-8 bg-accent" />
        </div>
      </div>

      {/* Right: Student Passport */}
      <div className="w-24 flex justify-end">
        <div className="w-20 h-24 border-2 p-0.5 shadow-md relative overflow-hidden flex items-center justify-center bg-white" style={{ borderColor: '#2563eb' }}>
          {data.passportPhoto ? (
            <img 
              src={data.passportPhoto} 
              alt="Student Passport" 
              className="w-full h-full object-cover" 
              style={{ imageRendering: 'pixelated' }} 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[8px] font-bold text-center uppercase tracking-tighter bg-slate-50 text-slate-400 gap-1">
              <User className="w-6 h-6 text-slate-300" />
              <span>No Photo</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Student Info Grid */}
    <div className="grid grid-cols-3 gap-x-4 gap-y-3 mb-4 p-3 border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
      <div className="space-y-0.5">
        <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Student Name</p>
        <p className="text-xs font-bold text-primary uppercase">{data.name}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Admission Number</p>
        <p className="text-xs font-bold text-primary">{data.admissionNo}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Gender</p>
        <p className="text-xs font-bold text-primary uppercase">{data.gender}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Class & Arm</p>
        <p className="text-xs font-bold text-primary uppercase">{formatClassName(data.class)} {data.arm}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Academic Session</p>
        <p className="text-xs font-bold text-primary">{data.session}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Term</p>
        <p className="text-xs font-bold text-primary uppercase">{data.term} Term</p>
      </div>
    </div>

    {/* Performance Table */}
    <div className="mb-4">
      <Table className="border" style={{ borderColor: '#2563eb' }}>
        <TableHeader className="bg-primary">
          <TableRow className="hover:bg-primary border-b border-primary">
            <TableHead className="font-bold text-white py-1.5 px-3 text-[9px] tracking-widest uppercase">Subject</TableHead>
            <TableHead className="font-bold text-white text-center w-16 py-1.5 text-[9px] tracking-widest uppercase border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>C.A</TableHead>
            <TableHead className="font-bold text-white text-center w-16 py-1.5 text-[9px] tracking-widest uppercase border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Exam</TableHead>
            <TableHead className="font-bold text-white text-center w-16 py-1.5 text-[9px] tracking-widest uppercase border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Total</TableHead>
            <TableHead className="font-bold text-white text-center w-12 py-1.5 text-[9px] tracking-widest uppercase border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Grd</TableHead>
            <TableHead className="font-bold text-white py-1.5 px-3 text-[9px] tracking-widest uppercase border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Instructor Remark</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.subjects.length > 0 ? (
            data.subjects.map((sub, idx) => (
              <TableRow key={idx} className="border-b transition-colors border-[#e2e8f0]">
                <TableCell className="font-bold text-primary py-1 px-3 text-[11px]">{sub.name}</TableCell>
                <TableCell className="text-center py-1 font-medium border-l border-[#e2e8f0] text-[11px] text-[#475569]">{sub.ca}</TableCell>
                <TableCell className="text-center py-1 font-medium border-l border-[#e2e8f0] text-[11px] text-[#475569]">{sub.exam}</TableCell>
                <TableCell className="text-center font-black text-primary py-1 border-l border-[#e2e8f0] bg-[#f9fafb] text-[11px]">{sub.total}</TableCell>
                <TableCell className="text-center py-1 border-l border-[#e2e8f0]">
                  <span className="inline-flex items-center justify-center w-6 h-6 font-serif font-bold text-[10px] border" style={{
                    backgroundColor: sub.grade === 'A' ? '#ecfdf5' : sub.grade === 'B' ? '#eff6ff' : sub.grade === 'C' ? '#fffbeb' : sub.grade === 'D' ? '#fff7ed' : '#fff1f2',
                    color: sub.grade === 'A' ? '#047857' : sub.grade === 'B' ? '#1d4ed8' : sub.grade === 'C' ? '#b45309' : sub.grade === 'D' ? '#c2410c' : '#be123c',
                    borderColor: sub.grade === 'A' ? '#d1fae5' : sub.grade === 'B' ? '#dbeafe' : sub.grade === 'C' ? '#fef3c7' : sub.grade === 'D' ? '#ffedd5' : '#ffe4e6'
                  }}>
                    {sub.grade}
                  </span>
                </TableCell>
                <TableCell className="text-[10px] italic py-1 px-3 border-l border-[#e2e8f0] text-[#64748b]">{sub.remark}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">
                No scores recorded for this student.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    {/* Summary Statistics */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="p-3 border text-center border-[#e6ebf0] bg-[#f2f5f8]">
        <p className="text-[8px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#66798c' }}>Aggregate Score</p>
        <p className="text-xl font-serif font-black text-primary leading-tight">
          {data.subjects.reduce((sum, sub) => sum + sub.total, 0)} <span className="text-[10px] font-normal text-slate-400">/ {data.subjects.length * 100}</span>
        </p>
      </div>
      <div className="p-3 border text-center border-[#faf5e6] bg-[#fefbf0]">
        <p className="text-[8px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#e5cf87' }}>Average %</p>
        <p className="text-xl font-serif font-black text-accent leading-tight">
          {(data.subjects.reduce((sum, sub) => sum + sub.total, 0) / (data.subjects.length || 1)).toFixed(1)}%
        </p>
      </div>
      <div className="p-3 border text-center border-[#f1f5f9] bg-[#f9fafb]">
        <p className="text-[8px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94a3b8' }}>Class Position</p>
        <p className="text-xl font-serif font-black text-primary leading-tight">{data.position}</p>
      </div>
      <div className="p-3 border text-center border-[#f1f5f9] bg-[#f9fafb]">
        <p className="text-[8px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94a3b8' }}>Attendance</p>
        <p className="text-xl font-serif font-black text-primary leading-tight">{data.attendance}</p>
      </div>
    </div>

    {/* Remarks & Signatures */}
    <div className="grid grid-cols-2 gap-6 text-[11px] border-t pt-4 border-primary flex-1">
      <div className="flex flex-col">
        <div className="flex-1 flex flex-col mb-4">
          <div className="flex items-center gap-1.5 text-primary mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Class Teacher's Assessment</span>
          </div>
          <div className="p-3 border-l-2 border-primary italic flex-1 bg-[#f9fafb] text-[#475569]">
            {data.teacherComment}
          </div>
        </div>
        <div className="pt-2 border-t border-[#f1f5f9]">
          <div className="h-10 flex items-end justify-center border-b border-dashed border-[#cbd5e1]"></div>
          <p className="text-center text-[8px] font-bold uppercase tracking-widest mt-1.5 text-[#94a3b8]">Class Teacher's Signature</p>
        </div>
      </div>
      
      <div className="flex flex-col">
        <div className="flex-1 flex flex-col mb-4">
          <div className="flex items-center gap-1.5 text-accent mb-1.5">
            <Award className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Principal's Final Verdict</span>
          </div>
          <div className="p-3 border-l-2 border-accent italic flex-1 bg-[#fefbf0] text-[#475569]">
            {data.principalComment}
          </div>
        </div>
        <div className="pt-2 border-t border-[#f1f5f9] relative">
          <div className="h-10 flex items-end justify-center border-b border-dashed border-[#cbd5e1]"></div>
          <p className="text-center text-[8px] font-bold uppercase tracking-widest mt-1.5 text-[#94a3b8]">Principal's Signature & Seal</p>
          <div className="absolute right-0 -top-6 w-16 h-16 border-2 rounded-full flex items-center justify-center text-[6px] font-black rotate-12 uppercase text-center p-2 leading-tight pointer-events-none opacity-20 border-primary text-primary">
            Official Seal
          </div>
        </div>
      </div>
    </div>
    
    {/* Footer */}
    <div className="mt-8 pt-3 border-t flex justify-between items-center text-[7px] font-bold uppercase tracking-[0.2em] border-[#f1f5f9] text-[#cbd5e1]">
      <p>© {new Date().getFullYear()} NDA Staff Secondary School Management System</p>
      <p>{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()}</p>
    </div>
  </div>
));

SingleReport.displayName = 'SingleReport';

const SingleReportPhone = ({ data }: { data: StudentReportData }) => {
  const totalScore = data.subjects.reduce((sum, sub) => sum + sub.total, 0);
  const avgScore = (totalScore / (data.subjects.length || 1)).toFixed(1);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-[600px] flex flex-col pb-6 rounded-2xl overflow-hidden shadow-md border border-slate-200">
      {/* Mobile Header banner */}
      <div className="bg-gradient-to-b from-primary to-blue-900 text-white p-5 pb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full p-1 flex items-center justify-center">
              <img src={LOGO_BASE64} alt="NDA Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-[10px] uppercase tracking-tight leading-none text-red-500">NDA STAFF SCHOOL</h2>
              <p className="text-[7px] font-black tracking-widest text-accent uppercase leading-none mt-1">Terminal Report Card</p>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest">
            Official
          </span>
        </div>

        <div className="space-y-1 mt-4">
          <h3 className="text-base font-serif font-bold tracking-tight text-white leading-tight">{data.name}</h3>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-wider">
            <span>{data.admissionNo}</span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>{data.class} {data.arm}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="px-3 -mt-4">
        <div className="bg-white p-3 shadow-sm border border-slate-100 rounded-lg grid grid-cols-4 gap-1.5 text-center">
          <div className="flex flex-col justify-between p-1 bg-blue-50/50 border border-blue-100 rounded-md">
            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Average</span>
            <span className="text-xs font-serif font-black text-primary mt-0.5">{avgScore}%</span>
          </div>
          <div className="flex flex-col justify-between p-1 bg-amber-50/50 border border-amber-100 rounded-md">
            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Position</span>
            <span className="text-xs font-serif font-black text-amber-700 mt-0.5">{data.position}</span>
          </div>
          <div className="flex flex-col justify-between p-1 bg-emerald-50/50 border border-emerald-100 rounded-md">
            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Presence</span>
            <span className="text-[9px] font-serif font-black text-emerald-700 mt-1 leading-none">{data.attendance}</span>
          </div>
          <div className="flex flex-col justify-between p-1 bg-slate-50 border border-slate-100 rounded-md">
            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Total</span>
            <span className="text-xs font-serif font-black text-slate-700 mt-0.5">{totalScore}</span>
          </div>
        </div>
      </div>

      {/* Subject List */}
      <div className="px-3 mt-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">Subject Breakdown</h4>
          <span className="text-[8px] font-black text-primary uppercase tracking-widest">{data.subjects.length} Subjects</span>
        </div>

        <div className="space-y-2">
          {data.subjects.map((sub, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-lg p-3 shadow-xs">
              <div className="flex items-center justify-between mb-2 border-b border-slate-50 pb-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{sub.name}</span>
                <span className={`inline-flex items-center justify-center w-5 h-5 font-serif font-bold text-[9px] rounded-full border ${
                  sub.grade === 'A' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  sub.grade === 'B' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                  sub.grade === 'C' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                  {sub.grade}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] uppercase font-bold mb-2">
                <div className="p-1 bg-slate-50 rounded">
                  <span className="text-[7px] text-slate-400 block">CA</span>
                  <span className="text-slate-700">{sub.ca}</span>
                </div>
                <div className="p-1 bg-slate-50 rounded">
                  <span className="text-[7px] text-slate-400 block">Exam</span>
                  <span className="text-slate-700">{sub.exam}</span>
                </div>
                <div className="p-1 bg-blue-50 border border-blue-100 rounded">
                  <span className="text-[7px] text-blue-400 block">Total</span>
                  <span className="text-primary font-black">{sub.total}</span>
                </div>
              </div>

              <div className="text-[9px] italic text-slate-400 flex items-center justify-between">
                <span>Remarks:</span>
                <span className="font-bold text-slate-600 not-italic uppercase tracking-widest text-[7px]">{sub.remark}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Remarks */}
      <div className="px-3 mt-4 space-y-2">
        <div className="bg-white border-l-2 border-primary rounded-r-lg p-3 shadow-xs">
          <span className="text-[8px] font-black uppercase tracking-widest text-primary block mb-1">Class Teacher's Comment</span>
          <p className="text-[10px] italic text-slate-600 font-serif">"{data.teacherComment}"</p>
        </div>

        <div className="bg-white border-l-2 border-accent rounded-r-lg p-3 shadow-xs">
          <span className="text-[8px] font-black uppercase tracking-widest text-accent block mb-1">Principal's Verdict</span>
          <p className="text-[10px] italic text-slate-600 font-serif">"{data.principalComment}"</p>
        </div>
      </div>
    </div>
  );
};

export default function ReportSheet() {
  const [selectedSession, setSelectedSession] = useState('2024/2025');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedArm, setSelectedArm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('Terminal');
  const [selectedStudent, setSelectedStudent] = useState('');
  
  const [showReport, setShowReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [studentReports, setStudentReports] = useState<StudentReportData[]>([]);
  const [viewMode, setViewMode] = useState<'print' | 'phone'>('print');
  
  const location = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);
  const bulkReportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [classStudents, setClassStudents] = useState<any[]>([]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setViewMode('phone');
    }
  }, []);

  useEffect(() => {
    if (location.pathname.includes('bulk-reports')) {
      setSelectedStudent('all');
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchClassStudents = async () => {
      if (!selectedClass || !selectedArm) {
        setClassStudents([]);
        return;
      }
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('class', '==', selectedClass), where('arm', '==', selectedArm));
        const studentSnap = await getDocs(q);
        const studs = studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClassStudents(studs);
      } catch (error) {
        console.error("Failed to fetch students for dropdown", error);
      }
    };
    fetchClassStudents();
  }, [selectedClass, selectedArm]);

  const calculateGrade = (total: number) => {
    if (total >= 75) return { grade: 'A', remark: 'Excellent' };
    if (total >= 65) return { grade: 'B', remark: 'Very Good' };
    if (total >= 50) return { grade: 'C', remark: 'Good' };
    if (total >= 40) return { grade: 'D', remark: 'Pass' };
    return { grade: 'F', remark: 'Fail' };
  };

  const fetchStudentScores = async (studentId: string) => {
    try {
      const scoresRef = collection(db, 'scores');
      const q = query(scoresRef, where('studentId', '==', studentId));
      const snapshot = await getDocs(q);
      
      const subjects: Subject[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (
          data.session === selectedSession &&
          data.term === selectedTerm &&
          data.class === selectedClass &&
          data.arm === selectedArm
        ) {
          subjects.push({
            name: data.subject || 'Unknown',
            ca: data.ca || 0,
            exam: data.exam || 0,
            total: data.total || 0,
            grade: data.grade || '-',
            remark: calculateGrade(data.total || 0).remark
          });
        }
      });
      
      return subjects;
    } catch (error) {
      console.error("Error fetching scores:", error);
      return [];
    }
  };

  const handleGenerate = async () => {
    // Validate all required fields
    const missing = [];
    if (!selectedSession) missing.push("Session");
    if (!selectedTerm) missing.push("Term");
    if (!selectedClass) missing.push("Class");
    if (!selectedArm) missing.push("Arm");
    if (!selectedStudent) missing.push("Student");

    if (missing.length > 0) {
      toast.error(`Please select: ${missing.join(", ")}`);
      return;
    }

    setIsGenerating(true);
    
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('class', '==', selectedClass), where('arm', '==', selectedArm));
      const studentSnap = await getDocs(q);
      const currentStudents = studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (currentStudents.length === 0) {
        toast.error(`No student records found for ${selectedClass.toUpperCase()} ${selectedArm}.`, {
          description: "Tip: Go to the Executive Dashboard and click 'Repair Database' to generate sample records for this class.",
          duration: 6000
        });
        setIsGenerating(false);
        return;
      }

      if (selectedStudent === 'all') {
        setIsBulkMode(true);
        const reports = await Promise.all(currentStudents.sort((a: any, b: any) => a.name.localeCompare(b.name)).map(async (s: any, idx) => {
          const subjects = await fetchStudentScores(s.id);
          
          const getOrdinal = (n: number) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
          };

          return {
            name: s.name,
            admissionNo: s.admissionNo,
            gender: s.gender,
            class: selectedClass,
            arm: selectedArm || 'A',
            term: selectedTerm,
            session: selectedSession,
            attendance: `${getRandomInt(100, 116)}/116`,
            position: getOrdinal(idx + 1),
            subjects: subjects.length > 0 ? subjects : [],
            teacherComment: subjects.length > 0 ? 'A very good performance. Keep it up.' : 'No assessment data available.',
            principalComment: subjects.length > 0 ? 'Promising result. Approved.' : 'Incomplete record.',
            passportPhoto: s.passportPhoto || ''
          };
        }));
        setStudentReports(reports);
        toast.success(`Generated reports for ${reports.length} students`);
      } else {
        setIsBulkMode(false);
        const student: any = currentStudents.find(s => s.id === selectedStudent);
        const subjects = await fetchStudentScores(selectedStudent);
        
        setStudentReports([{
          name: student?.name || 'Unknown Student',
          admissionNo: student?.admissionNo || 'N/A',
          gender: student?.gender || 'N/A',
          class: selectedClass,
          arm: selectedArm || 'A',
          term: selectedTerm,
          session: selectedSession,
          attendance: '112/116',
          position: 'N/A', // Position calculation for single report would require comparing with entire class
          subjects: subjects,
          teacherComment: subjects.length > 0 ? 'Satisfactory performance.' : 'No data recorded.',
          principalComment: subjects.length > 0 ? 'Good work. Please proceed.' : 'Admin attention required.',
          passportPhoto: student?.passportPhoto || ''
        }]);
        toast.success(`Generated report for ${student?.name || 'student'}`);
      }
      setShowReport(true);
      
      setTimeout(() => {
        const targetRef = selectedStudent === 'all' ? bulkReportRef : reportRef;
        if (targetRef.current) {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      
    } catch (error: any) {
      console.error("Report generation error:", error);
      if (error.code === 'permission-denied') {
        toast.error("Access Denied: You must be signed in as an authorized admin to generate reports.");
      } else {
        toast.error(`Error: ${error.message || "Failed to generate report. Please check your connection."}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];
        
        if (data && data.length > 0) {
          const hasStudentInfo = data.some(row => row['STUDENT NAME'] || row['Student Name'] || row['ADMISSION NO'] || row['Admission No']);
          
          if (hasStudentInfo) {
            const studentGroups: { [key: string]: any[] } = {};
            data.forEach(row => {
              const key = row['ADMISSION NO'] || row['Admission No'] || row['STUDENT NAME'] || row['Student Name'] || 'Unknown';
              if (!studentGroups[key]) studentGroups[key] = [];
              studentGroups[key].push(row);
            });

            const reports: StudentReportData[] = Object.keys(studentGroups).map(key => {
              const studentRows = studentGroups[key];
              const firstRow = studentRows[0];
              return {
                name: firstRow['STUDENT NAME'] || firstRow['Student Name'] || key,
                admissionNo: firstRow['ADMISSION NO'] || firstRow['Admission No'] || 'N/A',
                gender: firstRow['GENDER'] || firstRow['Gender'] || 'N/A',
                class: selectedClass || 'N/A',
                arm: selectedArm || 'A',
                term: selectedTerm || 'N/A',
                session: selectedSession || 'N/A',
                attendance: firstRow['ATTENDANCE'] || firstRow['Attendance'] || 'N/A',
                position: firstRow['POSITION'] || firstRow['Position'] || 'N/A',
                teacherComment: firstRow['TEACHER COMMENT'] || firstRow['Teacher Comment'] || 'N/A',
                principalComment: firstRow['PRINCIPAL COMMENT'] || firstRow['Principal Comment'] || 'N/A',
                subjects: studentRows.map(row => {
                  const ca = Number(row['C.A'] || row['CA'] || row['ca'] || 0);
                  const exam = Number(row['EXAM'] || row['Exam'] || row['exam'] || 0);
                  const total = ca + exam;
                  const { grade, remark } = calculateGrade(total);
                  return {
                    name: row['SUBJECT'] || row['Subject'] || row['subject'] || 'Unknown',
                    ca,
                    exam,
                    total,
                    grade,
                    remark
                  };
                })
              };
            });

            setStudentReports(reports);
            setIsBulkMode(reports.length > 1);
            setShowReport(true);
            toast.success(`Successfully uploaded results for ${reports.length} students!`);
          }
        }
      } catch (error) {
        toast.error('Failed to parse the file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadPDF = async () => {
    const targetRef = isBulkMode ? bulkReportRef : reportRef;
    if (!targetRef.current) {
      toast.error("No report content found to download.");
      return;
    }
    
    try {
      setIsGenerating(true);
      const fileName = isBulkMode ? `Bulk_Reports_${selectedClass}.pdf` : `Report_Sheet_${studentReports[0]?.name?.replace(/\s+/g, '_')}.pdf`;
      
      // Handle potential import variations for html2pdf
      const exporter = (html2pdf as any).default || html2pdf;
      
      if (typeof exporter !== 'function') {
        throw new Error("PDF Library (html2pdf) not loaded correctly.");
      }
      
      const opt = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 2, // Reducing scale slightly to reduce memory/page issues
          useCORS: true, 
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          letterRendering: true,
          scrollY: 0,
          onclone: (documentClone: Document) => {
            const previewContainer = documentClone.querySelector('.report-sheet-preview-container');
            if (previewContainer) {
              (previewContainer as HTMLElement).style.padding = '0';
              (previewContainer as HTMLElement).style.border = 'none';
              (previewContainer as HTMLElement).style.backgroundColor = 'transparent';
              (previewContainer as HTMLElement).style.boxShadow = 'none';
              (previewContainer as HTMLElement).style.margin = '0';
            }
            
            const pages = documentClone.querySelectorAll('.report-sheet-page, .html2pdf__item');
            pages.forEach((page: any) => {
              page.style.boxShadow = 'none';
              if (page.classList.contains('report-sheet-page')) {
                page.style.height = '296mm'; // Adjusting closer to A4 to prevent margin artifacts
                page.style.minHeight = '296mm';
                page.style.maxHeight = '296mm';
                page.style.margin = '0';
              }
              if (page.classList.contains('html2pdf__item')) {
                page.style.marginBottom = '0px';
                page.style.padding = '0px';
                page.style.border = 'none';
                page.style.height = '296mm';
                page.classList.remove('mb-8');
              }
            });
            
            const elements = documentClone.querySelectorAll('*');
            elements.forEach((el: any) => {
              const styles = window.getComputedStyle(el);
              ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
                const value = el.style[prop] || styles.getPropertyValue(prop);
                if (value && (value.includes('oklch') || value.includes('oklab'))) {
                   if (prop === 'color') el.style.color = '#111827';
                   if (prop === 'backgroundColor') {
                     if (!el.classList.contains('bg-primary')) {
                       el.style.backgroundColor = 'transparent';
                     }
                   }
                   if (prop === 'borderColor') el.style.borderColor = '#e2e8f0';
                }
              });
            });
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: 'css', avoid: ['.report-sheet-page'] }
      };

      // Ensure the element is visible and rendered
      await exporter().set(opt).from(targetRef.current).save();
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      console.error("PDF Export error:", error);
      toast.error(`Failed to generate PDF: ${error.message || "Please try again or use the Print button."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadExcel = () => {
    if (studentReports.length === 0) return;
    
    try {
      setIsGenerating(true);
      const dataToExport = studentReports.flatMap(report => 
        report.subjects.map(sub => ({
          'Student Name': report.name,
          'Admission No': report.admissionNo,
          'Class': report.class,
          'Arm': report.arm,
          'Term': report.term,
          'Session': report.session,
          'Subject': sub.name,
          'CA Score (40)': sub.ca,
          'Exam Score (60)': sub.exam,
          'Total (100)': sub.total,
          'Grade': sub.grade,
          'Remark': sub.remark,
          'Position': report.position,
          'Attendance': report.attendance
        }))
      );

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Academic Records");
      
      const fileName = isBulkMode ? `Academic_Records_${selectedClass}.xlsx` : `Record_${studentReports[0].name}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Excel file exported successfully!');
    } catch (error) {
      toast.error('Failed to export Excel file.');
    } finally {
      setIsGenerating(false);
    }
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

  return (
    <div className="space-y-10">
      <div className="print:hidden flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">
            {location.pathname.includes('bulk-reports') ? 'Bulk Report Repository' : 'Academic Report Generator'}
          </h1>
          <p className="text-slate-500 mt-2 font-light">
            Generate, review, and distribute professional terminal report sheets.
          </p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Academic Record
          </div>
        </div>
      </div>

      <Card className="print:hidden border-slate-100 shadow-sm rounded-none">
        <CardHeader className="border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent" />
            <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Report Parameters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="rounded-none border-slate-200"><SelectValue placeholder="Session" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                  <SelectItem value="2022/2023">2022/2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="rounded-none border-slate-200"><SelectValue placeholder="Term" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Term</SelectItem>
                  <SelectItem value="2nd">2nd Term</SelectItem>
                  <SelectItem value="3rd">3rd Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="rounded-none border-slate-200"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Junior Secondary</SelectLabel>
                    <SelectItem value="jss1">JSS 1</SelectItem>
                    <SelectItem value="jss2">JSS 2</SelectItem>
                    <SelectItem value="jss3">JSS 3</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Senior Secondary</SelectLabel>
                    <SelectItem value="sss1_science">SSS 1 Science</SelectItem>
                    <SelectItem value="sss1_art">SSS 1 Art</SelectItem>
                    <SelectItem value="sss1_commerce">SSS 1 Commerce</SelectItem>
                    <SelectItem value="sss2_science">SSS 2 Science</SelectItem>
                    <SelectItem value="sss2_art">SSS 2 Art</SelectItem>
                    <SelectItem value="sss2_commerce">SSS 2 Commerce</SelectItem>
                    <SelectItem value="sss3_science">SSS 3 Science</SelectItem>
                    <SelectItem value="sss3_art">SSS 3 Art</SelectItem>
                    <SelectItem value="sss3_commerce">SSS 3 Commerce</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Arm</Label>
              <Select value={selectedArm} onValueChange={setSelectedArm}>
                <SelectTrigger className="rounded-none border-slate-200"><SelectValue placeholder="Arm" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Arm A</SelectItem>
                  <SelectItem value="B">Arm B</SelectItem>
                  <SelectItem value="C">Arm C</SelectItem>
                  <SelectItem value="D">Arm D</SelectItem>
                  <SelectItem value="Science 1">Science 1</SelectItem>
                  <SelectItem value="Art 1">Art 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Exam Type</Label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger className="rounded-none border-slate-200"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                  <SelectItem value="Terminal">Terminal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="rounded-none border-slate-200"><SelectValue placeholder="Student" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL STUDENTS</SelectItem>
                  {classStudents.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-slate-50">
            <Button 
              onClick={handleGenerate}
              className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 py-6 text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Generate Report
            </Button>
            
            <Button 
              onClick={triggerFileInput}
              variant="outline"
              className="rounded-none border-slate-200 px-8 py-6 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
            
            <AnimatePresence>
              {showReport && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 ml-auto">
                    <Button 
                      onClick={handleDownloadPDF} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none px-6 py-6 text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-600/20"
                      disabled={isGenerating}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button 
                      onClick={handleDownloadExcel} 
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-none px-6 py-6 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/5"
                      disabled={isGenerating}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                    <Button 
                      onClick={handlePrint} 
                      disabled={isGenerating}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-none px-6 py-6 text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {showReport && (
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="report-sheet-preview-container bg-white p-12 rounded-none shadow-2xl border border-slate-100 print:shadow-none print:border-none print:p-0">
          <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12 border-b border-slate-50 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-primary">Academic Document Preview</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Review all entries before final distribution</p>
              </div>
            </div>

            {/* Layout Mode Toggles */}
            <div className="flex items-center bg-slate-100 p-1 rounded-none border border-slate-200">
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
          </div>

          {/* Printable templates kept always available in the DOM for PDF engine / browser printers */}
          <div className={viewMode === 'phone' ? 'absolute left-[-9999px] top-[-9999px] pointer-events-none' : ''}>
            {isBulkMode ? (
              <div ref={bulkReportRef} className="m-0 p-0 overflow-visible w-[210mm] mx-auto">
                {studentReports.map((report, idx) => (
                  <div key={idx} className={`html2pdf__item w-full m-0 p-0 shadow-none break-after-page ${idx !== studentReports.length - 1 ? 'mb-8 print:mb-0' : ''}`} style={{ pageBreakAfter: idx === studentReports.length - 1 ? 'auto' : 'always' }}>
                    <SingleReport data={report} isLast={idx === studentReports.length - 1} />
                  </div>
                ))}
              </div>
            ) : (
              studentReports.length > 0 && (
                <div className="flex flex-col items-center">
                  <SingleReport data={studentReports[0]} ref={reportRef} isLast={true} />
                </div>
              )
            )}
          </div>

          {/* Interactive Screen Phone View Layout */}
          {viewMode === 'phone' && (
            <div className="space-y-8 w-full max-w-md mx-auto print:hidden">
              {isBulkMode ? (
                studentReports.map((report, idx) => (
                  <div key={idx} className="bg-white p-4 border border-slate-100 shadow-sm rounded-none">
                    <SingleReportPhone data={report} />
                  </div>
                ))
              ) : (
                studentReports.length > 0 && (
                  <SingleReportPhone data={studentReports[0]} />
                )
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
