import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import ImageUploader from '../../../components/admin/ImageUploader/ImageUploader';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import ProductImage from '../../../components/ProductImage/ProductImage';
import Modal from '../../../components/Modal/Modal';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import Loader from '../../../components/Loader/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { useAsync } from '../../../hooks/useAsync';
import { categoryService } from '../../../services/categoryService';
import { slugify } from '../../../utils/format';
import './Categories.css';

const blank = { name: '', slug: '', description: '', image: '', active: true };

const Categories = () => {
  const { user } = useAuth();
  const { refresh } = useStore();
  const { data: categories, loading, reload } = useAsync(() => categoryService.list({ includeInactive: true }), []);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  if (loading) return <Loader />;

  const done = (msg) => {
    toast.success(msg);
    reload();
    refresh();
  };

  const save = async (e) => {
    e.preventDefault();
    if (!editing.name.trim()) return toast.error('Name is required.');
    const payload = { name: editing.name.trim(), slug: editing.slug || slugify(editing.name), description: editing.description, image: editing.image, active: editing.active };
    try {
      if (editing._id) await categoryService.update(editing._id, payload, user.email);
      else await categoryService.create(payload, user.email);
      setEditing(null);
      done('Category saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const move = async (index, dir) => {
    const ids = categories.map((c) => c._id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    await categoryService.reorder(ids, user.email);
    done('Order updated');
  };

  const toggle = async (c) => {
    await categoryService.update(c._id, { active: !c.active }, user.email);
    done(c.active ? 'Category hidden' : 'Category visible');
  };

  const remove = async () => {
    const c = toDelete;
    setToDelete(null);
    try {
      await categoryService.remove(c._id, user.email);
      done('Category deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="categories-admin">
      <AdminPageHeader title="Categories" subtitle="Drag order with arrows. Hidden categories don't appear on the store.">
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...blank })}><FiPlus /> Add category</button>
      </AdminPageHeader>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Order</th><th>Category</th><th>Slug</th><th>Products</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c._id}>
                <td>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><FiArrowUp /></button>
                    <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === categories.length - 1} aria-label="Move down"><FiArrowDown /></button>
                  </div>
                </td>
                <td>
                  <div className="categories-admin__name">
                    <ProductImage src={c.image} alt={c.name} color="#e89bb3" />
                    <div>
                      <strong>{c.name}</strong>
                      <small>{c.description}</small>
                    </div>
                  </div>
                </td>
                <td><code>/{c.slug}</code></td>
                <td>{c.productCount}</td>
                <td>
                  <button className="categories-admin__toggle" onClick={() => toggle(c)} title="Toggle visibility">
                    <StatusBadge status={c.active ? 'active' : 'inactive'} />
                  </button>
                </td>
                <td className="actions">
                  <button className="icon-btn" onClick={() => setEditing({ ...c })} aria-label="Edit"><FiEdit2 /></button>
                  <button className="icon-btn danger" onClick={() => setToDelete(c)} aria-label="Delete"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit category' : 'New category'}>
        {editing && (
          <form onSubmit={save}>
            <div className="form-group">
              <label htmlFor="cat-name" className="required">Name</label>
              <input id="cat-name" className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing._id ? editing.slug : slugify(e.target.value) })} />
            </div>
            <div className="form-group">
              <label htmlFor="cat-slug">Slug</label>
              <input id="cat-slug" className="input" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
            </div>
            <div className="form-group">
              <label htmlFor="cat-desc">Description</label>
              <textarea id="cat-desc" className="textarea" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="form-group">
              <span className="categories-admin__label">Category image</span>
              <ImageUploader multiple={false} images={editing.image ? [{ url: editing.image, alt: editing.name }] : []} onChange={(imgs) => setEditing({ ...editing, image: imgs[0]?.url || '' })} />
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Visible on store
            </label>
            <button className="btn btn-primary categories-admin__save">Save category</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete category?"
        message={toDelete?.productCount ? `"${toDelete.name}" still has ${toDelete.productCount} product(s). Reassign them before deleting.` : `Delete "${toDelete?.name}"? This cannot be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default Categories;
