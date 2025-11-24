import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { tagService } from '../../services/tagService';
import { Plus, Edit2, Trash2, RefreshCw, FolderTree } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [migratingCategory, setMigratingCategory] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTagForMigration, setSelectedTagForMigration] = useState('');
  const [selectList, setSelectList] = useState([]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await categoryService.getAll();
      setCategories(result.data);
      const list = await categoryService.getSelectList();
      setSelectList(list);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const list = await tagService.getSelectList();
      setTags(list);
    } catch (error) {
      console.error('Failed to fetch tags', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await categoryService.create({ 
        name: newCategoryName,
        parentCategoryId: newParentId || null
      });
      setNewCategoryName('');
      setNewParentId('');
      fetchCategories();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    try {
      await categoryService.update(editingCategory._id, { 
        name: editingCategory.name,
        parentCategoryId: editingCategory.parentCategoryId || null
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.delete(id);
      fetchCategories();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMigrate = async () => {
    if (!migratingCategory || !selectedTagForMigration) return;
    if (!window.confirm(`Merge category "${migratingCategory.name}" into tag? This will delete the category.`)) return;
    try {
      await categoryService.migrate(migratingCategory._id, selectedTagForMigration);
      setMigratingCategory(null);
      setSelectedTagForMigration('');
      fetchCategories();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Category Management</h1>
        <p className="text-muted-foreground mt-1">Organize your content with categories.</p>
      </div>

      {/* Create Category */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <form onSubmit={handleCreate} className="flex gap-4 flex-wrap md:flex-nowrap">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name..."
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <select
            value={newParentId}
            onChange={(e) => setNewParentId(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="">No Parent (Root)</option>
            {selectList.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 transition whitespace-nowrap"
          >
            <Plus size={18} />
            Add Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border font-medium flex">
          <div className="flex-1">Name</div>
          <div className="flex-1 hidden md:block">Slug</div>
          <div className="flex-1 hidden md:block">Parent</div>
          <div className="w-32 text-right">Actions</div>
        </div>
        
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading categories...</div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map(category => (
              <div key={category._id} className="p-4 flex items-center hover:bg-muted/20 transition-colors group">
                <div className="flex-1 font-medium flex items-center gap-2">
                  <FolderTree size={16} className="text-primary/70" />
                  {editingCategory?._id === category._id ? (
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="bg-background border border-border rounded px-2 py-1 text-sm w-full max-w-[200px]"
                    />
                  ) : (
                    category.name
                  )}
                </div>
                <div className="flex-1 hidden md:block text-sm text-muted-foreground">{category.slug}</div>
                <div className="flex-1 hidden md:block text-sm text-muted-foreground">
                  {editingCategory?._id === category._id ? (
                    <select
                      value={editingCategory.parentCategoryId || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, parentCategoryId: e.target.value })}
                      className="bg-background border border-border rounded px-2 py-1 text-sm"
                    >
                      <option value="">None</option>
                      {selectList.filter(c => c._id !== category._id).map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    selectList.find(c => c._id === category.parentCategoryId)?.name || '-'
                  )}
                </div>
                <div className="w-32 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingCategory?._id === category._id ? (
                    <button onClick={handleUpdate} className="text-primary hover:underline text-sm">Save</button>
                  ) : (
                    <>
                      <button onClick={() => setEditingCategory(category)} className="text-muted-foreground hover:text-primary p-1">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setMigratingCategory(category)} className="text-muted-foreground hover:text-blue-500 p-1">
                        <RefreshCw size={16} />
                      </button>
                      <button onClick={() => handleDelete(category._id)} className="text-muted-foreground hover:text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {categories.length === 0 && !loading && (
              <div className="p-8 text-center text-muted-foreground italic">No categories found.</div>
            )}
          </div>
        )}
      </div>

       {/* Migration Modal */}
      {migratingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Merge Category "{migratingCategory.name}"</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Select a tag to merge this category into. All posts with this category will be assigned the selected tag, and the category will be deleted.
            </p>
            <div className="space-y-4">
              <select
                value={selectedTagForMigration}
                onChange={(e) => setSelectedTagForMigration(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Select Tag...</option>
                {tags.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMigratingCategory(null)}
                  className="px-4 py-2 rounded-lg hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMigrate}
                  disabled={!selectedTagForMigration}
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
