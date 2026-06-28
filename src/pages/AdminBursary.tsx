import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreditCard, Search, Plus, Trash2, Edit2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminBursary() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [adminNo, setAdminNo] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('School Fees');
  const [status, setStatus] = useState('Paid');

  const adminRole = localStorage.getItem('admin_role');

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'bursary_transactions'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      // Sort by date descending
      data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error('Failed to load transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentClass || !amount) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
        studentName,
        studentClass,
        adminNo,
        paymentType,
        amount: Number(amount),
        status,
        updatedAt: new Date().toISOString()
      };

      if (currentId) {
        await updateDoc(doc(db, 'bursary_transactions', currentId), payload);
        toast.success('Transaction updated successfully');
      } else {
        const newId = `txn_${Date.now()}`;
        await setDoc(doc(db, 'bursary_transactions', newId), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success('Transaction added successfully');
      }
      setIsDialogOpen(false);
      loadTransactions();
      resetForm();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error('Failed to save transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'bursary_transactions', id));
      toast.success('Transaction deleted successfully');
      loadTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error('Failed to delete transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (txn: any) => {
    setCurrentId(txn.id);
    setStudentName(txn.studentName);
    setStudentClass(txn.studentClass);
    setAdminNo(txn.adminNo || '');
    setPaymentType(txn.paymentType || 'School Fees');
    setAmount(txn.amount.toString());
    setStatus(txn.status);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setCurrentId(null);
    setStudentName('');
    setStudentClass('');
    setAdminNo('');
    setPaymentType('School Fees');
    setAmount('');
    setStatus('Paid');
  };

  const filteredTransactions = transactions.filter(t => 
    t.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.studentClass?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.adminNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (adminRole !== 'admin' && adminRole !== 'bursar') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 font-bold">Unauthorized access. Only Admin or Bursar can view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Bursary Operations</h1>
          <p className="text-sm text-slate-500">Monitor transactions, fee payments, and financial records.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name, class, or ID..." 
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
                Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-none sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{currentId ? 'Edit Transaction' : 'Record New Transaction'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <Input 
                    required 
                    value={studentName} 
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="e.g. John Doe"
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
                    <Label>Admission No (Optional)</Label>
                    <Input 
                      value={adminNo} 
                      onChange={e => setAdminNo(e.target.value)}
                      placeholder="e.g. NDA/23/001"
                      className="rounded-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <select 
                    value={paymentType} 
                    onChange={e => setPaymentType(e.target.value)}
                    className="flex h-10 w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  >
                    <option value="School Fees">School Fees</option>
                    <option value="Books">Books</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Excursion">Excursion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (₦)</Label>
                    <Input 
                      required 
                      type="number"
                      value={amount} 
                      onChange={e => setAmount(e.target.value)}
                      placeholder="25000"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="rounded-none border-none shadow-md shadow-slate-200/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Collected</p>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                ₦{filteredTransactions.filter(t => t.status === 'Paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-none shadow-md shadow-slate-200/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pending</p>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                ₦{filteredTransactions.filter(t => t.status === 'Pending').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-none shadow-xl shadow-slate-200/50">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount (₦)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading records...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {txn.studentName}
                        {txn.adminNo && <div className="text-[10px] text-slate-400 font-mono">{txn.adminNo}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{txn.studentClass}</td>
                      <td className="px-6 py-4 text-slate-600">{txn.paymentType || 'School Fees'}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">₦{txn.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          txn.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                          txn.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {txn.status === 'Paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {txn.status === 'Pending' && <XCircle className="w-3 h-3 mr-1" />}
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(txn)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(txn.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
