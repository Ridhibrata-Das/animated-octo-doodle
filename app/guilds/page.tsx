"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { getAllGuilds, joinGuild, createGuild, type Guild } from "@/lib/firestore"
import { GuildList } from "@/components/social/guild-list"
import { Shield, Trophy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GuildHubPage() {
  const { user, profile } = useAuth()
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    getAllGuilds(50).then((data) => {
      setGuilds(data)
      setLoading(false)
    })
  }, [user])

  const handleJoinGuild = async (guildId: string) => {
    if (!user) return
    try {
      await joinGuild(user.uid, guildId)
      const updatedGuilds = await getAllGuilds(50)
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
      const updatedGuilds = await getAllGuilds(50)
      setGuilds(updatedGuilds)
      toast.success(`Guild "${name}" created!`)
    } catch (error) {
      toast.error("Failed to create guild.")
    }
  }

  if (loading && guilds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading Guild Hub...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Guild Hub</h1>
          <p className="text-muted-foreground">Join a guild, compete in weekly leaderboards, and conquer challenges together.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Guild Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-indigo-500/10 shadow-xl overflow-hidden">
            <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="h-6 w-6 text-amber-500" />
                Weekly Guild Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {guilds.map((guild, index) => (
                  <div key={guild.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center font-bold text-lg text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm font-bold text-xl">
                        {guild.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{guild.name}</h3>
                        <p className="text-sm text-muted-foreground">{guild.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xl text-indigo-600">{guild.totalXP.toLocaleString()}</div>
                      <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Total XP</div>
                    </div>
                  </div>
                ))}
                {guilds.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No guilds exist yet. Be the first to create one!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Your Guild & Discovery */}
        <div className="space-y-6">
          <GuildList 
            guilds={guilds} 
            userGuildId={profile?.guildId || null} 
            onJoin={handleJoinGuild} 
            onCreate={handleCreateGuild} 
          />
        </div>
      </div>
    </div>
  )
}
