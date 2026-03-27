import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Assignment, UserProfile } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';

export default function ManageAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [xpReward, setXpReward] = useState('');
  const [type, setType] = useState<'standard' | 'challenge'>('standard');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    const unsubAssignments = onSnapshot(query(collection(db, 'assignments')), (snapshot) => {
      const assignmentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
      setAssignments(assignmentData);
    }, (error) => {
      console.error("Error fetching assignments:", error);
    });

    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      const studentData = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.role === 'student');
      setStudents(studentData);
    }, (error) => {
      console.error("Error fetching students:", error);
    });

    return () => {
      unsubAssignments();
      unsubStudents();
    };
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    if (type === 'challenge' && selectedStudents.length !== 2) {
      toast.error('Challenge assignments must be assigned to exactly 2 students');
      return;
    }

    try {
      const newAssignment: Omit<Assignment, 'id'> = {
        title,
        description,
        xpReward: parseInt(xpReward, 10),
        type,
        assignedTo: selectedStudents,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'assignments'), newAssignment);
      toast.success('Assignment created successfully');
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setXpReward('');
      setType('standard');
      setSelectedStudents([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create assignment');
    }
  };

  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await deleteDoc(doc(db, 'assignments', assignmentToDelete));
      toast.success('Assignment deleted');
    } catch (error: any) {
      toast.error('Failed to delete assignment');
    } finally {
      setAssignmentToDelete(null);
    }
  };

  const handleDelete = (id: string) => {
    setAssignmentToDelete(id);
  };

  const toggleStudent = (uid: string) => {
    setSelectedStudents(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Assignments</h2>
          <p className="text-zinc-400">Create tasks and assign them to students.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button>Create Assignment</Button>} />
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-zinc-950 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="xpReward">XP Reward</Label>
                  <Input id="xpReward" type="number" min="1" value={xpReward} onChange={e => setXpReward(e.target.value)} required className="bg-zinc-950 border-zinc-800" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={e => setDescription(e.target.value)} required className="bg-zinc-950 border-zinc-800" />
              </div>
              <div className="space-y-2">
                <Label>Assignment Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="standard" checked={type === 'standard'} onChange={() => setType('standard')} />
                    Standard
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="challenge" checked={type === 'challenge'} onChange={() => setType('challenge')} />
                    1v1 Challenge
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign To Students</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-zinc-800 rounded-md bg-zinc-950">
                  {students.map(student => (
                    <label key={student.uid} className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(student.uid)} 
                        onChange={() => toggleStudent(student.uid)} 
                      />
                      {student.username}
                    </label>
                  ))}
                  {students.length === 0 && <span className="text-zinc-500 text-sm">No students available.</span>}
                </div>
              </div>
              <Button type="submit" className="w-full">Create Assignment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-50">Active Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">Title</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">XP Reward</TableHead>
                <TableHead className="text-zinc-400">Assigned To</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-zinc-50">{assignment.title}</TableCell>
                  <TableCell className="text-zinc-300 capitalize">{assignment.type}</TableCell>
                  <TableCell className="text-zinc-300 font-bold text-primary">+{assignment.xpReward} XP</TableCell>
                  <TableCell className="text-zinc-300">{assignment.assignedTo.length} students</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(assignment.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {assignments.length === 0 && (
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell colSpan={5} className="text-center text-zinc-400 py-6">
                    No assignments found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!assignmentToDelete} onOpenChange={(open) => !open && setAssignmentToDelete(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-400">Are you sure you want to delete this assignment? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssignmentToDelete(null)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
