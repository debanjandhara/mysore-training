
import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, MessageSquare } from 'lucide-react';
import { commentService } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export default function Comments() {
  const { token } = useAuth();
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await commentService.list({ limit: 100, status: 'All', dashboard: 'true' }, token);
      setComments(response.data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await commentService.updateStatus(id, newStatus);
      setComments(prev => prev.map(c => 
        c._id === id ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this comment permanently?")) {
      try {
        await commentService.delete(id);
        setComments(prev => prev.filter(c => c._id !== id));
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    }
  };

  const filteredComments = comments.filter(c => {
    if (activeTab === 'approved') return c.status === 'approved';
    return c.status === 'pending' || c.status === 'rejected';
  });

  const TabButton = ({ name, label, count }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={cn(
        "px-6 py-3 font-medium text-sm transition-all border-b-2",
        activeTab === name
          ? "border-primary text-primary bg-primary/5"
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {label} 
      <span className={cn(
        "ml-2 px-2 py-0.5 rounded-full text-xs",
        activeTab === name ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {count}
      </span>
    </button>
  );

  if (isLoading) return <div>Loading comments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Comments</h1>
        <p className="text-muted-foreground mt-1">Moderate community discussions.</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="flex border-b border-border">
          <TabButton 
            name="pending" 
            label="Pending"
            count={comments.filter(c => c.status === 'pending' || c.status === 'rejected').length} 
          />
          <TabButton 
            name="approved" 
            label="Approved"
            count={comments.filter(c => c.status === 'approved').length} 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Author & Post</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comment</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredComments.map((comment) => (
                <tr key={comment._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {comment.userId?.name || comment.userId?.username || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                        on {comment.postId?.title || "Unknown Post"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground max-w-md">{comment.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      comment.status === "approved" ? "bg-green-500/10 text-green-500" :
                      comment.status === "rejected" ? "bg-red-500/10 text-red-500" :
                      "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {comment.status !== 'approved' && (
                         <button 
                           onClick={() => handleStatusChange(comment._id, 'approved')}
                           className="p-2 text-muted-foreground hover:text-green-500 hover:bg-green-500/10 rounded-lg transition" 
                           title="Approve"
                         >
                           <Check size={18} />
                         </button>
                       )}

                       {comment.status !== 'rejected' && (
                         <button 
                           onClick={() => handleStatusChange(comment._id, 'rejected')}
                           className="p-2 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition" 
                           title="Reject"
                         >
                           <X size={18} />
                         </button>
                       )}
                       
                       <button 
                         onClick={() => handleDelete(comment._id)}
                         className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition" 
                         title="Delete"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredComments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No comments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
