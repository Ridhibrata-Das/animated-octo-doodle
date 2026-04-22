"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Shield, ArrowRight, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Guild } from "@/lib/firestore"

interface GuildListProps {
  guilds: Guild[];
  userGuildId: string | null;
  onJoin: (guildId: string) => void;
  onCreate: () => void;
}

export function GuildList({ guilds, userGuildId, onJoin, onCreate }: GuildListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          Top Guilds
        </h3>
        {!userGuildId && (
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={onCreate}>
            <Plus className="h-3.5 w-3.5" />
            Create
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {guilds.map((guild, index) => (
          <Card key={guild.id} className="overflow-hidden border-2 hover:border-indigo-500/20 transition-all cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-indigo-500/10">
                  <AvatarImage src={guild.photoURL} alt={guild.name} />
                  <AvatarFallback>{guild.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate group-hover:text-indigo-600 transition-colors">
                  {guild.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {guild.memberCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-amber-500" />
                    {guild.totalXP.toLocaleString()} XP
                  </span>
                </div>
              </div>

              {userGuildId === guild.id ? (
                <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/20">
                  Member
                </Badge>
              ) : (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoin(guild.id);
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {guilds.length === 0 && (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-xl">
            <p className="text-sm text-muted-foreground mb-4">No guilds found yet.</p>
            <Button size="sm" onClick={onCreate}>Be the first to create one!</Button>
          </div>
        )}
      </div>
    </div>
  )
}
