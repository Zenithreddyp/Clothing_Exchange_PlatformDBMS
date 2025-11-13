import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { CATEGORIES, ITEM_CONDITIONS, ITEM_STATUSES } from '../constants/enums';

export default function AddItem() {
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    brand: '', 
    size: '', 
    category: '', 
    item_condition: '',
    item_status: 'Available',
    color: '',
    pickup_location: '',
    pickup_latitude: '',
    pickup_longitude: '',
    image_url: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.title || !form.category || !form.item_condition) {
      toast.error('Please fill in all required fields (Title, Category, Condition)');
      return;
    }
    
    setLoading(true);
    try {
      // Prepare data for API
      const payload = {
        title: form.title,
        description: form.description || '',
        brand: form.brand || null,
        size: form.size || null,
        color: form.color || null,
        category: form.category,
        item_condition: form.item_condition,
        item_status: form.item_status,
        pickup_location: form.pickup_location || null,
        pickup_latitude: form.pickup_latitude ? parseFloat(form.pickup_latitude) : null,
        pickup_longitude: form.pickup_longitude ? parseFloat(form.pickup_longitude) : null,
        image_url: form.image_url || null
      };
      
      await api.post('/add_cloth', payload);
      toast.success('Item added successfully');
      setForm({ 
        title: '', 
        description: '', 
        brand: '', 
        size: '', 
        category: '', 
        item_condition: '',
        item_status: 'Available',
        color: '',
        pickup_location: '',
        pickup_latitude: '',
        pickup_longitude: '',
        image_url: ''
      });
      setImage(null);
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to add item';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Add Item</h1>
      <form onSubmit={submit} className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input 
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            placeholder="Title *" 
            value={form.title} 
            onChange={(e)=>setForm({...form, title:e.target.value})} 
            required
          />
          <input 
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            placeholder="Brand" 
            value={form.brand} 
            onChange={(e)=>setForm({...form, brand:e.target.value})} 
          />
          <input 
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            placeholder="Size" 
            value={form.size} 
            onChange={(e)=>setForm({...form, size:e.target.value})} 
          />
          <input 
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            placeholder="Color" 
            value={form.color} 
            onChange={(e)=>setForm({...form, color:e.target.value})} 
          />
          <select 
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            value={form.category} 
            onChange={(e)=>setForm({...form, category:e.target.value})}
            required
          >
            <option value="">Select Category *</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            value={form.item_condition} 
            onChange={(e)=>setForm({...form, item_condition:e.target.value})}
            required
          >
            <option value="">Select Condition *</option>
            {ITEM_CONDITIONS.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
        </div>
        <textarea 
          className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" 
          placeholder="Description" 
          value={form.description} 
          onChange={(e)=>setForm({...form, description:e.target.value})} 
          rows={3}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select 
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            value={form.item_status} 
            onChange={(e)=>setForm({...form, item_status:e.target.value})}
          >
            {ITEM_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <input 
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            placeholder="Image URL" 
            value={form.image_url} 
            onChange={(e)=>setForm({...form, image_url:e.target.value})} 
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input 
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            placeholder="Pickup Location" 
            value={form.pickup_location} 
            onChange={(e)=>setForm({...form, pickup_location:e.target.value})} 
          />
          <input 
            type="number" 
            step="any"
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            placeholder="Latitude" 
            value={form.pickup_latitude} 
            onChange={(e)=>setForm({...form, pickup_latitude:e.target.value})} 
          />
          <input 
            type="number" 
            step="any"
            className="bg-black/40 border border-white/10 rounded px-3 py-2" 
            placeholder="Longitude" 
            value={form.pickup_longitude} 
            onChange={(e)=>setForm({...form, pickup_longitude:e.target.value})} 
          />
        </div>
        <button 
          disabled={loading} 
          className="px-4 py-2 rounded bg-brand-500 hover:bg-brand-600 disabled:opacity-60 w-full"
        >
          {loading ? 'Uploading...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
}

