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
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { postService } from "../services/postService";
import { commentService } from "../services/commentService";
import { API_BASE_URL } from "../services/authService";

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
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI State
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    const fetchData = async () => {
      setIsLoading(true);
      console.log('=== BlogDetails fetchData START ===');
      console.log('[BlogDetails] slug from router:', slug);
      console.log('[BlogDetails] API_BASE_URL:', API_BASE_URL);

      try {
        // Fetch Post
        const postUrl = `${API_BASE_URL}/api/posts/slug/${slug}`;
        console.log('[POST] Fetching post by slug:', postUrl);
        const postData = await postService.getBySlug(slug);
        console.log('[POST] postData:', postData);
        setBlog(postData);

        // Fetch Comments (do not break page if this fails)
        if (postData && postData._id) {
          const commentsUrl = `${API_BASE_URL}/api/posts/${postData._id}/comments?includeReplies=inline`;
          console.log('[COMMENTS] Fetching comments:', commentsUrl);
          try {
            const commentsData = await commentService.getByPostId(postData._id);
            console.log('[COMMENTS] raw commentsData:', commentsData);
            setComments(commentsData.data || []);
          } catch (commentsErr) {
            console.error('[COMMENTS] Failed to fetch comments:', commentsErr);
            // Intentionally not rethrowing so the blog can still render
          }
        }
        
        // Increment view count (fire-and-forget)
        if (postData && postData._id && postService.viewStat) {
          const viewUrl = `${API_BASE_URL}/api/posts/${postData._id}/stat/view`;
          console.log('[STATS] Incrementing view at:', viewUrl);
          postService.viewStat(postData._id).catch(err => {
            console.error('[STATS] Failed to increment view:', err);
          });
        }
      } catch (err) {
        console.error('[BLOG] Failed to load blog (post-level error):', err);
        setError("Failed to load blog post.");
      } finally {
        console.log('=== BlogDetails fetchData END ===');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (isLoading) return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;
  if (error || !blog) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <div className="text-red-500 text-xl font-semibold mb-2">Blog Not Found</div>
        <p className="text-muted-foreground mb-4">{error || "The blog post you are looking for does not exist or has been removed."}</p>
        <Button onClick={() => navigate('/')} variant="outline">
          Go to Home
        </Button>
      </div>
    );
  }

  // Derived state
  const isOwner = user && blog.authorId === user._id; // Assuming authorId is populated or just ID
  // If authorId is an object (populated), check _id
  const authorName = blog.authorId?.name || blog.authorId?.username || "Unknown Author";
  const authorInitial = authorName.charAt(0);
  
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

  // Handle Comment Vote
  const handleCommentVote = async (commentId, action) => {
    if (!user) return; // Prompt login?
    try {
      const updatedComment = await commentService.vote(commentId, action);
      // Refresh comments
      const commentsData = await commentService.getByPostId(blog._id);
      setComments(commentsData.data || []);
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await commentService.delete(id);
      setComments(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleStartReply = (id) => {
    setReplyingTo(id);
    setReplyText("");
  };

  const handleSubmitReply = async (parentId) => {
    const text = replyText.trim();
    if (!text) return;

    try {
      await commentService.reply(parentId, {
        postId: blog._id,
        content: text
      });
      
      // Refresh comments
      const commentsData = await commentService.getByPostId(blog._id);
      setComments(commentsData.data || []);
      
      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to reply:", err);
    }
  };

  const handlePostComment = async () => {
    const text = newCommentText.trim();
    if (!text) return;

    try {
      await commentService.create({
        postId: blog._id,
        content: text
      });

      // Refresh comments
      const commentsData = await commentService.getByPostId(blog._id);
      setComments(commentsData.data || []);
      
      setNewCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
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
            src={blog.headerImage || "https://images.unsplash.com/photo-1499750310159-5b600aaf0320?auto=format&fit=crop&q=80&w=2070"} 
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
              {blog.tagIds && blog.tagIds.map(tag => (
                <span 
                  key={tag._id || tag}
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                >
                  {tag.name || "Tag"}
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
                  {authorInitial}
                </div>
                {authorName}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {Math.ceil((blog.content?.length || 0) / 1000)} min read
              </div>
            </div>
          </div>
        </motion.div>

        <div className="p-8 md:p-12">
          {/* Blog Content */}
          <div 
            className="prose prose-lg max-w-none mb-12 text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground prose-blockquote:text-foreground"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Interaction Bar */}
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              {/* Post Likes are not fully supported in backend for this demo, so disabling or showing stats */}
              <ActionButton 
                icon={ThumbsUp} 
                count={blog.cachedStats?.aggregateRating || 0} 
                isActive={false} 
                onClick={() => {}} 
                disabled={true} 
              />
             
              <div className="w-px h-8 bg-border mx-2" />
              <ActionButton 
                icon={MessageSquare} 
                count={blog.cachedStats?.commentCount || comments.length} 
                label="Comments"
                onClick={handleToggleComments}
              />
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2 text-sm">
                <Eye size={18} />
                <span>{blog.cachedStats?.viewCount?.toLocaleString() || 0} views</span>
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
            {showComments && (
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
                    <GlassCard key={comment._id} className="p-4 md:p-5 space-y-3 bg-background/60">
                      <div className="flex gap-3">
                        <div className="mt-1">
                          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                            {(comment.userId?.name || comment.userId?.username || "?").charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {comment.userId?.name || comment.userId?.username || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Owner controls */}
                                {(isOwner || (user && user._id === comment.userId?._id)) && (
                                  <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="ml-1 px-2 py-1 rounded-full text-[11px] text-red-500 hover:bg-red-500/10"
                                  >
                                    Delete
                                  </button>
                                )}
                            </div>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              onClick={() => handleCommentVote(comment._id, 'upvote')}
                              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors hover:bg-muted/60`}
                            >
                              <ThumbsUp size={14} />
                              <span>{comment.votes?.score || 0}</span>
                            </button>
                            
                            {user && (
                              <button
                                onClick={() => handleStartReply(comment._id)}
                                className="ml-1 text-xs text-primary hover:underline"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2 space-y-2 pl-12">
                          {comment.replies.map(reply => (
                            <div
                              key={reply._id}
                              className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm flex justify-between gap-2"
                            >
                              <div>
                                <p className="font-semibold text-primary text-xs mb-0.5">
                                  {reply.userId?.name || reply.userId?.username || "Unknown"}
                                </p>
                                <p className="text-foreground/80 text-xs mb-0.5">{reply.content}</p>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Form */}
                      {user && replyingTo === comment._id && (
                        <div className="mt-3 pl-12 space-y-2">
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="rounded-full px-4 py-1 text-xs"
                              onClick={() => handleSubmitReply(comment._id)}
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

                {/* New comment form */}
                {user ? (
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
                        onClick={handlePostComment}
                      >
                        Post comment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center p-4 border border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground">Please <button onClick={() => navigate('/login')} className="text-primary underline">log in</button> to leave a comment.</p>
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
