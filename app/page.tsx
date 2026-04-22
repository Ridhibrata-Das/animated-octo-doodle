"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { 
  ArrowRight, Gamepad2, Brain, Mic, Trophy, Users, 
  Sparkles, Zap, ShieldCheck, Star, ArrowUpRight,
  BookOpen, Heart, Music, Rocket, Flame
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/providers/auth-provider"
import { useRef } from "react"

const springUp = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring" as const, stiffness: 200, damping: 20 }
}

const bounceDelay = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 300, damping: 15, delay }
})

export default function LandingPage() {
  const { user, signInWithGoogle } = useAuth()
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  })
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="flex flex-col min-h-screen bg-sky-50 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Hero Section */}
      <section ref={targetRef} className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 overflow-hidden border-b-8 border-sky-200 dark:border-sky-900 rounded-b-[4rem]">
        {/* Playful Background Elements */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-300 via-sky-100 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-950" />
        
        {/* Floating clouds/blobs */}
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-32 h-20 bg-white/60 dark:bg-white/10 rounded-full blur-xl" 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute top-40 right-[15%] w-48 h-32 bg-white/50 dark:bg-white/5 rounded-full blur-xl" 
        />
        
        {/* Floating Letters / Icons */}
        <motion.div 
          initial={{ rotate: -15, scale: 0 }}
          animate={{ rotate: 10, scale: 1, y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-32 left-[20%] text-5xl md:text-7xl font-black text-orange-400 drop-shadow-xl select-none"
        >
          A
        </motion.div>
        
        <motion.div 
          initial={{ rotate: 20, scale: 0 }}
          animate={{ rotate: -10, scale: 1, y: [0, 20, 0] }}
          transition={{ duration: 5, delay: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-40 right-[25%] text-6xl md:text-8xl font-black text-[#84cc16] drop-shadow-xl select-none"
        >
          E
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{ duration: 6, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-32 left-[15%] bg-amber-400 p-4 rounded-3xl shadow-xl rotate-12 hidden lg:block"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>

        <motion.div 
          style={{ opacity: opacityHero }}
          className="container px-4 mx-auto text-center relative z-10"
        >
          <motion.div {...bounceDelay(0.1)}>
            <Badge variant="outline" className="mb-6 px-5 py-2 border-4 border-white/40 bg-white/80 dark:bg-slate-800/80 text-sky-600 dark:text-sky-300 rounded-full font-black text-sm md:text-base shadow-lg backdrop-blur-sm">
               The Future of Language Learning
            </Badge>
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tight mb-8 leading-[1.05]"
            {...bounceDelay(0.2)}
          >
            <span className="text-slate-800 dark:text-white drop-shadow-md">Master English<br/></span>
            <span className="relative inline-block mt-2">
              <span className="text-orange-500 drop-shadow-lg">Through </span>
              <span className="text-[#84cc16] drop-shadow-lg">Immersive </span>
              <span className="text-sky-500 drop-shadow-lg">Play</span>
              <motion.div 
                className="absolute -bottom-4 left-0 w-full h-4 bg-yellow-400 rounded-full -z-10"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              />
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed"
            {...bounceDelay(0.3)}
          >
            Stop studying boring grammar rules. Start playing! Experience 26+ magical game modes powered by AI.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
            {...bounceDelay(0.4)}
          >
            {user ? (
               <Button asChild size="lg" className="h-16 px-12 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-white shadow-xl shadow-[#84cc16]/40 border-b-8 border-[#4d7c0f] active:border-b-0 active:translate-y-2 transition-all text-xl font-black group">
                <Link href="/dashboard">
                  GO TO DASHBOARD <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="h-16 px-12 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-white shadow-xl shadow-[#84cc16]/40 border-b-8 border-[#4d7c0f] active:border-b-0 active:translate-y-2 transition-all text-xl font-black group" onClick={() => signInWithGoogle()}>
                  GET STARTED FREE <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-2" />
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full border-4 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all font-black text-lg shadow-lg">
                  <Link href="/playground">TRY DEMO</Link>
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section with Playful Cards */}
      <section className="relative -mt-16 z-20 container px-4 mx-auto">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            animate: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {[
            { value: "26+", label: "Game Modes", color: "bg-sky-400 shadow-sky-400/40 text-white border-b-sky-600" },
            { value: "A1-C2", label: "CEFR Levels", color: "bg-amber-400 shadow-amber-400/40 text-slate-900 border-b-amber-500" },
            { value: "AI", label: "Powered Tutors", color: "bg-rose-400 shadow-rose-400/40 text-white border-b-rose-600" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={springUp}
              className={`${stat.color} rounded-3xl p-8 text-center shadow-xl border-b-8 transform hover:-translate-y-2 transition-transform`}
            >
              <div className="text-4xl md:text-5xl font-black mb-2 drop-shadow-md">{stat.value}</div>
              <div className="text-sm uppercase tracking-widest font-bold opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="container px-4 mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={springUp}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-slate-800 dark:text-white">Learn to play. <br/> Play to learn.</h2>
            <p className="text-xl font-bold text-slate-500 max-w-2xl mx-auto">A completely new world designed to make English grammar unforgettable.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: "Smart Practice", 
                desc: "An AI tutor that knows your weaknesses and builds custom drills.",
                icon: Brain,
                bg: "bg-indigo-100 dark:bg-indigo-900/50",
                iconColor: "text-indigo-500",
                borderColor: "border-indigo-200 dark:border-indigo-800"
              },
              { 
                title: "Speak Fearlessly", 
                desc: "Practice with AI roleplay that provides instant pronunciation feedback.",
                icon: Mic,
                bg: "bg-rose-100 dark:bg-rose-900/50",
                iconColor: "text-rose-500",
                borderColor: "border-rose-200 dark:border-rose-800"
              },
              { 
                title: "Join Guilds", 
                desc: "Form study groups, climb leaderboards, and win weekly tournaments.",
                icon: Users,
                bg: "bg-emerald-100 dark:bg-emerald-900/50",
                iconColor: "text-emerald-600",
                borderColor: "border-emerald-200 dark:border-emerald-800"
              },
              { 
                title: "Endless Minigames", 
                desc: "From word scrambles to intense spelling bees, never get bored.",
                icon: Gamepad2,
                bg: "bg-amber-100 dark:bg-amber-900/50",
                iconColor: "text-amber-500",
                borderColor: "border-amber-200 dark:border-amber-800"
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                className={`bg-white dark:bg-slate-800 border-4 ${f.borderColor} rounded-[2rem] p-8 hover:shadow-2xl transition-all group hover:-translate-y-2`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              >
                <div className={`${f.bg} w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform border-4 ${f.borderColor}`}>
                  <f.icon className={`w-10 h-10 ${f.iconColor}`} />
                </div>
                <h3 className="text-2xl font-black mb-4 text-slate-800 dark:text-white">{f.title}</h3>
                <p className="text-slate-500 font-bold text-lg leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Showcase Section */}
      <section id="games" className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-indigo-950 overflow-hidden relative border-y-8 border-indigo-100 dark:border-indigo-900 rounded-[4rem] mx-4 md:mx-12">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div 
              className="flex-1 space-y-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.div variants={springUp}>
                <Badge className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-800 px-4 py-2 text-base font-bold rounded-full">
                  Level Up Your Grammar
                </Badge>
              </motion.div>
              
              <motion.h2 
                variants={springUp}
                className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-800 dark:text-white"
              >
                Gamify your <br /> <span className="text-purple-500">streak!</span>
              </motion.h2>
              
              <motion.p variants={springUp} className="text-xl font-bold text-slate-500 max-w-lg">
                Earn gems, unlock legendary outfits for your avatar, and track your daily streaks. Learning has never felt so rewarding.
              </motion.p>
              
              <motion.ul variants={springUp} className="space-y-6">
                {[
                  { icon: Zap, text: "Instant lightning-fast AI feedback" },
                  { icon: Trophy, text: "Compete in global weekly leagues" },
                  { icon: Star, text: "Hundreds of unique achievements" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 font-black flex-1 text-slate-700 dark:text-slate-300 text-lg md:text-xl">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 border-4 border-purple-200 dark:border-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <item.icon className="w-6 h-6 text-purple-500" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </motion.ul>

              <motion.div variants={springUp} className="pt-4">
                <Button asChild className="h-16 px-10 rounded-full font-black text-xl shadow-xl border-b-8 border-purple-800 bg-purple-500 hover:bg-purple-600 active:border-b-0 active:translate-y-2 transition-all text-white">
                  <Link href="/dashboard/games">See All Adventures <Rocket className="ml-3 w-6 h-6" /></Link>
                </Button>
              </motion.div>
            </motion.div>

            <div className="flex-1 relative">
              <motion.div 
                className="relative mx-auto w-full max-w-[500px] aspect-square"
                initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
                whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <div className="absolute inset-x-8 inset-y-12 bg-white/40 dark:bg-slate-800/40 rounded-[4rem] border-8 border-white/60 dark:border-slate-700/60 shadow-2xl backdrop-blur-sm -z-10" />

                {/* Floating UI Elements */}
                <motion.div 
                  className="absolute top-10 right-0 md:-right-10 w-72 bg-white dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 z-20"
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                       <Star className="text-yellow-400 fill-current w-8 h-8" />
                       <Star className="text-yellow-400 fill-current w-8 h-8" />
                       <Star className="text-yellow-400 fill-current w-8 h-8" />
                    </div>
                    <Badge className="bg-green-100 text-green-600 font-bold border-2 border-green-200">PERFECT!</Badge>
                  </div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600">
                    <div className="h-full bg-[#84cc16] w-full rounded-full" />
                  </div>
                  <div className="mt-6 font-black text-3xl text-center text-slate-800 dark:text-white">+ 150 GEMS</div>
                </motion.div>

                <motion.div 
                  className="absolute bottom-10 -left-4 md:-left-12 w-80 bg-orange-500 border-4 border-orange-400 rounded-3xl shadow-2xl p-6 text-white z-30"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/20 rounded-2xl border-4 border-orange-400">
                      <Flame className="w-12 h-12 text-yellow-300 fill-current" />
                    </div>
                    <div>
                      <div className="text-4xl font-black mb-1 drop-shadow-md">15 DAYS</div>
                      <div className="text-sm text-orange-200 uppercase font-black tracking-widest">Streak Unlocked!</div>
                    </div>
                  </div>
                </motion.div>
                
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Big Final CTA */}
      <section className="py-32">
        <div className="container px-4 mx-auto">
          <motion.div 
            className="bg-[#84cc16] rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl border-b-[16px] border-[#4d7c0f]"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 4px 4px, white 4px, transparent 0)", backgroundSize: "48px 48px" }} />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] drop-shadow-lg">Let&apos;s start your <br /> adventure!</h2>
              <p className="text-white/90 font-bold text-xl md:text-2xl mb-12 leading-relaxed">
                Join thousands of learners making grammar fun again. Create your free account and play your first game in 30 seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {user ? (
                   <Button asChild size="lg" className="h-20 px-12 rounded-full bg-white text-[#84cc16] hover:bg-slate-50 font-black text-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border-b-8 border-slate-200">
                    <Link href="/dashboard">JUMP SECURELY IN</Link>
                  </Button>
                ) : (
                  <Button size="lg" className="h-20 px-16 rounded-full bg-white text-[#84cc16] hover:bg-slate-50 font-black text-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border-b-8 border-slate-200" onClick={() => signInWithGoogle()}>
                    PLAY FOR FREE
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Extra Playful Footer */}
      <section className="py-16 bg-white dark:bg-slate-900 mx-4 lg:mx-12 rounded-[2rem] border-8 border-slate-100 dark:border-slate-800 mb-12">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-b from-[#84cc16] to-[#65a30d] border-b-4 border-[#4d7c0f]">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-3xl tracking-tight text-slate-800 dark:text-white">Sabai</span>
            </div>
            
            <div className="flex gap-8 font-bold text-slate-500">
              <Link href="/privacy" className="hover:text-[#84cc16] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#84cc16] transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-[#84cc16] transition-colors">Contact</Link>
            </div>
            
            <div className="text-slate-400 font-bold">
              Made with <Heart className="w-5 h-5 inline text-rose-500 fill-current mx-1 mb-1" /> for learning.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

