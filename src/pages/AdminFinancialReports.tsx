import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminFinancialReports() {
  const [ptaPayments, setPtaPayments] = useState<any[]>([]);
  const [bursaryTransactions, setBursaryTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const adminRole = localStorage.getItem('admin_role');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const ptaSnapshot = await getDocs(query(collection(db, 'pta_payments')));
      const bursarySnapshot = await getDocs(query(collection(db, 'bursary_transactions')));

      const pta: any[] = [];
      ptaSnapshot.forEach(doc => {
        pta.push({ id: doc.id, ...doc.data() });
      });

      const bursary: any[] = [];
      bursarySnapshot.forEach(doc => {
        bursary.push({ id: doc.id, ...doc.data() });
      });

      setPtaPayments(pta);
      setBursaryTransactions(bursary);
    } catch (error) {
      console.error("Error loading financial records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Process data to merge by student
  const mergedRecordsMap = new Map<string, any>();

  // Helper to extract a normalized key for a student (adminNo or name)
  const getStudentKey = (record: any) => {
    return record.adminNo?.trim().toLowerCase() || record.studentName?.trim().toLowerCase() || 'unknown';
  };

  // Add school fees from bursary transactions
  bursaryTransactions.forEach(t => {
    if (t.paymentType === 'School Fees' && t.status === 'Paid') {
      const key = getStudentKey(t);
      if (!mergedRecordsMap.has(key)) {
        mergedRecordsMap.set(key, {
          studentName: t.studentName,
          adminNo: t.adminNo || 'N/A',
          studentClass: t.studentClass || 'N/A',
          schoolFeesPaid: 0,
          ptaLevyPaid: 0,
        });
      }
      mergedRecordsMap.get(key).schoolFeesPaid += Number(t.amount) || 0;
      // Prefer class from bursary if missing
      if (mergedRecordsMap.get(key).studentClass === 'N/A' && t.studentClass) {
        mergedRecordsMap.get(key).studentClass = t.studentClass;
      }
    }
  });

  // Add pta levy
  ptaPayments.forEach(p => {
    if (p.status === 'Paid') {
      const key = getStudentKey(p);
      if (!mergedRecordsMap.has(key)) {
        mergedRecordsMap.set(key, {
          studentName: p.studentName,
          adminNo: p.adminNo || 'N/A',
          studentClass: p.studentClass || 'N/A',
          schoolFeesPaid: 0,
          ptaLevyPaid: 0,
        });
      }
      mergedRecordsMap.get(key).ptaLevyPaid += Number(p.amount) || 0;
      if (mergedRecordsMap.get(key).studentClass === 'N/A' && p.studentClass) {
        mergedRecordsMap.get(key).studentClass = p.studentClass;
      }
    }
  });

  const allRecords = Array.from(mergedRecordsMap.values());

  const filteredRecords = allRecords.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.adminNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by class for the chart
  const classChartMap = new Map<string, { className: string, schoolFees: number, ptaLevy: number }>();
  allRecords.forEach(r => {
    const cls = r.studentClass || 'Unassigned';
    if (!classChartMap.has(cls)) {
      classChartMap.set(cls, { className: cls, schoolFees: 0, ptaLevy: 0 });
    }
    classChartMap.get(cls)!.schoolFees += r.schoolFeesPaid;
    classChartMap.get(cls)!.ptaLevy += r.ptaLevyPaid;
  });

  const chartData = Array.from(classChartMap.values()).sort((a, b) => a.className.localeCompare(b.className));

  const totalSchoolFees = allRecords.reduce((acc, curr) => acc + curr.schoolFeesPaid, 0);
  const totalPtaLevy = allRecords.reduce((acc, curr) => acc + curr.ptaLevyPaid, 0);

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
          <h1 className="text-2xl font-serif font-bold text-primary">Financial Overview</h1>
          <p className="text-sm text-slate-500">Aggregate view of School Fees and PTA Levy payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-none border-none shadow-md shadow-slate-200/50">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total School Fees</p>
            <h3 className="text-3xl font-serif font-bold text-emerald-700 mt-2">₦{totalSchoolFees.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="rounded-none border-none shadow-md shadow-slate-200/50">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total PTA Levy</p>
            <h3 className="text-3xl font-serif font-bold text-blue-700 mt-2">₦{totalPtaLevy.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="rounded-none border-none shadow-md shadow-slate-200/50">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Overall Revenue</p>
            <h3 className="text-3xl font-serif font-bold text-slate-900 mt-2">₦{(totalSchoolFees + totalPtaLevy).toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-none border-none shadow-xl shadow-slate-200/50 h-[450px]">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Revenue per Class</CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[380px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No data available for chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="className" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `₦${val / 1000}k`} />
                    <RechartsTooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '0', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`₦${value.toLocaleString()}`, undefined]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar dataKey="schoolFees" name="School Fees" fill="#047857" radius={[2, 2, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="ptaLevy" name="PTA Levy" fill="#1d4ed8" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-none border-none shadow-xl shadow-slate-200/50 h-full min-h-[450px]">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Student Payment Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search name, class or admin no..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 rounded-none border-slate-200 w-full"
                  />
                </div>
              </div>
              <div className="overflow-y-auto custom-scrollbar flex-1 max-h-[600px]">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No payment records found.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filteredRecords.map((record, idx) => (
                      <li key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-slate-900">{record.studentName}</p>
                            <p className="text-xs font-mono text-slate-500">{record.adminNo} • {record.studentClass}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <div className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded text-xs font-medium border border-emerald-100 flex-1 text-center">
                            <span className="block text-[10px] uppercase tracking-wider text-emerald-600 mb-0.5">Fees</span>
                            ₦{record.schoolFeesPaid.toLocaleString()}
                          </div>
                          <div className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs font-medium border border-blue-100 flex-1 text-center">
                            <span className="block text-[10px] uppercase tracking-wider text-blue-600 mb-0.5">PTA</span>
                            ₦{record.ptaLevyPaid.toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
