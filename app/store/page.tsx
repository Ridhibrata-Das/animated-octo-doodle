'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { STORE_ITEMS, type StoreItem } from '@/data/store';
import { purchaseItem, updateUser } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gem, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function StorePage() {
  const { user, profile } = useAuth();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (item: StoreItem) => {
    if (!user || !profile) return;
    
    if ((profile.gems || 0) < item.cost) {
      toast.error("Not enough Gems!");
      return;
    }

    setPurchasing(item.id);
    const success = await purchaseItem(user.uid, item.id, item.cost, item.isConsumable);
    setPurchasing(null);

    if (success) {
      toast.success(`Successfully purchased ${item.name}!`, {
        icon: '💎'
      });
    } else {
      toast.error("Purchase failed. Please try again.");
    }
  };

  const handleEquipPersona = async (personaId: string | null) => {
    if (!user) return;
    await updateUser(user.uid, { activePersona: personaId });
    toast.success(personaId ? "Persona equipped!" : "Persona unequipped!");
  };

  if (!profile) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const gems = profile.gems || 0;
  const inventory = profile.inventory || [];
  const activePersona = profile.activePersona;

  return (
    <div className="container mx-auto p-4 max-w-5xl py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            The Emporium
          </h1>
          <p className="text-muted-foreground text-lg">Spend your hard-earned gems on exclusive perks.</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl shadow-inner">
          <Gem className="w-8 h-8 text-indigo-500" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-muted-foreground leading-none">Your Balance</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none mt-1">{gems}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STORE_ITEMS.map((item, idx) => {
          const isOwned = !item.isConsumable && inventory.includes(item.id);
          const canAfford = gems >= item.cost;
          const isEquipped = activePersona === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full flex flex-col border-2 hover:border-indigo-500/50 transition-colors overflow-hidden relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-4xl">{item.icon}</div>
                    <Badge variant={item.type === 'persona' ? 'default' : 'secondary'} className="uppercase">
                      {item.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <CardDescription className="text-base">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {isOwned && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                      <ShieldCheck className="w-5 h-5" />
                      Owned
                    </div>
                  )}
                  {!isOwned && (
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                      <Gem className="w-5 h-5" />
                      {item.cost}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-4 border-t bg-muted/20">
                  {isOwned ? (
                    item.type === 'persona' ? (
                      <Button 
                        className="w-full" 
                        variant={isEquipped ? "secondary" : "default"}
                        onClick={() => handleEquipPersona(isEquipped ? null : item.id)}
                      >
                        {isEquipped ? <><Check className="w-4 h-4 mr-2" /> Equipped</> : 'Equip Persona'}
                      </Button>
                    ) : (
                      <Button className="w-full" disabled variant="outline">Already Owned</Button>
                    )
                  ) : (
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford || purchasing === item.id}
                      variant={canAfford ? "default" : "secondary"}
                    >
                      {purchasing === item.id ? 'Purchasing...' : (canAfford ? 'Purchase' : 'Not enough Gems')}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
