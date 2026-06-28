import React, { useEffect, useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Printer, Download, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LOGO_BASE64 } from '@/src/logoBase64';

export default function StudentResult() {
  const location = useLocation();
  const resultData = location.state as { 
    submitted: boolean;
    score?: number;
    total?: number;
    subjectScores?: Record<string, { score: number, total: number }>;
  } | null;

  const [studentSession, setStudentSession] = useState<any>({});

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('student_session') || '{}');
    setStudentSession(session);
  }, []);

  // If someone navigates here directly without taking an exam, send them home
  if (!resultData?.submitted) {
    return <Navigate to="/" />;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation - Hidden in print */}
        <div className="flex justify-between items-center print:hidden">
          <Link to="/student/dashboard">
            <Button variant="ghost" className="text-gray-600 hover:text-green-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="bg-green-700 hover:bg-green-800 text-white rounded shadow-sm">
              <Printer className="w-4 h-4 mr-2" />
              Print Slip
            </Button>
          </div>
        </div>

        {/* Slip Container */}
        <div className="bg-white border-2 border-green-700 shadow-xl print:shadow-none print:border-none">
          {/* Header */}
          <div className="bg-green-50 border-b-2 border-green-700 p-6 text-center relative">
            <div className="absolute top-6 left-6">
              <img src={LOGO_BASE64} alt="JAMB Logo" className="w-20 h-20 object-contain" />
            </div>
            <div className="absolute top-6 right-6 opacity-20">
              <img src={LOGO_BASE64} alt="JAMB Logo watermark" className="w-20 h-20 object-contain grayscale" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black text-green-900 tracking-tight uppercase mt-2">
              Joint Admissions and Matriculation Board
            </h1>
            <h2 className="text-lg font-bold text-green-800 tracking-widest mt-1">
              UNIFIED TERTIARY MATRICULATION EXAMINATION
            </h2>
            <div className="inline-block bg-green-800 text-white px-4 py-1 mt-3 font-bold tracking-widest uppercase text-sm border border-green-900 shadow-sm">
              Notification of Result Slip
            </div>
          </div>

          <div className="p-8">
            {/* Candidate Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="md:col-span-1 flex justify-center md:justify-start">
                <div className="w-32 h-40 border-2 border-gray-300 bg-gray-50 flex items-center justify-center p-1 relative">
                  <div className="w-full h-full border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 gap-2 bg-white">
                    <User className="w-12 h-12" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Passport</span>
                  </div>
                  {/* Decorative corner staples */}
                  <div className="absolute top-1 left-1 w-2 h-0.5 bg-gray-400 rotate-45"></div>
                  <div className="absolute top-1 right-1 w-2 h-0.5 bg-gray-400 -rotate-45"></div>
                </div>
              </div>
              
              <div className="md:col-span-3">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 font-bold text-gray-500 uppercase w-1/3">Candidate Name:</td>
                      <td className="py-3 font-black text-gray-900 uppercase text-lg">{studentSession.name || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 font-bold text-gray-500 uppercase">Registration No:</td>
                      <td className="py-3 font-bold text-gray-900 font-mono text-lg">{studentSession.regNo || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 font-bold text-gray-500 uppercase">Class:</td>
                      <td className="py-3 font-bold text-gray-900 uppercase">{studentSession.class || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 font-bold text-gray-500 uppercase">Examination Status:</td>
                      <td className="py-3 font-bold text-green-700 uppercase flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Completed Successfully
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scores Table */}
            <div className="mb-8 border border-gray-300 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <span className="text-8xl font-black rotate-[-30deg] tracking-widest">JAMB UTME</span>
              </div>
              <table className="w-full relative z-10">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="py-3 px-4 text-left font-bold text-gray-700 uppercase tracking-widest border-r border-gray-300">Subject</th>
                    <th className="py-3 px-4 text-center font-bold text-gray-700 uppercase tracking-widest w-32">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {resultData?.subjectScores && Object.entries(resultData.subjectScores).map(([sub, data], idx) => {
                    // JAMB scales scores. Let's assume standard out of 100 or scale it if needed. 
                    // But here we show what was passed. Since there are 150 questions per subject, it's out of 150.
                    // Let's normalize it to out of 100 or simply show it as is. Let's scale to 100 for English, 100 for others = 400 total.
                    // Wait, standard JAMB is 100 marks per subject, making 400 max.
                    // The exam has 150 questions. So Score = (data.score / data.total) * 100.
                    const scaledScore = Math.round((data.score / data.total) * 100);
                    
                    return (
                      <tr key={idx} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-800 uppercase border-r border-gray-300">{sub}</td>
                        <td className="py-3 px-4 text-center font-black text-gray-900 font-mono text-xl">{scaledScore}</td>
                      </tr>
                    );
                  })}
                  {(!resultData?.subjectScores && resultData?.score !== undefined) && (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-gray-500 font-medium">
                        Detailed subject breakdown not available.
                      </td>
                    </tr>
                  )}
                  {/* Aggregate Row */}
                  <tr className="bg-gray-800 text-white">
                    <td className="py-4 px-4 font-black uppercase tracking-widest text-right border-r border-gray-600">Aggregate Score</td>
                    <td className="py-4 px-4 text-center font-black font-mono text-2xl text-green-400">
                      {resultData?.subjectScores ? 
                        Object.values(resultData.subjectScores).reduce((acc, curr) => acc + Math.round((curr.score / curr.total) * 100), 0)
                        : (resultData?.score || 0)
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Rules */}
            <div className="border-t-2 border-gray-200 pt-6 mt-12">
              <h4 className="font-bold text-gray-800 uppercase text-sm mb-2">Important Information:</h4>
              <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1 font-medium">
                <li>This result is subject to further screening.</li>
                <li>Candidates are advised to keep this slip safe for admission processing.</li>
                <li>Any alteration on this slip renders it completely invalid.</li>
              </ul>
              <div className="mt-8 flex justify-between items-end">
                <div>
                  <img src={LOGO_BASE64} alt="QR Code Signature" className="w-16 h-16 opacity-30 grayscale" style={{ filter: 'contrast(200%) grayscale(100%) blur(1px)' }} />
                </div>
                <div className="text-right">
                  <div className="border-b border-dashed border-gray-400 w-48 mb-1"></div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Registrar / Chief Executive</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
