"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeSwitch } from "@/components/common/theme-switch"
import { LanguageToggle } from "@/components/common/language-toggle"
import { useStreakContext } from "@/components/providers/streak-provider"
import { cn } from "@/lib/utils"
import { BookOpen, Gamepad2, Trophy, Lightbulb, Languages, Menu, X, Flame, Gem, Zap, Users, Shield, User as UserIcon, LogOut, ChevronDown } from "lucide-react"
import { SoundToggle } from "@/components/ui/sound-toggle"
import { useXP } from "@/hooks/use-xp"
import { useEnergy } from "@/hooks/use-energy"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { PaymentModal } from "@/components/payment-modal"

const navGroups = {
  Learn: [
    { href: "/practice", label: "Practice", icon: BookOpen },
    { href: "/playground", label: "Playground", icon: BookOpen },
    { href: "/translate", label: "Translate", icon: Languages },
    { href: "/tips", label: "Tips", icon: Lightbulb },
  ],
  Play: [
    { href: "/builder", label: "Sentence Builder", icon: Gamepad2 },
    { href: "/game/rainfall", label: "Word Game", icon: Gamepad2 },
    { href: "/quiz", label: "Quiz", icon: Trophy },
  ],
  Social: [
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/community", label: "Community", icon: Users },
    { href: "/guilds", label: "Guilds", icon: Shield },
    { href: "/history", label: "History", icon: BookOpen },
  ]
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentStreak } = useStreakContext()
  const { gems } = useXP()
  const { energy, maxEnergy, isPremium } = useEnergy()
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-b from-[#84cc16] to-[#65a30d] shadow-lg shadow-[#65a30d]/30 border-b-4 border-[#4d7c0f] active:border-b-0 active:translate-y-1 transition-all">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight hidden sm:inline-block text-foreground shrink-0">Sabai</span>
          </Link>

          {/* Desktop Navigation */}
          {!loading && user && (
            <nav className="hidden lg:flex items-center gap-3 ml-6 mr-auto">
              {Object.entries(navGroups).map(([groupName, items]) => (
                <DropdownMenu key={groupName}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-1 font-bold text-muted-foreground hover:text-foreground text-base rounded-full px-4">
                      {groupName} <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 border-2">
                    {items.map((item) => (
                      <DropdownMenuItem key={item.href} asChild className="rounded-xl p-3 cursor-pointer mb-1 last:mb-0">
                        <Link href={item.href} className="w-full flex items-center gap-3">
                          <div className="bg-muted p-2 rounded-lg">
                            <item.icon className="h-4 w-4 text-foreground" />
                          </div>
                          <span className="font-semibold">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </nav>
          )}

          {!loading && !user && (
            <nav className="hidden lg:flex items-center gap-8 ml-8 mr-auto font-bold text-muted-foreground">
              <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="#games" className="hover:text-foreground transition-colors">Games</Link>
              <Link href="#cefr" className="hover:text-foreground transition-colors">Levels</Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {!loading && user ? (
              <>
                <Link href="/challenges" className="hidden sm:flex">
                  <Button variant="ghost" size="sm" className={cn("gap-2 text-base rounded-full px-4 border-2 border-transparent hover:border-orange-200 hover:bg-orange-50", currentStreak > 0 ? "text-orange-500" : "text-muted-foreground")}>
                    <Flame className={cn("h-5 w-5", currentStreak > 0 && "fill-current")} />
                    <span className="font-extrabold">{currentStreak}</span>
                  </Button>
                </Link>
                <Link href="/store" className="hidden sm:flex">
                  <Button variant="ghost" size="sm" className="gap-2 text-base rounded-full px-4 text-sky-500 border-2 border-transparent hover:border-sky-200 hover:bg-sky-50">
                    <Gem className="h-5 w-5 fill-current" />
                    <span className="font-extrabold">{gems}</span>
                  </Button>
                </Link>
                
                <div className="hidden sm:flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => !isPremium && setShowPaymentModal(true)}
                    className={cn(
                      "gap-2 text-base rounded-full px-4 border-2 border-transparent hover:border-emerald-200 hover:bg-emerald-50 text-emerald-500"
                    )}
                  >
                    <Zap className={cn("h-5 w-5", energy > 0 && "fill-current")} />
                    <span className="font-extrabold">{isPremium ? `${energy}/${maxEnergy}` : energy > 0 ? "Free Plays" : "Empty"}</span>
                  </Button>
                </div>
                
                <div className="hidden sm:flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeSwitch />
                  <SoundToggle />
                </div>

                <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full pl-2 pr-4 py-2 h-auto gap-3 border-2 border-transparent hover:border-border">
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-[#84cc16] shadow-sm" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      )}
                      <span className="font-bold hidden md:inline-block max-w-[100px] truncate">{profile?.displayName || 'Learner'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-2">
                    <div className="px-3 py-2 mb-2 bg-muted/50 rounded-xl md:hidden">
                      <p className="font-bold truncate">{profile?.displayName || 'Learner'}</p>
                    </div>
                    <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer">
                      <Link href="/dashboard" className="w-full flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-lg">
                          <UserIcon className="h-4 w-4" /> 
                        </div>
                        <span className="font-bold">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem className="rounded-xl p-3 text-red-500 focus:text-red-500 cursor-pointer focus:bg-red-50 dark:focus:bg-red-500/10" onClick={() => signOut()}>
                      <div className="bg-red-100 dark:bg-red-500/20 p-2 rounded-lg mr-3">
                        <LogOut className="h-4 w-4" /> 
                      </div>
                      <span className="font-bold">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : !loading && !user ? (
               <>
                 <div className="hidden sm:flex items-center gap-2">
                   <LanguageToggle />
                   <ThemeSwitch />
                 </div>
                 <Button variant="ghost" className="hidden sm:flex font-extrabold text-base rounded-full px-6 hover:bg-muted" onClick={() => signInWithGoogle()}>
                   LOG IN
                 </Button>
                 <Button className="hidden sm:flex bg-[#84cc16] hover:bg-[#65a30d] text-white font-black text-base rounded-full px-8 py-6 shadow-lg shadow-[#84cc16]/30 border-b-4 border-[#4d7c0f] active:border-b-0 active:translate-y-1 transition-all" onClick={() => signInWithGoogle()}>
                   GET STARTED
                 </Button>
               </>
            ) : null}

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden rounded-xl border-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t-2 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-2">
              {!loading && user ? (
                <>
                  <div className="flex items-center justify-around p-4 bg-muted/30 rounded-2xl mb-4 border-2">
                    <div className="flex flex-col items-center gap-1">
                      <Flame className="h-6 w-6 text-orange-500 fill-current" />
                      <span className="font-black text-lg">{currentStreak}</span>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="flex flex-col items-center gap-1">
                      <Gem className="h-6 w-6 text-sky-500 fill-current" />
                      <span className="font-black text-lg">{gems}</span>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <button 
                      onClick={() => {
                        if (!isPremium) {
                          setShowPaymentModal(true);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <Zap className={cn("h-6 w-6 text-emerald-500", energy > 0 && "fill-current")} />
                      <span className="font-black text-lg text-emerald-500">{isPremium ? `${energy}/${maxEnergy}` : energy > 0 ? "Free Plays" : "Empty"}</span>
                    </button>
                  </div>
                  
                  {Object.entries(navGroups).map(([groupName, items]) => (
                    <div key={groupName} className="mb-4">
                      <h4 className="font-extrabold text-sm uppercase tracking-widest text-muted-foreground px-2 mb-3 mt-2">{groupName}</h4>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                            <Button
                              variant={pathname === item.href ? "secondary" : "ghost"}
                              className={cn("w-full justify-start gap-4 font-bold h-12 rounded-xl", pathname === item.href && "bg-[#84cc16]/10 text-[#65a30d]")}
                            >
                              <div className={cn("p-2 rounded-lg", pathname === item.href ? "bg-[#84cc16]/20" : "bg-muted")}>
                                <item.icon className="h-4 w-4" />
                              </div>
                              {item.label}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="h-px bg-border my-4" />
                  <Button variant="ghost" className="w-full justify-start gap-4 font-bold h-12 rounded-xl text-red-500 hover:bg-red-50" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                    <div className="bg-red-100 p-2 rounded-lg">
                      <LogOut className="h-4 w-4" />
                    </div>
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="p-4 flex flex-col gap-4">
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-lg border-2" onClick={() => { signInWithGoogle(); setMobileMenuOpen(false); }}>LOG IN</Button>
                  <Button className="w-full h-14 bg-[#84cc16] hover:bg-[#65a30d] font-black text-lg text-white rounded-2xl shadow-lg shadow-[#84cc16]/30 border-b-4 border-[#4d7c0f] active:border-b-0 transition-all" onClick={() => { signInWithGoogle(); setMobileMenuOpen(false); }}>GET STARTED FREE</Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
    <AnimatePresence>
      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal} 
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => setShowPaymentModal(false)}
        />
      )}
    </AnimatePresence>
    </>
  )
}
