import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, setDoc, updateDoc } from 'firebase/firestore';
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
import { toast } from 'sonner';

export default function ManageStudents() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bonusXp, setBonusXp] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Students</h2>
          <p className="text-zinc-400">View and manage student accounts.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button>Add Student</Button>} />
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
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-zinc-950 border-zinc-800" minLength={6} />
              </div>
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-50">Student Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">Username</TableHead>
                <TableHead className="text-zinc-400">Level</TableHead>
                <TableHead className="text-zinc-400">Rank</TableHead>
                <TableHead className="text-zinc-400">XP</TableHead>
                <TableHead className="text-zinc-400">Streak</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.uid} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-zinc-50">{student.username}</TableCell>
                  <TableCell className="text-zinc-300">{student.level}</TableCell>
                  <TableCell className="text-zinc-300">{student.rank}</TableCell>
                  <TableCell className="text-zinc-300">{student.xp}</TableCell>
                  <TableCell className="text-zinc-300">{student.streak} days</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell colSpan={6} className="text-center text-zinc-400 py-6">
                    No students found. Create one to get started.
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
