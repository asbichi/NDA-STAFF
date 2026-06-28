import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreditCard, Search, Plus, Trash2, Edit2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminPTAPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [adminNo, setAdminNo] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Paid');

  const adminRole = localStorage.getItem('admin_role');

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'pta_payments'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setPayments(data);
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error('Failed to load payments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !adminNo || !amount) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
        studentName,
        studentClass,
        adminNo,
        amount: Number(amount),
        status,
        updatedAt: new Date().toISOString()
      };

      if (currentId) {
        await updateDoc(doc(db, 'pta_payments', currentId), payload);
        toast.success('Payment updated successfully');
      } else {
        const newId = `pta_${Date.now()}`;
        await setDoc(doc(db, 'pta_payments', newId), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success('Payment added successfully');
      }
      setIsDialogOpen(false);
      loadPayments();
      resetForm();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error('Failed to save payment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'pta_payments', id));
      toast.success('Payment deleted successfully');
      loadPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error('Failed to delete payment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (payment: any) => {
    setCurrentId(payment.id);
    setStudentName(payment.studentName);
    setStudentClass(payment.studentClass || '');
    setAdminNo(payment.adminNo);
    setAmount(payment.amount.toString());
    setStatus(payment.status);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setCurrentId(null);
    setStudentName('');
    setStudentClass('');
    setAdminNo('');
    setAmount('');
    setStatus('Paid');
  };

  const filteredPayments = payments.filter(p => 
    p.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.adminNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (adminRole !== 'admin' && adminRole !== 'pta_financial_secretary') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 font-bold">Unauthorized access. Only Admin or PTA Financial Secretary can view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">PTA Payments</h1>
          <p className="text-sm text-slate-500">Manage Parents Teachers Association dues and payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search student or Reg No..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64 rounded-none border-slate-200"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 rounded-none shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-none sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{currentId ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <Input 
                    required 
                    value={studentName} 
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="e.g. Aisha Bello"
                    className="rounded-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Input 
                      required 
                      value={studentClass} 
                      onChange={e => setStudentClass(e.target.value)}
                      placeholder="e.g. JSS 1"
                      className="rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Admission No</Label>
                    <Input 
                      required 
                      value={adminNo} 
                      onChange={e => setAdminNo(e.target.value)}
                      placeholder="e.g. NDA/23/001"
                      className="rounded-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amount (₦)</Label>
                  <Input 
                    required 
                    type="number"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="5000"
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="flex h-10 w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-none">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="rounded-none">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Record
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-none border-none shadow-xl shadow-slate-200/50">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Payment Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Admin No</th>
                  <th className="px-6 py-4 text-right">Amount (₦)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading records...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{payment.studentName}</td>
                      <td className="px-6 py-4 text-slate-600">{payment.studentClass || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{payment.adminNo}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">₦{payment.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                          payment.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {payment.status === 'Paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {payment.status === 'Pending' && <XCircle className="w-3 h-3 mr-1" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(payment)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
