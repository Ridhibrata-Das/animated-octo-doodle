import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const MAX_FREE_GAMES = 10;
const MAX_PLAYS_PER_FREE_GAME = 2;
const MAX_PREMIUM_ENERGY = 26;

export function useEnergy() {
  const { profile, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Calculate if they are premium
  const isPremium = (() => {
    if (isAdmin) return true;
    if (!profile?.premiumUntil) return false;
    const premiumDate = new Date(profile.premiumUntil).getTime();
    return premiumDate > Date.now();
  })();

  // Admin Check
  useEffect(() => {
    if (!user?.email) return;
    async function checkAdmin() {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'settings', 'roles');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const admins = docSnap.data().admins || [];
          if (user?.email && admins.includes(user.email.toLowerCase())) {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        console.error("Admin check failed", e);
      }
    }
    checkAdmin();
  }, [user?.email]);

  const playedGames = profile?.playedGames || {};
  const energy = profile?.energy !== undefined ? profile.energy : (isPremium ? MAX_PREMIUM_ENERGY : 0);
  const maxEnergy = profile?.maxEnergy !== undefined ? profile.maxEnergy : MAX_PREMIUM_ENERGY;

  // Hourly replenishment for premium users
  useEffect(() => {
    if (!user || !profile || !isPremium) return;
    
    const lastUpdate = profile.lastEnergyUpdate ? new Date(profile.lastEnergyUpdate).getTime() : Date.now();
    const now = Date.now();
    const hoursPassed = Math.floor((now - lastUpdate) / (1000 * 60 * 60));
    
    if (hoursPassed > 0 && energy < maxEnergy) {
      const newEnergy = Math.min(maxEnergy, energy + hoursPassed);
      updateDoc(doc(db, 'users', user.uid), {
        energy: newEnergy,
        lastEnergyUpdate: new Date().toISOString()
      });
    }
  }, [user, profile, isPremium, energy, maxEnergy]);

  const canPlayGame = useCallback((gameId: string) => {
    // Admin bypass all restrictions
    if (isAdmin) return true;

    if (isPremium) {
      return energy > 0;
    }

    // Free logic: Limit to 10 unique games
    const playedGameIds = Object.keys(playedGames);
    const hasPlayedThis = playedGameIds.includes(gameId);
    
    if (!hasPlayedThis && playedGameIds.length >= MAX_FREE_GAMES) {
      return false; // Already tried 10 different games
    }
    
    const timesPlayedThis = playedGames[gameId] || 0;
    if (timesPlayedThis >= MAX_PLAYS_PER_FREE_GAME) {
      return false; // Played this specific game 2 times
    }
    
    return true;
  }, [isAdmin, isPremium, energy, playedGames]);

  const consumeAttempt = useCallback(async (gameId: string) => {
    if (!user || !profile) return false;
    
    // Safety check again
    if (!canPlayGame(gameId)) return false;

    // Admin doesn't consume energy, just logs the play record if needed
    if (isAdmin) return true;

    const userRef = doc(db, 'users', user.uid);
    const updatedPlayedGames = { ...playedGames };
    updatedPlayedGames[gameId] = (updatedPlayedGames[gameId] || 0) + 1;

    try {
      if (isPremium) {
        await updateDoc(userRef, {
          energy: Math.max(0, energy - 1),
          playedGames: updatedPlayedGames,
          lastEnergyUpdate: new Date().toISOString()
        });
      } else {
        await updateDoc(userRef, {
          playedGames: updatedPlayedGames
        });
      }
      return true;
    } catch (e) {
      console.error("Failed to consume attempt", e);
      return false;
    }
  }, [user, profile, isAdmin, isPremium, energy, playedGames, canPlayGame]);

  return {
    isPremium,
    isAdmin,
    energy: isAdmin ? Infinity : energy,
    maxEnergy,
    playedGames,
    canPlayGame,
    consumeAttempt
  };
}
