import React, { useState, useEffect } from 'react';
import { Save, Search, Loader2, ClipboardCheck, Filter, AlertCircle } from 'lucide-react';
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

export default function TermAssessment() {
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedArm, setSelectedArm] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<Record<string, { attendance: string, teacherComment: string, principalComment: string }>>({});
  const [schoolOpenDays, setSchoolOpenDays] = useState('120');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedClass && selectedArm && selectedSession && selectedTerm) {
      loadStudentsAndAssessments();
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedArm, selectedSession, selectedTerm]);

  const loadStudentsAndAssessments = async () => {
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
      
      const existingAssessments: Record<string, { attendance: string, teacherComment: string, principalComment: string }> = {};
      
      const promises = classStudents.map(async (student) => {
        const docId = `${selectedSession.replace('/', '-')}_${selectedTerm}_${selectedClass}_${selectedArm}_${student.id}`;
        try {
          const docRef = doc(db, 'term_assessments', docId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            existingAssessments[student.id] = {
              attendance: data.attendance?.toString() || '',
              teacherComment: data.teacherComment || '',
              principalComment: data.principalComment || ''
            };
            if (data.schoolOpenDays) {
              setSchoolOpenDays(data.schoolOpenDays.toString());
            }
          } else {
            existingAssessments[student.id] = { attendance: '', teacherComment: '', principalComment: '' };
          }
        } catch (e) {
          console.error("Failed to load for student", student.id, e);
          existingAssessments[student.id] = { attendance: '', teacherComment: '', principalComment: '' };
        }
      });
      
      await Promise.all(promises);
      
      setAssessments(existingAssessments);
    } catch (error) {
      console.error("Error loading assessments:", error);
      toast.error("Failed to load existing assessments.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessmentChange = (studentId: string, field: 'attendance' | 'teacherComment' | 'principalComment', value: string) => {
    if (field === 'attendance' && value !== '' && !/^\d+$/.test(value)) return;
    
    setAssessments(prev => ({
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
        const studentAssessment = assessments[student.id] || {};
        const attendance = parseInt(studentAssessment.attendance as string) || 0;
        
        const docId = `${selectedSession.replace('/', '-')}_${selectedTerm}_${selectedClass}_${selectedArm}_${student.id}`;
        const assessmentRef = doc(db, 'term_assessments', docId);
        
        return setDoc(assessmentRef, {
          studentId: student.id,
          studentName: student.name,
          admissionNo: student.admissionNo,
          session: selectedSession,
          term: selectedTerm,
          class: selectedClass,
          arm: selectedArm,
          attendance,
          schoolOpenDays: parseInt(schoolOpenDays) || 0,
          teacherComment: studentAssessment.teacherComment || '',
          principalComment: studentAssessment.principalComment || '',
          updatedAt: new Date()
        }, { merge: true });
      });
      
      await Promise.all(promises);

      toast.success('Term assessments saved successfully!');
    } catch (error) {
      console.error("Error saving assessments:", error);
      toast.error('Failed to save assessments. Please try again.');
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
          <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">Term Assessment & Attendance</h1>
          <p className="text-slate-500 mt-2 font-light print:hidden">Enter attendance, teacher, and principal remarks for the term.</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 print:hidden"
        >
          <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white" onClick={() => window.print()}>
            Print Sheet
          </Button>
          <div className="px-4 py-2 bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Term Assessments
          </div>
        </motion.div>
      </div>

      <Card className="border-slate-100 shadow-sm rounded-none print:hidden">
        <CardHeader className="border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent" />
            <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Class Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          </div>
        </CardContent>
      </Card>

      {students.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-slate-100 shadow-sm rounded-none overflow-hidden">
            <CardHeader className="border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between py-6 px-8 gap-4">
              <div>
                <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Student Assessment Entry</CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Total School Open Days:</Label>
                  <Input 
                    type="number"
                    value={schoolOpenDays}
                    onChange={(e) => setSchoolOpenDays(e.target.value)}
                    className="w-20 rounded-none border-slate-200 text-center font-bold text-primary focus:ring-accent"
                  />
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 py-6 text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 print:hidden w-full sm:w-auto"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Commit Assessments
                </Button>
              </div>
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
                        <TableHead className="w-[120px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Attendance</TableHead>
                        <TableHead className="w-[250px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Teacher's Comment</TableHead>
                        <TableHead className="w-[250px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Principal's Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-50">
                      {students.map((student, index) => {
                        return (
                          <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors group print:break-inside-avoid">
                            <TableCell className="px-8 py-3 text-[11px] font-bold text-slate-400">{index + 1}</TableCell>
                            <TableCell className="px-8 py-3 font-mono text-[11px] font-bold text-slate-500">{student.admissionNo}</TableCell>
                            <TableCell className="px-8 py-3">
                              <span className="text-sm font-bold text-primary">{student.name}</span>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Input 
                                type="text" 
                                value={assessments[student.id]?.attendance || ''}
                                onChange={(e) => handleAssessmentChange(student.id, 'attendance', e.target.value)}
                                className="w-20 rounded-none border-slate-200 text-center font-bold text-primary focus:ring-accent print:border-none print:shadow-none print:px-0"
                                placeholder={`0-${schoolOpenDays}`}
                              />
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Input 
                                type="text" 
                                value={assessments[student.id]?.teacherComment || ''}
                                onChange={(e) => handleAssessmentChange(student.id, 'teacherComment', e.target.value)}
                                className="w-full rounded-none border-slate-200 font-medium text-primary focus:ring-accent print:border-none print:shadow-none print:px-0"
                                placeholder="Comment"
                              />
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Input 
                                type="text" 
                                value={assessments[student.id]?.principalComment || ''}
                                onChange={(e) => handleAssessmentChange(student.id, 'principalComment', e.target.value)}
                                className="w-full rounded-none border-slate-200 font-medium text-primary focus:ring-accent print:border-none print:shadow-none print:px-0"
                                placeholder="Comment"
                              />
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
