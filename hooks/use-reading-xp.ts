import { useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useXP } from '@/hooks/use-xp';
import { toast } from 'sonner';

const MAX_READING_XP_PER_DAY = 10;
const XP_PER_READ = 2;

export function useReadingXP() {
  const { user } = useAuth();
  const { addRawXP } = useXP();
  
  const recordRead = useCallback(async (postId: string) => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `reading_xp_${user.uid}_${today}`;
      
      const readData = JSON.parse(localStorage.getItem(storageKey) || '{"readPosts": [], "xpEarned": 0}');
      
      if (readData.readPosts.includes(postId)) {
        return; // Already read today
      }
      
      if (readData.xpEarned >= MAX_READING_XP_PER_DAY) {
        // Still mark as read but no more XP
        readData.readPosts.push(postId);
        localStorage.setItem(storageKey, JSON.stringify(readData));
        return;
      }
      
      // Award XP
      readData.readPosts.push(postId);
      readData.xpEarned += XP_PER_READ;
      localStorage.setItem(storageKey, JSON.stringify(readData));
      
      await addRawXP(XP_PER_READ, 'Reading Community Post');
      toast.success(`+${XP_PER_READ} XP for reading!`);
      
    } catch (e) {
      console.error("Failed to record reading XP:", e);
    }
  }, [user, addRawXP]);

  return { recordRead };
}
