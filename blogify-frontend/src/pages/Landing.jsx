import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { motion, LayoutGroup } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { postService } from "../services/postService";

import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { Search, SlidersHorizontal } from "lucide-react";

// --- Sections ---

/**
 * Hero Section Component
 * Displays the main value proposition and CTA.
 */
const HeroSection = ({ currentTheme, gradientText, onStartWriting, onCreateAccount }) => (
  <section className="text-center space-y-8 pt-12 md:pt-20 col-span-12 max-w-4xl mx-auto">
    <div 
      className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-small font-medium uppercase tracking-wider transition-colors hover:bg-white/10 backdrop-blur-md"
      style={{ borderColor: `${currentTheme.secondary}40`, color: currentTheme.secondary }}
    >
      <span className="w-2 h-2 rounded-full bg-secondary mr-2 animate-pulse"/>
      New: AI features integrated
    </div>
    
    <h1 className="text-h1 md:text-[64px] leading-tight font-extrabold tracking-tight text-foreground drop-shadow-sm">
      Your own <span style={gradientText}>Blogify</span> platform
    </h1>
    
    <p className="max-w-2xl mx-auto text-h3 text-foreground/60 font-light leading-relaxed">
      This is your space to think out loud, to share what matters, and to write without filters. Whether it's one word or thousand, your story starts right here.
    </p>
    
    <div className="flex flex-wrap justify-center gap-4 pt-8">
      <Button size="lg" onClick={onStartWriting}>Start Writing</Button>
      <Button variant="outline" size="lg" onClick={onCreateAccount}>Create Account</Button>
    </div>
  </section>
);

/**
 * V2 AI Feature Section
 * Showcases the search capability with a glassmorphic input.
 */
const V2AiSection = ({ onOpenFilter, searchText, setSearchText }) => (
  <section className="col-span-12 py-16 text-center">
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="relative flex items-center max-w-xl mx-auto gap-2">
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search for blog..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-full border border-input bg-background/50 backdrop-blur-md text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        <Button className="h-12 rounded-full px-8">Search</Button>
        <button 
          onClick={onOpenFilter}
          className="h-12 w-12 rounded-full border border-input bg-background/50 hover:bg-accent flex items-center justify-center transition-colors backdrop-blur-md text-foreground/70 hover:text-foreground"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  </section>
);

/**
 * Gooey Category Selector
 * Uses framer-motion layout transitions and SVG filters for organic morphing effects.
 */
const CategorySelector = ({ categories, activeCategory, setActiveCategory }) => (
  <section className="col-span-12 py-8 overflow-x-visible">
    <div className="flex justify-center">
      <div className="relative inline-flex p-1 gap-1 bg-muted/10 rounded-full isolate">
        {/* Gooey Background Layer */}
        <div 
          className="absolute inset-0 flex gap-1 p-1 pointer-events-none select-none" 
          style={{ filter: "url(#gooey)" }} 
        >
          <LayoutGroup>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <div key={cat} className="relative px-6 py-2 rounded-full flex items-center justify-center">
                  {/* Ghost Text for Sizing */}
                  <span className="text-small font-medium opacity-0">{cat}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-primary rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}
                </div>
              );
            })}
          </LayoutGroup>
        </div>

        {/* Interactive Foreground Layer */}
        <div className="relative flex gap-1 z-10">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-6 py-2 rounded-full text-small font-medium transition-colors duration-300 flex items-center justify-center ${
                  isActive ? "text-primary-foreground" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <span className="relative">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

/**
 * Blog Grid Component
 * Displays blog posts in a 12-column responsive grid.
 * Applies category and text search filters.
 */
const BlogGrid = ({ activeCategory, searchText, blogs, loading }) => {
  const normalizedSearch = searchText?.trim().toLowerCase() || "";

  const categoryFiltered =
    activeCategory === "All"
      ? blogs
      : blogs.filter((blog) =>
          Array.isArray(blog.tags) && blog.tags.includes(activeCategory)
        );

  const visibleBlogs = !normalizedSearch
    ? categoryFiltered
    : categoryFiltered.filter((blog) => {
        const title = blog.title || "";
        const excerpt = blog.excerpt || "";
        const tags = Array.isArray(blog.tags) ? blog.tags : [];

        const inTitle = title.toLowerCase().includes(normalizedSearch);
        const inExcerpt = excerpt.toLowerCase().includes(normalizedSearch);
        const inTags = tags.some((t) =>
          (t || "").toLowerCase().includes(normalizedSearch)
        );
        return inTitle || inExcerpt || inTags;
      });

  if (loading) {
    return (
      <section className="col-span-12 py-8 text-center text-muted-foreground">
        Loading blogs...
      </section>
    );
  }

  return (
    <section className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {visibleBlogs.map((blog) => (
        <Link to={`/blog/${blog.slug}`} key={blog.slug} className="block h-full">
          <GlassCard
            className="group h-full relative overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5 p-0 flex flex-col"
          >
            {/* Top image: fills full width of card, no padding, slightly rounded */}
            <motion.div
              layoutId={`blog-image-${blog.slug}`}
              className="w-full aspect-[16/9] bg-gradient-to-br from-muted/20 to-muted/40 group-hover:scale-105 transition-transform duration-700 rounded-t-2xl overflow-hidden"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Content: padded section below image */}
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <motion.h3
                layoutId={`blog-title-${blog.slug}`}
                className="text-h3 font-bold leading-tight text-foreground group-hover:text-primary transition-colors"
              >
                {blog.title}
              </motion.h3>
              <p className="text-small text-foreground/60 line-clamp-2">
                {blog.excerpt}
              </p>
              
              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {blog.author[0]}
                  </div>
                  {blog.author}
                </div>
                {typeof blog.views === "number" && (
                  <span>{blog.views.toLocaleString()} views</span>
                )}
              </div>
            </div>
          </GlassCard>
        </Link>
      ))}
    </section>
  );
};

/**
 * Newsletter Subscription Section
 */
const Newsletter = () => (
  <section className="col-span-12 py-24 max-w-2xl mx-auto text-center space-y-8">
    <div className="space-y-4">
      <h2 className="text-h2 font-bold text-foreground tracking-tight">Never Miss a Blog</h2>
      <p className="text-body text-foreground/60">Subscribe to get the latest blogs, new tech and exclusive news.</p>
    </div>
    <GlassCard className="flex flex-col sm:flex-row gap-4 p-2 !rounded-full">
      <input
        type="email"
        placeholder="Enter your email ID"
        className="flex-1 h-12 bg-transparent px-6 text-body text-foreground placeholder:text-foreground/30 focus:outline-none"
      />
      <Button className="w-full sm:w-auto rounded-full">Subscribe</Button>
    </GlassCard>
  </section>
);

/**
 * Filter Modal Popup
 * Controlled component for filtering content.
 */
const FilterModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <GlassCard className="w-full max-w-md relative animate-in zoom-in-95 duration-300 !bg-background border-border shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground">✕</button>
        <h3 className="text-h3 font-bold mb-6">Filter & Sort</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-small font-medium text-foreground/70">Price Range</label>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-primary rounded-full" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-small font-medium text-foreground/70">Sort By</label>
            <div className="relative">
              <select className="w-full h-12 bg-muted/50 border border-input rounded-full px-6 text-small text-foreground appearance-none focus:ring-2 focus:ring-ring">
                <option>Latest</option>
                <option>Popular</option>
                <option>Oldest</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">↓</div>
            </div>
          </div>
          
          <Button onClick={onClose} className="w-full">Apply Filters</Button>
        </div>
      </GlassCard>
    </div>
  );
};

// --- Main Page ---

/**
 * Landing Page Component
 * The main entry point for the application.
 */
export default function Landing() {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const categories = ["All", "Design", "Development", "AI", "Business", "Lifestyle"];

  const gradientText = {
    backgroundImage: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const result = await postService.list({ limit: 30 });
        const items = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];

        const mapped = items.map((post) => ({
          slug: post.slug,
          title: post.title,
          excerpt: post.seo?.metaDescription || "",
          image: post.headerImage,
          tags: Array.isArray(post.tags)
            ? post.tags
            : Array.isArray(post.tagIds)
            ? post.tagIds.map((t) => t.name || t)
            : [],
          author: post.authorId?.name || "Unknown",
          views: post.cachedStats?.viewCount ?? 0,
        }));

        setBlogs(mapped);
      } catch (error) {
        console.error("Failed to load blogs for landing:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-y-16 gap-x-6 pb-20">
      <HeroSection 
        currentTheme={currentTheme} 
        gradientText={gradientText}
        onStartWriting={() => navigate("/dashboard/write-blog")}
        onCreateAccount={() => navigate("/auth")}
      />
      
      <V2AiSection 
        onOpenFilter={() => setIsFilterOpen(true)} 
        searchText={searchText}
        setSearchText={setSearchText}
      />
      
      <CategorySelector 
        categories={categories} 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
      />
      
      <BlogGrid 
        activeCategory={activeCategory} 
        searchText={searchText}
        blogs={blogs}
        loading={loading}
      />
      
      <Newsletter />

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </div>
  );
}