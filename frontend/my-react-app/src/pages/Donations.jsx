import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DonationCard from '../components/DonationCard.jsx';
import { toast } from 'react-hot-toast';

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await api.get('/donations');
    setDonations(data?.donations || data || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.post('/donations', { title });
      toast.success('Donation recorded');
      setTitle('');
      load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">Donations</h1>

      <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-2">
        <input className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2" placeholder="Donation title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <button disabled={loading} className="px-4 py-2 rounded bg-brand-500 hover:bg-brand-600">Add</button>
      </form>

      <div className="grid grid-cols-1 gap-3">
        {donations.map((d) => (
          <DonationCard key={d.id} donation={d} />
        ))}
      </div>
    </div>
  );
}

