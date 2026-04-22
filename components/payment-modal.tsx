'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Rocket, Crown, Star, Check, Hash, IndianRupee, ExternalLink, Heart, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { createSubscriptionRequest } from '@/lib/firestore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  const isPending = profile?.subscriptionStatus === 'pending';

  const handleClaimSubmit = async () => {
    if (!user || !profile) return;
    if (!transactionId || !amountPaid) {
      toast.error("Please provide both Transaction ID and Amount Paid");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSubscriptionRequest(
        user.uid, 
        user.email || '', 
        profile.displayName || 'Learner',
        transactionId,
        parseFloat(amountPaid)
      );

      toast.success("Request Submitted!", {
        description: "Your request has been queued. An admin will verify your transaction ID shortly."
      });
      onSuccess();
    } catch (e) {
      console.error(e);
      toast.error("An error occurred trying to submit your request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 text-center bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white relative shrink-0">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl mx-auto flex items-center justify-center -rotate-6 mb-2 shadow-xl">
            <Crown className="w-6 h-6 text-yellow-300 fill-yellow-300" />
          </div>
          <h2 className="text-2xl font-black mb-0.5 tracking-tight italic uppercase">Unlock Premium</h2>
          <p className="text-white/80 font-medium text-xs">
            Support Sabai and get unlimited access!
          </p>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* QR Section */}
          <div className="text-center space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Step 1: Scan & Pay</p>
            <div className="relative group mx-auto w-40 h-40">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-3 rounded-2xl shadow-lg border border-border/50">
                <img src="/qr-code.png" alt="Payment QR Code" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-bold text-foreground tracking-tight">SABAI FOUNDATION</p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full border border-border/50">UPI ID: 81k1byfou2ce@mahb</p>
              </div>
            </div>
          </div>

          {/* Donation Text */}
          <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-rose-500">
              <Heart className="w-4 h-4 fill-current" />
              <h4 className="font-black italic uppercase text-xs tracking-tight">Support Sabai Foundation</h4>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
              Your contribution helps keep this platform free for underprivileged sections. Thank you for your kindness!
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase text-rose-500 hover:underline flex items-center gap-1">Website <ExternalLink className="w-2 h-2" /></a>
              <span className="text-muted-foreground opacity-20">|</span>
              <a href="https://example.com/donate" target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase text-rose-500 hover:underline flex items-center gap-1" >Donation Portal <ExternalLink className="w-2 h-2" /></a>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Step 2: Enter Details</p>
            
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="trxId" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <Hash className="w-3 h-3" /> Transaction ID
                </Label>
                <Input 
                  id="trxId"
                  disabled={isPending}
                  placeholder="e.g. T2403221234..."
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="h-10 rounded-xl border-2 font-bold focus:border-indigo-500 transition-all bg-muted/20"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <IndianRupee className="w-3 h-3" /> Amount Paid (₹)
                </Label>
                <Input 
                  id="amount"
                  type="number"
                  disabled={isPending}
                  placeholder="Amount in INR"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="h-10 rounded-xl border-2 font-bold focus:border-indigo-500 transition-all bg-muted/20"
                />
              </div>
            </div>

            <Button 
              disabled={isSubmitting || isPending}
              onClick={handleClaimSubmit}
              className={`w-full h-14 rounded-full text-lg font-black shadow-xl transition-all shadow-indigo-500/10 active:scale-95 ${
                isPending 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border-2 border-zinc-700" 
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              }`}
            >
              {isSubmitting ? "Validating..." : isPending ? "Verification Pending" : "Submit Claim"} 
              {!isPending && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
