import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function StudentResult() {
  const location = useLocation();
  const resultData = location.state as { submitted: boolean } | null;

  // If someone navigates here directly without taking an exam, send them home
  if (!resultData?.submitted) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>

      <Card className="w-full max-w-lg bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl animate-in zoom-in duration-500">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight mb-2">
            Exam Submitted!
          </CardTitle>
          <p className="text-blue-200">You have successfully completed the examination.</p>
        </CardHeader>

        <CardContent className="space-y-8 pt-6 text-center">
          <p className="text-lg text-slate-300">
            Your responses have been securely saved. You may now close this window or return to the dashboard.
          </p>
        </CardContent>

        <CardFooter className="pt-6 pb-8 flex flex-col gap-4">
          <Link to="/student/dashboard" className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 py-6 text-lg font-bold rounded-xl">
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/" className="text-sm text-blue-300/70 hover:text-white flex items-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Logout
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
