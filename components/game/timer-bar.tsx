'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimerBarProps {
  duration?: number;
  onTimeUp?: () => void;
  className?: string;
  timeLeft?: number;
  totalTime?: number;
  isCritical?: boolean;
}

export function TimerBar({ 
  duration, 
  onTimeUp, 
  className, 
  timeLeft: controlledTimeLeft, 
  totalTime: controlledTotalTime,
  isCritical: controlledIsCritical
}: TimerBarProps) {
  const [internalTimeLeft, setInternalTimeLeft] = useState(duration || 0);

  useEffect(() => {
    if (duration === undefined) return;
    
    setInternalTimeLeft(duration);
    
    const interval = setInterval(() => {
      setInternalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onTimeUp]);

  const activeTimeLeft = duration !== undefined ? internalTimeLeft : (controlledTimeLeft || 0);
  const activeTotalTime = duration !== undefined ? duration : (controlledTotalTime || 1);
  const isCritical = controlledIsCritical ?? (activeTimeLeft > 0 && activeTimeLeft <= 5);

  const percentage = Math.max(0, Math.min(100, (activeTimeLeft / activeTotalTime) * 100));
  
  // Color changes based on urgency
  const colorClass = 
    isCritical ? 'bg-red-500 animate-timer-blink' :
    percentage > 50 ? 'bg-emerald-500' :
    percentage > 25 ? 'bg-amber-500' : 
    'bg-red-500';

  return (
    <div className={`w-full flex flex-col gap-2 ${className || ''}`}>
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <Clock className={`w-4 h-4 ${isCritical ? 'text-red-500 animate-pulse' : ''}`} />
          <span className={`text-sm ${isCritical ? 'text-red-500 font-bold' : ''}`}>
            {activeTimeLeft}s
          </span>
        </div>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
}
