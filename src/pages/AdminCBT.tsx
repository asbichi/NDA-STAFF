import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit2, Trash2, Upload, 
  Download, Database, BookOpen, Layers, Zap, Sparkles, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue, SelectGroup, SelectLabel
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GoogleGenAI, Type } from "@google/genai";
import { toast } from 'sonner';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SUBJECT_CATEGORIES = {
  sss_science: ['Mathematics', 'English Language', 'Civic Education', 'Biology', 'Physics', 'Chemistry', 'Economics', 'Further Mathematics', 'Geography', 'Computer Science', 'Agricultural Science', 'Data Processing', 'Technical Drawing'],
  sss_art: ['Mathematics', 'English Language', 'Civic Education', 'Biology', 'Economics', 'Literature in English', 'Government', 'History', 'CRS', 'IRS', 'French', 'Hausa', 'Igbo', 'Yoruba', 'Data Processing', 'Fine Arts'],
  sss_commerce: ['Mathematics', 'English Language', 'Civic Education', 'Biology', 'Economics', 'Commerce', 'Financial Accounting', 'Office Practice', 'Government', 'Data Processing', 'Marketing', 'Insurance']
};

const ALL_SUBJECTS = Array.from(new Set([
  ...SUBJECT_CATEGORIES.sss_science,
  ...SUBJECT_CATEGORIES.sss_art,
  ...SUBJECT_CATEGORIES.sss_commerce
])).sort();

const getAvailableSubjects = (className: string) => {
  if (!className) return ALL_SUBJECTS;
  if (className.includes('science')) return SUBJECT_CATEGORIES.sss_science;
  if (className.includes('art')) return SUBJECT_CATEGORIES.sss_art;
  if (className.includes('commerce')) return SUBJECT_CATEGORIES.sss_commerce;
  return ALL_SUBJECTS;
};

export default function AdminCBT() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newQuestionClass, setNewQuestionClass] = useState('');
  const [newQuestionSubject, setNewQuestionSubject] = useState('');

  // Fetch questions from Firestore
  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedQuestions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(fetchedQuestions);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions from database.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generate 10 high-quality multiple-choice questions strictly adhering to the WAEC, NECO, and JAMB standards for Senior Secondary School (SS1 - SS3) students in Nigeria. Include subjects from Science, Art, and Commerce fields (e.g., Physics, Chemistry, Government, Financial Accounting, Literature, Economics). Return exactly 10 questions. Ensure options are plausible and the difficulty matches standard WAEC/JAMB past questions. For the 'class' field, use values like 'SSS 1 Science', 'SSS 2 Art', 'SSS 3 Commerce'.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                subject: { type: Type.STRING },
                class: { type: Type.STRING },
                difficulty: { type: Type.STRING, description: "Standard WAEC/JAMB Difficulty" },
                answer: { type: Type.STRING, description: "A, B, C, or D" },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING },
                  }
                }
              },
              required: ["text", "subject", "class", "difficulty", "answer"]
            }
          }
        }
      });

      const newQuestions = JSON.parse(response.text);
      
      // Save to Firestore
      const promises = newQuestions.map((q: any) => 
        addDoc(collection(db, 'questions'), {
          ...q,
          createdAt: serverTimestamp()
        })
      );
      
      await Promise.all(promises);
      toast.success(`Successfully generated and saved 10 new questions!`);
    } catch (error) {
      console.error('AI Generation Error:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'questions', id));
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         q.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || q.subject?.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Question Databank</h1>
          <p className="text-slate-500 mt-1">Manage examination questions across all subjects and classes.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={handleGenerateAI}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            AI Generate (10)
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" /> Bulk Upload
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-600/20">
                <Plus className="w-4 h-4" /> Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>Fill in the details below to add a question to the databank.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select onValueChange={(val) => { setNewQuestionClass(val); setNewQuestionSubject(''); }}>
                      <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                      <SelectContent>
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
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input 
                      placeholder="Enter Subject (e.g. Mathematics)" 
                      value={newQuestionSubject} 
                      onChange={(e) => setNewQuestionSubject(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea placeholder="Enter the question here..." className="min-h-[100px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Option A</Label>
                    <Input placeholder="Option A" />
                  </div>
                  <div className="space-y-2">
                    <Label>Option B</Label>
                    <Input placeholder="Option B" />
                  </div>
                  <div className="space-y-2">
                    <Label>Option C</Label>
                    <Input placeholder="Option C" />
                  </div>
                  <div className="space-y-2">
                    <Label>Option D</Label>
                    <Input placeholder="Option D" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select Answer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Option A</SelectItem>
                        <SelectItem value="B">Option B</SelectItem>
                        <SelectItem value="C">Option C</SelectItem>
                        <SelectItem value="D">Option D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full">Save Question</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Questions', value: '1,240', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Subjects', value: '12', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Classes', value: '6', icon: Layers, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Active Exams', value: '4', icon: Zap, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <CardTitle className="text-lg font-semibold">Questions List</CardTitle>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search questions..." 
                  className="pl-10 bg-slate-50 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-40">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Filter Subject..." 
                  className="pl-10 bg-slate-50 border-slate-200"
                  value={selectedSubject === 'all' ? '' : selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value.trim() || 'all')}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[calc(100vh-450px)]">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                <TableRow className="hover:bg-slate-50/50">
                  <TableHead className="w-[400px]">Question</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      <p className="text-slate-500">Loading questions from database...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      No questions found. Click "AI Generate" to create some!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions.map((q) => (
                    <TableRow key={q.id} className="group hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-medium text-slate-700 max-w-[400px] truncate">
                        {q.text}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-medium">
                          {q.subject}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{q.class}</TableCell>
                      <TableCell>
                        <Badge className={
                          q.difficulty === 'Easy' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                          q.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                          'bg-red-100 text-red-700 hover:bg-red-100'
                        }>
                          {q.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">{q.answer}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => handleDelete(q.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
