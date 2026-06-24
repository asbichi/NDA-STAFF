import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
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
import { toast } from 'sonner';

interface CrudModuleProps {
  title: string;
  columns: { key: string; label: string }[];
  mockData: any[];
}

export default function CrudModule({ title, columns, mockData }: CrudModuleProps) {
  const [data, setData] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = { id: Date.now(), ...formData };
    setData([...data, newItem]);
    setIsAddOpen(false);
    setFormData({});
    toast.success(`${title} added successfully`);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setData(data.map(item => item.id === selectedItem.id ? { ...item, ...formData } : item));
    setIsEditOpen(false);
    toast.success(`${title} updated successfully`);
  };

  const handleDelete = () => {
    setData(data.filter(item => item.id !== selectedItem.id));
    setIsDeleteOpen(false);
    toast.success(`${title} deleted successfully`);
  };

  const openEdit = (item: any) => {
    setSelectedItem(item);
    setFormData(item);
    setIsEditOpen(true);
  };

  const openDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 mt-1">Manage {title.toLowerCase()} data and settings.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setFormData({}); setIsAddOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-auto max-h-[calc(100vh-320px)]">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map(col => (
                      <TableCell key={col.key}>{item[col.key]}</TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => openEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => openDelete(item)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center text-gray-500">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {title}</DialogTitle>
            <DialogDescription>Fill in the details below to create a new record.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            {columns.map(col => (
              <div key={col.key} className="space-y-2">
                <Label htmlFor={`add-${col.key}`}>{col.label}</Label>
                <Input 
                  id={`add-${col.key}`} 
                  value={formData[col.key] || ''} 
                  onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                  required
                />
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {title}</DialogTitle>
            <DialogDescription>Update the details for this record.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            {columns.map(col => (
              <div key={col.key} className="space-y-2">
                <Label htmlFor={`edit-${col.key}`}>{col.label}</Label>
                <Input 
                  id={`edit-${col.key}`} 
                  value={formData[col.key] || ''} 
                  onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                  required
                />
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
