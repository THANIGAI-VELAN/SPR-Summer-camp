import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, runTransaction } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../components/auth/AuthProvider';
import { Assignment, Submission, UserProfile } from '../../types';
import { calculateLevel, calculateRank } from '../../lib/gamification';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

export default function Assignments() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);

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

  const handleTurnIn = async (assignment: Assignment) => {
    if (submitting) return;
    setSubmitting(assignment.id);

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', profile.uid);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }

        const userData = userDoc.data() as UserProfile;
        const newXp = userData.xp + assignment.xpReward;
        const newLevel = calculateLevel(newXp);
        const newRank = calculateRank(newXp);

        // Create submission
        const submissionRef = doc(collection(db, 'submissions'));
        transaction.set(submissionRef, {
          assignmentId: assignment.id,
          studentId: profile.uid,
          status: 'completed',
          xpAwarded: assignment.xpReward,
          completedAt: Date.now(),
        });

        // Update user XP
        transaction.update(userRef, {
          xp: newXp,
          level: newLevel,
          rank: newRank,
        });
      });

      toast.success(`Assignment completed! You earned ${assignment.xpReward} XP.`);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <p className="text-zinc-400">Complete tasks to earn XP and level up.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">
            Pending ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">
            Completed ({completedAssignments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingAssignments.map(assignment => (
              <Card key={assignment.id} className="bg-zinc-900 border-zinc-800 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl text-zinc-50">{assignment.title}</CardTitle>
                    <Badge variant={assignment.type === 'challenge' ? 'destructive' : 'default'}>
                      {assignment.type === 'challenge' ? '1v1 Challenge' : 'Standard'}
                    </Badge>
                  </div>
                  <CardDescription className="text-zinc-400 mt-2">
                    {assignment.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <span>+{assignment.xpReward} XP</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleTurnIn(assignment)}
                    disabled={submitting === assignment.id}
                  >
                    {submitting === assignment.id ? 'Turning in...' : 'Turn In'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {pendingAssignments.length === 0 && (
              <div className="col-span-full text-center py-12 text-zinc-400">
                You have no pending assignments. Great job!
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedAssignments.map(assignment => {
              const submission = submissions.find(s => s.assignmentId === assignment.id);
              return (
                <Card key={assignment.id} className="bg-zinc-900 border-zinc-800 opacity-75 flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-xl text-zinc-50">{assignment.title}</CardTitle>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none">
                        Completed
                      </Badge>
                    </div>
                    <CardDescription className="text-zinc-400 mt-2">
                      {assignment.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span>Earned {submission?.xpAwarded || assignment.xpReward} XP</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {completedAssignments.length === 0 && (
              <div className="col-span-full text-center py-12 text-zinc-400">
                You haven't completed any assignments yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
