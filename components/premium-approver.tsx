'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function PremiumApprover() {
  const processedIds = useRef(new Set<string>());
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'subscription_requests'),
      where('uid', '==', user.uid),
      where('status', '==', 'approved'),
      where('notified', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(async (document) => {
        // Prevent local repetition
        if (processedIds.current.has(document.id)) return;
        processedIds.current.add(document.id);

        // Trigger Confetti
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // Show Toast
        toast.success("Subscription Approved!", {
          description: "Welcome to Premium! You now have unlimited games and hourly energy refills.",
          duration: 10000,
        });

        // Mark as notified
        try {
          await updateDoc(doc(db, 'subscription_requests', document.id), {
            notified: true
          });
          
          await updateDoc(doc(db, 'users', user.uid), {
            subscriptionStatus: 'active'
          });
        } catch (e) {
          console.error("Failed to mark notification as read", e);
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  return null;
}
