"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { 
  getCommunityFeed, 
  getAllGuilds, 
  joinGuild, 
  createGuild, 
  toggleLikePost, 
  createPost,
  subscribeToCommunityFeed,
  type Post,
  type Guild
} from "@/lib/firestore"
import { PostCard } from "@/components/social/post-card"
import { GuildList } from "@/components/social/guild-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Send, MessageSquare, Users, TrendingUp, Sparkles, Trophy } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CommunityPage() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    
    // Initial fetch for guilds
    getAllGuilds().then(setGuilds)

    // Subscription for posts feed
    const unsubscribe = subscribeToCommunityFeed((newPosts) => {
      setPosts(newPosts)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleCreatePost = async () => {
    if (!profile || !newPostContent.trim()) return
    
    setIsSubmitting(true)
    try {
      await createPost(profile, newPostContent, 'status')
      setNewPostContent("")
      toast.success("Post shared with the community!")
    } catch (error) {
      toast.error("Failed to post. Try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinGuild = async (guildId: string) => {
    if (!user) return
    try {
      await joinGuild(user.uid, guildId)
      const updatedGuilds = await getAllGuilds()
      setGuilds(updatedGuilds)
      toast.success("Welcome to the guild!")
    } catch (error) {
      toast.error("Could not join guild.")
    }
  }

  const handleCreateGuild = async () => {
    if (!user) return
    const name = prompt("Enter Guild Name:")
    if (!name) return
    const desc = prompt("Enter Guild Description:")
    if (!desc) return

    try {
      await createGuild(user.uid, name, desc)
      const updatedGuilds = await getAllGuilds()
      setGuilds(updatedGuilds)
      toast.success(`Guild "${name}" created!`)
    } catch (error) {
      toast.error("Failed to create guild.")
    }
  }

  const handleLikePost = (postId: string) => {
    if (user) toggleLikePost(user.uid, postId)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-muted-foreground animate-pulse">Connecting to community...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black tracking-tight">Community</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/20 gap-1 px-3 py-1">
                <Sparkles className="h-3 w-3" />
                2.4k Active Now
              </Badge>
            </div>
          </div>

          {/* Create Post Card */}
          <Card className="border-2 border-indigo-500/10 shadow-sm overflow-hidden bg-gradient-to-br from-background to-indigo-500/5">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <Input 
                    placeholder="Share your progress or ask a question..." 
                    className="border-none bg-transparent text-lg focus-visible:ring-0 p-0 placeholder:text-muted-foreground/50"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCreatePost()}
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-500/10">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground hover:text-indigo-600">
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                        Text
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground hover:text-indigo-600">
                        <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                        Achievement
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span className="ml-2">Post</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Feed Filtering */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-muted/50 p-1 mb-4 h-12 w-full sm:w-auto grid grid-cols-3">
              <TabsTrigger value="all" className="text-xs sm:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Global Feed</TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs sm:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Achievements</TabsTrigger>
              <TabsTrigger value="guild" className="text-xs sm:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">My Guild</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 m-0">
              {posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUserId={user?.uid || ""} 
                  onLike={handleLikePost} 
                />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/20">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No posts yet. Be the first to break the silence!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 m-0">
              {posts.filter(p => p.type === 'achievement' || p.type === 'game_score').map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUserId={user?.uid || ""} 
                  onLike={handleLikePost} 
                />
              ))}
            </TabsContent>

            <TabsContent value="guild" className="space-y-4 m-0">
              <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/20">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Guild-specific feed coming soon!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          <GuildList 
            guilds={guilds} 
            userGuildId={profile?.guildId || null} 
            onJoin={handleJoinGuild} 
            onCreate={handleCreateGuild} 
          />

          <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy className="h-24 w-24" />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-xl font-black mb-2">Weekly Goal</h3>
              <p className="text-indigo-100 text-sm mb-6">Complete 5 Daily Workouts to earn the "Social Butterfly" badge!</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span>Progress</span>
                  <span>3/5</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[60%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-3xl border-2 border-dashed p-6 text-center space-y-4 bg-muted/30">
            <h4 className="font-bold text-sm">Suggested Friends</h4>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>L</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold">Learner #{i * 123}</p>
                    <p className="text-[10px] text-muted-foreground">Level {10 + i}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-indigo-600">Follow</Button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function Badge({ children, variant, className }: any) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "outline" ? "text-foreground" : "bg-primary text-primary-foreground border-transparent",
      className
    )}>
      {children}
    </span>
  )
}
