export type Role = 'admin' | 'student';

export interface UserProfile {
  uid: string;
  username: string;
  role: Role;
  xp: number;
  level: number;
  rank: string;
  streak: number;
  lastLogin: number; // Unix timestamp for easier math
  badges: string[];
  createdAt: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: 'standard' | 'challenge';
  assignedTo: string[]; // Array of student UIDs
  createdAt: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: 'completed';
  xpAwarded: number;
  completedAt: number;
}
