'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/providers/auth-provider';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Loader2, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  User as UserIcon, 
  CheckCircle2, 
  ChevronRight, 
  Target, 
  Zap, 
  Trophy,
  BrainCircuit,
  Rocket
} from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Phase logic: 1: Welcome, 2: Profile, 3: Exam, 4: Result/Roadmap
  const [phase, setPhase] = useState<'welcome' | 'profile' | 'exam' | 'result'>('welcome');

  const [formData, setFormData] = useState({
    username: '',
    age: '',
    profession: '',
    learningMotive: '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    if (profile?.displayName && !formData.username) {
      setFormData(prev => ({ ...prev, username: profile.displayName }));
    }
  }, [profile]);

  const generateExam = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameMode: 'onboarding-exam', // Fixed: modeId -> gameMode
          performanceData: [formData.profession, formData.learningMotive]
        })
      });

      if (!response.ok) throw new Error('Failed to generate exam');
      
      const data = await response.json();
      if (!data.questions || data.questions.length === 0) throw new Error('Invalid exam data');
      
      setQuestions(data.questions);
      setPhase('exam');
    } catch (e) {
      console.error(e);
      toast.error("AI is a bit tired. Let's try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = () => {
    if (!formData.username || !formData.age || !formData.profession || !formData.learningMotive) {
      toast.error("Please complete your profile first!");
      return;
    }
    generateExam();
  };

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPhase('result');
    }
  };

  const skipToDashboard = async () => {
    if (!user) return;
    if (!formData.username || !formData.age || !formData.profession || !formData.learningMotive) {
      toast.error("Please fill in your details before skipping!");
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        age: parseInt(formData.age),
        isOnboarded: true,
        xp: 0,
        totalXP: 0,
        level: 1,
        energy: 26,
        maxEnergy: 26,
        lastEnergyUpdate: new Date().toISOString(),
      });
      toast.success("Profile saved. Welcome to Sabai!");
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      toast.error("Skip failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const finishOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        age: parseInt(formData.age),
        isOnboarded: true,
        xp: 100,
        totalXP: 100,
        level: 1,
        energy: 26,
        maxEnergy: 26,
        lastEnergyUpdate: new Date().toISOString(),
      });
      toast.success(`Godspeed, ${formData.username}!`);
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      toast.error("Sync failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-primary/30">
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-fuchsia-600/20 blur-[120px] rounded-full" 
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 h-screen flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          {phase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 bg-gradient-to-tr from-primary to-fuchsia-500 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3"
              >
                <Zap className="w-12 h-12 text-white fill-current" />
              </motion.div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-[0.8] mb-2">
                  Welcome to <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-400 to-indigo-400">
                    Sabai
                  </span>
                </h1>
                <p className="text-zinc-400 text-xl md:text-2xl font-medium max-w-xl mx-auto">
                  The AI-powered playground where your journey to English mastery begins.
                </p>
              </div>

              <Button 
                onClick={() => setPhase('profile')}
                className="group relative h-20 px-12 rounded-full text-2xl font-black bg-white text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/10"
              >
                Initialize Profile
                <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {phase === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full max-w-2xl bg-zinc-900/40 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[3.5rem] shadow-2xl space-y-10"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic uppercase">The Identity</h2>
                  <p className="text-zinc-500">Who is the explorer behind the screen?</p>
                </div>
              </div>

              <div className="grid gap-8">
                <div className="group space-y-3">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 group-focus-within:text-primary transition-colors">Explorer Codex (Username)</Label>
                  <Input 
                    placeholder="Enter your handle..."
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold px-8 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Universal Cycles (Age)</Label>
                    <Input 
                      type="number"
                      placeholder="Age"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold px-8"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Life Role</Label>
                    <Select value={formData.profession} onValueChange={(val) => setFormData({...formData, profession: val})}>
                      <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold px-8">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 rounded-2xl">
                        <SelectItem value="school">School Student</SelectItem>
                        <SelectItem value="college">College Student</SelectItem>
                        <SelectItem value="working">Professional</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Learning Motivation</Label>
                  <Select value={formData.learningMotive} onValueChange={(val) => setFormData({...formData, learningMotive: val})}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold px-8">
                      <SelectValue placeholder="Why are you here?" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-2xl">
                      <SelectItem value="career">Career Dominance</SelectItem>
                      <SelectItem value="academic">Academic Excellence</SelectItem>
                      <SelectItem value="travel">Global Communication</SelectItem>
                      <SelectItem value="hobby">Personal Mastery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleProfileSubmit}
                  disabled={loading}
                  className="w-full h-20 rounded-full text-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 active:scale-98 transition-all"
                >
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <>Generate Trial <BrainCircuit className="ml-3 w-7 h-7" /></>}
                </Button>

                <Button
                  onClick={skipToDashboard}
                  variant="ghost"
                  className="w-full h-14 rounded-full text-zinc-500 font-bold hover:text-white hover:bg-white/5 transition-all"
                >
                  Skip for Now (Direct to Dashboard)
                </Button>
              </div>
            </motion.div>
          )}

          {phase === 'exam' && (
            <motion.div
              key="exam"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -100 }}
              className="w-full max-w-3xl space-y-12"
            >
              <div className="flex items-end justify-between px-4">
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Trial Challenge</p>
                  <h3 className="text-4xl font-black italic uppercase">Question {currentQuestionIndex + 1}/3</h3>
                </div>
                <div className="flex gap-2 mb-2">
                   {[0,1,2].map(i => (
                     <motion.div 
                        key={i} 
                        initial={false}
                        animate={{ 
                          width: i === currentQuestionIndex ? 48 : 12,
                          backgroundColor: i <= currentQuestionIndex ? '#D946EF' : '#27272a'
                        }}
                        className="h-3 rounded-full" 
                      />
                   ))}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-fuchsia-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-zinc-900/80 backdrop-blur-2xl border border-white/10 p-12 md:p-16 rounded-[3.5rem] shadow-2xl space-y-12">
                  <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight">
                    "{questions[currentQuestionIndex].text}"
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {questions[currentQuestionIndex].options.map((opt, i) => (
                        <Button
                          key={opt}
                          variant="outline"
                          onClick={() => handleAnswer(i)}
                          className="h-20 rounded-3xl border-2 border-white/5 bg-zinc-800/30 text-lg font-bold justify-start px-8 hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-[0.98] group"
                        >
                          <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4 text-sm font-black group-hover:bg-white/20">{String.fromCharCode(65 + i)}</span>
                          {opt}
                        </Button>
                     ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl space-y-12 text-center"
            >
              <div className="space-y-4">
                <motion.div 
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Trophy className="w-12 h-12 text-emerald-500" />
                </motion.div>
                <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter">Ascension Complete</h1>
                <p className="text-zinc-400 text-xl font-medium max-w-xl mx-auto">
                  We've analyzed your potential. Here is your specialized growth roadmap.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Target, label: "Primary Goal", val: formData.learningMotive.toUpperCase(), color: "text-primary bg-primary/10" },
                  { icon: Rocket, label: "XP Seeded", val: "100 XP", color: "text-amber-500 bg-amber-500/10" },
                  { icon: GraduationCap, label: "Starting Level", val: "Level 1", color: "text-sky-400 bg-sky-400/10" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-4"
                  >
                    <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.label}</p>
                      <p className="text-2xl font-black italic">{item.val}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="relative group max-w-2xl mx-auto">
                 <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                 <Button
                  onClick={finishOnboarding}
                  disabled={loading}
                  className="relative w-full h-24 rounded-full text-3xl font-black bg-white text-black hover:bg-zinc-100 transition-all shadow-2xl active:scale-95"
                 >
                   {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : "Initiate Dashboard"}
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
