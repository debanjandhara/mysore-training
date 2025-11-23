import React, { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { Search, SlidersHorizontal } from "lucide-react";

// --- Sections ---

/**
 * Hero Section Component
 * Displays the main value proposition and CTA.
 */
const HeroSection = ({ currentTheme, gradientText }) => (
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
      <Button size="lg">Start Writing</Button>
      <Button variant="outline" size="lg">Create Account</Button>
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

// Sample blog data for the grid
const blogs = [
  {
    slug: "ai-powered-ui-design",
    title: "AI-Powered UI Design: The New Creative Partner",
    excerpt: "Exploring how AI tools are helping designers build smarter, faster, and more human-centered interfaces.",
    tags: ["Design", "AI"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
  },
  {
    slug: "modern-web-development-2025",
    title: "Modern Web Development in 2025",
    excerpt: "From server components to edge functions, here’s what modern development looks like today.",
    tags: ["Development"],
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  },
  {
    slug: "design-systems-that-scale",
    title: "Design Systems That Actually Scale",
    excerpt: "Lessons learned from building and maintaining design systems across growing product teams.",
    tags: ["Design", "Development"],
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766",
  },
  {
    slug: "how-startups-use-ai",
    title: "How Startups Are Using AI to Move Faster",
    excerpt: "A behind-the-scenes look at how small teams leverage AI to compete with larger companies.",
    tags: ["AI", "Business"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  },
  {
    slug: "building-profitable-side-projects",
    title: "Building Profitable Side Projects",
    excerpt: "Turn your weekend ideas into real businesses with these practical growth strategies.",
    tags: ["Business", "Lifestyle"],
    image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  },
  {
    slug: "deep-work-for-developers",
    title: "Deep Work for Developers",
    excerpt: "How to stay focused in a world full of notifications, meetings, and constant distractions.",
    tags: ["Development", "Lifestyle"],
    image: "https://images.unsplash.com/photo-1504691342899-a17bd2d7b583",
  },
  {
    slug: "future-of-design-tools",
    title: "The Future of Design Tools",
    excerpt: "What the next generation of design software will look like as AI becomes the norm.",
    tags: ["Design", "AI"],
    image: "https://images.unsplash.com/photo-1581276879432-15a3d254c0a4",
  },
  {
    slug: "scaling-tech-teams",
    title: "Scaling Tech Teams Without Breaking Culture",
    excerpt: "How to grow your engineering team while keeping communication and trust strong.",
    tags: ["Business", "Development"],
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
  },
  {
    slug: "healthy-routines-for-creators",
    title: "Healthy Routines for Designers & Developers",
    excerpt: "Simple habits that help creative professionals stay energized and avoid burnout.",
    tags: ["Lifestyle"],
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136",
  },
  {
    slug: "no-code-ai-tools",
    title: "No-Code AI Tools Are Changing Everything",
    excerpt: "You don\'t need to be a machine learning expert to build smart products anymore.",
    tags: ["AI", "Development"],
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
  },
  {
    slug: "design-thinking-for-business",
    title: "Design Thinking for Business Growth",
    excerpt: "How design-first thinking can unlock new market opportunities and better products.",
    tags: ["Design", "Business"],
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
  },
  {
    slug: "minimalist-digital-life",
    title: "Minimalist Digital Life",
    excerpt: "Reducing digital clutter to improve focus, creativity, and overall mental well-being.",
    tags: ["Lifestyle"],
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5",
  },
];

/**
 * Blog Grid Component
 * Displays blog posts in a 12-column responsive grid.
 * Applies category and text search filters.
 */
const BlogGrid = ({ activeCategory, searchText }) => {
  const normalizedSearch = searchText?.trim().toLowerCase() || "";

  const categoryFiltered =
    activeCategory === "All"
      ? blogs
      : blogs.filter((blog) => blog.tags?.includes(activeCategory));

  const visibleBlogs = !normalizedSearch
    ? categoryFiltered
    : categoryFiltered.filter((blog) => {
        const inTitle = blog.title.toLowerCase().includes(normalizedSearch);
        const inExcerpt = blog.excerpt.toLowerCase().includes(normalizedSearch);
        const inTags = Array.isArray(blog.tags)
          ? blog.tags.some((t) => t.toLowerCase().includes(normalizedSearch))
          : false;
        return inTitle || inExcerpt || inTags;
      });

  return (
    <section className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {visibleBlogs.map((blog) => (
        <GlassCard
          key={blog.slug}
          className="group relative overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5 p-0"
        >
          {/* Top image: fills full width of card, no padding, slightly rounded */}
          <div
            className="w-full aspect-[16/9] bg-gradient-to-br from-muted/20 to-muted/40 group-hover:scale-105 transition-transform duration-700 rounded-t-2xl"
            style={
              blog.image
                ? {
                    backgroundImage: `url(${blog.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />

          {/* Content: padded section below image */}
          <div className="p-6 space-y-4">
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
            <h3 className="text-h3 font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
              {blog.title}
            </h3>
            <p className="text-small text-foreground/60 line-clamp-2">
              {blog.excerpt}
            </p>
          </div>
        </GlassCard>
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
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  const categories = ["All", "Design", "Development", "AI", "Business", "Lifestyle"];

  const gradientText = {
    backgroundImage: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  return (
    <div className="grid grid-cols-12 gap-y-16 gap-x-6 pb-20">
      <HeroSection currentTheme={currentTheme} gradientText={gradientText} />
      
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
      />
      
      <Newsletter />

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </div>
  );
}