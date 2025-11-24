import React, { useState, useEffect, useCallback } from "react";
import { useTheme, THEMES } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { getFonts, loadFont } from "../services/fontService";
import { Search, Loader2, Upload, Camera } from "lucide-react";

/**
 * Sidebar Navigation Item
 * 
 * @param {object} props
 * @param {boolean} props.active - Whether the item is currently active
 * @param {string} props.label - The label for the item
 * @param {function} props.onClick - The callback function for when the item is clicked
 */
const SidebarItem = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-md text-small font-medium transition-all duration-200 ${
      active
        ? "bg-primary/10 text-primary"
        : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
    }`}
  >
    {label}
  </button>
);

/**
 * Font Selector Component
 */
const FontSelector = ({ currentFont, onSelect }) => {
  const [fonts, setFonts] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch fonts
  useEffect(() => {
    let mounted = true;
    
    const fetch = async () => {
      setLoading(true);
      try {
        // If search changed, reset list. If page changed (and >1), append.
        const isNewSearch = page === 1;
        const data = await getFonts({ page, limit: 6, query: debouncedSearch });
        
        if (mounted) {
          if (isNewSearch) {
            setFonts(data.items);
          } else {
            setFonts(prev => [...prev, ...data.items]);
          }
          setHasMore(data.hasMore);
          
          // Load preview fonts
          data.items.forEach(f => loadFont(f.family));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => { mounted = false; };
  }, [page, debouncedSearch]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-small font-semibold uppercase tracking-wider text-foreground/40">Typography</label>
        <div className="relative w-48">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-foreground/40" size={14} />
          <input 
            type="text" 
            placeholder="Search fonts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-md border border-input bg-background/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fonts.map((font) => (
          <button
            key={font.family}
            onClick={() => {
              loadFont(font.family);
              onSelect(font.family);
            }}
            className={`relative p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
              currentFont === font.family ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <p className="text-xs text-foreground/50 mb-1">{font.category}</p>
            <p 
              className="text-lg text-foreground truncate"
              style={{ fontFamily: font.family }}
            >
              {font.family}
            </p>
            <p className="text-sm text-foreground/70 truncate" style={{ fontFamily: font.family }}>
              The quick brown fox jumps over the lazy dog.
            </p>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      )}

      {!loading && hasMore && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="w-full py-2 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors font-medium"
        >
          Load More Fonts
        </button>
      )}
      
      {!loading && fonts.length === 0 && (
        <div className="text-center py-8 text-foreground/50 text-sm">
          No fonts found.
        </div>
      )}
    </div>
  );
};

/**
 * Color Picker Control with Preview
 * 
 * @param {object} props
 * @param {string} props.label - The label for the color control
 * @param {string} props.value - The current color value
 * @param {function} props.onChange - The callback function for when the color value changes
 */
const ColorControl = ({ label, value, onChange }) => (
  <div className="space-y-2 group">
    <div className="flex justify-between text-small text-foreground/70">
      <span className="font-medium">{label}</span>
      <span className="font-mono text-[10px] opacity-50 uppercase tracking-wider">{value}</span>
    </div>
    <div className="relative h-12 w-full overflow-hidden rounded-md border border-input ring-offset-background transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 group-hover:border-primary/50">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer border-0 p-0 opacity-0"
      />
      <div 
        className="h-full w-full" 
        style={{ backgroundColor: value }} 
      />
    </div>
  </div>
);

/**
 * Profile Page Component
 * Handles user settings, appearance customization, and notifications.
 * 
 * @returns {JSX.Element} The Profile page component
 */
export default function Profile() {
  const { currentTheme, setTheme, cardOpacity, setCardOpacity } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");
  const [localTheme, setLocalTheme] = useState(currentTheme);

  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    profileImage: "",
    socialLinks: {
      twitter: "",
      linkedin: "",
      github: "",
      instagram: ""
    }
  });

  // Fetch profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (token && activeTab === 'profile') {
        setIsLoading(true);
        try {
          const { user } = await authService.getCurrentUser(token);
          if (user) {
            setFormData({
              name: user.name || "",
              username: user.username || "",
              email: user.email || "",
              bio: user.bio || "",
              location: user.location || "",
              website: user.website || "",
              profileImage: user.profileImage || "",
              socialLinks: {
                twitter: user.socialLinks?.twitter || "",
                linkedin: user.socialLinks?.linkedin || "",
                github: user.socialLinks?.github || "",
                instagram: user.socialLinks?.instagram || ""
              }
            });
          }
        } catch (error) {
          console.error("Failed to load profile", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadProfile();
  }, [token, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const socialKey = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await authService.uploadImage(token, file);
      if (result && result.data && result.data.url) {
        // Construct full URL if needed, or store relative
        const fullUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}${result.data.url}`;
        setFormData(prev => ({ ...prev, profileImage: fullUrl }));
      }
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authService.updateProfile(token, formData);
      alert("Profile updated successfully!"); 
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    setLocalTheme(currentTheme);
  }, [currentTheme]);

  // Preload fonts used by theme presets for tile previews
  useEffect(() => {
    // Only bother when appearance tab is visible
    if (activeTab !== "appearance") return;

    const uniqueFamilies = Array.from(
      new Set(
        Object.values(THEMES)
          .map((t) => (t.font || "").split(",")[0].trim())
          .filter(Boolean)
      )
    );

    uniqueFamilies.forEach((family) => {
      loadFont(family);
    });
  }, [activeTab]);

  /**
   * Handles theme changes by updating the local theme state and the theme context.
   * 
   * @param {string} key - The theme property to update
   * @param {string} val - The new value for the theme property
   */
  const handleThemeChange = (key, val) => {
    const updated = { ...localTheme, [key]: val };
    setLocalTheme(updated);
    setTheme(updated);
  };

  /**
   * Applies a theme preset by updating the local theme state and the theme context.
   * 
   * @param {object} preset - The theme preset to apply
   */
  const applyPreset = (preset) => {
    setLocalTheme(preset);
    setTheme(preset);
  };

  return (
    <div className="flex flex-col md:flex-row gap-12">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="px-4">
          <h2 className="text-h3 font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-small text-foreground/50 mt-1">Manage your preferences</p>
        </div>
        <nav className="space-y-1">
          <SidebarItem 
            label="Profile" 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")}
          />
          <SidebarItem 
            label="Appearance" 
            active={activeTab === "appearance"} 
            onClick={() => setActiveTab("appearance")}
          />
          <SidebarItem 
            label="Notifications" 
            active={activeTab === "notifications"} 
            onClick={() => setActiveTab("notifications")}
          />
        </nav>
      </aside>

      {/* Main Content - Glass Card */}
      <div className="flex-1 min-h-[600px] rounded-lg border border-border p-8 shadow-2xl shadow-black/5 glass-card">
        
        {activeTab === "profile" && (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-h3 font-medium text-foreground">Profile Information</h3>
              <p className="text-body text-foreground/50 mt-2">Update your account details and public profile.</p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <div className="grid gap-8">
                {/* Profile Image */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-secondary/10">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground/30">
                          <Camera size={32} />
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                      <Upload size={20} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Profile Photo</h4>
                    <p className="text-small text-foreground/50 mt-1">Click to upload a new avatar. Max 5MB.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-small font-medium text-foreground/80">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="flex h-12 w-full rounded-md border border-input bg-background/50 px-4 py-2 text-body shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-small font-medium text-foreground/80">Username</label>
                    <input 
                      type="text" 
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="flex h-12 w-full rounded-md border border-input bg-background/50 px-4 py-2 text-body shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-small font-medium text-foreground/80">Bio</label>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background/50 px-4 py-3 text-body shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-small font-medium text-foreground/80">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      readOnly
                      className="flex h-12 w-full rounded-md border border-input bg-secondary/20 px-4 py-2 text-body shadow-sm text-foreground/60 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-small font-medium text-foreground/80">Location</label>
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="flex h-12 w-full rounded-md border border-input bg-background/50 px-4 py-2 text-body shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-small font-medium text-foreground/80">Website</label>
                    <input 
                      type="url" 
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="flex h-12 w-full rounded-md border border-input bg-background/50 px-4 py-2 text-body shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                   <label className="text-small font-semibold uppercase tracking-wider text-foreground/40">Social Links</label>
                   <div className="grid gap-4 md:grid-cols-2">
                      <input type="text" name="social.twitter" placeholder="Twitter URL" value={formData.socialLinks.twitter} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"/>
                      <input type="text" name="social.linkedin" placeholder="LinkedIn URL" value={formData.socialLinks.linkedin} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"/>
                      <input type="text" name="social.github" placeholder="GitHub URL" value={formData.socialLinks.github} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"/>
                      <input type="text" name="social.instagram" placeholder="Instagram URL" value={formData.socialLinks.instagram} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"/>
                   </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-small font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-h3 font-medium text-foreground">Appearance</h3>
              <p className="text-body text-foreground/50 mt-2">Customize the look and feel of your workspace.</p>
            </div>
            
            {/* Presets */}
            <div className="space-y-4">
              <label className="text-small font-semibold uppercase tracking-wider text-foreground/40">Theme Presets</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                {Object.values(THEMES).map((theme) => (
                  <button 
                    key={theme.name}
                    onClick={() => applyPreset(theme)}
                    className={`group relative h-24 rounded-lg border-2 overflow-hidden transition-all duration-300 ${
                      localTheme.name === theme.name 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ 
                        backgroundColor: theme.background,
                        fontFamily: theme.font
                      }}
                    >
                      <span 
                        className="font-medium tracking-tight capitalize"
                        style={{ color: theme.primary }}
                      >
                        {theme.name}
                      </span>
                    </div>
                    {/* Preview bubbles */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: theme.primary }} />
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: theme.secondary }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Typography */}
            <FontSelector 
              currentFont={localTheme.font} 
              onSelect={(font) => handleThemeChange("font", font)}
            />

            <div className="h-px bg-border/50" />

            {/* Custom Colors */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-small font-semibold uppercase tracking-wider text-foreground/40">Fine Tuning</label>
              </div>
              
              <div className="grid gap-8 sm:grid-cols-2">
                <ColorControl 
                  label="Primary Brand" 
                  value={localTheme.primary} 
                  onChange={(v) => handleThemeChange("primary", v)} 
                />
                <ColorControl 
                  label="Secondary Accent" 
                  value={localTheme.secondary} 
                  onChange={(v) => handleThemeChange("secondary", v)} 
                />
                <ColorControl 
                  label="Background Depth" 
                  value={localTheme.background} 
                  onChange={(v) => handleThemeChange("background", v)} 
                />
                <ColorControl 
                  label="Text Color" 
                  value={localTheme.foreground || "#f8fafc"} 
                  onChange={(v) => handleThemeChange("foreground", v)} 
                />
              </div>

              {/* Live preview card that reacts to primary/secondary/text color changes */}
              <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-stretch">
                <div
                  className="rounded-lg border shadow-sm p-4 flex flex-col justify-between transition-colors"
                  style={{
                    backgroundColor: localTheme.background,
                    color: localTheme.foreground,
                    borderColor: localTheme.secondary,
                  }}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] opacity-60 mb-1">
                      Preview
                    </p>
                    <h4 className="text-base font-semibold mb-1" style={{ color: localTheme.primary }}>
                      Blogify workspace
                    </h4>
                    <p className="text-xs opacity-80">
                      Secondary elements and normal text will follow these colors.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition-colors"
                      style={{
                        backgroundColor: localTheme.primary,
                        color: localTheme.foreground,
                      }}
                    >
                      Primary
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
                      style={{
                        borderColor: localTheme.secondary,
                        color: localTheme.secondary,
                        backgroundColor: "transparent",
                      }}
                    >
                      Secondary
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-[11px] leading-relaxed text-foreground/70">
                  <p className="font-semibold mb-1">How this applies</p>
                  <p>
                    <span className="font-mono">Primary</span> is used for main buttons and highlights.
                  </p>
                  <p>
                    <span className="font-mono">Secondary</span> is used for softer accents and pills.
                  </p>
                  <p>
                    <span className="font-mono">Text Color</span> is the default body text across the app.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <label className="text-small font-semibold uppercase tracking-wider text-foreground/40">Glass Opacity</label>
                  <span className="font-mono text-xs text-foreground/60">{(cardOpacity * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  step="1" 
                  value={(cardOpacity / 0.3) * 30}
                  onChange={(e) => {
                    const uiValue = parseFloat(e.target.value) || 0;
                    // Clamp slider value between 0 and 30
                    const clamped = Math.min(Math.max(uiValue, 0), 30);
                    // Map 0–30 UI range to 0.0–0.3 internal opacity
                    const internal = (clamped / 30) * 0.3;
                    setCardOpacity(internal);
                  }}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
              <div className="w-2 h-2 bg-foreground/20 rounded-full" />
            </div>
            <p className="text-body text-foreground/40">No notifications configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}