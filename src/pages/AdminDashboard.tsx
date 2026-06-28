import { 
  Users, BookOpen, Library, 
  CreditCard, CalendarClock, Activity, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, Award,
  FileText, FileEdit, MonitorPlay, Database, Loader2, ClipboardCheck,
  Plus, X, UserPlus, GraduationCap, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { seedDatabase } from '../services/dataService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const performanceData = [
  { term: '1st Term', average: 65 },
  { term: '2nd Term', average: 72 },
  { term: '3rd Term', average: 78 },
];

const classPerformanceData = [
  { className: 'JSS 1', average: 78, highest: 95 },
  { className: 'JSS 2', average: 72, highest: 90 },
  { className: 'JSS 3', average: 75, highest: 92 },
  { className: 'SSS 1', average: 68, highest: 88 },
  { className: 'SSS 2', average: 70, highest: 89 },
  { className: 'SSS 3', average: 82, highest: 98 },
];

const feesData = [
  { month: 'Jan', collected: 400000 },
  { month: 'Feb', collected: 300000 },
  { month: 'Mar', collected: 200000 },
  { month: 'Apr', collected: 278000 },
  { month: 'May', collected: 189000 },
  { month: 'Jun', collected: 239000 },
];

const StatCard = ({ title, value, icon: Icon, description, trend, trendType }: { 
  title: string, value: string, icon: any, description?: string, trend?: string, trendType?: 'up' | 'down' 
}) => (
  <Card className="bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all duration-200 rounded-xl group overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-xs font-semibold text-slate-500 tracking-normal">{title}</CardTitle>
      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm">
        <Icon className="w-5 h-5" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trendType === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendType === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
        {description && <p className="text-xs font-medium text-slate-400">{description}</p>}
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('admin_role');
    if (role === 'pta_financial_secretary') {
      navigate('/admin/pta-payments', { replace: true });
    } else if (role === 'bursar') {
      navigate('/admin/bursary', { replace: true });
    }
  }, [navigate]);

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
    <div className="space-y-8 pb-12">
      {/* 1. Executive Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm font-normal">Welcome back, Administrator. Here is your academic and operational overview.</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-3"
        >
          <Button 
            variant="outline" 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 text-amber-700 border-amber-200 text-xs font-medium hover:bg-amber-100 transition-colors shadow-sm"
          >
            {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            {isSyncing ? "Syncing..." : "Repair Database"}
          </Button>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            System Online
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium shadow-sm">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </motion.div>
      </div>

      {/* 2. Top KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard title="Total Students" value="1,245" icon={Users} trend="+12%" trendType="up" description="vs last term" />
        <StatCard title="Questions Bank" value="4,820" icon={Library} description="Across 12 subjects" />
        <StatCard title="Active Exams" value="08" icon={CalendarClock} trend="Live" trendType="up" description="Currently running" />
        <StatCard title="Avg. CBT Score" value="68%" icon={Activity} trend="-2%" trendType="down" description="Last 30 days" />
        <StatCard title="Total Classes" value="36" icon={BookOpen} description="JSS1 - SS3" />
        <StatCard title="Fees Collection" value="₦12.4M" icon={CreditCard} trend="+5%" trendType="up" description="This term" />
      </div>

      {/* 3. Main Assessment Banner & Quick Access Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-800 shadow-md rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-400">Termly Assessment Center</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col justify-between h-full pb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Manage Termly Reports</h2>
              <p className="text-slate-300 text-sm mb-6 max-w-lg font-normal leading-relaxed">Manually key in CA and Examination scores per subject and student, then generate the official examination report sheets.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/admin/score-entry">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg px-5 py-2.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer">
                  Key in Scores
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline" className="border-white/20 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-lg px-5 py-2.5 backdrop-blur-sm transition-all cursor-pointer">
                  Generate Reports
                </Button>
              </Link>
              <Link to="/admin/cbt-results">
                <Button variant="ghost" className="text-blue-300 hover:text-white hover:bg-white/10 font-medium text-xs rounded-lg px-4 py-2.5 transition-all cursor-pointer">
                  CBT Results &rarr;
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Portal Cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Student Directory', path: '/admin/students', icon: Users, color: 'bg-blue-50/70 text-blue-700 border-blue-200/80 hover:bg-blue-100/80 hover:border-blue-400' },
            { name: 'Score Entry', path: '/admin/score-entry', icon: FileEdit, color: 'bg-emerald-50/70 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/80 hover:border-emerald-400' },
            { name: 'Term Assessment', path: '/admin/term-assessment', icon: ClipboardCheck, color: 'bg-indigo-50/70 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/80 hover:border-indigo-400' },
            { name: 'CBT Databank', path: '/admin/cbt', icon: Database, color: 'bg-violet-50/70 text-violet-700 border-violet-200/80 hover:bg-violet-100/80 hover:border-violet-400' },
          ].map((action) => (
            <Link 
              key={action.name} 
              to={action.path}
              className={`flex flex-col items-center justify-center p-5 border rounded-xl ${action.color} shadow-xs hover:shadow-md transition-all duration-200 group text-center`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/80 shadow-xs flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-200">
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold tracking-tight">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Performance Chart */}
        <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-800 tracking-tight">CBT Performance Trend</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="h-[320px] pt-6 px-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="term" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#0f172a'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#2563eb" 
                  strokeWidth={2.5} 
                  dot={{r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} 
                  activeDot={{r: 6, fill: '#2563eb'}}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fees Collection Chart */}
        <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-800 tracking-tight">Revenue Analysis (₦)</CardTitle>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="h-[320px] pt-6 px-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                  tickFormatter={(value) => `₦${value/1000}k`}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#0f172a'
                  }}
                />
                <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class Performance Chart */}
        <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl overflow-hidden lg:col-span-2">
          <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-800 tracking-tight">Class Performance Distribution (Current Term)</CardTitle>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="h-[320px] pt-6 px-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="className" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                  domain={[0, 100]}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#0f172a'
                  }}
                />
                <Bar dataKey="average" name="Average Score" fill="#9333ea" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="highest" name="Highest Score" fill="#d8b4fe" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 5. Recent Activity Table */}
      <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-800 tracking-tight">Recent Academic Activity</CardTitle>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Abdullah Bichi', activity: 'Completed Mathematics CBT', class: 'SSS 3 Science', status: 'Passed', time: '2 mins ago' },
                  { name: 'Fatima Yusuf', activity: 'Score Sheet Keyed In', class: 'JSS 2', status: 'Verified', time: '15 mins ago' },
                  { name: 'Samuel Okon', activity: 'Started English CBT', class: 'SSS 1 Art', status: 'In Progress', time: '45 mins ago' },
                  { name: 'Grace Adebayo', activity: 'Result Sheet Generated', class: 'JSS 3', status: 'Success', time: '1 hour ago' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0">
                          {row.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-normal">{row.activity}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{row.class}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200/60 inline-block">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 text-right font-medium">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Floating Quick Actions Menu */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isQuickActionsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2.5 mb-1 items-end"
            >
              {[
                { label: 'Add Student', path: '/admin/students', icon: UserPlus, iconBg: 'bg-blue-500 text-white' },
                { label: 'Generate Report', path: '/admin/reports', icon: FileText, iconBg: 'bg-emerald-500 text-white' },
                { label: 'CBT Databank', path: '/admin/cbt', icon: GraduationCap, iconBg: 'bg-indigo-500 text-white' },
                { label: 'Key in Scores', path: '/admin/score-entry', icon: FileEdit, iconBg: 'bg-amber-500 text-white' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-md text-white pl-4 pr-2.5 py-2 rounded-full shadow-lg border border-slate-700/80 hover:border-blue-500 hover:bg-slate-800 transition-all duration-200 group cursor-pointer"
                >
                  <span className="text-xs font-semibold tracking-wide">{action.label}</span>
                  <div className={`w-8 h-8 rounded-full ${action.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
          className={`h-14 px-6 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2.5 font-semibold text-sm cursor-pointer ${
            isQuickActionsOpen 
              ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/35 hover:scale-105'
          }`}
        >
          {isQuickActionsOpen ? (
            <>
              <X className="w-5 h-5 transition-transform duration-200" />
              <span>Close Menu</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-blue-200 animate-pulse" />
              <span>Quick Actions</span>
              <Plus className="w-4 h-4 ml-0.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
