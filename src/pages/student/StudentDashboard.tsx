import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../components/auth/AuthProvider';
import { Assignment, Submission } from '../../types';
import { getNextLevelProgress } from '../../lib/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Trophy, Star, Flame, Award, BookOpen, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!profile) return;

    const unsubAssignments = onSnapshot(
      query(collection(db, 'assignments'), where('assignedTo', 'array-contains', profile.uid)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
        setAssignments(data);
      }, (error) => {
        console.error("Error fetching assignments:", error);
      }
    );

    const unsubSubmissions = onSnapshot(
      query(collection(db, 'submissions'), where('studentId', '==', profile.uid)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
        setSubmissions(data);
      }, (error) => {
        console.error("Error fetching submissions:", error);
      }
    );

    return () => {
      unsubAssignments();
      unsubSubmissions();
    };
  }, [profile]);

  if (!profile) return null;

  const completedIds = new Set(submissions.map(s => s.assignmentId));
  const pendingAssignments = assignments.filter(a => !completedIds.has(a.id));
  const completedAssignments = assignments.filter(a => completedIds.has(a.id));

  const progress = getNextLevelProgress(profile.xp);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile.username}!</h2>
        <p className="text-zinc-400">Here's your current progress.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Current Level</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-50">{profile.level}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total XP</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-50">{profile.xp}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Rank Tier</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-50">{profile.rank}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Day Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-50">{profile.streak}</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-50">Level {profile.level} Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>{progress.current} XP</span>
            <span>{progress.max} XP to Level {profile.level + 1}</span>
          </div>
          <Progress value={progress.percentage} className="h-3 bg-zinc-800" />
        </CardContent>
      </Card>

      {/* Assignments Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Pending Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">{pendingAssignments.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Completed Assignments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">{completedAssignments.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
