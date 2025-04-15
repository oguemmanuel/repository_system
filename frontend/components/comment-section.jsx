"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageSquare, Flag } from "lucide-react"
import { Toaster } from "./ui/sonner"

// Mock comments data
const mockComments = [
  {
    id: "1",
    author: {
      name: "John Doe",
      avatar: "",
      initials: "JD",
    },
    content:
      "This project is very impressive! The facial recognition implementation is well-documented and the results are promising.",
    timestamp: "2 days ago",
    likes: 8,
    replies: [
      {
        id: "1-1",
        author: {
          name: "Sarah Johnson",
          avatar: "",
          initials: "SJ",
        },
        content: "I agree! The methodology section is particularly well-written.",
        timestamp: "1 day ago",
        likes: 3,
      },
    ],
  },
  {
    id: "2",
    author: {
      name: "Michael Brown",
      avatar: "",
      initials: "MB",
    },
    content:
      "I found this very helpful for my own research on computer vision applications. Would love to know more about the algorithms used for feature extraction.",
    timestamp: "5 days ago",
    likes: 5,
    replies: [],
  },
]

const CommentSection = ({ resourceId }) => {
  const [comments, setComments] = useState(mockComments)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = (commentId, isReply = false, replyId) => {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (!isReply && comment.id === commentId) {
          return { ...comment, likes: comment.likes + 1 }
        } else if (isReply && comment.id === commentId && replyId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply,
            ),
          }
        }
        return comment
      }),
    )

    Toaster({
      title: "Comment liked",
      description: "You have liked this comment.",
    })
  }

  const handleReply = (commentId) => {
    setReplyingTo(commentId)
    setReplyContent("")
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setReplyContent("")
  }

  const handleSubmitReply = (commentId) => {
    if (!replyContent.trim()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newReply = {
        id: `${commentId}-${Date.now()}`,
        author: {
          name: "You",
          avatar: "",
          initials: "YO",
        },
        content: replyContent,
        timestamp: "Just now",
        likes: 0,
      }

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, replies: [...comment.replies, newReply] } : comment,
        ),
      )

      setReplyingTo(null)
      setReplyContent("")
      setIsSubmitting(false)

      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      })
    }, 1000)
  }

  const handleReport = (commentId, isReply = false, replyId) => {
    toast({
      title: "Comment reported",
      description: "Thank you for reporting this comment. Our moderators will review it.",
    })
  }

  return (
    <div className="space-y-6">
      {comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-6">No comments yet. Be the first to comment!</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar>
                {comment.author.avatar ? (
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                ) : (
                  <AvatarFallback>{comment.author.initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{comment.author.name}</p>
                    <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleReport(comment.id)}>
                    <Flag className="h-4 w-4" />
                    <span className="sr-only">Report</span>
                  </Button>
                </div>
                <p className="text-sm">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="gap-1 h-8 px-2" onClick={() => handleLike(comment.id)}>
                    <ThumbsUp className="h-4 w-4" />
                    <span>{comment.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 h-8 px-2" onClick={() => handleReply(comment.id)}>
                    <MessageSquare className="h-4 w-4" />
                    <span>Reply</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-12 space-y-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                      {reply.author.avatar ? (
                        <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                      ) : (
                        <AvatarFallback>{reply.author.initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{reply.author.name}</p>
                          <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleReport(comment.id, true, reply.id)}>
                          <Flag className="h-3 w-3" />
                          <span className="sr-only">Report</span>
                        </Button>
                      </div>
                      <p className="text-sm">{reply.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 h-7 px-2 text-xs"
                        onClick={() => handleLike(comment.id, true, reply.id)}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{reply.likes}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="ml-12 flex items-start gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>YO</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelReply}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyContent.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default CommentSection