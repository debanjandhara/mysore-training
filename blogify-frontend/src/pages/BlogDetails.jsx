import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Eye, 
  Clock, 
  Calendar,
  MoreHorizontal 
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { blogs } from "../lib/blogsData";

const ActionButton = ({ icon: Icon, label, count, isActive, onClick, disabled, colorClass = "text-primary" }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
      disabled
        ? "opacity-50 cursor-not-allowed text-muted-foreground"
        : isActive 
          ? `bg-primary/10 ${colorClass} ring-1 ring-primary/20` 
          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
    }`}
  >
    <Icon size={18} className={isActive && !disabled ? "fill-current" : ""} />
    {count !== undefined && <span className="text-sm font-medium">{count}</span>}
    {label && <span className="text-sm font-medium">{label}</span>}
  </button>
);

export default function BlogDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [blog, setBlog] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userAction, setUserAction] = useState(null); // 'like' | 'dislike' | null
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    // Always start from the top when opening a blog post
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    const foundBlog = blogs.find(b => b.slug === slug);
    if (foundBlog) {
      setBlog(foundBlog);
      setLikes(foundBlog.likes);
      setDislikes(foundBlog.dislikes);

      // Simple mock comments per blog
      const baseComments = [
        {
          id: 1,
          author: "Alex Carter",
          text: `Really enjoyed "${foundBlog.title}" – the points were very practical.`,
          likes: 12,
          dislikes: 0,
          userAction: null,
          createdAt: "2 hours ago",
        },
        {
          id: 2,
          author: "Jordan Lee",
          text: "Can you write a follow-up that goes deeper into the implementation details?",
          likes: 5,
          dislikes: 1,
          userAction: null,
          createdAt: "1 day ago",
        },
        {
          id: 3,
          author: "Priya Singh",
          text: "This helped me finally understand the core idea, thanks!",
          likes: 8,
          dislikes: 0,
          userAction: null,
          createdAt: "3 days ago",
        },
      ];

      setComments(baseComments);
    }
  }, [slug]);

  if (!blog) return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;

  // TODO: Replace this with the real logged-in user's name from auth context
  const currentUserName = "Guest User";
  const isOwner = blog && currentUserName === blog.author;

  const handleLike = () => {
    if (isOwner) return;
    if (userAction === 'like') {
      setLikes(prev => prev - 1);
      setUserAction(null);
    } else {
      if (userAction === 'dislike') setDislikes(prev => prev - 1);
      setLikes(prev => prev + 1);
      setUserAction('like');
    }
  };

  const handleDislike = () => {
    if (isOwner) return;
    if (userAction === 'dislike') {
      setDislikes(prev => prev - 1);
      setUserAction(null);
    } else {
      if (userAction === 'like') setLikes(prev => prev - 1);
      setDislikes(prev => prev + 1);
      setUserAction('dislike');
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComments = () => {
    setShowComments(prev => !prev);
  };

  const handleCommentReaction = (id, action) => {
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id !== id) return comment;

        let { likes, dislikes, userAction } = comment;

        if (action === 'like') {
          if (userAction === 'like') {
            likes -= 1;
            userAction = null;
          } else {
            if (userAction === 'dislike') dislikes -= 1;
            likes += 1;
            userAction = 'like';
          }
        } else if (action === 'dislike') {
          if (userAction === 'dislike') {
            dislikes -= 1;
            userAction = null;
          } else {
            if (userAction === 'like') likes -= 1;
            dislikes += 1;
            userAction = 'dislike';
          }
        }

        return { ...comment, likes, dislikes, userAction };
      })
    );
  };

  const handleDeleteComment = (id) => {
    if (!blog) return;
    setComments(prev => prev.filter(comment => comment.id !== id));
  };

  const handleStartReply = (id) => {
    if (!blog) return;
    setReplyingTo(id);
    setReplyText("");
  };

  const handleSubmitReply = (id) => {
    if (!blog) return;
    const text = replyText.trim();
    if (!text) return;

    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id !== id) return comment;
        const existingReplies = Array.isArray(comment.replies) ? comment.replies : [];
        const newReply = {
          id: Date.now(),
          author: blog.author,
          text,
          createdAt: "Just now",
        };
        return { ...comment, replies: [...existingReplies, newReply] };
      })
    );

    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Button 
        variant="ghost" 
        className="mb-6 group pl-0 hover:bg-transparent"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to all posts
      </Button>

      <GlassCard className="overflow-hidden p-0 border-none shadow-2xl">
        {/* Hero Image with Zoom Transition */}
        <motion.div 
          layoutId={`blog-image-${blog.slug}`}
          className="relative h-[400px] w-full overflow-hidden"
        >
          <img 
            src={blog.image} 
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3 mb-4"
            >
              {blog.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
            
            <motion.h1 
              layoutId={`blog-title-${blog.slug}`}
              className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-4 drop-shadow-lg"
            >
              {blog.title}
            </motion.h1>

            <div className="flex items-center gap-6 text-foreground/80 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                  {blog.author[0]}
                </div>
                {blog.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {blog.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {blog.readTime}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="p-8 md:p-12">
          {/* Blog Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Interaction Bar */}
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <ActionButton 
                icon={ThumbsUp} 
                count={likes} 
                isActive={userAction === 'like'} 
                onClick={handleLike} 
                disabled={isOwner}
              />
              <ActionButton 
                icon={ThumbsDown} 
                count={dislikes} 
                isActive={userAction === 'dislike'} 
                onClick={handleDislike}
                disabled={isOwner}
                colorClass="text-red-500"
              />
              <div className="w-px h-8 bg-border mx-2" />
              <ActionButton 
                icon={MessageSquare} 
                count={blog.comments} 
                label="Comments"
                onClick={handleToggleComments}
              />
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2 text-sm">
                <Eye size={18} />
                <span>{blog.views.toLocaleString()} views</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full gap-2"
                onClick={handleShare}
              >
                <Share2 size={16} />
                {shareCopied ? "Link copied" : "Share"}
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && comments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.25 }}
                className="mt-10 space-y-6 border-t border-border pt-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
                  <span className="text-xs text-muted-foreground">Showing latest</span>
                </div>

                <div className="space-y-4">
                  {comments.map(comment => (
                    <GlassCard key={comment.id} className="p-4 md:p-5 space-y-3 bg-background/60">
                      <div className="flex gap-3">
                        <div className="mt-1">
                          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                            {comment.author[0]}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{comment.author}</p>
                              <p className="text-xs text-muted-foreground">{comment.createdAt}</p>
                            </div>
                            {blog && isOwner && (
                              <div className="flex items-center gap-1">
                                {blog.author === comment.author && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold tracking-wide">
                                    Author
                                  </span>
                                )}
                                {blog.author === comment.author && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="ml-1 px-2 py-1 rounded-full text-[11px] text-red-500 hover:bg-red-500/10"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {comment.text}
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              onClick={() => handleCommentReaction(comment.id, 'like')}
                              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                comment.userAction === 'like'
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                              }`}
                            >
                              <ThumbsUp size={14} />
                              <span>{comment.likes}</span>
                            </button>
                            <button
                              onClick={() => handleCommentReaction(comment.id, 'dislike')}
                              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                comment.userAction === 'dislike'
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                              }`}
                            >
                              <ThumbsDown size={14} />
                              <span>{comment.dislikes}</span>
                            </button>
                            {(!isOwner || comment.author !== blog.author) && (
                              <button
                                onClick={() => handleStartReply(comment.id)}
                                className="ml-1 text-xs text-primary hover:underline"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                        <div className="mt-2 space-y-2 pl-12">
                          {comment.replies.map(reply => (
                            <div
                              key={reply.id}
                              className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm flex justify-between gap-2"
                            >
                              <div>
                                <p className="font-semibold text-primary text-xs mb-0.5">{reply.author}</p>
                                <p className="text-foreground/80 text-xs mb-0.5">{reply.text}</p>
                                <span className="text-[10px] text-muted-foreground">{reply.createdAt}</span>
                              </div>
                              {blog && isOwner && blog.author === reply.author && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="self-start text-[11px] text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {blog && blog.author && replyingTo === comment.id && (
                        <div className="mt-3 pl-12 space-y-2">
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Reply as the author..."
                            className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="rounded-full px-4 py-1 text-xs"
                              onClick={() => handleSubmitReply(comment.id)}
                            >
                              Send reply
                            </Button>
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(""); }}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>

                {/* New comment form: visible only when viewer is not the blog owner */}
                {!isOwner && (
                  <div className="mt-6 border-t border-border pt-6 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Add a comment</h3>
                    <textarea
                      rows={3}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Be respectful and stay on topic.</span>
                      <Button
                        size="sm"
                        className="rounded-full px-4 py-1 text-xs"
                        onClick={() => {
                          const text = newCommentText.trim();
                          if (!text) return;
                          const newComment = {
                            id: Date.now(),
                            author: currentUserName,
                            text,
                            likes: 0,
                            dislikes: 0,
                            userAction: null,
                            createdAt: "Just now",
                            replies: [],
                          };
                          setComments(prev => [...prev, newComment]);
                          setNewCommentText("");
                        }}
                      >
                        Post comment
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
}
