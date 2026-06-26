import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Hero from './pages/Hero';
import About from './pages/About';
import Courses from './pages/Courses';
import Contact from './pages/Contact';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminCBT from './pages/AdminCBT';
import AdminCBTResults from './pages/AdminCBTResults';
import CBTExam from './pages/CBTExam';
import AdminStudents from './pages/AdminStudents';
import CrudModule from './components/CrudModule';
import ReportSheet from './pages/ReportSheet';
import StudentResult from './pages/StudentResult';
import ScoreEntry from './pages/ScoreEntry';
import AdminSettings from './pages/AdminSettings';
import StudentDashboard from './pages/StudentDashboard';
import StudentReportView from './pages/StudentReportView';
import Gallery from './pages/Gallery';
import AdminGallery from './pages/AdminGallery';
import { Toaster } from '@/components/ui/sonner';

// Mock Data & Columns for Modules
const studentCols = [
  { key: 'adminNo', label: 'Admin No' },
  { key: 'name', label: 'Full Name' },
  { key: 'class', label: 'Class' },
  { key: 'gender', label: 'Gender' },
];
const studentData = [
  { id: 1, adminNo: 'NDA/23/001', name: 'Aisha Bello', class: 'SS 1', gender: 'Female' },
  { id: 2, adminNo: 'NDA/23/002', name: 'Chukwuemeka Obi', class: 'SS 2', gender: 'Male' },
  { id: 3, adminNo: 'NDA/23/003', name: 'Fatima Musa', class: 'JSS 3', gender: 'Female' },
];

const classCols = [
  { key: 'name', label: 'Class Name' },
  { key: 'teacher', label: 'Form Teacher' },
  { key: 'capacity', label: 'Capacity' },
];
const classData = [
  { id: 1, name: 'JSS 1', teacher: 'Mr. Ibrahim', capacity: '40' },
  { id: 2, name: 'JSS 2', teacher: 'Mrs. Okafor', capacity: '40' },
  { id: 3, name: 'JSS 3', teacher: 'Mr. Adamu', capacity: '40' },
  { id: 4, name: 'SS 1', teacher: 'Mrs. Bello', capacity: '35' },
  { id: 5, name: 'SS 2', teacher: 'Mr. Chukwu', capacity: '35' },
  { id: 6, name: 'SS 3', teacher: 'Mrs. Danjuma', capacity: '35' },
];

const examCols = [
  { key: 'title', label: 'Exam Title' },
  { key: 'subject', label: 'Subject' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
];
const examData = [
  { id: 1, title: 'First Term Mathematics', subject: 'Mathematics', date: '2023-11-15', status: 'Completed' },
  { id: 2, title: 'Mid-Term English', subject: 'English', date: '2023-10-05', status: 'Completed' },
];

const feeCols = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'amount', label: 'Amount (₦)' },
  { key: 'type', label: 'Fee Type' },
  { key: 'status', label: 'Status' },
];
const feeData = [
  { id: 1, studentName: 'Aisha Bello', amount: '45,000', type: 'Tuition', status: 'Paid' },
  { id: 2, studentName: 'Chukwuemeka Obi', amount: '45,000', type: 'Tuition', status: 'Pending' },
];

const parentCols = [
  { key: 'name', label: 'Parent Name' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'email', label: 'Email' },
  { key: 'students', label: 'Linked Students' },
];
const parentData = [
  { id: 1, name: 'Alhaji Bello', phone: '08012345678', email: 'bello@example.com', students: 'Aisha Bello' },
  { id: 2, name: 'Mr. Obi', phone: '08087654321', email: 'obi@example.com', students: 'Chukwuemeka Obi' },
];

const genericCols = [
  { key: 'name', label: 'Name / Title' },
  { key: 'description', label: 'Description' },
  { key: 'date', label: 'Date Added' },
];
const genericData = [
  { id: 1, name: 'Sample Record 1', description: 'This is a sample description', date: '2023-10-01' },
  { id: 2, name: 'Sample Record 2', description: 'Another sample description', date: '2023-10-02' },
];

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<PageWrapper><Hero /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/courses" element={<PageWrapper><Courses /></PageWrapper>} />
        <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<PageWrapper><AdminDashboard /></PageWrapper>} />
          <Route path="students" element={<PageWrapper><AdminStudents /></PageWrapper>} />
          <Route path="classes" element={<PageWrapper><CrudModule title="Class Module" columns={classCols} mockData={classData} /></PageWrapper>} />
          <Route path="exams" element={<PageWrapper><CrudModule title="Exams Module" columns={examCols} mockData={examData} /></PageWrapper>} />
          <Route path="fees" element={<PageWrapper><CrudModule title="Fees Module" columns={feeCols} mockData={feeData} /></PageWrapper>} />
          <Route path="parents" element={<PageWrapper><CrudModule title="Parent Module" columns={parentCols} mockData={parentData} /></PageWrapper>} />
          
          <Route path="reports" element={<PageWrapper><ReportSheet /></PageWrapper>} />
          <Route path="bulk-reports" element={<PageWrapper><ReportSheet /></PageWrapper>} />

          <Route path="broad-sheet" element={<PageWrapper><CrudModule title="Broad Sheet" columns={genericCols} mockData={genericData} /></PageWrapper>} />
          <Route path="time-table" element={<PageWrapper><CrudModule title="Time Table" columns={genericCols} mockData={genericData} /></PageWrapper>} />
          <Route path="analysis" element={<PageWrapper><CrudModule title="Analysis" columns={genericCols} mockData={genericData} /></PageWrapper>} />
          <Route path="cbt" element={<PageWrapper><AdminCBT /></PageWrapper>} />
          <Route path="cbt-results" element={<PageWrapper><AdminCBTResults /></PageWrapper>} />
          <Route path="score-entry" element={<PageWrapper><ScoreEntry /></PageWrapper>} />
          <Route path="gallery" element={<PageWrapper><AdminGallery /></PageWrapper>} />
          <Route path="settings" element={<PageWrapper><AdminSettings /></PageWrapper>} />
        </Route>
        <Route path="/exam/:examId" element={<PageWrapper><CBTExam /></PageWrapper>} />
        <Route path="/result" element={<PageWrapper><StudentResult /></PageWrapper>} />
        <Route path="/student/dashboard" element={<PageWrapper><StudentDashboard /></PageWrapper>} />
        <Route path="/student/report" element={<PageWrapper><StudentReportView /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <Toaster />
    </BrowserRouter>
  );
}
