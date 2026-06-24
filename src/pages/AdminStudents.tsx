import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [arm, setArm] = useState('');
  const [gender, setGender] = useState('');
  const [passportPhoto, setPassportPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Standard high-density passport aspect ratio (300x360 pixels)
        canvas.width = 300;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, 300, 360);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          setPassportPhoto(dataUrl);
          toast.success("Passport photo processed sharply!");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching students: ", error);
      toast.error('Failed to load students');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredData = students.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.class?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setAdmissionNo('');
    setStudentClass('');
    setArm('');
    setGender('');
    setPassportPhoto('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!name || !admissionNo || !studentClass || !arm || !gender) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'students'), {
        name,
        admissionNo,
        class: studentClass,
        arm,
        gender,
        passportPhoto,
        createdAt: serverTimestamp()
      });
      setIsAddOpen(false);
      resetForm();
      toast.success(`Student added successfully`);
    } catch (error) {
      console.error("Error adding student: ", error);
      toast.error("Failed to add student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!name || !admissionNo || !studentClass || !arm || !gender) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'students', selectedItem.id), {
        name,
        admissionNo,
        class: studentClass,
        arm,
        gender,
        passportPhoto
      });
      setIsEditOpen(false);
      toast.success(`Student updated successfully`);
    } catch (error) {
      console.error("Error updating student: ", error);
      toast.error("Failed to update student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'students', selectedItem.id));
      setIsDeleteOpen(false);
      toast.success(`Student deleted successfully`);
    } catch (error) {
      console.error("Error deleting student: ", error);
      toast.error("Failed to delete student.");
    }
  };

  const openEdit = (item: any) => {
    setSelectedItem(item);
    setName(item.name || '');
    setAdmissionNo(item.admissionNo || '');
    setStudentClass(item.class || '');
    setArm(item.arm || '');
    setGender(item.gender || '');
    setPassportPhoto(item.passportPhoto || '');
    setIsEditOpen(true);
  };

  const openDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  return (
    <div className="p-6 md:p-12 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">Student Directory</h1>
          <p className="text-slate-500 mt-1 font-light">Manage all enrolled students, their classes, and academic assignments.</p>
        </div>
        
        <Button 
          className="bg-primary hover:bg-primary/90 text-white rounded-none px-6 shadow-xl shadow-primary/20 transition-all font-bold uppercase text-[11px] tracking-widest" 
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Student
        </Button>

        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if(!open) resetForm();
        }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-primary">Admit New Student</DialogTitle>
              <DialogDescription>
                Register a new student into the school database.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Aisha Bello" className="rounded-none border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label>Admission No.</Label>
                  <Input value={admissionNo} onChange={e => setAdmissionNo(e.target.value)} required placeholder="e.g. NDA/24/001" className="rounded-none border-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Class</Label>
                  <Input value={studentClass} onChange={e => setStudentClass(e.target.value)} required placeholder="e.g. JSS 1" className="rounded-none border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label>Arm</Label>
                  <Input value={arm} onChange={e => setArm(e.target.value)} required placeholder="e.g. Science 1" className="rounded-none border-slate-200" />
                </div>
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger className="rounded-none border-slate-200"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center border p-3 border-dashed border-slate-200 bg-slate-50/50">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Passport Photo</Label>
                  <p className="text-[10px] text-slate-400">Upload a sharp, high-density 3:4 passport image. Max 2MB.</p>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="rounded-none border-slate-200 text-xs bg-white cursor-pointer" 
                  />
                </div>
                <div className="flex justify-center">
                  <div className="w-20 h-24 border bg-white flex items-center justify-center relative overflow-hidden shadow-sm">
                    {passportPhoto ? (
                      <img 
                        src={passportPhoto} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        style={{ imageRendering: 'pixelated' }} 
                      />
                    ) : (
                      <div className="text-[9px] font-bold text-slate-300 text-center uppercase tracking-tighter">No Photo</div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="rounded-none bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[11px] w-full">
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Register Student
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-none">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, admission no, or class..."
              className="pl-9 bg-white rounded-none border-slate-200 focus:ring-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[500px]">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6 min-w-[200px]">Student Name</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6 min-w-[150px]">Admission No.</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6 min-w-[150px]">Class & Arm</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Gender</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent mb-2" />
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Synchronizing Database...</p>
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-6 py-4 font-bold text-primary text-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-primary overflow-hidden shrink-0 shadow-sm">
                        {item.passportPhoto ? (
                          <img 
                            src={item.passportPhoto} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            style={{ imageRendering: 'pixelated' }} 
                          />
                        ) : (
                          item.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      {item.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono text-slate-500 font-bold text-xs">{item.admissionNo}</TableCell>
                    <TableCell className="px-6 py-4 font-bold text-slate-700 uppercase">{item.class.replace('_', ' ')} <span className="text-accent">{item.arm}</span></TableCell>
                    <TableCell className="px-6 py-4 text-slate-600">{item.gender}</TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-none" onClick={() => openEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 border-rose-200 hover:bg-rose-50 rounded-none" onClick={() => openDelete(item)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">No student records found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary">Edit Student Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required className="rounded-none border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label>Admission No.</Label>
                <Input value={admissionNo} onChange={e => setAdmissionNo(e.target.value)} required className="rounded-none border-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Class</Label>
                <Input value={studentClass} onChange={e => setStudentClass(e.target.value)} required placeholder="e.g. JSS 1" className="rounded-none border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label>Arm</Label>
                <Input value={arm} onChange={e => setArm(e.target.value)} required placeholder="e.g. Science 1" className="rounded-none border-slate-200" />
              </div>
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger className="rounded-none border-slate-200"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center border p-3 border-dashed border-slate-200 bg-slate-50/50">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Passport Photo</Label>
                <p className="text-[10px] text-slate-400">Upload a sharp, high-density 3:4 passport image. Max 2MB.</p>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="rounded-none border-slate-200 text-xs bg-white cursor-pointer" 
                />
              </div>
              <div className="flex justify-center">
                <div className="w-20 h-24 border bg-white flex items-center justify-center relative overflow-hidden shadow-sm">
                  {passportPhoto ? (
                    <img 
                      src={passportPhoto} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      style={{ imageRendering: 'pixelated' }} 
                    />
                  ) : (
                    <div className="text-[9px] font-bold text-slate-300 text-center uppercase tracking-tighter">No Photo</div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="rounded-none bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[11px] w-full">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Admission</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-bold text-primary">{selectedItem?.name}</span>? This action cannot be undone and will delete their record from the active student database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-none" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase tracking-widest text-[11px]" onClick={handleDelete}>Confirm Extraction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
