import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function AdminCBTResults() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'cbt_results'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedResults = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort locally to prevent requiring a Firebase composite index
      fetchedResults = fetchedResults.sort((a: any, b: any) => {
        const dateA = a.date?.toDate ? a.date.toDate().getTime() : 0;
        const dateB = b.date?.toDate ? b.date.toDate().getTime() : 0;
        return dateB - dateA;
      });
      
      setResults(fetchedResults);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching CBT results:", error);
      toast.error("Failed to load CBT results.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePrint = () => {
    try {
      toast.info("If the print dialog doesn't appear, please click the 'Open App in New Tab' icon at the top right of this preview panel.", { duration: 5000 });
      setTimeout(() => {
        window.focus();
        window.print();
      }, 500);
    } catch (e) {
      console.error("Print error:", e);
      toast.error("Could not open print dialog. Please try using the PDF download button instead.");
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('cbt-results-table');
    if (!element) return;
    
    try {
      setIsGenerating(true);
      toast.info('Preparing PDF...');
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const ratio = canvas.width / canvas.height;
      const pdfHeight = pdfWidth / ratio;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('CBT_Results.pdf');
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CBT Results</h1>
          <p className="text-slate-500 mt-1">View and print student scores from CBT examinations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={handleDownloadPDF} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm" id="cbt-results-table">
        <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
          <CardTitle className="text-lg font-semibold">Student Scores</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Registration No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject / Exam Title</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Date Taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      <p className="text-slate-500">Loading results...</p>
                    </TableCell>
                  </TableRow>
                ) : results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      No CBT results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-medium text-slate-700">{r.studentId}</TableCell>
                      <TableCell>{r.studentName}</TableCell>
                      <TableCell>{r.class}</TableCell>
                      <TableCell>{r.examTitle || r.subject || 'General Assessment'}</TableCell>
                      <TableCell className="font-bold text-blue-600">{r.score} / {r.total}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          r.percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {r.percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {r.date?.toDate ? new Date(r.date.toDate()).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
