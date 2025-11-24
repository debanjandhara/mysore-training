import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, Eye, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { postService } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';

export default function ViewBlogs() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const result = await postService.list({ limit: 100, status: 'published' });
        const items = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];

        const mapped = items.map((post) => ({
          id: post._id,
          title: post.title,
          category: Array.isArray(post.categoryIds) && post.categoryIds[0]
            ? (post.categoryIds[0].name || 'Uncategorized')
            : 'Uncategorized',
          tags: Array.isArray(post.tagIds)
            ? post.tagIds.map((t) => t.name || t)
            : [],
          publishedAt: post.publishedAt
            ? new Date(post.publishedAt).toISOString().slice(0, 10)
            : '',
          status: post.status === 'published' ? 'Published' : 'Draft',
        }));

        setBlogs(mapped);
      } catch (error) {
        console.error('Failed to load blogs for dashboard:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [token]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      // Optimistic local removal; actual delete wiring can be added later
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(search.toLowerCase()) ||
    blog.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Blogs</h1>
            <p className="text-muted-foreground mt-1">Manage your published content and drafts.</p>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center text-muted-foreground">
          Loading blogs...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Blogs</h1>
          <p className="text-muted-foreground mt-1">Manage your published content and drafts.</p>
        </div>
        <div className="relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
           <input 
             type="text" 
             placeholder="Search blogs..." 
             className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-full md:w-64 placeholder:text-muted-foreground/50"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{blog.title}</p>
                    <div className="flex gap-2 mt-1">
                      {blog.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground/80">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{blog.category}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      blog.status === "Published" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{blog.publishedAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition" title="View">
                         <Eye size={18} />
                       </button>
                       <button className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition" title="Edit">
                         <Edit2 size={18} />
                       </button>
                       <button 
                         className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition" 
                         title="Delete"
                         onClick={() => handleDelete(blog.id)}
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBlogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No blogs found matching your search.
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
