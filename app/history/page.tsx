'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { getRecentSessions, type GameSession } from '@/lib/firestore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, History, TrendingUp, Trophy } from 'lucide-react';

export default function HistoryPage() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      getRecentSessions(user.uid, 50).then((data) => {
        setSessions(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Chart data: oldest to newest for the graph
  const chartData = sessions.slice().reverse().map((s, i) => ({
    name: `S${i + 1}`,
    xp: s.xpEarned,
    mode: s.gameMode,
    score: Math.round((s.correctAnswers / Math.max(1, s.questionsAnswered)) * 100)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-5xl py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Please log in to view history</h1>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 space-y-8 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <History className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Learning History</h1>
          <p className="text-muted-foreground">Your recent sessions and progression</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Stats Summary */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-amber-500" /> Stats Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Games Played</div>
              <div className="text-3xl font-black">{profile?.gamesPlayed || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total XP Earned</div>
              <div className="text-3xl font-black text-amber-500">{profile?.totalXP?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current Level</div>
              <div className="text-3xl font-black text-primary">Lvl {profile?.level || 1} <span className="text-xl text-muted-foreground">({profile?.cefrLevel || 'A1'})</span></div>
            </div>
          </CardContent>
        </Card>

        {/* XP Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" /> XP Earnings (Last 50 Sessions)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} minTickGap={20} />
                    <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                      formatter={(value: number) => [`${value} XP`, 'Earned']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const mode = payload[0].payload.mode;
                          return `Session: ${mode}`;
                        }
                        return label;
                      }}
                    />
                    <Area type="monotone" dataKey="xp" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                  </AreaChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Play some games to generate data!
                </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Session Log */}
      <Card>
        <CardHeader>
           <CardTitle>Recent Sessions Log</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="space-y-1">
             {sessions.length > 0 ? sessions.map((s, i) => {
               const timeAgo = s.timestamp && typeof (s.timestamp as any).toDate === 'function' 
                 ? formatDistanceToNow((s.timestamp as any).toDate(), { addSuffix: true }) 
                 : 'just now';
               
               return (
                 <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-0 border-border/50">
                   <div>
                     <p className="font-semibold capitalize text-base">{s.gameMode.replace(/-/g, ' ')}</p>
                     <p className="text-xs text-muted-foreground mt-1">
                       {timeAgo} • Score: {s.correctAnswers}/{s.questionsAnswered} • {Math.round(s.durationSeconds)}s
                     </p>
                   </div>
                   <div className="text-right">
                     <div className="font-bold text-amber-500 text-lg">+{s.xpEarned}</div>
                     <div className="text-[10px] text-muted-foreground uppercase font-bold">XP</div>
                   </div>
                 </div>
               );
             }) : (
               <div className="text-center py-8 text-muted-foreground">No sessions recorded yet.</div>
             )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
