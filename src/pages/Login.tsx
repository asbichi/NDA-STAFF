import { LOGO_BASE64 } from "@/src/logoBase64";
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, User, ArrowLeft, GraduationCap, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue, SelectGroup, SelectLabel
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';

const SUBJECTS = {
  jss: ['Mathematics', 'English Language', 'Basic Science', 'Basic Technology', 'Social Studies', 'Civic Education', 'Agricultural Science', 'Business Studies', 'Computer Studies', 'PHE', 'CRS', 'IRS', 'French', 'Home Economics', 'Fine Arts'],
  sss_science: ['Mathematics', 'English Language', 'Civic Education', 'Economics', 'Biology', 'Physics', 'Chemistry', 'Further Mathematics', 'Agricultural Science', 'Computer Science', 'Geography'],
  sss_art: ['Mathematics', 'English Language', 'Civic Education', 'Economics', 'Biology', 'Agricultural Science', 'Literature in English', 'Government', 'History', 'CRS', 'IRS', 'Fine Arts', 'French'],
  sss_commerce: ['Mathematics', 'English Language', 'Civic Education', 'Economics', 'Biology', 'Agricultural Science', 'Commerce', 'Financial Accounting', 'Office Practice', 'Government']
};

const getAvailableSubjects = (studentClass: string) => {
  if (!studentClass) return [];
  if (studentClass.startsWith('jss')) return SUBJECTS.jss;
  if (studentClass.includes('science')) return SUBJECTS.sss_science;
  if (studentClass.includes('art')) return SUBJECTS.sss_art;
  if (studentClass.includes('commerce')) return SUBJECTS.sss_commerce;
  return [];
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'student';
  
  const [role, setRole] = useState(initialRole);
  const [password, setPassword] = useState('');
  const [regNo, setRegNo] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  
  const navigate = useNavigate();

  const [adminEmail, setAdminEmail] = useState('admin@NDA.academy');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Bypass Firebase auth for demo mode
    if (adminEmail.trim() === 'admin@NDA.academy' && adminPassword.trim() === 'Bichi123') {
      toast.success('Admin login successful (Demo Mode)!');
      navigate('/admin');
      setIsLoading(false);
      return;
    }

    try {
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              throw err;
            }
            throw createErr;
          }
        } else {
          throw err;
        }
      }
      toast.success('Admin login successful!');
      navigate('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = error.message || 'Failed to login.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/network-request-failed') {
        toast.error('Firebase Error: Login service unavailable.', { duration: 5000 });
        toast.warning('Using bypass. Try credentials: admin@NDA.academy / Bichi123', { duration: 8000 });
        setIsLoading(false);
        return;
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!regNo || !studentClass || !subject) {
      toast.error('Please fill in all fields to access the portal.');
      setIsLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'students'),
        where('admissionNo', '==', regNo.trim())
      );
      const querySnapshot = await getDocs(q);
      
      let studentSession: any = null;

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const studentData = studentDoc.data();
        studentSession = {
          regNo: studentData.admissionNo,
          name: studentData.name,
          class: studentData.class,
          gender: studentData.gender || 'Not Specified',
          passportPhoto: studentData.passportPhoto || '',
          id: studentDoc.id
        };
      } else {
        // Fallback to mock session
        studentSession = {
          regNo,
          name: regNo.split('/').pop() === '001' ? 'Aisha Bello' : 
                regNo.split('/').pop() === '002' ? 'Chukwuemeka Obi' : 
                regNo.split('/').pop() === '003' ? 'Fatima Musa' : 'Student User',
          class: studentClass,
          gender: 'Not Specified',
          passportPhoto: ''
        };
      }

      localStorage.setItem('student_session', JSON.stringify(studentSession));
      toast.success('Student login successful!');
      navigate('/student/dashboard');
    } catch (error) {
      console.error("Student login error: ", error);
      toast.error('An error occurred while logging in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-10 px-4 relative overflow-y-auto overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10 fixed" style={{ backgroundImage: 'radial-gradient(rgba(239, 68, 68, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] -z-10 fixed text-primary"
      >
        <img src={LOGO_BASE64} alt="NDA Logo" className="w-[600px] h-[600px] object-contain grayscale"  />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex flex-col items-center mb-2">
              <img src={LOGO_BASE64} alt="NDA Logo" className="w-16 h-16 object-contain mb-2"  />
              <div className="w-12 h-1 bg-accent mb-2"></div>
            </div>
            <CardTitle className="text-2xl font-serif font-bold tracking-tight text-primary">Portal Access</CardTitle>
            <div className="bg-black px-3 py-1.5 border border-white/10 inline-block mx-auto mt-1">
              <span className="font-serif font-bold text-xs tracking-wider uppercase text-white">
                NDA Staff Secondary School
              </span>
            </div>
          </CardHeader>
          
          <Tabs defaultValue={role} onValueChange={(v) => setRole(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 mx-6 mb-4 w-auto rounded-none">
              <TabsTrigger value="student" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] font-bold uppercase tracking-widest">CBT Portal (Student)</TabsTrigger>
              <TabsTrigger value="admin" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] font-bold uppercase tracking-widest">Staff Portal (Admin)</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4 mt-0">
              <div className="px-6 pb-4 text-center">
                <p className="text-xs text-slate-500 font-light">Access the Computer-Based Testing (CBT) platform for your scheduled examinations.</p>
              </div>
              <form onSubmit={handleStudentLogin}>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="regNo" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registration Number (Password)</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="regNo" 
                        type={showStudentPassword ? "text" : "password"}
                        placeholder="Enter Reg Number as Password" 
                        className="pl-10 pr-10 rounded-none border-slate-200 focus-visible:ring-primary"
                        value={regNo}
                        onChange={(e) => setRegNo(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showStudentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Class</Label>
                      <Select onValueChange={(val) => { setStudentClass(val); setSubject(''); }} required>
                        <SelectTrigger className="rounded-none border-slate-200">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
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
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</Label>
                      <Select onValueChange={setSubject} value={subject} required disabled={!studentClass}>
                        <SelectTrigger className="rounded-none border-slate-200">
                          <SelectValue placeholder={studentClass ? "Select Subject" : "Class First"} />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSubjects(studentClass).map(sub => (
                            <SelectItem key={sub} value={sub.toLowerCase()}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white py-7 text-xs font-bold uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/20"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isLoading ? 'Authenticating...' : 'Enter CBT Portal'}
                  </Button>
                  
                  <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary flex items-center transition-colors">
                    <ArrowLeft className="w-3 h-3 mr-2" />
                    Back to Home
                  </Link>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-0">
              <div className="px-6 pb-4 text-center">
                <p className="text-xs text-slate-500 font-light">Manage CBT Examinations and Secondary Termly Results (Admin Only).</p>
              </div>
              <form onSubmit={handleAdminLogin}>
                <CardContent className="space-y-5">
                  <div className="bg-blue-50 text-blue-800 p-3 text-xs font-medium rounded-none border border-blue-200 text-center">
                    Demo Bypass Credentials:<br />
                    <b>admin@NDA.academy</b> / <b>Bichi123</b>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Staff Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="adminEmail" 
                        type="email"
                        placeholder="admin@NDA.academy" 
                        className="pl-10 rounded-none border-slate-200 focus-visible:ring-primary"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="adminPassword" 
                        type={showAdminPassword ? "text" : "password"}
                        placeholder="Enter password" 
                        className="pl-10 pr-10 rounded-none border-slate-200 focus-visible:ring-primary"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-xs font-bold uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/20"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isLoading ? 'Authenticating...' : 'Staff Login'}
                  </Button>
                  
                  <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary flex items-center transition-colors mt-4">
                    <ArrowLeft className="w-3 h-3 mr-2" />
                    Back to Home
                  </Link>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}

