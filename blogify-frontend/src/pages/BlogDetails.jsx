import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Share2,
  Eye, Clock, Calendar, Trash2, Send, MoreHorizontal, Flag, X
} from "lucide-react";

// Contexts & Services
import { useAuth } from "../context/AuthContext";
import { postService } from "../services/postService";
import { commentService } from "../services/commentService";

// UI Components
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";

// --- Constants & Styles ---
const STYLES = {
  tag: "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/20",
  metaItem: "flex items-center gap-2 text-sm text-muted-foreground",
  actionBtn: "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border border-transparent",
  input: "w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-foreground placeholder:text-muted-foreground",
  glassPanel: "bg-background/40 backdrop-blur-sm border border-border/30 rounded-xl",
};

/**
 * Report Modal Component
 */
const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;
  
  const reasons = ["Spam", "Harassment", "Hate Speech", "Misinformation", "Other"];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
          <h3 className="font-bold text-lg text-foreground">Report Comment</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-muted-foreground mb-2">Why are you reporting this?</p>
          {reasons.map((r) => (
            <button 
              key={r} 
              onClick={() => onSubmit(r)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 text-sm transition-colors border border-transparent hover:border-border/50 text-foreground"
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Recursive Comment Node
 */
const CommentNode = React.memo(({ 
  comment, 
  user, 
  isPostOwner, 
  onVote, 
  onReply, 
  onDelete, 
  onReport,
  activeReplyId,
  replyText,
  setReplyText,
  submitReply,
  cancelReply
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthor = user?._id === comment.userId?._id;
  const authorName = comment.userId?.name || comment.userId?.username || "Anonymous";
  
  const hasUpvoted = comment.votes?.upvotedBy?.includes(user?._id);
  const hasDownvoted = comment.votes?.downvotedBy?.includes(user?._id);
  const score = comment.votes?.score || 0;

  const handleVoteClick = (type) => {
    if (isAuthor) return; 
    let action = type;
    if (type === 'upvote' && hasUpvoted) action = 'remove';
    if (type === 'downvote' && hasDownvoted) action = 'remove';
    onVote(comment._id, action);
  };

  return (
    <div className="space-y-3">
      <div className={`p-4 ${STYLES.glassPanel} relative group`}>
        <div className="flex gap-3">
          <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {authorName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-background border border-border rounded-lg shadow-xl z-10 overflow-hidden py-1">
                     <button 
                        onClick={() => { onReport(comment._id); setIsMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-left text-foreground hover:bg-muted/50"
                      >
                        <Flag size={12} /> Report
                      </button>
                     {(isPostOwner || isAuthor) && (
                      <button 
                        onClick={() => { onDelete(comment._id); setIsMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-left text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed break-words">{comment.content}</p>

            <div className="flex items-center gap-4 pt-3">
              <div className={`flex items-center bg-background/50 rounded-full px-2 py-1 border border-border/30 ${isAuthor ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <button
                  onClick={() => handleVoteClick('upvote')}
                  disabled={isAuthor}
                  className={`p-1 rounded-full transition-colors ${!isAuthor && 'hover:bg-primary/10'} ${hasUpvoted ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <ThumbsUp size={14} className={hasUpvoted ? "fill-current" : ""} />
                </button>
                <span className={`text-xs font-medium mx-2 ${score < 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {score}
                </span>
                <button
                  onClick={() => handleVoteClick('downvote')}
                  disabled={isAuthor}
                  className={`p-1 rounded-full transition-colors ${!isAuthor && 'hover:bg-destructive/10'} ${hasDownvoted ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  <ThumbsDown size={14} className={hasDownvoted ? "fill-current" : ""} />
                </button>
              </div>

              {user && (
                <button
                  onClick={() => onReply(comment._id)}
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <MessageSquare size={14} /> Reply
                </button>
              )}
            </div>

            {activeReplyId === comment._id && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t border-border/30"
              >
                <div className="flex gap-3">
                  <div className="h-full w-0.5 bg-primary/30 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <textarea
                      autoFocus
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Replying to ${authorName}...`}
                      className={STYLES.input}
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelReply}>Cancel</Button>
                      <Button size="sm" onClick={() => submitReply(comment._id)}>Reply</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 md:pl-8 border-l-2 border-border/30 ml-2 md:ml-4 space-y-3">
          {comment.replies.map((reply) => (
            <CommentNode 
              key={reply._id}
              comment={reply}
              user={user}
              isPostOwner={isPostOwner}
              onVote={onVote}
              onReply={onReply}
              onDelete={onDelete}
              onReport={onReport}
              activeReplyId={activeReplyId}
              replyText={replyText}
              setReplyText={setReplyText}
              submitReply={submitReply}
              cancelReply={cancelReply}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const BlogSkeleton = () => (
  <div className="max-w-4xl mx-auto animate-pulse space-y-8 p-4">
    <div className="h-8 w-32 bg-muted rounded mb-6" />
    <div className="h-[400px] w-full bg-muted/50 rounded-xl" />
    <div className="space-y-4">
      <div className="h-10 w-3/4 bg-muted/50 rounded" />
      <div className="h-4 w-1/2 bg-muted/50 rounded" />
    </div>
  </div>
);

/**
 * Info/Alert Modal Component
 */
const InfoModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Clock size={24} />
          </div>
          <h3 className="font-bold text-lg text-foreground">Submission Received</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
          <Button onClick={onClose} className="w-full mt-2">Got it</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default function BlogDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyState, setReplyState] = useState({ id: null, text: "" });
  const [shareStatus, setShareStatus] = useState("idle"); 
  const [reportModal, setReportModal] = useState({ isOpen: false, commentId: null });
  const [infoModal, setInfoModal] = useState({ isOpen: false, message: "" });

  const viewCountedRef = useRef(false);

  const isOwner = useMemo(() => user && post?.authorId === user._id, [user, post]);
  const formattedDate = useMemo(() => post ? new Date(post.publishedAt || post.createdAt).toLocaleDateString() : "", [post]);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    const loadData = async () => {
      setLoading(true);
      try {
        const postData = await postService.getBySlug(slug);
        if (!isMounted) return;
        
        setIsLiked(user && postData.likes?.includes(user._id));

        if (postData._id) {
          const { data } = await commentService.getByPostId(postData._id);
          if (isMounted) setComments(data || []);
          
          // Logic: If we haven't counted this view yet, send to server AND locally increment
          if (!viewCountedRef.current) {
            viewCountedRef.current = true;
            postService.viewStat(postData._id).catch(console.error);
            
            // --- FIX 2: Manually +1 the view count for the UI before setting state ---
            if(postData.cachedStats) {
                postData.cachedStats.viewCount = (postData.cachedStats.viewCount || 0) + 1;
            }
          }
        }
        // Set post data (now including the +1 view)
        setPost(postData);

      } catch (err) {
        if (isMounted) setError("Content unavailable.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [slug, user]);

  const handleLike = useCallback(async () => {
    if (!user || isOwner) return; 
    setIsLiked(prev => !prev);
    setPost(prev => ({
      ...prev,
      cachedStats: {
        ...prev.cachedStats,
        aggregateRating: isLiked ? (prev.cachedStats.aggregateRating - 1) : (prev.cachedStats.aggregateRating + 1)
      }
    }));
    try { await postService.like(post._id); } catch { setIsLiked(prev => !prev); }
  }, [user, post, isLiked, isOwner, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareStatus("copied");
    setTimeout(() => setShareStatus("idle"), 2000);
  };

  const handleCommentSubmit = async (parentId = null) => {
    if (!user) return navigate("/auth");
    const text = parentId ? replyState.text : commentText;
    if (!text.trim()) return;

    try {
      const payload = { postId: post._id, content: text };
      if (parentId) {
        await commentService.reply(parentId, payload);
        setReplyState({ id: null, text: "" });
      } else {
        await commentService.create(payload);
        setCommentText("");
      }
      
      const treeData = await commentService.getTree(post._id);
      
      setComments(Array.isArray(treeData) ? treeData : treeData.data || []);
      
      setInfoModal({ 
        isOpen: true, 
        message: "Your comment has been submitted! Please wait while the blogger approves it." 
      });
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const handleVoteComment = useCallback(async (commentId, action) => {
    if (!user) return navigate("/auth");

    const updateTree = (nodes) => {
      return nodes.map(node => {
        if (node._id === commentId) {
          const votes = { 
            ...node.votes, 
            upvotedBy: [...(node.votes?.upvotedBy || [])], 
            downvotedBy: [...(node.votes?.downvotedBy || [])] 
          };
          
          const wasUp = votes.upvotedBy.includes(user._id);
          const wasDown = votes.downvotedBy.includes(user._id);
          
          if (wasUp) votes.upvotedBy = votes.upvotedBy.filter(id => id !== user._id);
          if (wasDown) votes.downvotedBy = votes.downvotedBy.filter(id => id !== user._id);
          
          if (action === 'upvote') votes.upvotedBy.push(user._id);
          if (action === 'downvote') votes.downvotedBy.push(user._id);
          
          votes.score = votes.upvotedBy.length - votes.downvotedBy.length;
          
          return { ...node, votes };
        }
        if (node.replies) {
          return { ...node, replies: updateTree(node.replies) };
        }
        return node;
      });
    };

    setComments(prev => updateTree(prev));

    try {
      await commentService.vote(commentId, action);
    } catch (err) { 
      console.error(err); 
    }
  }, [user, navigate]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await commentService.delete(commentId);
      const treeData = await commentService.getTree(post._id);
      setComments(Array.isArray(treeData) ? treeData : treeData.data || []);
    } catch (err) { console.error(err); }
  }, [post]);

  const handleReportSubmit = (reason) => {
    console.log(`Reported comment ${reportModal.commentId} for: ${reason}`);
    setReportModal({ isOpen: false, commentId: null });
    alert("Comment reported. Thank you for helping keep our community safe.");
  };

  if (loading) return <BlogSkeleton />;
  if (error || !post) return <div className="text-center py-20">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-20">
      
      <ReportModal 
        isOpen={reportModal.isOpen} 
        onClose={() => setReportModal({isOpen: false, commentId: null})} 
        onSubmit={handleReportSubmit} 
      />
      
      <InfoModal 
        isOpen={infoModal.isOpen}
        message={infoModal.message}
        onClose={() => setInfoModal({ isOpen: false, message: "" })}
      />

      <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 w-5 h-5" /> Back
      </Button>

      <GlassCard className="overflow-hidden p-0 border border-border/30 bg-background/30 backdrop-blur-xl">
        <div className="relative h-[400px] w-full">
          <img src={post.headerImage || "https://images.unsplash.com/photo-1499750310159-5b600aaf0320?auto=format&fit=crop&q=80"} 
               alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute bottom-0 p-8 md:p-12 w-full">
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">{post.title}</h1>
            <div className="flex gap-4 text-sm font-medium text-foreground/80">
              <span className="flex items-center gap-1"><Calendar size={16}/> {formattedDate}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {Math.ceil((post.content?.length || 0) / 1000)} min read</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* --- FIX 1: Added specific prose classes to force theme colors for headings, quotes, bold, etc --- */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-12 text-foreground prose-headings:text-foreground prose-blockquote:text-foreground prose-strong:text-foreground prose-a:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="border-t border-border/40 pt-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-3">
              <button 
                onClick={handleLike} 
                disabled={isOwner}
                className={`${STYLES.actionBtn} ${isLiked ? 'bg-primary/10 text-primary' : 'bg-muted/50 hover:bg-muted/80'} ${isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isOwner ? "You cannot like your own post" : "Like this post"}
              >
                <ThumbsUp size={18} className={isLiked ? "fill-current" : ""} />
                <span className="font-medium">{post.cachedStats?.aggregateRating || 0}</span>
              </button>
              <button onClick={() => setShowComments(!showComments)} className={`${STYLES.actionBtn} ${showComments ? 'bg-primary/10 text-primary' : 'bg-muted/50 hover:bg-muted/80'}`}>
                <MessageSquare size={18} />
                <span className="font-medium">{comments.length}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={STYLES.metaItem}><Eye size={18} /> {post.cachedStats?.viewCount || 0}</span>
              <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full gap-2">
                <Share2 size={16} /> {shareStatus === "copied" ? "Copied!" : "Share"}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showComments && (
              <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="mt-10 pt-8 border-t border-border/40">
                  <h3 className="text-xl font-bold mb-6">Discussion ({comments.length})</h3>

                  <div className="flex gap-4 mb-8">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                        {user?.name?.charAt(0) || "G"}
                      </div>
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={user ? "What are your thoughts?" : "Log in to comment"}
                          className={STYLES.input}
                          disabled={!user}
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button size="sm" onClick={() => handleCommentSubmit(null)} disabled={!commentText.trim() || !user}>
                            Post Comment <Send size={14} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                  </div>

                  <div className="space-y-6">
                    {comments.map(comment => (
                      <CommentNode 
                        key={comment._id}
                        comment={comment}
                        user={user}
                        isPostOwner={isOwner}
                        onVote={handleVoteComment}
                        onReply={(id) => setReplyState({ id, text: "" })}
                        onDelete={handleDeleteComment}
                        onReport={(id) => setReportModal({ isOpen: true, commentId: id })}
                        activeReplyId={replyState.id}
                        replyText={replyState.text}
                        setReplyText={(text) => setReplyState(prev => ({...prev, text}))}
                        submitReply={handleCommentSubmit}
                        cancelReply={() => setReplyState({ id: null, text: "" })}
                      />
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
}