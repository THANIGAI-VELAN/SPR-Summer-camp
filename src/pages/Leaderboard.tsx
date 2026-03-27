import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Submission } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Trophy, Medal, Award } from 'lucide-react';

type ViewMode = 'overall' | 'weekly';

interface LeaderboardEntry {
  uid: string;
  username: string;
  xp: number;
  level: number;
  rank: string;
}

export default function Leaderboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('overall');
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const unsubStudents = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'student')),
      (snapshot) => {
        const studentData = snapshot.docs.map(doc => doc.data() as UserProfile);
        setStudents(studentData);
      },
      (error) => {
        console.error("Error fetching students:", error);
      }
    );

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const unsubSubmissions = onSnapshot(
      query(collection(db, 'submissions'), where('completedAt', '>=', oneWeekAgo)),
      (snapshot) => {
        const submissionData = snapshot.docs.map(doc => doc.data() as Submission);
        setRecentSubmissions(submissionData);
      },
      (error) => {
        console.error("Error fetching submissions:", error);
      }
    );

    return () => {
      unsubStudents();
      unsubSubmissions();
    };
  }, []);

  const leaderboardData = useMemo(() => {
    let entries: LeaderboardEntry[] = [];

    if (viewMode === 'overall') {
      entries = students.map(s => ({
        uid: s.uid,
        username: s.username,
        xp: s.xp,
        level: s.level,
        rank: s.rank,
      }));
    } else {
      // Calculate weekly XP
      const weeklyXpMap = new Map<string, number>();
      recentSubmissions.forEach(sub => {
        const current = weeklyXpMap.get(sub.studentId) || 0;
        weeklyXpMap.set(sub.studentId, current + sub.xpAwarded);
      });

      entries = students.map(s => ({
        uid: s.uid,
        username: s.username,
        xp: weeklyXpMap.get(s.uid) || 0,
        level: s.level,
        rank: s.rank,
      }));
    }

    // Sort by XP descending, then by username
    return entries.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return a.username.localeCompare(b.username);
    });
  }, [students, recentSubmissions, viewMode]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-zinc-300" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-zinc-500 font-medium w-5 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Award className="w-8 h-8 text-primary" />
            Leaderboard
          </h2>
          <p className="text-zinc-400">See how you stack up against other campers.</p>
        </div>
        
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            onClick={() => setViewMode('overall')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'overall' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-zinc-400 hover:text-zinc-50'
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'weekly' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-zinc-400 hover:text-zinc-50'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-50">
            {viewMode === 'overall' ? 'All-Time Top Campers' : 'Top Campers This Week'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="w-16 text-center text-zinc-400">Rank</TableHead>
                <TableHead className="text-zinc-400">Camper</TableHead>
                <TableHead className="text-zinc-400">Tier</TableHead>
                <TableHead className="text-right text-zinc-400">XP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry, index) => (
                <TableRow key={entry.uid} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {getRankIcon(index)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-50">
                    {entry.username}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {entry.rank}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-zinc-100">
                    {entry.xp}
                  </TableCell>
                </TableRow>
              ))}
              {leaderboardData.length === 0 && (
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                    No data available yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
