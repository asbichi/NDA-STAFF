import React, { useState } from 'react';
import { Save, Lock, User, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { auth } from '../firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        // If the user is using the demo bypass (no real Firebase auth session)
        toast.success('Password updated successfully (Demo Mode)!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsLoading(false);
        return;
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password update error:', error);
      let errorMessage = 'Failed to update password.';
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect current password.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log back in to change your password.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white border-b pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Security Settings
          </CardTitle>
          <CardDescription>Update your administrator password here.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="currentPassword" 
                  type="password"
                  placeholder="Enter current password" 
                  className="pl-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="newPassword" 
                  type="password"
                  placeholder="Enter new password" 
                  className="pl-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="confirmPassword" 
                  type="password"
                  placeholder="Confirm new password" 
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
