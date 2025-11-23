
import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Save, CalendarDays } from 'lucide-react';
import { cn } from '../../lib/utils';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-border p-2 flex gap-1 flex-wrap bg-muted rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn("p-2 rounded hover:bg-background transition", editor.isActive('bold') ? 'bg-background text-primary' : 'text-muted-foreground')}
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn("p-2 rounded hover:bg-background transition", editor.isActive('italic') ? 'bg-background text-primary' : 'text-muted-foreground')}
      >
        <Italic size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn("p-2 rounded hover:bg-background transition", editor.isActive('bulletList') ? 'bg-background text-primary' : 'text-muted-foreground')}
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn("p-2 rounded hover:bg-background transition", editor.isActive('orderedList') ? 'bg-background text-primary' : 'text-muted-foreground')}
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn("p-2 rounded hover:bg-background transition", editor.isActive('blockquote') ? 'bg-background text-primary' : 'text-muted-foreground')}
      >
        <Quote size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-background transition text-muted-foreground disabled:opacity-50"
      >
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-background transition text-muted-foreground disabled:opacity-50"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function WriteBlog() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tech');
  const [tags, setTags] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your amazing story...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[300px] p-4 text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:text-muted-foreground prose-code:text-primary prose-li:text-muted-foreground',
      },
    },
  });

  const handlePublish = async () => {
    if (!title || !editor.getHTML()) return;

    setIsSubmitting(true);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (scheduledAt) {
      // Scheduled publish
      console.log({
        title,
        category,
        tags: tags.split(',').map(t => t.trim()),
        content: editor.getHTML(),
        thumbnail: thumbnailFile ? { name: thumbnailFile.name, size: thumbnailFile.size, type: thumbnailFile.type } : null,
        heroImage: heroImageFile ? { name: heroImageFile.name, size: heroImageFile.size, type: heroImageFile.type } : null,
        status: 'Scheduled',
        scheduledAt,
      });

      alert(`Blog scheduled successfully for ${new Date(scheduledAt).toLocaleString()} (check console for data)`);

      // Reset form after scheduling
      setTitle('');
      setCategory('Tech');
      setTags('');
      setThumbnailFile(null);
      setHeroImageFile(null);
      setScheduledAt('');
      if (editor) {
        editor.commands.setContent('');
      }
    } else {
      // Immediate publish
      console.log({
        title,
        category,
        tags: tags.split(',').map(t => t.trim()),
        content: editor.getHTML(),
        thumbnail: thumbnailFile ? { name: thumbnailFile.name, size: thumbnailFile.size, type: thumbnailFile.type } : null,
        heroImage: heroImageFile ? { name: heroImageFile.name, size: heroImageFile.size, type: heroImageFile.type } : null,
      });

      alert("Blog Published Successfully! (Check console for data)");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Write New Blog</h1>
        <p className="text-muted-foreground mt-1">Share your thoughts with the world.</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden p-6 space-y-6">
        
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Meta Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
            >
              <option value="Tech">Tech</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Education">Education</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Tags <span className="text-xs text-muted-foreground/70 font-normal">(comma separated)</span></label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, coding, tutorial"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-primary/10 file:text-xs file:font-medium file:text-primary"
            />
            <p className="text-xs text-muted-foreground">Used in cards and previews as the small thumbnail.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Main / Hero Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHeroImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-primary/10 file:text-xs file:font-medium file:text-primary"
            />
            <p className="text-xs text-muted-foreground">Shown at the top of the blog details page.</p>
          </div>
        </div>

        {/* Schedule Date & Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarDays size={16} />
            Schedule publish (optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to publish immediately, or choose a future date and time to schedule.
          </p>
        </div>

        {/* Editor */}
        <div className="space-y-2">
           <label className="text-sm font-medium text-muted-foreground">Content</label>
           <div className="border border-border rounded-lg overflow-hidden bg-card">
             <MenuBar editor={editor} />
             <EditorContent editor={editor} />
           </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {isSubmitting
              ? scheduledAt
                ? 'Scheduling...'
                : 'Publishing...'
              : scheduledAt
                ? 'Schedule & Publish'
                : 'Publish Post'}
          </button>
        </div>

      </div>
    </div>
  );
}
