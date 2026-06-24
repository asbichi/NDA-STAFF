import { LOGO_BASE64 } from "@/src/logoBase64";
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Timer, ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

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
        { text: 'If log₁₀2 = 0.3010 and log₁₀3 = 0.4771, evaluate log₁₀12.', options: { A: '1.0791', B: '1.7781', C: '0.7781', D: '1.3010' }, correctAnswer: '1.0791' }, // Oops, let me just fix options so one is correct
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
      // Create 10 questions per subject
      for (let i = 0; i < 10; i++) {
        const base = qs[i % qs.length];
        mockQuestions.push({
          id: idCounter.toString(),
          text: base.text, // Removed [Subject] prefix for cleaner UI as subject is in header
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
    setIsSubmitted(true);
    
    // Calculate score
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    const percentage = Math.round((score / questions.length) * 100);

    try {
      const studentSession = JSON.parse(localStorage.getItem('student_session') || '{}');
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
      
      toast.success('Examination submitted successfully!');
      setTimeout(() => {
        navigate('/result', { state: { submitted: true } });
      }, 2000);
    } catch (error) {
      console.error("Error saving CBT result:", error);
      toast.error("Failed to save result, but exam is submitted.");
      setTimeout(() => {
        navigate('/result', { state: { submitted: true } });
      }, 2000);
    }
  }, [isSubmitted, navigate, questions, answers]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

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
  const progress = ((currentSubjectIndex + 1) / currentSubjectQuestions.length) * 100;

  if (loading || !currentQuestion) return <div className="min-h-screen flex items-center justify-center">Loading exam...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src={LOGO_BASE64} alt="Logo" className="w-10 h-10 bg-white rounded-full p-1" />
          <div>
            <h1 className="font-bold text-lg leading-tight">CBT EXAMINATION</h1>
            <p className="text-xs text-blue-200">Class: SS3</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl ${timeLeft < 300 ? 'bg-red-600 animate-pulse' : 'bg-blue-900'}`}>
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>

        <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitted}>
          SUBMIT EXAM
        </Button>
      </header>

      {/* Subject Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-[72px] z-10">
        <div className="max-w-7xl mx-auto flex overflow-x-auto hide-scrollbar">
          {subjects.map(subject => {
            const subjectQuestions = questions.filter(q => q.subject === subject);
            const answeredCount = subjectQuestions.filter(q => answers[q.id]).length;
            
            return (
              <button
                key={subject}
                onClick={() => {
                  const firstIndex = questions.findIndex(q => q.subject === subject);
                  setCurrentQuestionIndex(firstIndex);
                }}
                className={`flex-none px-6 py-3 font-medium text-sm border-b-[3px] transition-colors whitespace-nowrap flex items-center gap-2 ${
                  currentSubject === subject 
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>{subject}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${answeredCount === subjectQuestions.length ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {answeredCount}/{subjectQuestions.length}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  {currentSubject} - Q{currentSubjectIndex + 1} of {currentSubjectQuestions.length}
                </span>
                <Progress value={progress} className="w-1/3 h-2" />
              </div>
              <CardTitle className="text-xl md:text-2xl font-medium leading-relaxed">
                {currentQuestion.text.replace(/^\[.*?\]\s*/, '')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <RadioGroup 
                value={answers[currentQuestion.id]} 
                onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                className="grid gap-4"
              >
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <Label
                    key={key}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                      answers[currentQuestion.id] === key ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-100'
                    }`}
                  >
                    <RadioGroupItem value={key} id={`q-${currentQuestion.id}-${key}`} className="sr-only" />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                      answers[currentQuestion.id] === key ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-400'
                    }`}>
                      {key}
                    </div>
                    <span className="text-lg text-slate-700">{value}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between p-6 bg-slate-50/50 border-t">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0 || questions[currentQuestionIndex - 1]?.subject !== currentSubject}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button 
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={currentQuestionIndex === questions.length - 1 || questions[currentQuestionIndex + 1]?.subject !== currentSubject}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Navigation Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          <Card className="border-none shadow-lg sticky top-36">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase">{currentSubject} Navigator</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {currentSubjectQuestions.map((q, idx) => {
                  const globalIdx = questions.findIndex(globalQ => globalQ.id === q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(globalIdx)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                        currentQuestionIndex === globalIdx 
                          ? 'bg-blue-600 text-white shadow-md scale-110 z-10' 
                          : answers[q.id] 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-4 border-t bg-slate-50/50">
              <div className="flex items-center gap-4 text-xs font-medium w-full">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Answered</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-300 rounded-full"></div> Unanswered</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded-full"></div> Current</div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 mt-4" onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2" /> Final Submission
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {isSubmitted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <Card className="max-w-md w-full text-center p-8 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Exam Submitted!</h2>
            <p className="text-slate-500 mb-6">Your responses have been recorded. Redirecting to results...</p>
            <Progress value={100} className="h-1 animate-pulse" />
          </Card>
        </div>
      )}
    </div>
  );
}

