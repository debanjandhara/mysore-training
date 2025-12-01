import React, { useRef, useEffect, useState, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { 
  Search, 
  SlidersHorizontal, 
  Loader2, 
  Mail, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  X
} from "lucide-react";

// Contexts & Services
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { postService } from "../services/postService";
import { categoryService } from "../services/categoryService";
import { API_BASE_URL, fetchWithAuth } from "../services/authService";

// UI Components
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";

// --- Helpers ---

const formatDate = (dateString) => {
  if (!dateString) return "Recently";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// --- Sub-Components ---

const Hero = memo(({ theme, onStart }) => (
  <section className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center space-y-8 px-4 text-center">
    {/* Background Decorative Elements */}
    <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
    <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-secondary/20 blur-[120px]" />

    {/* Badge */}
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium uppercase tracking-wider text-secondary backdrop-blur-md"
    >
      <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-secondary" />
      New: AI features integrated
    </motion.div>

    {/* Heading */}
    <motion.h1 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="max-w-5xl text-5xl font-extrabold tracking-tight drop-shadow-sm md:text-7xl lg:text-8xl"
    >
      Your own{" "}
      <span
        style={{
          background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Blogify
      </span>{" "}
      platform
    </motion.h1>

    {/* Subheading */}
    <motion.p 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="mx-auto max-w-2xl text-xl font-light text-foreground/60 md:text-2xl"
    >
      This is your space to think out loud, to share what matters. Your story starts right here.
    </motion.p>

    {/* CTA */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4 }}
      className="pt-6"
    >
      <Button size="lg" onClick={onStart} className="rounded-full px-12 py-7 text-lg shadow-2xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
        Start Writing
      </Button>
    </motion.div>
  </section>
));

const SearchSection = ({
  search,
  setSearch,
  onFilter,
  onSearch,
  suggestions = [],
  onSuggestionSelect,
}) => (
  <section className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 py-4 backdrop-blur-xl transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
    <div className="mx-auto flex max-w-4xl items-center gap-3 px-4">
      <div className="group relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40 transition-colors group-focus-within:text-primary" />
        <input
          type="text"
          placeholder="Search for blog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearch) {
              e.preventDefault();
              onSearch();
            }
          }}
          className="h-12 w-full rounded-full border border-input bg-background/50 pl-12 pr-4 outline-none transition-all focus:ring-2 focus:ring-primary/50 hover:bg-background/80"
        />

        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 rounded-xl border border-input bg-background/95 shadow-lg">
            {suggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => onSuggestionSelect && onSuggestionSelect(term)}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <span className="truncate">{term}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        className="hidden h-12 rounded-full px-8 md:block"
        type="button"
        onClick={onSearch}
      >
        Search
      </Button>

      <button
        onClick={onFilter}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-input bg-background/50 transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>
    </div>
  </section>
);

const CategorySelector = ({ categories, active, setActive }) => {
  const scrollContainerRef = useRef(null);
  const itemRefs = useRef({});

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (active && itemRefs.current[active] && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const item = itemRefs.current[active];
      const containerWidth = container.offsetWidth;
      const itemLeft = item.offsetLeft;
      const itemWidth = item.offsetWidth;
      const scrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [active]);

  return (
    <section className="relative mx-auto w-full max-w-6xl py-6">
      <div className="flex items-center gap-2 px-2">
        {/* Left Arrow - Enlarged & Themed */}
        <button 
          onClick={() => scroll("left")}
          className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-input bg-background/50 text-foreground shadow-sm transition-all hover:bg-primary hover:text-white hover:border-primary hover:scale-110 md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2 scroll-smooth"
          >
            <LayoutGroup>
              {categories.map((cat) => {
                const isActive = active === cat;
                return (
                  <button
                    key={cat}
                    ref={(el) => (itemRefs.current[cat] = el)}
                    onClick={() => setActive(cat)}
                    className={`
                      relative px-6 py-3 rounded-full text-sm font-medium transition-colors shrink-0 z-0
                      ${isActive ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"}
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryPill"
                        className="absolute inset-0 -z-10 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 whitespace-nowrap">{cat}</span>
                  </button>
                );
              })}
            </LayoutGroup>
          </div>
        </div>

        {/* Right Arrow - Enlarged & Themed */}
        <button 
          onClick={() => scroll("right")}
          className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-input bg-background/50 text-foreground shadow-sm transition-all hover:bg-primary hover:text-white hover:border-primary hover:scale-110 md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
};

const BlogGrid = ({ blogs, loading }) => {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading stories...</span>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-xl text-muted-foreground">No blogs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 px-4 py-4 md:grid-cols-2 lg:grid-cols-3 xl:px-8 max-w-7xl mx-auto">
      {blogs.map((blog) => (
        <Link
          to={`/blog/${blog.slug}`}
          key={blog._id || blog.slug}
          className="group block h-full"
        >
          <GlassCard className="flex h-full flex-col overflow-hidden p-0 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5">
            <div className="aspect-[16/9] w-full overflow-hidden bg-muted/20">
              <img
                src={blog.headerImage || "/placeholder.jpg"}
                alt={blog.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                {blog.tags?.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-bold leading-tight transition-colors group-hover:text-primary">
                {blog.title}
              </h3>
              <p className="line-clamp-2 text-sm text-foreground/60">
                {blog.seo?.metaDescription || blog.excerpt}
              </p>
              <div className="mt-auto flex items-center gap-3 border-t border-border/50 pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {blog.author?.name?.[0] || "A"}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="mb-1 text-sm font-medium leading-none text-foreground">
                    {blog.author?.name || "Anonymous"}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{formatDate(blog.createdAt)}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span>{blog.cachedStats?.viewCount || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </Link>
      ))}
    </section>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-12">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-input bg-background/50 text-foreground transition-all hover:bg-primary hover:text-white hover:border-primary hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-background/50 disabled:hover:text-foreground"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            h-12 w-12 rounded-full text-sm font-bold transition-all hover:scale-110
            ${
              currentPage === page
                ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                : "border border-input bg-background/50 text-foreground hover:bg-primary hover:text-white hover:border-primary"
            }
          `}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-input bg-background/50 text-foreground transition-all hover:bg-primary hover:text-white hover:border-primary hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-background/50 disabled:hover:text-foreground"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
};

const Newsletter = memo(({ onSubscribe }) => (
  <section className="px-4 py-24">
    <div className="mx-auto max-w-5xl">
      <GlassCard className="relative overflow-hidden p-8 text-center md:p-16">
        <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-secondary/20 blur-[80px]" />
        <div className="relative z-10 mx-auto max-w-2xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Stay in the loop
            </h2>
            <p className="text-lg text-foreground/70">
              Join our community to get the latest stories, trends, and updates delivered straight to your inbox.
            </p>
          </div>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={onSubscribe}
              className="group h-14 rounded-full px-10 text-lg shadow-xl shadow-primary/10 transition-all hover:shadow-primary/20"
            >
              <Mail className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              Subscribe to Newsletter
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  </section>
));

const SubscribeModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); 

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setStatus("idle");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md"
        >
          <GlassCard className="relative !bg-background/95 p-8 shadow-2xl ring-1 ring-white/10">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-foreground/50 transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {status === "success" ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 ring-1 ring-green-500/20">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold">Subscribed!</h3>
                <p className="mt-2 text-foreground/60">
                  Thank you for joining. Keep an eye on your inbox!
                </p>
                <Button onClick={onClose} variant="outline" className="mt-8 w-full rounded-full">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Join the Newsletter</h3>
                  <p className="mt-2 text-sm text-foreground/60">
                    Get the latest blogs and news directly to your inbox.
                  </p>
                </div>

                <div className="space-y-2 text-left">
                  <label className="ml-1 text-sm font-medium text-foreground/80">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-lg border border-input bg-background/50 pl-10 pr-4 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={status === "loading"}
                  className="h-12 w-full rounded-lg text-base"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Subscribing...
                    </>
                  ) : (
                    "Subscribe Now"
                  )}
                </Button>
              </form>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/**
 * FilterModal:
 * - Dropdown fixed to use "bg-background" and "text-foreground".
 * - Ensures compatibility with dark/light themes.
 */
const FilterModal = ({ isOpen, onClose, sort, setSort, count, setCount }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] flex animate-in fade-in items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <GlassCard className="relative w-full max-w-sm space-y-6 !bg-background border-border p-6 shadow-2xl">
          <button onClick={() => onClose()} className="absolute right-4 top-4 text-foreground/50 hover:text-foreground">✕</button>
          <h3 className="text-xl font-bold">Filter & Sort</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/70">Items per page: {count}</label>
            <input 
              type="range" 
              min="3" 
              max="30" 
              step="3" 
              value={count} 
              onChange={(e) => setCount(Number(e.target.value))} 
              className="w-full accent-primary cursor-pointer" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/70">Sort By</label>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-12 w-full appearance-none rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              >
                {/* Adding explicit class names to options to force theme colors in native dropdowns */}
                <option value="latest" className="bg-background text-foreground py-2">Latest</option>
                <option value="popular" className="bg-background text-foreground py-2">Most Viewed</option>
              </select>
              {/* Custom Arrow Icon for Dropdown */}
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50">
                <ChevronRight className="h-4 w-4 rotate-90" />
              </div>
            </div>
          </div>

          <Button onClick={() => onClose()} className="w-full h-12 text-base">Apply Filters</Button>
        </GlassCard>
      </div>
    );
};

// --- Main Landing Component ---

export default function Landing() {
  const { currentTheme } = useTheme();
  const { isAuthenticated, token } = useAuth(); 
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSubscribeOpen, setSubscribeOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  
  // Pagination & Sort
  const [postCount, setPostCount] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    let isMounted = true;
    categoryService.getSelectList().then((data) => {
      if (isMounted) setCategories(["All", ...data.map((c) => c.name)]);
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    setLoading(true);

    const params = { limit: 100 }; 
    postService.list(params).then((res) => {
      const allBlogs = Array.isArray(res.data) ? res.data : [];
      const mapped = allBlogs.map((post) => ({
        _id: post._id,
        slug: post.slug,
        title: post.title,
        excerpt: post.seo?.metaDescription || "",
        headerImage: post.headerImage,
        // Tags from tagIds
        tags: Array.isArray(post.tags)
          ? post.tags
          : post.tagIds?.map((t) => t.name || t) || [],
        // Categories from categoryIds for category-wise filtering
        categories: Array.isArray(post.categoryIds)
          ? post.categoryIds.map((c) => c.name || c)
          : [],
        author: { name: post.authorId?.name || "Unknown" },
        createdAt: post.createdAt,
        cachedStats: post.cachedStats,
      }));
      setBlogs(mapped);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Load saved searches for logged-in users
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    fetchWithAuth(`${API_BASE_URL}/api/users/me/saved-searches`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setSavedSearches(items);
      })
      .catch((err) => {
        console.error("Failed to load saved searches:", err);
      });
  }, [isAuthenticated, token]);

  useEffect(() => { setCurrentPage(1); }, [search, activeCategory, postCount]);

  const filteredBlogs = useMemo(() => {
    let result = blogs;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((b) =>
        b.title?.toLowerCase().includes(lower) ||
        b.tags?.some((t) => t.toLowerCase().includes(lower))
      );
    }
    if (activeCategory !== "All") {
      result = result.filter((b) => b.categories?.includes(activeCategory));
    }
    return [...result].sort((a, b) => {
      if (sortBy === "popular") return (b.cachedStats?.viewCount || 0) - (a.cachedStats?.viewCount || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [blogs, search, activeCategory, sortBy]);

  const paginatedBlogs = useMemo(() => {
    const indexOfLastPost = currentPage * postCount;
    const indexOfFirstPost = indexOfLastPost - postCount;
    return filteredBlogs.slice(indexOfFirstPost, indexOfLastPost);
  }, [filteredBlogs, currentPage, postCount]);

  const totalPages = Math.ceil(filteredBlogs.length / postCount);

  // Scroll to top of SearchSection (main content) when page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (!isAuthenticated) {
      const searchSection = document.getElementById("main-content-start");
      if (searchSection) {
        // Adjust offset for sticky header if needed
        const yOffset = -60; 
        const y = searchSection.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Suggestions from saved searches
  const suggestionTerms = useMemo(() => {
    const terms = savedSearches
      .map((s) => s.query)
      .filter(Boolean);
    // Deduplicate while preserving order
    return Array.from(new Set(terms));
  }, [savedSearches]);

  const filteredSuggestions = useMemo(() => {
    if (!search) return [];
    const lower = search.toLowerCase();
    // Chrome-like behavior: only suggestions whose beginning matches the typed text
    return suggestionTerms
      .filter((t) => t.toLowerCase().startsWith(lower))
      .slice(0, 5);
  }, [suggestionTerms, search]);

  const handleSearchSubmit = async (overrideTerm) => {
    const term = (overrideTerm ?? search).trim();
    if (!term) return;

    // Local filtering already reacts to `search` state; this only saves history for logged-in users
    if (!isAuthenticated || !token) return;

    try {
      await fetchWithAuth(`${API_BASE_URL}/api/users/me/saved-searches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: term,
          filters: {
            category: activeCategory,
            sortBy,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to save search:", err);
    }
  };

  if (isAuthenticated) {
    // --- AUTHENTICATED VIEW (No Hero) ---
    return (
      <div className="min-h-screen pb-20">
        <SearchSection 
          search={search} 
          setSearch={setSearch} 
          onFilter={() => setFilterOpen(true)}
          onSearch={() => handleSearchSubmit()}
          suggestions={filteredSuggestions}
          onSuggestionSelect={(term) => {
            setSearch(term);
            handleSearchSubmit(term);
          }}
        />

        <CategorySelector 
          categories={categories} 
          active={activeCategory} 
          setActive={setActiveCategory} 
        />
        <BlogGrid blogs={paginatedBlogs} loading={loading} />
        {!loading && filteredBlogs.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
        <FilterModal isOpen={isFilterOpen} onClose={() => setFilterOpen(false)} sort={sortBy} setSort={setSortBy} count={postCount} setCount={setPostCount} />
      </div>
    );
  }

  // --- GUEST VIEW (With Hero) ---
  return (
    <div className="w-full">
      
      {/* 1. Hero Section (Natural Flow) */}
      <Hero 
        theme={currentTheme} 
        onStart={() => navigate("/auth")} 
      />

      {/* 2. Main Content (Starts right after Hero) */}
      <div id="main-content-start" className="relative z-10 bg-background pb-20">
        
        {/* Sticky Search */}
        <SearchSection 
          search={search} 
          setSearch={setSearch} 
          onFilter={() => setFilterOpen(true)}
          onSearch={handleSearchSubmit}
        />
        
        <CategorySelector 
          categories={categories} 
          active={activeCategory} 
          setActive={setActiveCategory} 
        />
        
        <BlogGrid 
          blogs={paginatedBlogs} 
          loading={loading} 
        />

        {!loading && filteredBlogs.length > 0 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        )}
        
        <Newsletter onSubscribe={() => setSubscribeOpen(true)} />
      </div>

      {/* Modals */}
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setFilterOpen(false)} 
        sort={sortBy} 
        setSort={setSortBy} 
        count={postCount} 
        setCount={setPostCount} 
      />
      <SubscribeModal 
        isOpen={isSubscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />
    </div>
  );
}