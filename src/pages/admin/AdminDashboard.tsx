import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, Assignment } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, BookOpen, Trophy } from 'lucide-react';

export default function AdminDashboard() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      const studentData = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.role === 'student');
      setStudents(studentData);
    }, (error) => {
      console.error("Error fetching students:", error);
    });

    const unsubAssignments = onSnapshot(query(collection(db, 'assignments')), (snapshot) => {
      const assignmentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
      setAssignments(assignmentData);
    }, (error) => {
      console.error("Error fetching assignments:", error);
    });

    return () => {
      unsubStudents();
      unsubAssignments();
    };
  }, []);

  const totalXP = students.reduce((sum, s) => sum + s.xp, 0);
  const avgXP = students.length > 0 ? Math.round(totalXP / students.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-zinc-400">Welcome to the admin control panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Students</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">{students.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Active Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">{assignments.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Average Student XP</CardTitle>
            <Trophy className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">{avgXP} XP</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Preview */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-50">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students
              .sort((a, b) => b.xp - a.xp)
              .slice(0, 5)
              .map((student, index) => (
                <div key={student.uid} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-50">{student.username}</p>
                      <p className="text-sm text-zinc-400">Level {student.level} • Rank {student.rank}</p>
                    </div>
                  </div>
                  <div className="font-bold text-primary">{student.xp} XP</div>
                </div>
              ))}
            {students.length === 0 && (
              <p className="text-zinc-400 text-sm">No students found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
