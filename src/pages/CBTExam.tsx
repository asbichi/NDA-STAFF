import { LOGO_BASE64 } from "@/src/logoBase64";
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Timer, ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle2, User, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  subject: string;
}

export default function CBTExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours for UTME mock
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isExamStarted, setIsExamStarted] = useState(false);

  const studentSession = JSON.parse(localStorage.getItem('student_session') || '{}');
  const candidateName = studentSession.name || 'CANDIDATE NAME';
  const regNumber = studentSession.regNo || 'REG NUMBER';

  // Derive subjects from questions
  const subjects = Array.from(new Set(questions.map(q => q.subject)));
  const currentSubject = questions[currentQuestionIndex]?.subject || '';

  // Mock questions for now
  useEffect(() => {
    const subjectData = {
      'Use of English': [
        { text: 'In the sentence "The man who stole the car has been arrested," the underlined expression is an example of:', options: { A: 'a noun clause', B: 'an adjectival clause', C: 'an adverbial clause', D: 'a prepositional phrase' }, correctAnswer: 'B' },
        { text: 'Choose the word that has the same vowel sound as the one represented by the underlined letter(s): "p[eo]ple"', options: { A: 'leopard', B: 'quay', C: 'plough', D: 'people' }, correctAnswer: 'B' },
        { text: 'Choose the option that best completes the sentence: The team _____ playing very well so far this season.', options: { A: 'are', B: 'is', C: 'have been', D: 'has been' }, correctAnswer: 'D' },
        { text: 'Fill in the gap: I would rather you _____ now.', options: { A: 'go', B: 'went', C: 'are going', D: 'have gone' }, correctAnswer: 'B' },
        { text: 'Choose the word opposite in meaning to the underlined word: The measures taken by the government were meant to *ameliorate* the situation.', options: { A: 'improve', B: 'aggravate', C: 'soothe', D: 'pacify' }, correctAnswer: 'B' },
        { text: 'What is the interpretation of "to let the cat out of the bag"?', options: { A: 'to expose a secret', B: 'to buy a pet', C: 'to make a mistake', D: 'to be very angry' }, correctAnswer: 'A' },
        { text: 'Select the option that best completes the gap: The principal, along with the teachers, _____ arriving soon.', options: { A: 'are', B: 'is', C: 'have', D: 'were' }, correctAnswer: 'B' },
        { text: 'Identify the correctly spelt word:', options: { A: 'Embarass', B: 'Embarrass', C: 'Embaras', D: 'Embarras' }, correctAnswer: 'B' },
        { text: 'Choose the word closest in meaning to the underlined word: His remarks were entirely *superfluous*.', options: { A: 'necessary', B: 'redundant', C: 'insightful', D: 'ambiguous' }, correctAnswer: 'B' },
        { text: 'Fill in the gap: Hard work is a prerequisite _____ success.', options: { A: 'for', B: 'to', C: 'of', D: 'in' }, correctAnswer: 'B' }
      ],
      'Mathematics': [
        { text: 'If log₁₀2 = 0.3010 and log₁₀3 = 0.4771, evaluate log₁₀12.', options: { A: '1.0791', B: '1.7781', C: '0.7781', D: '1.3010' }, correctAnswer: 'A' },
        { text: 'A polygon has 9 sides. What is the sum of its interior angles?', options: { A: '1260°', B: '1440°', C: '1620°', D: '1080°' }, correctAnswer: 'A' },
        { text: 'Simplify: (8⅓ × 27⅓) ÷ 64⅓', options: { A: '1.5', B: '2.5', C: '3.5', D: '4.5' }, correctAnswer: 'A' },
        { text: 'Find the derivative of y = 3x² + 5x - 4 with respect to x.', options: { A: '6x', B: '6x + 5', C: '3x + 5', D: '6x - 4' }, correctAnswer: 'B' },
        { text: 'If 3x ≡ 4 (mod 5), find x.', options: { A: '1', B: '2', C: '3', D: '4' }, correctAnswer: 'C' },
        { text: 'Evaluate the integral of (2x + 3) dx from x=0 to x=2.', options: { A: '10', B: '12', C: '8', D: '14' }, correctAnswer: 'A' },
        { text: 'What is the probability of tossing at least one Head when two fair coins are tossed?', options: { A: '1/4', B: '1/2', C: '3/4', D: '1' }, correctAnswer: 'C' },
        { text: 'In a class of 40 students, 25 offer Physics and 20 offer Chemistry. If 5 students offer neither of the two subjects, how many offer both?', options: { A: '5', B: '10', C: '15', D: '20' }, correctAnswer: 'B' },
        { text: 'Find the standard deviation of 2, 4, 6, 8, 10.', options: { A: '√4', B: '√6', C: '√8', D: '√10' }, correctAnswer: 'C' },
        { text: 'Solve the equation: x² - 5x + 6 = 0.', options: { A: '(-2, 3)', B: '(2, -3)', C: '(2, 3)', D: '(-2, -3)' }, correctAnswer: 'C' }
      ],
      'Physics': [
        { text: 'A projectile is fired at an angle of 30° to the horizontal with a velocity of 40m/s. Calculate the time of flight. (g = 10m/s²)', options: { A: '2s', B: '4s', C: '6s', D: '8s' }, correctAnswer: 'B' },
        { text: 'The half-life of a radioactive element is 10 days. What fraction of the original sample will remain after 30 days?', options: { A: '1/2', B: '1/4', C: '1/8', D: '1/16' }, correctAnswer: 'C' },
        { text: 'Two resistors of 4Ω and 6Ω are connected in parallel. What is their effective resistance?', options: { A: '10Ω', B: '2.4Ω', C: '1.5Ω', D: '24Ω' }, correctAnswer: 'B' },
        { text: 'Which of the following electromagnetic waves has the highest frequency?', options: { A: 'X-rays', B: 'Ultraviolet rays', C: 'Gamma rays', D: 'Infrared rays' }, correctAnswer: 'C' },
        { text: 'A gas occupies a volume of 2m³ at a pressure of 100kPa. What will be its volume if the pressure is increased to 200kPa at constant temperature?', options: { A: '1m³', B: '2m³', C: '4m³', D: '0.5m³' }, correctAnswer: 'A' },
        { text: 'The efficiency of a machine is 80%. If the velocity ratio is 5, what is its mechanical advantage?', options: { A: '4', B: '5', C: '6', D: '3' }, correctAnswer: 'A' },
        { text: 'An object is placed 15cm from a convex lens of focal length 10cm. The image formed is:', options: { A: 'real, inverted and magnified', B: 'virtual, erect and magnified', C: 'real, inverted and diminished', D: 'virtual, erect and diminished' }, correctAnswer: 'A' },
        { text: 'Which of the following is responsible for the production of sound?', options: { A: 'Friction', B: 'Vibration', C: 'Refraction', D: 'Diffraction' }, correctAnswer: 'B' },
        { text: 'Calculate the energy stored in a capacitor of capacitance 20μF when charged to a potential difference of 100V.', options: { A: '0.1J', B: '1.0J', C: '10J', D: '0.01J' }, correctAnswer: 'A' },
        { text: 'The threshold frequency of a metal is 5 × 10¹⁴ Hz. What is the work function? (h = 6.63 × 10⁻³⁴ Js)', options: { A: '3.315 × 10⁻¹⁹ J', B: '1.326 × 10⁻¹⁹ J', C: '3.315 × 10⁻²⁰ J', D: '6.63 × 10⁻¹⁹ J' }, correctAnswer: 'A' }
      ],
      'Chemistry': [
        { text: 'Isotopes of an element have the same number of:', options: { A: 'Neutrons', B: 'Protons', C: 'Orbitals', D: 'Nucleons' }, correctAnswer: 'B' },
        { text: 'Which of the following is a primary alkanol?', options: { A: 'Propan-2-ol', B: 'Ethanol', C: '2-methylpropan-2-ol', D: 'Butan-2-ol' }, correctAnswer: 'B' },
        { text: 'Calculate the mass of copper deposited during the electrolysis of CuSO₄ solution when a current of 2A is passed for 1 hour. (Cu = 64, F = 96500 C/mol)', options: { A: '2.39g', B: '4.78g', C: '1.19g', D: '3.58g' }, correctAnswer: 'A' },
        { text: 'The general formula for alkynes is:', options: { A: 'CnH2n+2', B: 'CnH2n', C: 'CnH2n-2', D: 'CnH2n+1' }, correctAnswer: 'C' },
        { text: 'Which of the following oxides is amphoteric?', options: { A: 'CO₂', B: 'Al₂O₃', C: 'Na₂O', D: 'MgO' }, correctAnswer: 'B' },
        { text: 'The bond formed when elements with a large difference in electronegativity combine is:', options: { A: 'Covalent', B: 'Ionic', C: 'Metallic', D: 'Coordinate' }, correctAnswer: 'B' },
        { text: 'The shape of a water molecule (H₂O) is:', options: { A: 'Linear', B: 'Tetrahedral', C: 'V-shaped', D: 'Trigonal planar' }, correctAnswer: 'C' },
        { text: 'Which of the following statements about catalysts is true?', options: { A: 'They increase the activation energy', B: 'They provide an alternative reaction pathway', C: 'They are consumed in the reaction', D: 'They alter the equilibrium constant' }, correctAnswer: 'B' },
        { text: 'The process of splitting larger hydrocarbon molecules into smaller ones is called:', options: { A: 'Polymerization', B: 'Fractional distillation', C: 'Cracking', D: 'Esterification' }, correctAnswer: 'C' },
        { text: 'What is the oxidation state of Chromium in K₂Cr₂O₇?', options: { A: '+6', B: '+3', C: '+4', D: '+2' }, correctAnswer: 'A' }
      ]
    };

    const mockQuestions: Question[] = [];
    let idCounter = 1;

    Object.entries(subjectData).forEach(([subject, qs]) => {
      // Create 150 questions per subject for JAMB CBT standard
      for (let i = 0; i < 150; i++) {
        const base = qs[i % qs.length];
        mockQuestions.push({
          id: idCounter.toString(),
          text: base.text,
          options: base.options,
          correctAnswer: base.correctAnswer,
          subject: subject
        });
        idCounter++;
      }
    });
    
    setQuestions(mockQuestions);
    setLoading(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitted) return;
    
    if (timeLeft > 0 && !window.confirm('Are you sure you want to submit? You still have time left.')) {
      return;
    }

    setIsSubmitted(true);
    
    // Calculate score
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    const percentage = Math.round((score / questions.length) * 100);

    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      await addDoc(collection(db, 'cbt_results'), {
        studentId: studentSession.regNo || 'Unknown',
        studentName: studentSession.name || 'Unknown Student',
        class: studentSession.class || 'Unknown Class',
        score: score,
        total: questions.length,
        percentage: percentage,
        date: serverTimestamp()
      });
      
      const subjectScores: Record<string, { score: number, total: number }> = {};
      subjects.forEach(sub => {
        const subQuestions = questions.filter(q => q.subject === sub);
        let subScore = 0;
        subQuestions.forEach(q => {
          if (answers[q.id] === q.correctAnswer) subScore++;
        });
        subjectScores[sub] = { score: subScore, total: subQuestions.length };
      });

      toast.success('Examination submitted successfully!');
      setTimeout(() => {
        navigate('/result', { state: { submitted: true, score, total: questions.length, subjectScores } });
      }, 2000);
    } catch (error) {
      console.error("Error saving CBT result:", error);
      toast.error("Failed to save result, but exam is submitted.");
      setTimeout(() => {
        navigate('/result', { state: { submitted: true } });
      }, 2000);
    }
  }, [isSubmitted, navigate, questions, answers, studentSession, timeLeft]);

  useEffect(() => {
    if (!isExamStarted) return;
    
    if (timeLeft <= 0 && !isSubmitted) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit, isSubmitted, isExamStarted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || !isExamStarted) return;
      const key = e.key.toUpperCase();
      
      const currentQ = questions[currentQuestionIndex];
      if (!currentQ) return;

      if (['A', 'B', 'C', 'D'].includes(key) && currentQ.options[key]) {
        setAnswers(prev => ({ ...prev, [currentQ.id]: key }));
      } else if (key === 'N' || key === 'ArrowRight') {
        setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
      } else if (key === 'P' || key === 'ArrowLeft') {
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
      } else if (key === 'S') {
        // Optional submit shortcut could be too dangerous to put on 'S' natively, let's leave S out.
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, questions, isSubmitted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  // Scoped to current subject
  const currentSubjectQuestions = questions.filter(q => q.subject === currentSubject);
  const currentSubjectIndex = currentSubjectQuestions.findIndex(q => q.id === currentQuestion?.id);

  if (loading || !currentQuestion) return <div className="min-h-screen bg-green-50 flex items-center justify-center">Loading examination engine...</div>;

  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-6">
        <Card className="w-full max-w-4xl border-t-4 border-t-green-700 shadow-2xl bg-white rounded-none">
          <CardHeader className="bg-green-50 border-b border-green-200 py-6 px-8 text-center flex flex-col items-center">
            <img src={LOGO_BASE64} alt="JAMB Logo" className="w-20 h-20 mb-4" />
            <CardTitle className="text-2xl font-black text-green-900 tracking-tight uppercase">
              Joint Admissions and Matriculation Board
            </CardTitle>
            <p className="text-green-800 font-bold uppercase tracking-widest mt-2 text-sm">Unified Tertiary Matriculation Examination</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
              <h3 className="font-bold text-blue-900 uppercase text-sm mb-1">Candidate Biodata</h3>
              <p className="font-bold text-lg">{candidateName}</p>
              <p className="font-mono text-slate-600 font-medium">{regNumber}</p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 uppercase text-sm border-b pb-2">Examination Instructions</h4>
              <ul className="list-disc pl-5 space-y-3 text-slate-700 text-sm md:text-base leading-relaxed">
                <li>This examination consists of four (4) subjects. Use the Subject Navigator to switch between subjects.</li>
                <li>You have a total of <b>2 Hours</b> to complete all questions.</li>
                <li>You can use the <b>Next</b> and <b>Previous</b> buttons to navigate through questions.</li>
                <li>Alternatively, you can use keyboard shortcuts: <b>A, B, C, D</b> to select answers, and <b>N</b> (Next) / <b>P</b> (Previous) to navigate.</li>
                <li>An on-screen calculator is available at the top right of the screen.</li>
                <li>Ensure you click on <b>Submit Examination</b> only when you are completely done.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-6 flex justify-center">
            <Button 
              onClick={() => setIsExamStarted(true)}
              className="bg-green-700 hover:bg-green-800 text-white font-bold py-6 px-12 text-lg uppercase tracking-widest rounded shadow-lg"
            >
              Start Examination
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans selection:bg-green-200">
      {/* Header - JAMB Style Green */}
      <header className="bg-green-800 text-white shadow-md border-b-4 border-green-600 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded">
              <img src={LOGO_BASE64} alt="JAMB Logo" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl tracking-tight uppercase">Joint Admissions and Matriculation Board</h1>
              <p className="text-green-200 text-xs md:text-sm font-medium tracking-wider">UNIFIED TERTIARY MATRICULATION EXAMINATION</p>
            </div>
          </div>

          {/* Time & Tools Display */}
          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-center gap-4">
              <Button onClick={() => alert('JAMB Calculator launched!')} variant="outline" className="bg-white text-green-800 border-none hover:bg-green-50 shadow-sm hidden md:flex font-bold">
                <Calculator className="w-4 h-4 mr-2" />
                Calculator
              </Button>
              <div className="flex flex-col items-center md:items-end">
                <span className="text-xs text-green-200 uppercase font-bold tracking-widest mb-1">Time Remaining</span>
                <div className={`flex items-center gap-2 px-6 py-2 rounded shadow-inner font-mono text-2xl md:text-3xl font-bold border-2 ${timeLeft < 300 ? 'bg-red-700 border-red-500 animate-pulse' : 'bg-black text-green-400 border-green-900'}`}>
                  <Timer className="w-6 h-6 text-current opacity-70" />
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-2 md:p-4 gap-4">
        
        {/* Left Sidebar - Candidate Details */}
        <div className="w-full md:w-64 flex flex-col gap-4">
          <Card className="rounded-none border-t-4 border-t-green-700 shadow-md">
            <CardHeader className="bg-gray-50 border-b py-3 px-4">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase">Candidate Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className="w-24 h-24 bg-gray-200 border-4 border-white shadow flex items-center justify-center text-gray-400">
                <User className="w-12 h-12" />
              </div>
              <div>
                <p className="font-bold text-gray-900 uppercase">{candidateName}</p>
                <p className="text-sm font-mono text-gray-500">{regNumber}</p>
              </div>
            </CardContent>
          </Card>

          {/* Subject Navigation Tabs */}
          <Card className="rounded-none border-t-4 border-t-blue-700 shadow-md flex-1">
            <CardHeader className="bg-gray-50 border-b py-3 px-4">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase">Subjects</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {subjects.map((subject, idx) => {
                  const subjectQuestions = questions.filter(q => q.subject === subject);
                  const answeredCount = subjectQuestions.filter(q => answers[q.id]).length;
                  const isActive = currentSubject === subject;
                  
                  return (
                    <button
                      key={subject}
                      onClick={() => {
                        const firstIndex = questions.findIndex(q => q.subject === subject);
                        setCurrentQuestionIndex(firstIndex);
                      }}
                      className={`px-4 py-3 text-left border-b text-sm font-bold flex justify-between items-center transition-colors ${
                        isActive 
                          ? 'bg-blue-50 border-l-4 border-l-blue-600 text-blue-800' 
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent text-gray-600'
                      }`}
                    >
                      <span>{idx + 1}. {subject}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${answeredCount === subjectQuestions.length ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {answeredCount}/{subjectQuestions.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center - Question Area */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 rounded-none border border-gray-300 shadow-md flex flex-col">
            
            <div className="bg-gray-100 border-b border-gray-300 p-3 flex justify-between items-center">
              <span className="font-bold text-gray-800 uppercase text-lg">
                {currentSubject}
              </span>
              <span className="bg-white border border-gray-300 px-3 py-1 text-sm font-bold text-gray-600 rounded-sm shadow-sm">
                Question {currentSubjectIndex + 1} of {currentSubjectQuestions.length}
              </span>
            </div>

            <CardContent className="p-6 flex-1 bg-white flex flex-col">
              <div className="text-lg md:text-xl font-medium text-black mb-8 leading-relaxed">
                {currentQuestion.text}
              </div>

              <div className="space-y-3 mt-auto">
                <RadioGroup 
                  value={answers[currentQuestion.id] || ""} 
                  onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                >
                  {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3 mb-4">
                      <RadioGroupItem 
                        value={key} 
                        id={`option-${key}`} 
                        className="w-5 h-5 text-green-600 border-gray-400 focus:ring-green-600"
                      />
                      <Label 
                        htmlFor={`option-${key}`} 
                        className="text-base font-normal cursor-pointer text-gray-800 leading-tight"
                      >
                        <span className="font-bold mr-2">{key}.</span> {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            
            {/* Navigation Controls */}
            <div className="bg-gray-100 border-t border-gray-300 p-4 flex justify-between items-center">
              <Button 
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
                className="bg-white border-gray-400 text-gray-800 hover:bg-gray-50 rounded-sm font-bold min-w-[120px]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              
              <Button 
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={currentQuestionIndex === questions.length - 1}
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-sm font-bold min-w-[120px] shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Question Grid & Submit */}
        <div className="w-full md:w-72 flex flex-col gap-4">
          <Card className="rounded-none border border-gray-300 shadow-md bg-white">
            <CardHeader className="bg-gray-100 border-b border-gray-300 py-3 px-4">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-5 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                {currentSubjectQuestions.map((q, idx) => {
                  const globalIdx = questions.findIndex(globalQ => globalQ.id === q.id);
                  const isAnswered = !!answers[q.id];
                  const isCurrent = currentQuestionIndex === globalIdx;
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(globalIdx)}
                      className={`h-9 w-full rounded-sm flex items-center justify-center text-sm font-bold transition-all border ${
                        isCurrent 
                          ? 'bg-blue-600 text-white border-blue-800 ring-2 ring-blue-300 ring-offset-1' 
                          : isAnswered 
                            ? 'bg-green-600 text-white border-green-700' 
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </CardContent>
            <div className="bg-gray-50 border-t border-gray-200 p-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase font-bold text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-600 border border-green-700 rounded-sm"></div> Answered</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div> Unanswered</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600 border border-blue-800 rounded-sm"></div> Current</div>
            </div>
          </Card>

          <Button 
            onClick={handleSubmit}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg uppercase tracking-wider py-6 rounded-none shadow-md mt-auto"
          >
            Submit Examination
          </Button>
        </div>

      </div>

      {isSubmitted && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <Card className="max-w-md w-full text-center p-8 border-none rounded shadow-2xl">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 uppercase">Exam Submitted</h2>
            <p className="text-gray-500 mb-6 font-medium">Your responses have been recorded securely. Redirecting to results...</p>
            <Progress value={100} className="h-1.5 bg-gray-200 [&>div]:bg-green-600 animate-pulse" />
          </Card>
        </div>
      )}
    </div>
  );
}


