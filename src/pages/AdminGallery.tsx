import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, LayoutGrid, Image as ImageIcon, 
  Upload, X, RefreshCw, Save, ArrowLeft, MoveUp, MoveDown, BookOpen, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';

export interface GalleryMember {
  id: string;
  name: string;
  title: string;
  role: 'management' | 'pta';
  imageUrl: string;
  description: string;
  order: number;
}

export default function AdminGallery() {
  const [members, setMembers] = useState<GalleryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'management' | 'pta'>('all');
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<GalleryMember | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formRole, setFormRole] = useState<'management' | 'pta'>('management');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imageUploadType, setImageUploadType] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const colRef = collection(db, 'gallery_members');
      const q = query(colRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      console.log("AdminGallery: fetched members", snapshot.size);

      let list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryMember[];

      setMembers(list);
    } catch (err: any) {
      console.error("Error fetching gallery:", err);
      toast.error("Failed to load gallery members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // File Upload Helper to convert file to Base64 string
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) { // 500KB limit
      toast.error("Image file is too large. Please select an image smaller than 500KB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImageUrl(reader.result as string);
      setIsUploading(false);
      toast.success("Image selected and optimized successfully!");
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddDialog = () => {
    setEditingMember(null);
    setFormName('');
    setFormTitle('');
    setFormRole('management');
    setFormDescription('');
    setFormImageUrl('');
    setImageUploadType('upload');
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (member: GalleryMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormTitle(member.title);
    setFormRole(member.role);
    setFormDescription(member.description);
    setFormImageUrl(member.imageUrl);
    setImageUploadType(member.imageUrl.startsWith('data:') ? 'upload' : 'url');
    setIsDialogOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTitle.trim() || !formDescription.trim()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    if (!formImageUrl) {
      toast.error("Please select or specify a photo.");
      return;
    }

    try {
      const colRef = collection(db, 'gallery_members');
      
      if (editingMember) {
        // Update
        const docRef = doc(db, 'gallery_members', editingMember.id);
        await updateDoc(docRef, {
          name: formName,
          title: formTitle,
          role: formRole,
          description: formDescription,
          imageUrl: formImageUrl,
          updatedAt: serverTimestamp()
        });
        toast.success("Member profile updated successfully!");
      } else {
        // Add new
        const nextOrder = members.length > 0 ? Math.max(...members.map(m => m.order || 0)) + 1 : 1;
        await addDoc(colRef, {
          name: formName,
          title: formTitle,
          role: formRole,
          description: formDescription,
          imageUrl: formImageUrl,
          order: nextOrder,
          createdAt: serverTimestamp()
        });
        toast.success("Member added to gallery successfully!");
      }
      setIsDialogOpen(false);
      fetchMembers();
    } catch (err: any) {
      console.error("Error saving gallery member:", err);
      toast.error(`Error saving profile: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDeleteMember = async () => {
    if (!isDeletingId) return;

    try {
      const docRef = doc(db, 'gallery_members', isDeletingId);
      await deleteDoc(docRef);
      toast.success("Member profile deleted successfully.");
      setIsDeletingId(null);
      fetchMembers();
    } catch (err: any) {
      console.error("Error deleting member:", err);
      toast.error("Failed to delete member profile.");
    }
  };

  // Reorder Members up/down to allow fine grain control over profile order on public gallery
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const list = [...members];
    const temp = list[index].order;
    list[index].order = list[targetIndex].order;
    list[targetIndex].order = temp;

    // Save batch to firestore
    try {
      setLoading(true);
      const batch = writeBatch(db);
      const ref1 = doc(db, 'gallery_members', list[index].id);
      const ref2 = doc(db, 'gallery_members', list[targetIndex].id);
      
      batch.update(ref1, { order: list[index].order });
      batch.update(ref2, { order: list[targetIndex].order });
      
      await batch.commit();
      toast.success("Display order rearranged successfully!");
      fetchMembers();
    } catch (err: any) {
      console.error("Order update failed:", err);
      toast.error("Failed to update display order.");
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-12 space-y-8 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            Gallery Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Add, edit, rearrange, or delete profile cards of School Management and PTA EXCOs displayed on the public gallery.</p>
        </div>
        <Button 
          onClick={handleOpenAddDialog}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl shadow-md shadow-blue-600/10"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-slate-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Members</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{members.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">School Management</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {members.filter(m => m.role === 'management').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">PTA EXCOs</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {members.filter(m => m.role === 'pta').length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-100 shadow-sm bg-white rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name, title, or biography details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-slate-50 border-slate-100 text-sm focus-visible:ring-blue-600 h-11 rounded-xl"
              />
            </div>
            
            {/* Role Filter */}
            <Select 
              value={roleFilter} 
              onValueChange={(val: any) => setRoleFilter(val)}
            >
              <SelectTrigger className="bg-slate-50 border-slate-100 text-sm h-11 rounded-xl">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="management">School Management</SelectItem>
                <SelectItem value="pta">PTA EXCOs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Members Grid or Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mb-4" />
          <p className="text-slate-500 text-sm uppercase font-semibold tracking-wider">Syncing gallery...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No members found</h3>
          <p className="text-slate-500 mt-1 text-sm">Create a new member or adjust your filter parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => (
            <Card key={member.id} className="overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl flex flex-col h-full">
              {/* Photo & Actions */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50 border-b border-slate-50">
                <img 
                  src={member.imageUrl} 
                  alt={member.name} 
                  className="object-contain object-center bg-slate-50 w-full h-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop'; }}
                />
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Badge className={member.role === 'management' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}>
                    {member.role === 'management' ? 'MANAGEMENT' : 'PTA EXCO'}
                  </Badge>
                </div>

                {/* Display position index */}
                <div className="absolute bottom-4 left-4 bg-black/65 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-widest uppercase">
                  Order: #{member.order}
                </div>
              </div>

              {/* Content Detail */}
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">{member.name}</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">{member.title}</p>
                  <p className="text-slate-500 text-sm mt-4 leading-relaxed line-clamp-3 whitespace-pre-line">{member.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                  {/* Display Order Arranging Controls */}
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="w-8 h-8 rounded-lg"
                      title="Move Display Up"
                    >
                      <MoveUp className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === members.length - 1}
                      className="w-8 h-8 rounded-lg"
                      title="Move Display Down"
                    >
                      <MoveDown className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleOpenEditDialog(member)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs"
                    >
                      <Edit2 className="w-3 h-3 mr-1.5 text-blue-600" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsDeletingId(member.id)}
                      className="border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Profile Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">
              {editingMember ? "Edit Member Profile" : "Add New Gallery Member"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Set the photo, role, title, and biography description for this member.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMember} className="space-y-6 mt-4">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="memberName" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</Label>
              <Input 
                id="memberName"
                placeholder="e.g. Brigadier General A. B. Muhammed"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="bg-slate-50 border-slate-100 text-sm focus-visible:ring-blue-600 h-11 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="memberTitle" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Designation / Title</Label>
                <Input 
                  id="memberTitle"
                  placeholder="e.g. School Commandant"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-100 text-sm focus-visible:ring-blue-600 h-11 rounded-xl"
                />
              </div>

              {/* Role Select */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Organizational Group</Label>
                <Select 
                  value={formRole} 
                  onValueChange={(val: any) => setFormRole(val)}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-100 text-sm h-11 rounded-xl">
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">School Management</SelectItem>
                    <SelectItem value="pta">PTA EXCO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Photo Selection Area */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Profile Photo</Label>
              
              <div className="flex gap-4 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setImageUploadType('upload')}
                  className={`text-xs font-bold uppercase tracking-wider pb-1.5 border-b-2 transition-all ${
                    imageUploadType === 'upload' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadType('url')}
                  className={`text-xs font-bold uppercase tracking-wider pb-1.5 border-b-2 transition-all ${
                    imageUploadType === 'url' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Image URL
                </button>
              </div>

              {imageUploadType === 'upload' ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-50/50 transition-colors relative">
                  {formImageUrl ? (
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img src={formImageUrl} alt="Preview" className="w-full h-full object-contain object-center bg-slate-50" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop'; toast.error("Invalid image URL"); }} />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-600">Select Profile Image</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, or WEBP up to 2MB</p>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                      <RefreshCw className="animate-spin w-6 h-6 text-blue-600" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input 
                    placeholder="https://example.com/photo.jpg"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="bg-slate-50 border-slate-100 text-sm focus-visible:ring-blue-600 h-11 rounded-xl"
                  />
                  {formImageUrl && (
                    <div className="mt-2 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <img src={formImageUrl} alt="Preview" className="w-10 h-10 rounded-full object-contain object-center bg-slate-50 shrink-0" onError={() => toast.error("Invalid image URL")} />
                      <span className="text-xs text-slate-500 truncate">{formImageUrl}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description/Bio Textarea */}
            <div className="space-y-2">
              <Label htmlFor="memberBio" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Biography / Description</Label>
              <Textarea 
                id="memberBio"
                placeholder="Write a brief profile, welcome address, or role summary..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
                required
                className="bg-slate-50 border-slate-100 text-sm focus-visible:ring-blue-600 rounded-xl resize-none"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6"
              >
                <Save className="w-4 h-4 mr-2" /> {editingMember ? "Update Profile" : "Save Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeletingId !== null} onOpenChange={(open) => !open && setIsDeletingId(null)}>
        <DialogContent className="max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800">Delete Profile Card?</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete this profile from the gallery? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsDeletingId(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMember}
              className="rounded-xl font-bold"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
