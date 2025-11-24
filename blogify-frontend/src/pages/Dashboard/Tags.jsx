import React, { useState, useEffect } from 'react';
import { tagService } from '../../services/tagService';
import { categoryService } from '../../services/categoryService';
import { Plus, X, Edit2, Trash2, RefreshCw } from 'lucide-react';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [migratingTag, setMigratingTag] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryForMigration, setSelectedCategoryForMigration] = useState('');

  const fetchTags = async () => {
    setLoading(true);
    try {
      const result = await tagService.getAll();
      setTags(result.data);
    } catch (error) {
      console.error('Failed to fetch tags', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const list = await categoryService.getSelectList();
      setCategories(list);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await tagService.create({ name: newTagName });
      setNewTagName('');
      fetchTags();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingTag || !editingTag.name.trim()) return;
    try {
      await tagService.update(editingTag._id, { name: editingTag.name });
      setEditingTag(null);
      fetchTags();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    try {
      await tagService.delete(id);
      fetchTags();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMigrate = async () => {
    if (!migratingTag || !selectedCategoryForMigration) return;
    if (!window.confirm(`Merge tag "${migratingTag.name}" into category? This will delete the tag.`)) return;
    try {
      await tagService.migrate(migratingTag._id, selectedCategoryForMigration);
      setMigratingTag(null);
      setSelectedCategoryForMigration('');
      fetchTags();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tags Management</h1>
        <p className="text-muted-foreground mt-1">Create, edit, and manage your blog tags.</p>
      </div>

      {/* Create Tag */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter new tag name..."
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 transition"
          >
            <Plus size={18} />
            Add Tag
          </button>
        </form>
      </div>

      {/* Tags List */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[300px]">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading tags...</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <div key={tag._id} className="group flex items-center gap-2 bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-full border border-border transition-all">
                {editingTag?._id === tag._id ? (
                  <input
                    type="text"
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    onBlur={handleUpdate}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                    autoFocus
                    className="bg-transparent border-none outline-none text-sm font-medium w-24"
                  />
                ) : (
                  <span className="text-sm font-medium text-foreground">{tag.name}</span>
                )}
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 border-l border-border pl-2">
                  <button
                    onClick={() => setEditingTag(tag)}
                    className="text-muted-foreground hover:text-primary p-0.5"
                    title="Edit"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => setMigratingTag(tag)}
                    className="text-muted-foreground hover:text-blue-500 p-0.5"
                    title="Merge into Category"
                  >
                    <RefreshCw size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(tag._id)}
                    className="text-muted-foreground hover:text-red-500 p-0.5"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {tags.length === 0 && !loading && (
              <p className="text-muted-foreground italic">No tags found.</p>
            )}
          </div>
        )}
      </div>

      {/* Migration Modal (Simple overlay for now) */}
      {migratingTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Merge Tag "{migratingTag.name}"</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Select a category to merge this tag into. All posts with this tag will be assigned the selected category, and the tag will be deleted.
            </p>
            <div className="space-y-4">
              <select
                value={selectedCategoryForMigration}
                onChange={(e) => setSelectedCategoryForMigration(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Select Category...</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMigratingTag(null)}
                  className="px-4 py-2 rounded-lg hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMigrate}
                  disabled={!selectedCategoryForMigration}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  Merge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
