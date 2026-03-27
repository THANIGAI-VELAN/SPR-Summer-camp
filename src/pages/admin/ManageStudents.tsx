import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { db } from '../../lib/firebase';
import { secondaryAuth } from '../../lib/secondaryFirebase';
import { UserProfile } from '../../types';
import { calculateLevel, calculateRank } from '../../lib/gamification';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, Filter, Eye, EyeOff } from 'lucide-react';

type SortField = 'username' | 'level' | 'xp';
type SortDirection = 'asc' | 'desc';

export default function ManageStudents() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  // Sorting and Filtering states
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [rankFilter, setRankFilter] = useState<string>('all');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bonusXp, setBonusXp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      const studentData = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.role === 'student');
      setStudents(studentData);
    }, (error) => {
      console.error("Error fetching students:", error);
    });
    return () => unsub();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create user in secondary auth so admin doesn't get logged out
      await setPersistence(secondaryAuth, inMemoryPersistence);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      await signOut(secondaryAuth); // Sign out immediately from secondary app

      const uid = userCredential.user.uid;
      
      const newStudent: UserProfile = {
        uid,
        username,
        role: 'student',
        xp: 0,
        level: 1,
        rank: 'E',
        streak: 0,
        lastLogin: Date.now(),
        badges: [],
        createdAt: Date.now(),
      };

      await setDoc(doc(db, 'users', uid), newStudent);
      
      toast.success('Student created successfully');
      setIsCreateOpen(false);
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create student');
    }
  };

  const handleGrantBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const xpToAdd = parseInt(bonusXp, 10);
    if (isNaN(xpToAdd) || xpToAdd <= 0) {
      toast.error('Please enter a valid XP amount');
      return;
    }

    try {
      const newXp = selectedStudent.xp + xpToAdd;
      const newLevel = calculateLevel(newXp);
      const newRank = calculateRank(newXp);

      await updateDoc(doc(db, 'users', selectedStudent.uid), {
        xp: newXp,
        level: newLevel,
        rank: newRank,
      });

      toast.success(`Granted ${xpToAdd} XP to ${selectedStudent.username}`);
      setIsBonusOpen(false);
      setBonusXp('');
      setSelectedStudent(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to grant bonus XP');
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    try {
      await deleteDoc(doc(db, 'users', studentId));
      toast.success(`Student ${studentName} has been deleted`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete student');
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    // Filter
    if (rankFilter !== 'all') {
      result = result.filter(s => s.rank === rankFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'username') {
        comparison = a.username.localeCompare(b.username);
      } else if (sortField === 'level') {
        comparison = a.level - b.level;
      } else if (sortField === 'xp') {
        comparison = a.xp - b.xp;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, sortField, sortDirection, rankFilter]);

  const uniqueRanks = Array.from(new Set(students.map(s => s.rank))).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Students</h2>
          <p className="text-zinc-400">View and manage student accounts.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Add Student</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
            <DialogHeader>
              <DialogTitle>Create New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Permanent Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required className="bg-zinc-950 border-zinc-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-zinc-950 border-zinc-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="bg-zinc-950 border-zinc-800 pr-10" 
                    minLength={6} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-zinc-50">Student Roster</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger className="w-[120px] bg-zinc-950 border-zinc-800 text-zinc-50">
                <SelectValue placeholder="Filter Rank" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                <SelectItem value="all">All Ranks</SelectItem>
                {uniqueRanks.map(rank => (
                  <SelectItem key={rank} value={rank}>Rank {rank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => toggleSort('username')}>
                  <div className="flex items-center">Username <SortIcon field="username" /></div>
                </TableHead>
                <TableHead className="text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => toggleSort('level')}>
                  <div className="flex items-center">Level <SortIcon field="level" /></div>
                </TableHead>
                <TableHead className="text-zinc-400">Rank</TableHead>
                <TableHead className="text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => toggleSort('xp')}>
                  <div className="flex items-center">XP <SortIcon field="xp" /></div>
                </TableHead>
                <TableHead className="text-zinc-400">Streak</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedStudents.map((student) => (
                <TableRow key={student.uid} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-zinc-50">
                    <div className="flex flex-col">
                      <span>{student.username}</span>
                      <span className="text-xs text-zinc-500 font-mono">{student.uid}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{student.level}</TableCell>
                  <TableCell className="text-zinc-300">{student.rank}</TableCell>
                  <TableCell className="text-zinc-300">{student.xp}</TableCell>
                  <TableCell className="text-zinc-300">{student.streak} days</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsBonusOpen(true);
                        }}
                      >
                        Grant XP
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="border-red-900/50 text-red-400 hover:bg-red-950/50 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Student Account?</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-400">
                              This will permanently delete the student account for <strong className="text-zinc-200">{student.username}</strong> (ID: {student.uid}). This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleDeleteStudent(student.uid, student.username)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAndSortedStudents.length === 0 && (
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell colSpan={6} className="text-center text-zinc-400 py-6">
                    {students.length === 0 ? "No students found. Create one to get started." : "No students match the current filter."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isBonusOpen} onOpenChange={setIsBonusOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
          <DialogHeader>
            <DialogTitle>Grant Bonus XP</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGrantBonus} className="space-y-4">
            <div className="space-y-2">
              <Label>Student: {selectedStudent?.username}</Label>
              <Input 
                type="number" 
                placeholder="Amount of XP" 
                value={bonusXp} 
                onChange={e => setBonusXp(e.target.value)} 
                required 
                min="1"
                className="bg-zinc-950 border-zinc-800" 
              />
            </div>
            <Button type="submit" className="w-full">Grant XP</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
