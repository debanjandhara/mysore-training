import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Node } from '@tiptap/core';
import { 
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Save, 
  CalendarDays, Image as ImageIcon, Video as VideoIcon, 
  Music, Heading1, Heading2, Loader2, X, Code, Eye, PenTool, Plus 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';
import { tagService } from '../../services/tagService';
import { API_BASE_URL } from '../../services/authService';

/* -------------------------------------------------------------------------- */
/*                                Custom Nodes                                */
/* -------------------------------------------------------------------------- */

const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: 'video' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', { ...HTMLAttributes, class: 'w-full rounded-lg my-4 border border-border' }];
  },
});

const AudioNode = Node.create({
  name: 'audio',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: 'audio' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['audio', { ...HTMLAttributes, class: 'w-full my-4' }];
  },
});

/* -------------------------------------------------------------------------- */
/*                            Sub-Components                                  */
/* -------------------------------------------------------------------------- */

// Memoized toolbar to prevent unnecessary renders, though Tiptap state updates will still trigger it
const EditorToolbar = React.memo(({ editor, onAddMedia }) => {
  if (!editor) return null;

  const handleMediaClick = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) onAddMedia(file, type);
    };
    input.click();
  };

  const ToolbarButton = ({ onClick, isActive, disabled, icon: Icon }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={cn(
        "p-2 rounded-md transition-all duration-200 flex items-center justify-center",
        isActive 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30 sticky top-0 z-10">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
      
      <div className="w-px h-6 bg-border mx-1 self-center" />
      
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
      
      <div className="w-px h-6 bg-border mx-1 self-center" />
      
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
      
      <div className="w-px h-6 bg-border mx-1 self-center" />
      
      <ToolbarButton onClick={() => handleMediaClick('image')} icon={ImageIcon} />
      <ToolbarButton onClick={() => handleMediaClick('video')} icon={VideoIcon} />
      <ToolbarButton onClick={() => handleMediaClick('audio')} icon={Music} />
      
      <div className="w-px h-6 bg-border mx-1 self-center" />
      
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={Undo} />
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={Redo} />
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */

export default function WriteBlog() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editBlogId = location.state?.blogId;

  // Form State
  const [title, setTitle] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // Changed to Array
  const [tags, setTags] = useState([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [existingHeroImageUrl, setExistingHeroImageUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorMode, setEditorMode] = useState('write'); 
  const [rawHtmlCode, setRawHtmlCode] = useState('');

  // Data State
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Calculate min date for validation (Current time formatted for datetime-local)
  const minDate = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({ placeholder: 'Tell your story...' }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg border border-border' } }),
      VideoNode,
      AudioNode
    ],
    editorProps: {
      attributes: {
        // Enforce theme text color on ALL elements to prevent gray text
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] p-6 max-w-none",
          "text-foreground", // Global text color
          "prose-headings:text-foreground prose-headings:font-bold",
          "prose-p:text-foreground",
          "prose-strong:text-foreground",
          "prose-blockquote:text-foreground prose-blockquote:border-l-primary",
          "prose-ul:text-foreground prose-ul:list-disc prose-ul:pl-6",
          "prose-ol:text-foreground prose-ol:list-decimal prose-ol:pl-6",
          "prose-li:text-foreground prose-li:marker:text-primary",
          "prose-code:text-primary prose-code:bg-muted/50 prose-code:rounded prose-code:px-1",
          "prose-img:my-4"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      // Defer this slightly if needed, but usually fine
      setRawHtmlCode(editor.getHTML());
    }
  });

  // Load Data
  useEffect(() => {
    const init = async () => {
      try {
        const [cats, tagList] = await Promise.all([
          categoryService.getSelectList(),
          tagService.getSelectList()
        ]);
        setCategories(cats);
        setAvailableTags(tagList);

        if (editBlogId) {
          const post = await postService.getById(editBlogId);
          setTitle(post.title);
          
          // Handle Multiple Categories
          if (post.categoryIds && post.categoryIds.length > 0) {
            const ids = post.categoryIds.map(c => typeof c === 'object' ? c._id : c);
            setSelectedCategoryIds(ids);
          }

          if (post.tagIds && post.tagIds.length > 0) {
             const tagNames = post.tagIds.map(t => typeof t === 'object' ? t.name : t);
             setTags(tagNames);
          }

          if (post.headerImage) setExistingHeroImageUrl(post.headerImage);
          
          if (post.publishedAt) {
             const date = new Date(post.publishedAt);
             const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
             setScheduledAt(localIso);
             setIsScheduleEnabled(true);
          }
          
          if (editor) {
            editor.commands.setContent(post.content);
            setRawHtmlCode(post.content);
          }
        }
      } catch (error) {
        console.error("Error initializing WriteBlog:", error);
      }
    };

    init();
  }, [editBlogId, editor]);

  const handleAddMedia = async (file, type) => {
    try {
      const result = await postService.uploadMedia(file, token);
      let url = result.data.url;
      if (url && url.startsWith('/')) url = `${API_BASE_URL}${url}`;

      if (type === 'image') editor.chain().focus().setImage({ src: url }).run();
      else if (type === 'video') editor.chain().focus().insertContent(`<video src="${url}" controls></video>`).run();
      else if (type === 'audio') editor.chain().focus().insertContent(`<audio src="${url}" controls></audio>`).run();
    } catch (error) {
      alert('Media upload failed: ' + error.message);
    }
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value && !selectedCategoryIds.includes(value)) {
      setSelectedCategoryIds([...selectedCategoryIds, value]);
    }
    // Reset select to default
    e.target.value = ""; 
  };

  const removeCategory = (idToRemove) => {
    setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== idToRemove));
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c._id === id);
    return cat ? cat.name : 'Unknown';
  };

  const handleTagInput = (e) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      const val = tagInputValue.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInputValue('');
    }
  };

  const handleSubmit = async (statusOverride) => {
    if (!title) return alert('Title is required');
    if (selectedCategoryIds.length === 0) return alert('Please select at least one category');
    if (!heroImageFile && !existingHeroImageUrl) return alert('Header image is required');
    
    const content = editorMode === 'raw' ? rawHtmlCode : editor?.getHTML();
    if (!content || content === '<p></p>') return alert('Content is required');

    // Date Validation
    if (isScheduleEnabled) {
        if (!scheduledAt) return alert('Please select a date for scheduling.');
        if (new Date(scheduledAt) < new Date()) {
            return alert('Scheduled date cannot be in the past.');
        }
    }

    setIsSubmitting(true);
    try {
      // Process Tags
      const tagIds = await Promise.all(tags.map(async (tagName) => {
        const existing = availableTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        if (existing) return existing._id;
        const newTag = await tagService.create({ name: tagName });
        return newTag._id;
      }));

      // Process Image
      let heroUrl = existingHeroImageUrl;
      if (heroImageFile) {
        const imgRes = await postService.uploadMedia(heroImageFile, token);
        heroUrl = imgRes.data.url.startsWith('/') ? `${API_BASE_URL}${imgRes.data.url}` : imgRes.data.url;
      }

      const finalStatus = statusOverride || (isScheduleEnabled && scheduledAt ? 'scheduled' : 'published');
      
      const payload = {
        title,
        content,
        categoryIds: selectedCategoryIds, // Sending Array
        tagIds,
        headerImage: heroUrl,
        status: finalStatus,
        publishedAt: (isScheduleEnabled && scheduledAt) 
          ? scheduledAt 
          : (finalStatus === 'published' ? new Date().toISOString() : undefined),
      };

      if (editBlogId) {
        await postService.update(editBlogId, payload, token);
      } else {
        await postService.create(payload, token);
      }
      
      navigate('/dashboard/view-blogs');
    } catch (error) {
      console.error(error);
      alert('Error saving blog: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{editBlogId ? 'Edit Blog' : 'Write New Blog'}</h1>
        <p className="text-muted-foreground">{editBlogId ? 'Update your content.' : 'Create content that matters.'}</p>
      </div>

      <div className="grid gap-6">
        {/* Meta Information Card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Blog Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an engaging title..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Multiple Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Categories</label>
              <div className="space-y-2">
                 <select
                    onChange={handleCategorySelect}
                    defaultValue=""
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select categories...</option>
                    {categories.map(c => <option key={c._id} value={c._id} disabled={selectedCategoryIds.includes(c._id)}>{c.name}</option>)}
                  </select>
                  
                  {/* Selected Categories Pills */}
                  <div className="flex flex-wrap gap-2 min-h-[30px]">
                    {selectedCategoryIds.map(id => (
                       <span key={id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm font-medium border border-border">
                         {getCategoryName(id)}
                         <button 
                           onClick={() => removeCategory(id)} 
                           className="ml-1 hover:text-red-500 transition-colors"
                           type="button"
                         >
                           <X size={14} />
                         </button>
                       </span>
                    ))}
                    {selectedCategoryIds.length === 0 && <span className="text-xs text-muted-foreground italic">No categories selected</span>}
                  </div>
              </div>
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tags</label>
              <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border bg-background min-h-[46px] focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                    #{tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-primary/70" type="button"><X size={14} /></button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInputValue}
                  onChange={(e) => setTagInputValue(e.target.value)}
                  onKeyDown={handleTagInput}
                  placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
                  className="flex-1 bg-transparent outline-none min-w-[120px] text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Header Image</label>
            <div className="space-y-4">
              {(existingHeroImageUrl && !heroImageFile) && (
                <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border border-border">
                  <img src={existingHeroImageUrl} alt="Header Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-sm text-muted-foreground cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Editor Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Mode Tabs */}
          <div className="flex items-center border-b border-border bg-muted/30 px-2">
            <button
              onClick={() => {
                  if (editorMode === 'raw') editor?.commands.setContent(rawHtmlCode);
                  setEditorMode('write');
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                editorMode === 'write' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <PenTool size={16} /> Write
            </button>
            <button
              onClick={() => {
                  setRawHtmlCode(editor?.getHTML() || '');
                  setEditorMode('raw');
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                editorMode === 'raw' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Code size={16} /> Raw Code
            </button>
            <button
              onClick={() => {
                  setRawHtmlCode(editor?.getHTML() || '');
                  setEditorMode('preview');
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                editorMode === 'preview' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye size={16} /> Preview
            </button>
          </div>

          {/* Content Area */}
          <div className="min-h-[400px] bg-background">
            {editorMode === 'write' && (
              <>
                <EditorToolbar editor={editor} onAddMedia={handleAddMedia} />
                <EditorContent editor={editor} />
              </>
            )}

            {editorMode === 'raw' && (
              <textarea
                value={rawHtmlCode}
                onChange={(e) => setRawHtmlCode(e.target.value)}
                className="w-full h-[500px] p-4 font-mono text-sm bg-background text-foreground resize-none focus:outline-none"
                placeholder="<!-- Raw HTML Code -->"
              />
            )}

            {editorMode === 'preview' && (
              <div 
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl p-6 max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-li:marker:text-primary"
                dangerouslySetInnerHTML={{ __html: rawHtmlCode || editor?.getHTML() }} 
              />
            )}
          </div>
        </div>

        {/* Publishing Options */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays size={20} />
              <span className="text-sm font-medium">Schedule</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isScheduleEnabled}
                onChange={() => setIsScheduleEnabled(!isScheduleEnabled)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
            
            {isScheduleEnabled && (
              <input
                type="datetime-local"
                value={scheduledAt}
                min={minDate} // Validator: Prevents picking past dates in UI
                onChange={(e) => setScheduledAt(e.target.value)}
                disabled={!!editBlogId && false} // Allow rescheduling if needed
                className={cn(
                  "ml-2 px-3 py-1.5 rounded border border-border bg-background text-sm text-foreground focus:border-primary outline-none",
                  // The following class forces the calendar icon to match theme brightness
                  "[color-scheme:light] dark:[color-scheme:dark]"
                )}
              />
            )}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              type="button"
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              type="button"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {(isScheduleEnabled && scheduledAt) ? 'Schedule' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}