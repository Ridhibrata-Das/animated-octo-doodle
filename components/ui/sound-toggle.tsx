'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '@/lib/sounds';

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Initial sync with SoundManager state
    if (soundManager) {
      setMuted(soundManager.isMuted);
    }
  }, []);

  const toggleSound = () => {
    if (soundManager) {
      const isNowMuted = soundManager.toggle();
      setMuted(isNowMuted);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleSound}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {muted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5" />}
      <span className="sr-only">{muted ? 'Unmute' : 'Mute'}</span>
    </Button>
  );
}
