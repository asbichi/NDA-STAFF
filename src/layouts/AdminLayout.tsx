import { LOGO_BASE64 } from "@/src/logoBase64";
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, 
  CreditCard, FileSpreadsheet, Calendar, BarChart3, 
  UserCircle, FileText, MonitorPlay, Settings, LogOut,
  Menu, Printer, FileEdit, Bell, Search, ChevronRight, Database,
  UserPlus, Check, Trash2, Inbox, ChevronDown, ChevronUp, LayoutGrid, ClipboardCheck, PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';

const sidebarGroups = [
  {
    title: 'Overview',
    links: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Academic Records',
    links: [
      { name: 'Students', path: '/admin/students', icon: Users },
      { name: 'Score Entry', path: '/admin/score-entry', icon: FileEdit },
      { name: 'Term Assessment', path: '/admin/term-assessment', icon: ClipboardCheck },
      { name: 'Report Sheets', path: '/admin/reports', icon: FileText },
    ]
  },
  {
    title: 'Exams & Assessment',
    links: [
      { name: 'CBT Databank', path: '/admin/cbt', icon: Database },
      { name: 'CBT Results', path: '/admin/cbt-results', icon: MonitorPlay },
    ]
  },
  {
    title: 'Administration',
    links: [
      { name: 'School Gallery', path: '/admin/gallery', icon: LayoutGrid },
      { name: 'System Settings', path: '/admin/settings', icon: Settings },
    ]
  }
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'registration' | 'fee'>('all');
  const [firestoreStudents, setFirestoreStudents] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const navDropdownRef = useRef<HTMLDivElement>(null);

  // Persistence for read notifications
  const [readIds, setReadIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('admin_read_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence for dismissed notifications
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('admin_dismissed_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save read state to local storage
  useEffect(() => {
    localStorage.setItem('admin_read_notifications', JSON.stringify(readIds));
  }, [readIds]);

  // Save dismissed state to local storage
  useEffect(() => {
    localStorage.setItem('admin_dismissed_notifications', JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  const adminRole = localStorage.getItem('admin_role') || 'admin';

  const filteredSidebarGroups = sidebarGroups.map(group => {
    if (adminRole === 'pta_financial_secretary') {
      if (group.title === 'Overview') {
        return {
          ...group,
          links: [
            { name: 'PTA Payments', path: '/admin/pta-payments', icon: CreditCard }
          ]
        };
      }
      return { ...group, links: [] };
    }

    if (adminRole === 'bursar') {
      if (group.title === 'Overview') {
        return {
          ...group,
          links: [
            { name: 'Bursary', path: '/admin/bursary', icon: CreditCard },
            { name: 'Financial Overview', path: '/admin/financial-reports', icon: PieChart }
          ]
        };
      }
      return { ...group, links: [] };
    }
    
    // For regular admins, add PTA payments, Bursary, and Financial Reports to Administration or similar
    if (group.title === 'Administration') {
      return {
        ...group,
        links: [
          ...group.links,
          { name: 'PTA Payments', path: '/admin/pta-payments', icon: CreditCard },
          { name: 'Bursary', path: '/admin/bursary', icon: CreditCard },
          { name: 'Financial Overview', path: '/admin/financial-reports', icon: PieChart }
        ]
      };
    }
    return group;
  }).filter(group => group.links.length > 0);

  // Click outside to close notification or quick nav dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target as Node)) {
        setIsNavDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Live listener to Firestore for new student registrations (last 5)
  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreRegs = snapshot.docs.slice(0, 5).map(doc => {
        const data = doc.data();
        const name = data.name || 'Unknown Student';
        const studentClass = data.class || '';
        const arm = data.arm || '';
        const adminNo = data.admissionNo || data.adminNo || '';
        const createdAt = data.createdAt;
        
        let relativeTime = 'Recently';
        let timestamp = Date.now();
        if (createdAt && typeof createdAt.toDate === 'function') {
          const date = createdAt.toDate();
          timestamp = date.getTime();
          const diffMs = Date.now() - timestamp;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);
          
          if (diffMins < 1) relativeTime = 'Just now';
          else if (diffMins < 60) relativeTime = `${diffMins}m ago`;
          else if (diffHours < 24) relativeTime = `${diffHours}h ago`;
          else relativeTime = `${diffDays}d ago`;
        }

        return {
          id: `reg_${doc.id}`,
          type: 'registration' as const,
          title: `New Registration: ${name}`,
          description: `Enrolled in ${studentClass} ${arm} | Admin No: ${adminNo}`,
          time: relativeTime,
          link: '/admin/students',
          timestamp: timestamp
        };
      });
      
      setFirestoreStudents(firestoreRegs);
    }, (error) => {
      console.error("Notification listener error: ", error);
    });

    return () => unsubscribe();
  }, []);

  const feeAlerts = [
    {
      id: 'fee_1',
      type: 'fee' as const,
      title: 'Pending Tuition: Chukwuemeka Obi',
      description: 'First Term Tuition fee of ₦45,000 is pending/unpaid for SS 2 A',
      time: '2h ago',
      link: '/admin/fees',
      timestamp: Date.now() - 2 * 60 * 60 * 1000
    },
    {
      id: 'fee_2',
      type: 'fee' as const,
      title: 'Overdue Exam Fee: Alhaji Bello',
      description: 'CBT Examination fee of ₦10,000 is outstanding for student Aisha Bello',
      time: '1d ago',
      link: '/admin/fees',
      timestamp: Date.now() - 24 * 60 * 60 * 1000
    },
    {
      id: 'fee_3',
      type: 'fee' as const,
      title: 'Pending Development Levy: Fatima Musa',
      description: 'Annual school development levy of ₦20,000 is unpaid for JSS 3',
      time: '3d ago',
      link: '/admin/fees',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
    }
  ];

  const fallbackRegistrations = [
    {
      id: 'reg_mock_1',
      type: 'registration' as const,
      title: 'New Registration: Aisha Bello',
      description: 'Enrolled in SS 1 A | Admin No: NDA/23/001',
      time: '1d ago',
      link: '/admin/students',
      timestamp: Date.now() - 26 * 60 * 60 * 1000
    },
    {
      id: 'reg_mock_2',
      type: 'registration' as const,
      title: 'New Registration: Chukwuemeka Obi',
      description: 'Enrolled in SS 2 A | Admin No: NDA/23/002',
      time: '2d ago',
      link: '/admin/students',
      timestamp: Date.now() - 48 * 60 * 60 * 1000
    }
  ];

  const activeRegistrations = firestoreStudents.length > 0 ? firestoreStudents : fallbackRegistrations;
  
  const allAlerts = [
    ...activeRegistrations,
    ...feeAlerts
  ]
    .filter(item => !dismissedIds.includes(item.id))
    .sort((a, b) => b.timestamp - a.timestamp);

  const filteredAlerts = allAlerts.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const unreadCount = allAlerts.filter(item => !readIds.includes(item.id)).length;

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      setReadIds(prev => [...prev, id]);
    }
  };

  const markAllAsRead = () => {
    const unreadIds = allAlerts.filter(item => !readIds.includes(item.id)).map(item => item.id);
    if (unreadIds.length > 0) {
      setReadIds(prev => [...prev, ...unreadIds]);
      toast.success("All notifications marked as read");
    }
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds(prev => [...prev, id]);
    toast.success("Notification cleared");
  };

  const handleNotificationClick = (item: any) => {
    markAsRead(item.id);
    setIsOpen(false);
    navigate(item.link);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-primary text-white">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src={LOGO_BASE64} alt="NDA Logo" className="w-10 h-10 object-contain bg-white rounded-full p-1 shrink-0"  />
          <div className="flex flex-col bg-black px-3 py-2 border border-white/10">
            <span className="font-serif font-bold text-sm leading-tight tracking-wider text-white">NDA STAFF SECONDARY SCHOOL</span>
            <span className="text-[8px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-0.5">Global Academy</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="py-8 px-6 space-y-10">
          {filteredSidebarGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </h3>
              <nav className="space-y-1">
                {group.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                        <span className="text-sm tracking-normal">{link.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 border-t border-white/5">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-red-500/10 transition-all rounded-none"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper flex print:bg-white print:block">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 h-screen sticky top-0 shrink-0 shadow-2xl z-10 overflow-hidden print:hidden">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen print:h-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-4 lg:hidden">
            <Sheet>
              <SheetTrigger className="p-2 text-primary hover:bg-slate-50 rounded-md transition-colors focus:outline-none">
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 border-none">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 bg-black px-2.5 py-1 border border-white/10">
              <img src={LOGO_BASE64} alt="NDA Logo" className="w-6 h-6 object-contain"  />
              <span className="font-serif font-bold text-xs leading-none tracking-wider text-white">NDA STAFF SECONDARY SCHOOL</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search portal..." 
                className="w-full bg-slate-50 border-none text-sm px-10 py-2 rounded-none focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Quick Navigation Dropdown for Phone/Tablet View */}
            <div className="relative lg:hidden" ref={navDropdownRef}>
              <button 
                onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                className={`relative flex items-center gap-1 p-2 rounded-none transition-all duration-300 focus:outline-none ${isNavDropdownOpen ? 'text-primary bg-slate-50' : 'text-slate-400 hover:text-primary hover:bg-slate-50'}`}
                title="Quick Navigation"
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Nav</span>
                {isNavDropdownOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <AnimatePresence>
                {isNavDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-[calc(100vw-3rem)] xs:w-[320px] sm:w-[380px] bg-white border border-slate-100 shadow-2xl z-50 rounded-none overflow-hidden"
                  >
                    {/* Dropdown Header */}
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-accent" />
                        <span className="font-serif font-black text-[11px] uppercase tracking-wider text-primary">Portal Navigation</span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5">
                        Quick Access
                      </span>
                    </div>

                    {/* Navigation Icons Grid */}
                    <div className="p-3 bg-white grid grid-cols-3 gap-2 max-h-[360px] overflow-y-auto custom-scrollbar">
                      {filteredSidebarGroups.flatMap(group => group.links).map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsNavDropdownOpen(false)}
                            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 group ${
                              isActive 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20' 
                                : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-blue-600'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mb-2 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-blue-600'}`} />
                            <span className={`text-[9px] font-semibold uppercase tracking-wider text-center line-clamp-1 w-full ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'}`}>
                              {link.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        NDA Staff Secondary School
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Center Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-none transition-all duration-300 focus:outline-none ${isOpen ? 'text-primary bg-slate-50' : 'text-slate-400 hover:text-primary hover:bg-slate-50'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 bg-accent text-[8px] font-black text-white rounded-full flex items-center justify-center border border-white px-0.5 shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-96 bg-white border border-slate-100 shadow-2xl z-50 rounded-none overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-black text-xs uppercase tracking-wider text-primary">Notification Center</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-none uppercase tracking-wider border border-red-100">
                            {unreadCount} Active
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[9px] font-black uppercase tracking-widest text-accent hover:text-primary transition-colors focus:outline-none"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 text-center py-2 text-[8px] font-black uppercase tracking-widest transition-all focus:outline-none ${
                          activeTab === 'all' 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-400 hover:text-primary'
                        }`}
                      >
                        All ({allAlerts.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('registration')}
                        className={`flex-1 text-center py-2 text-[8px] font-black uppercase tracking-widest transition-all focus:outline-none ${
                          activeTab === 'registration' 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-400 hover:text-primary'
                        }`}
                      >
                        Registrations ({allAlerts.filter(i => i.type === 'registration').length})
                      </button>
                      <button
                        onClick={() => setActiveTab('fee')}
                        className={`flex-1 text-center py-2 text-[8px] font-black uppercase tracking-widest transition-all focus:outline-none ${
                          activeTab === 'fee' 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-400 hover:text-primary'
                        }`}
                      >
                        Fees ({allAlerts.filter(i => i.type === 'fee').length})
                      </button>
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                      {filteredAlerts.length === 0 ? (
                        <div className="py-12 px-5 text-center flex flex-col items-center justify-center bg-white">
                          <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
                            <Inbox className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">All caught up</p>
                          <p className="text-[9px] text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                            No notifications found in {activeTab === 'all' ? 'any categories' : `${activeTab} alerts`}.
                          </p>
                        </div>
                      ) : (
                        filteredAlerts.map((item) => {
                          const isUnread = !readIds.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleNotificationClick(item)}
                              className={`p-4 flex gap-3 transition-all hover:bg-slate-50 cursor-pointer relative group ${
                                isUnread ? 'bg-blue-50/20' : 'bg-white'
                              }`}
                            >
                              {/* Left status accent strip */}
                              {isUnread && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                              )}

                              {/* Action category circle icon */}
                              <div className="shrink-0 mt-0.5">
                                {item.type === 'registration' ? (
                                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                                    <UserPlus className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100">
                                    <CreditCard className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>

                              {/* Body content */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-start justify-between gap-1">
                                  <p className={`text-[11px] leading-snug truncate ${isUnread ? 'font-bold text-primary' : 'font-medium text-slate-600'}`}>
                                    {item.title}
                                  </p>
                                  <span className="shrink-0 text-[8px] font-mono font-bold text-slate-400 uppercase">
                                    {item.time}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                                  {item.description}
                                </p>
                                <div className="pt-1 flex items-center gap-1.5">
                                  <span className="text-[8px] font-black uppercase tracking-wider text-primary hover:text-accent flex items-center gap-0.5">
                                    View Module <ChevronRight className="w-2.5 h-2.5" />
                                  </span>
                                </div>
                              </div>

                              {/* Floating action buttons on hover */}
                              <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isUnread && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(item.id);
                                    }}
                                    title="Mark as read"
                                    className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors focus:outline-none"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => dismissNotification(item.id, e)}
                                  title="Clear alert"
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Visual dot if unread and not hovered */}
                              {isUnread && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full group-hover:scale-0 transition-transform" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer bar */}
                    {allAlerts.length > 0 && (
                      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Showing {filteredAlerts.length} of {allAlerts.length} alerts</span>
                        {dismissedIds.length > 0 && (
                          <button 
                            onClick={() => {
                              setDismissedIds([]);
                              toast.success("All cleared notifications restored");
                            }}
                            className="text-primary hover:text-accent transition-colors focus:outline-none"
                          >
                            Restore Cleared
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Admin User</span>
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Super Admin</span>
              </div>
              <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center text-white font-serif font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 relative print:overflow-visible print:p-0">
          <div className="p-8 md:p-12 relative min-h-full print:p-0">
            {/* Logo Watermark */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] z-0 ml-0 lg:ml-80 print:hidden">
              <img src={LOGO_BASE64} alt="" className="w-[600px] h-[600px] object-contain grayscale"  />
            </div>
            
            <div className="relative z-10 w-full max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
