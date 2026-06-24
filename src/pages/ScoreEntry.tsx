import React, { useState, useEffect } from 'react';
import { Save, Search, Loader2, FileEdit, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';

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

const calculateGrade = (total: number) => {
  if (total >= 75) return 'A';
  if (total >= 65) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'D';
  return 'F';
};

export default function ScoreEntry() {
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedArm, setSelectedArm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, { ca: string, exam: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedClass && selectedArm && selectedSubject && selectedSession && selectedTerm) {
      loadStudentsAndScores();
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedArm, selectedSubject, selectedSession, selectedTerm]);

  const loadStudentsAndScores = async () => {
    setIsLoading(true);
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('class', '==', selectedClass), where('arm', '==', selectedArm));
      const studentSnap = await getDocs(q);
      
      const classStudents = studentSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unknown',
        admissionNo: doc.data().admissionNo || 'Unknown'
      }));
      
      setStudents(classStudents);
      
      const existingScores: Record<string, { ca: string, exam: string }> = {};
      
      const promises = classStudents.map(async (student) => {
        const docId = `${selectedSession.replace('/', '-')}_${selectedTerm}_${selectedClass}_${selectedArm}_${selectedSubject}_${student.id}`;
        try {
          const docRef = doc(db, 'scores', docId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            existingScores[student.id] = {
              ca: data.ca?.toString() || '',
              exam: data.exam?.toString() || ''
            };
          } else {
            existingScores[student.id] = { ca: '', exam: '' };
          }
        } catch (e) {
          console.error("Failed to load for student", student.id, e);
          existingScores[student.id] = { ca: '', exam: '' };
        }
      });
      
      await Promise.all(promises);
      
      setScores(existingScores);
    } catch (error) {
      console.error("Error loading scores:", error);
      toast.error("Failed to load existing scores.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, field: 'ca' | 'exam', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    const numValue = parseInt(value);
    if (field === 'ca' && numValue > 40) return;
    if (field === 'exam' && numValue > 60) return;

    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises = students.map(student => {
        const studentScore = scores[student.id] || {};
        const ca = parseInt(studentScore.ca as string) || 0;
        const exam = parseInt(studentScore.exam as string) || 0;
        const total = ca + exam;
        const grade = calculateGrade(total);
        
        const docId = `${selectedSession.replace('/', '-')}_${selectedTerm}_${selectedClass}_${selectedArm}_${selectedSubject}_${student.id}`;
        const scoreRef = doc(db, 'scores', docId);
        
        return setDoc(scoreRef, {
          studentId: student.id,
          studentName: student.name,
          admissionNo: student.admissionNo,
          session: selectedSession,
          term: selectedTerm,
          class: selectedClass,
          arm: selectedArm,
          subject: selectedSubject,
          ca,
          exam,
          total,
          grade,
          updatedAt: new Date()
        }, { merge: true });
      });
      
      await Promise.all(promises);

      toast.success('Scores saved successfully!');
    } catch (error) {
      console.error("Error saving scores:", error);
      toast.error('Failed to save scores. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">Termly Score Entry</h1>
          <p className="text-slate-500 mt-2 font-light">Manually key in Continuous Assessment (CA) and Examination marks per subject for the termly report sheet.</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="px-4 py-2 bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <FileEdit className="w-3.5 h-3.5" />
            Secondary Termly Report
          </div>
        </motion.div>
      </div>

      <Card className="border-slate-100 shadow-sm rounded-none">
        <CardHeader className="border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent" />
            <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Assessment Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academic Session</Label>
              <Input 
                value={selectedSession} 
                onChange={(e) => setSelectedSession(e.target.value)} 
                placeholder="e.g. 2023/2024" 
                className="rounded-none border-slate-200 focus:ring-primary"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="rounded-none border-slate-200 focus:ring-primary">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">First Term</SelectItem>
                  <SelectItem value="2nd">Second Term</SelectItem>
                  <SelectItem value="3rd">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="rounded-none border-slate-200 focus:ring-primary">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Junior Secondary</SelectLabel>
                    <SelectItem value="jss1">JSS 1</SelectItem>
                    <SelectItem value="jss2">JSS 2</SelectItem>
                    <SelectItem value="jss3">JSS 3</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Senior Secondary (Science)</SelectLabel>
                    <SelectItem value="sss1_science">SSS 1 Science</SelectItem>
                    <SelectItem value="sss2_science">SSS 2 Science</SelectItem>
                    <SelectItem value="sss3_science">SSS 3 Science</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Senior Secondary (Art)</SelectLabel>
                    <SelectItem value="sss1_art">SSS 1 Art</SelectItem>
                    <SelectItem value="sss2_art">SSS 2 Art</SelectItem>
                    <SelectItem value="sss3_art">SSS 3 Art</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Senior Secondary (Commerce)</SelectLabel>
                    <SelectItem value="sss1_commerce">SSS 1 Commerce</SelectItem>
                    <SelectItem value="sss2_commerce">SSS 2 Commerce</SelectItem>
                    <SelectItem value="sss3_commerce">SSS 3 Commerce</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Arm</Label>
              <Select value={selectedArm} onValueChange={setSelectedArm}>
                <SelectTrigger className="rounded-none border-slate-200 focus:ring-primary">
                  <SelectValue placeholder="Select Arm" />
                </SelectTrigger>
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
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject</Label>
              <Input 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)} 
                placeholder="Enter Subject Name" 
                className="rounded-none border-slate-200 focus:ring-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-slate-100 shadow-sm rounded-none overflow-hidden">
            <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between py-6 px-8">
              <div>
                <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Student Performance Entry</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                  CA (Max 40) + Exam (Max 60) = Total (100)
                </CardDescription>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 py-6 text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Commit Scores
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-24 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Retrieving Records...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-b border-slate-100">
                        <TableHead className="w-[80px] px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">S/N</TableHead>
                        <TableHead className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Admission No</TableHead>
                        <TableHead className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student Name</TableHead>
                        <TableHead className="w-[180px] px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">CA Score (40)</TableHead>
                        <TableHead className="w-[180px] px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Exam Score (60)</TableHead>
                        <TableHead className="w-[120px] px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Total</TableHead>
                        <TableHead className="w-[120px] px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-50">
                      {students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                            <p className="text-[10px] uppercase tracking-widest font-bold">No students found matching this class and arm.</p>
                            <p className="text-xs mt-2 font-light">Register students in the Student Directory first.</p>
                          </TableCell>
                        </TableRow>
                      ) : students.map((student, index) => {
                        const ca = parseInt(scores[student.id]?.ca) || 0;
                        const exam = parseInt(scores[student.id]?.exam) || 0;
                        const total = ca + exam;
                        const grade = calculateGrade(total);
                        
                        return (
                          <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                            <TableCell className="px-8 py-6 text-[11px] font-bold text-slate-400">{index + 1}</TableCell>
                            <TableCell className="px-8 py-6 font-mono text-[11px] font-bold text-slate-500">{student.admissionNo}</TableCell>
                            <TableCell className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-none flex items-center justify-center text-[10px] font-bold text-primary">
                                  {student.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <span className="text-sm font-bold text-primary">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              <Input 
                                type="text" 
                                value={scores[student.id]?.ca || ''}
                                onChange={(e) => handleScoreChange(student.id, 'ca', e.target.value)}
                                className="w-24 rounded-none border-slate-200 text-center font-bold text-primary focus:ring-accent"
                                placeholder="0-40"
                              />
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              <Input 
                                type="text" 
                                value={scores[student.id]?.exam || ''}
                                onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                                className="w-24 rounded-none border-slate-200 text-center font-bold text-primary focus:ring-accent"
                                placeholder="0-60"
                              />
                            </TableCell>
                            <TableCell className="px-8 py-6 text-center">
                              <span className={`text-xl font-serif font-bold ${total > 0 ? 'text-primary' : 'text-slate-200'}`}>
                                {total.toString().padStart(2, '0')}
                              </span>
                            </TableCell>
                            <TableCell className="px-8 py-6 text-center">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-none font-serif font-bold text-sm border ${
                                total === 0 ? 'bg-slate-50 text-slate-300 border-slate-100' :
                                grade === 'A' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                grade === 'B' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                grade === 'C' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                grade === 'D' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {total > 0 ? grade : '-'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-24 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300"
        >
          <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Select filters to load student records</p>
        </motion.div>
      )}
    </div>
  );
}
