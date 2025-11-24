import React, { createContext, useContext, useEffect, useState } from "react";

const BlogDataContext = createContext(null);

export function BlogDataProvider({ children }) {
  const [blogs, setBlogs] = useState([]);

  // Simple front-end auto-publish for scheduled posts while app is open
  useEffect(() => {
    const interval = setInterval(() => {
      setBlogs(prev =>
        prev.map(blog => {
          if (blog.status === "Scheduled" && blog.scheduledAt) {
            const scheduledTime = new Date(blog.scheduledAt).getTime();
            if (!Number.isNaN(scheduledTime) && scheduledTime <= Date.now()) {
              return {
                ...blog,
                status: "Published",
                publishedAt: blog.publishedAt || new Date().toISOString().slice(0, 10),
              };
            }
          }
          return blog;
        })
      );
    }, 30_000); // check every 30s

    return () => clearInterval(interval);
  }, []);

  const addBlog = (blog) => {
    setBlogs(prev => [{ ...blog, id: blog.id ?? Date.now() }, ...prev]);
  };

  const value = { blogs, addBlog, setBlogs };

  return (
    <BlogDataContext.Provider value={value}>{children}</BlogDataContext.Provider>
  );
}

export function useBlogData() {
  const ctx = useContext(BlogDataContext);
  if (!ctx) throw new Error("useBlogData must be used within a BlogDataProvider");
  return ctx;
}
