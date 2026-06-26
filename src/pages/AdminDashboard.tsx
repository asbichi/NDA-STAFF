import { 
  Users, UserCheck, BookOpen, Library, 
  CreditCard, CalendarClock, Activity, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, Award,
  FileText, Printer, FileEdit, MonitorPlay, Database, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { seedDatabase } from '../services/dataService';
import { toast } from 'sonner';

const performanceData = [
  { term: '1st Term', average: 65 },
  { term: '2nd Term', average: 72 },
  { term: '3rd Term', average: 78 },
];

const feesData = [
  { month: 'Jan', collected: 400000 },
  { month: 'Feb', collected: 300000 },
  { month: 'Mar', collected: 200000 },
  { month: 'Apr', collected: 278000 },
  { month: 'May', collected: 189000 },
  { month: 'Jun', collected: 239000 },
];

const attendanceData = [
  { week: 'W1', present: 95 },
  { week: 'W2', present: 92 },
  { week: 'W3', present: 96 },
  { week: 'W4', present: 89 },
];

const StatCard = ({ title, value, icon: Icon, description, trend, trendType }: { 
  title: string, value: string, icon: any, description?: string, trend?: string, trendType?: 'up' | 'down' 
}) => (
  <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-none group">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{title}</CardTitle>
      <div className="w-10 h-10 bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
        <Icon className="w-4 h-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-serif font-bold text-primary">{value}</div>
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${trendType === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
        {description && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{description}</p>}
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.info("Starting database synchronization...");
    try {
      await seedDatabase((msg) => {
        console.log(msg);
      });
      toast.success("Database synchronization complete!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Synchronization failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-2 font-light">Welcome back, Administrator. Here's the current academic overview.</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Button 
            variant="outline" 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-100 transition-colors"
          >
            {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            {isSyncing ? "Syncing..." : "Repair Database"}
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            System Online
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'Manual Score Entry', path: '/admin/score-entry', icon: FileEdit, color: 'bg-amber-50 text-amber-700 border-amber-100' },
          { name: 'Generate Report', path: '/admin/reports', icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { name: 'Bulk Reports', path: '/admin/bulk-reports', icon: Printer, color: 'bg-purple-50 text-purple-700 border-purple-100' },
          { name: 'CBT Databank', path: '/admin/cbt', icon: MonitorPlay, color: 'bg-rose-50 text-rose-700 border-rose-100' },
        ].map((action) => (
          <Link 
            key={action.name} 
            to={action.path}
            className={`flex flex-col items-center justify-center p-6 border ${action.color} hover:shadow-lg transition-all duration-300 group`}
          >
            <action.icon className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-center">{action.name}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-slate-100 shadow-sm rounded-none bg-gradient-to-br from-primary to-[#1d4ed8] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <CardHeader>
            <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-accent">Termly Assessment Center</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-4">Manage Termly Reports</h2>
            <p className="text-slate-300 text-sm mb-8 max-w-md font-light">Manually key in CA and Exam scores per subject and student, then generate the official secondary termly examination report sheets.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/admin/score-entry">
                <Button className="bg-accent hover:bg-accent/90 text-primary font-bold text-[10px] uppercase tracking-widest rounded-none px-8">
                  Key in Scores
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-none px-8">
                  Generate Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm rounded-none flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-serif font-bold text-primary mb-2">Result Analysis</h3>
          <p className="text-xs text-slate-500 mb-6">View detailed performance analysis and broad sheets for the current session.</p>
          <Link to="/admin/analysis" className="w-full">
            <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-slate-50">
              View Analysis
            </Button>
          </Link>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Students" value="1,245" icon={Users} trend="+12%" trendType="up" description="vs last term" />
        <StatCard title="Questions Bank" value="4,820" icon={Library} description="Across 12 subjects" />
        <StatCard title="Active Exams" value="08" icon={CalendarClock} trend="Live" trendType="up" description="Currently running" />
        <StatCard title="Avg. CBT Score" value="68%" icon={Activity} trend="-2%" trendType="down" description="Last 30 days" />
        <StatCard title="Total Classes" value="36" icon={BookOpen} description="JSS1 - SS3" />
        <StatCard title="Fees Collection" value="₦12.4M" icon={CreditCard} trend="+5%" trendType="up" description="This term" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Student Performance Chart */}
        <Card className="border-slate-100 shadow-sm rounded-none">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">CBT Performance Trend</CardTitle>
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="term" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '0px', 
                    border: '1px solid #f1f5f9', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} 
                  activeDot={{r: 6, fill: '#10b981'}}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fees Collection Chart */}
        <Card className="border-slate-100 shadow-sm rounded-none">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Revenue Analysis (₦)</CardTitle>
              <CreditCard className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  tickFormatter={(value) => `₦${value/1000}k`}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    borderRadius: '0px', 
                    border: '1px solid #f1f5f9', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                />
                <Bar dataKey="collected" fill="#2563eb" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Table (New) */}
        <Card className="border-slate-100 shadow-sm rounded-none lg:col-span-2">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Recent Academic Activity</CardTitle>
              <Award className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student Name</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Activity</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Class</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { name: 'Abdullah Bichi', activity: 'Completed Mathematics CBT', class: 'SSS 3 Science', status: 'Passed', time: '2 mins ago' },
                    { name: 'Fatima Yusuf', activity: 'Paid 2nd Term Fees', class: 'JSS 2', status: 'Verified', time: '15 mins ago' },
                    { name: 'Samuel Okon', activity: 'Started English CBT', class: 'SSS 1 Art', status: 'In Progress', time: '45 mins ago' },
                    { name: 'Grace Adebayo', activity: 'Result Sheet Generated', class: 'JSS 3', status: 'Success', time: '1 hour ago' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-none flex items-center justify-center text-[10px] font-bold text-primary">
                            {row.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-bold text-primary">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-500 font-light">{row.activity}</td>
                      <td className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{row.class}</td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-[10px] font-bold text-slate-400 text-right uppercase tracking-widest">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
