
import React, { useState } from 'react';
import { Check, X, Trash2, MessageSquare } from 'lucide-react';
import { mockComments } from '../../lib/mockData';
import { cn } from '../../lib/utils';

export default function Comments() {
  const [comments, setComments] = useState(mockComments);
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending' represents "Not Approved" or needing action

  const handleStatusChange = (id, newStatus) => {
    setComments(comments.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this comment permanently?")) {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  // Filter logic:
  // "Approved" tab shows Approved comments.
  // "Not Approved" tab shows Pending and Rejected comments (or maybe just Pending?).
  // The user request said "Approved / Not Approved". Let's stick to that.
  // "Not Approved" usually means Pending moderation, or explicitly Rejected.
  // Let's show Pending in "Not Approved" and Approved in "Approved".
  // Rejected ones might be less useful to see unless filtering for trash, but let's include Pending & Rejected in "Not Approved".
  
  const filteredComments = comments.filter(c => {
    if (activeTab === 'Approved') return c.status === 'Approved';
    return c.status === 'Pending' || c.status === 'Rejected';
  });

  const TabButton = ({ name, count }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={cn(
        "px-6 py-3 font-medium text-sm transition-all border-b-2",
        activeTab === name
          ? "border-primary text-primary bg-primary/5"
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {name} 
      <span className={cn(
        "ml-2 px-2 py-0.5 rounded-full text-xs",
        activeTab === name ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Comments</h1>
        <p className="text-muted-foreground mt-1">Moderate community discussions.</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <TabButton 
            name="Pending" 
            count={comments.filter(c => c.status === 'Pending' || c.status === 'Rejected').length} 
          />
          <TabButton 
            name="Approved" 
            count={comments.filter(c => c.status === 'Approved').length} 
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
                <tr key={comment.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{comment.user}</span>
                      <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">on {comment.postTitle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground max-w-md">{comment.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      comment.status === "Approved" ? "bg-green-500/10 text-green-500" :
                      comment.status === "Rejected" ? "bg-red-500/10 text-red-500" :
                      "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{comment.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {/* Approve Button */}
                       {comment.status !== 'Approved' && (
                         <button 
                           onClick={() => handleStatusChange(comment.id, 'Approved')}
                           className="p-2 text-muted-foreground hover:text-green-500 hover:bg-green-500/10 rounded-lg transition" 
                           title="Approve"
                         >
                           <Check size={18} />
                         </button>
                       )}

                       {/* Reject Button */}
                       {comment.status !== 'Rejected' && (
                         <button 
                           onClick={() => handleStatusChange(comment.id, 'Rejected')}
                           className="p-2 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition" 
                           title="Reject"
                         >
                           <X size={18} />
                         </button>
                       )}
                       
                       {/* Delete Button */}
                       <button 
                         onClick={() => handleDelete(comment.id)}
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
                    No comments found in this category.
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
