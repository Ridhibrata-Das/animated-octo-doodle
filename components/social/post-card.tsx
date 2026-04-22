"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, Trophy, Zap, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/firestore"
import { useReadingXP } from "@/hooks/use-reading-xp"

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onLike }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUserId))
  const [likesCount, setLikesCount] = useState(post.likes.length)
  const { recordRead } = useReadingXP()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only record read for other people's posts
    if (post.authorId === currentUserId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          recordRead(post.id);
          observer.disconnect();
        }
      },
      { threshold: 0.6 } // Fire when 60% of the card is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [post.id, post.authorId, currentUserId, recordRead]);

  const handleLike = () => {
    onLike(post.id)
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const getTimeAgo = () => {
    if (!post.createdAt) return "Just now"
    try {
      // Handle Firestore Timestamp or Date
      const date = (post.createdAt as any).toDate ? (post.createdAt as any).toDate() : new Date(post.createdAt as any)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return "Recently"
    }
  }

  return (
    <Card ref={cardRef} className="overflow-hidden border-2 hover:border-indigo-500/20 transition-all">
      <CardHeader className="p-4 flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-indigo-500/10">
          <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
          <AvatarFallback>{post.authorName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm truncate">{post.authorName}</h4>
            {post.type === 'achievement' && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-[10px] h-4">
                Achievement
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{getTimeAgo()}</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="text-sm leading-relaxed">
          {post.content}
        </div>

        {post.type === 'game_score' && post.metadata?.score !== undefined && (
          <div className="bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Score</p>
                <p className="text-lg font-black text-indigo-600">{post.metadata.score}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Mode</p>
              <p className="text-sm font-bold truncate">{post.metadata.modeId || "Challenge"}</p>
            </div>
          </div>
        )}

        {post.type === 'achievement' && post.metadata?.badgeName && (
          <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Star className="h-6 w-6 text-white fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600">New Badge Unlocked!</p>
              <p className="text-base font-black uppercase tracking-tight">{post.metadata.badgeName}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            className={cn(
              "gap-2 hover:bg-red-500/5 h-8 px-2",
              isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span className="text-xs font-bold">{likesCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-indigo-500/5 h-8 px-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-bold">{post.commentCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground ml-auto h-8 w-8 p-0">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
