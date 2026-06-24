import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, User, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending verification
    setTimeout(() => {
      toast.success('Verification sent to email!');
      setStep(2);
      setIsLoading(false);
    }, 1000);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    // Simulate password reset
    setTimeout(() => {
      toast.success('Password reset successfully!');
      setStep(3);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Logo Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 -z-10">
        <img src="/logo.png" alt="" className="w-[600px] h-[600px] object-contain grayscale" referrerPolicy="no-referrer" />
      </div>

      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl -z-10"></div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'New Password'}
            {step === 3 && 'Success'}
          </CardTitle>
          <CardDescription className="text-purple-200/70">
            {step === 1 && 'Enter your details to receive a reset link'}
            {step === 2 && 'Enter your new password below'}
            {step === 3 && 'Your password has been updated'}
          </CardDescription>
        </CardHeader>
        
        {step === 1 && (
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-purple-100">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-purple-300/50" />
                  <Input 
                    id="username" 
                    placeholder="Enter username" 
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-100">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-300/50" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="Enter email" 
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Send Verification'}
              </Button>
              <Link to="/login" className="text-sm text-purple-300/70 hover:text-white flex items-center transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
              </Link>
            </CardFooter>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-purple-100">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-300/50" />
                  <Input 
                    id="newPassword" 
                    type="password"
                    placeholder="Enter new password" 
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-purple-100">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-300/50" />
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    placeholder="Confirm new password" 
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </CardFooter>
          </form>
        )}

        {step === 3 && (
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <p className="text-center text-purple-200">Your password has been successfully reset. You can now login with your new password.</p>
            <Link to="/login" className="w-full">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
