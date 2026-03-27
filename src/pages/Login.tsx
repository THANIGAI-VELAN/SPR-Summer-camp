import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

interface LoginProps {
  isAdminLogin?: boolean;
}

export default function Login({ isAdminLogin = false }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        // If it's the designated admin email and user not found, create the account
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          if (email === 'thanigaivelan404@gmail.com' && isAdminLogin) {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } catch (createErr: any) {
              if (createErr.code === 'auth/email-already-in-use') {
                throw new Error('Invalid password. Please try again.');
              }
              throw createErr;
            }
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      const uid = userCredential.user.uid;
      await userCredential.user.getIdToken(true); // Force token refresh to ensure Firestore has it
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
        throw err;
      }
      
      // Bootstrap admin if it's the designated email and no profile exists
      if (!userDoc.exists() && userCredential.user.email === 'thanigaivelan404@gmail.com') {
        const newAdmin = {
          uid,
          username: 'SuperAdmin',
          role: 'admin',
          xp: 0,
          level: 1,
          rank: 'S',
          streak: 0,
          lastLogin: Date.now(),
          badges: [],
          createdAt: Date.now(),
        };
        try {
          await setDoc(doc(db, 'users', uid), newAdmin);
          userDoc = await getDoc(doc(db, 'users', uid));
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
          throw err;
        }
      }

      if (!userDoc.exists()) {
        await auth.signOut();
        throw new Error('User profile not found. Please contact your administrator.');
      }

      const role = userDoc.data().role;

      if (isAdminLogin && role !== 'admin') {
        await auth.signOut();
        throw new Error('Unauthorized. Admin access only.');
      }

      if (!isAdminLogin && role !== 'student') {
        await auth.signOut();
        throw new Error('Unauthorized. Student access only.');
      }

      toast.success('Logged in successfully!');
      
      const from = (location.state as any)?.from?.pathname || (role === 'admin' ? '/admin' : '/student');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message || 'Failed to login. Please check your credentials.';
      
      try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError.error) {
          errorMessage = parsedError.error;
        }
      } catch (e) {
        // Not a JSON string, ignore
      }

      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please try again.';
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isAdminLogin ? 'Admin Portal' : 'Student Login'}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
