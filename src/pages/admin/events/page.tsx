import { useState, useEffect } from 'react';
import supabase from '@/hooks/useSupabase';

const tabs = ['All', 'Upcoming', 'Ongoing', 'Past', 'Cancelled'];

interface TicketTier { name: string; price: number; description: string; capacity: number }
interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  end_date: string;
  time: string;
  venue: string;
  venue_address: string;
  status: string;
  total_capacity: number;
  tickets_sold: number;
  organizer_id: string;
  description: string;
  cover_image: string;
  ticket_tiers: TicketTier[];
}

const emptyTier: TicketTier = { name: '', price: 0, description: '', capacity: 0 };
const emptyForm = {
  title: '', date: '', endDate: '', time: '14:00', venue: '', venueAddress: '', totalCapacity: '', organizerId: '',
  status: 'upcoming', description: '', cover_image: '',
};

export default function AdminEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tiers, setTiers] = useState<TicketTier[]>([{ ...emptyTier }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('start_date', { ascending: false });
    setEvents(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchEvents(); }, []);

  const filtered = events
    .filter((ev) => activeTab === 'All' || ev.status === activeTab.toLowerCase())
    .filter((ev) => ev.title.toLowerCase().includes(search.toLowerCase()));

  const totalSold = filtered.reduce((sum, ev) => sum + (ev.tickets_sold ?? 0), 0);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(): Promise<string> {
    if (!imageFile) return form.cover_image;
    setUploading(true);
    const ext = imageFile.name.split('.').pop();
    const path = `events/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('content').upload(path, imageFile, { upsert: true });
    setUploading(false);
    if (upErr) throw new Error(upErr.message);
    const { data } = supabase.storage.from('content').getPublicUrl(path);
    return data.publicUrl;
  }

  function updateTier(index: number, field: keyof TicketTier, value: string | number) {
    setTiers((prev) => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (tiers.some((t) => !t.name || !t.price)) { setError('All ticket tiers need a name and price.'); return; }
    setSaving(true);
    setError('');
    let coverUrl = form.cover_image;
    try { coverUrl = await uploadImage(); } catch (e: unknown) { setError((e as Error).message); setSaving(false); return; }
    
    // Generate slug from title
    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    const { error: err } = await supabase.from('events').insert({
      title: form.title,
      slug: slug,
      date: form.date,
      start_date: new Date(form.date).toISOString(),
      end_date: new Date(form.endDate || form.date).toISOString(),
      time: form.time,
      venue: form.venue,
      venue_address: form.venueAddress,
      total_capacity: form.totalCapacity ? Number(form.totalCapacity) : 0,
      status: form.status,
      description: form.description,
      cover_image: coverUrl,
      tickets_sold: 0,
      ticket_tiers: tiers.map((t) => ({ ...t, price: Number(t.price), capacity: Number(t.capacity) })),
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowModal(false);
    setForm(emptyForm);
    setTiers([{ ...emptyTier }]);
    setImageFile(null);
    setImagePreview('');
    fetchEvents();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl md:text-2xl text-foreground-50">Events & Tickets</h1>
          <p className="text-sm text-foreground-500 mt-1">Create, manage events, and track ticket sales.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm whitespace-nowrap">
          <i className="ri-add-line mr-2" />Create Event
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Total Events', value: filtered.length },
          { label: 'Tickets Sold', value: totalSold.toLocaleString() },
          { label: 'Avg. Fill Rate', value: filtered.length > 0 && filtered.reduce((s, e) => s + e.total_capacity, 0) > 0 ? `${Math.round((totalSold / filtered.reduce((s, e) => s + e.total_capacity, 0)) * 100)}%` : '0%' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-foreground-500">{s.label}</p>
            <p className="text-xl font-heading font-bold text-foreground-50">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-400 hover:text-foreground-200'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-500 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-background-200" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ev) => (
            <div key={ev.id} className="card p-4 space-y-3">
              {ev.cover_image && (
                <img src={ev.cover_image} alt={ev.title} className="w-full h-32 object-cover rounded-md" />
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm text-foreground-50 truncate">{ev.title}</h3>
                  <p className="text-xs text-foreground-500 mt-0.5">{ev.venue}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2 ${
                  ev.status === 'upcoming' ? 'bg-primary-500/15 text-primary-400' :
                  ev.status === 'ongoing' ? 'bg-green-500/15 text-green-400' :
                  ev.status === 'past' ? 'bg-foreground-500/15 text-foreground-400' :
                  'bg-accent-500/15 text-accent-400'}`}>
                  {ev.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-foreground-500">
                <span><i className="ri-calendar-line mr-1" />{new Date(ev.start_date).toLocaleDateString()}</span>
                {ev.time && <span><i className="ri-time-line mr-1" />{ev.time}</span>}
              </div>
              {ev.ticket_tiers?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ev.ticket_tiers.map((t) => (
                    <span key={t.name} className="text-[10px] px-2 py-0.5 rounded-full bg-background-200 text-foreground-400">
                      {t.name}: KSh {Number(t.price).toLocaleString()}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-400">{ev.tickets_sold ?? 0}/{ev.total_capacity} tickets</span>
                <button onClick={() => handleDelete(ev.id)}
                  className="text-foreground-600 hover:text-accent-400 transition-colors">
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
              <div className="h-1.5 rounded-full bg-background-200 overflow-hidden">
                <div className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${Math.min(((ev.tickets_sold ?? 0) / ev.total_capacity) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-foreground-600 col-span-3 text-center py-8">No events found.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 overflow-hidden">
          <div className="bg-background-100 rounded-t-xl md:rounded-xl border border-background-300/40 w-full md:max-w-2xl h-[95vh] md:max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-background-300/30 flex-shrink-0">
              <h2 className="font-heading font-semibold text-foreground-50">Create Event</h2>
              <button onClick={() => setShowModal(false)} className="text-foreground-500 hover:text-foreground-200">
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto flex-1">
              {error && <p className="text-sm text-accent-400 bg-accent-500/10 border border-accent-500/30 rounded-md p-3">{error}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'title', label: 'Event Title', type: 'text', full: true },
                  { id: 'date', label: 'Start Date', type: 'date', required: true },
                  { id: 'endDate', label: 'End Date (optional)', type: 'date', required: false },
                  { id: 'time', label: 'Time', type: 'time' },
                  { id: 'venue', label: 'Venue Name', type: 'text' },
                  { id: 'venueAddress', label: 'Venue Address', type: 'text' },
                  { id: 'totalCapacity', label: 'Total Capacity (optional)', type: 'number', required: false },
                ].map((field) => (
                  <div key={field.id} className={field.full ? 'sm:col-span-2' : ''}>
                    <label htmlFor={field.id} className="block text-sm text-foreground-300 mb-1.5">{field.label}</label>
                    <input id={field.id} type={field.type} required={field.required !== false}
                      value={form[field.id as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" />
                  </div>
                ))}

                {/* Cover Image Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-foreground-300 mb-1.5">Cover Image</label>
                  <label className="flex items-center gap-3 cursor-pointer w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 border-dashed hover:border-primary-500 transition-colors">
                    <i className="ri-upload-cloud-line text-foreground-400 text-lg" />
                    <span className="text-sm text-foreground-400">{imageFile ? imageFile.name : 'Click to upload event poster'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  {imagePreview && (
                    <div className="mt-2 relative w-full h-20">
                      <img src={imagePreview} alt="Preview" className="w-full h-20 object-cover rounded-md" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-accent-500 transition-colors">
                        <i className="ri-close-line text-sm" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="event-status" className="block text-sm text-foreground-300 mb-1.5">Status</label>
                  <select id="event-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500">
                    {['upcoming', 'ongoing', 'past', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="event-description" className="block text-sm text-foreground-300 mb-1.5">Description</label>
                <textarea id="event-description" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none" />
              </div>

              {/* Ticket Tiers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground-200">Ticket Tiers</label>
                  <button type="button" onClick={() => setTiers((prev) => [...prev, { ...emptyTier }])}
                    className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    <i className="ri-add-line" /> Add Tier
                  </button>
                </div>
                <div className="space-y-3">
                  {tiers.map((tier, i) => (
                    <div key={i} className="p-3 rounded-md bg-background-200 border border-background-300/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground-400">Tier {i + 1}</span>
                        {tiers.length > 1 && (
                          <button type="button" onClick={() => setTiers((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-foreground-600 hover:text-accent-400 transition-colors">
                            <i className="ri-close-line text-sm" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-foreground-400 mb-1">Name</label>
                          <input type="text" placeholder="e.g. General, VIP" value={tier.name}
                            onChange={(e) => updateTier(i, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-background-100 border border-background-300/60 text-xs text-foreground-50 focus:outline-none focus:border-primary-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground-400 mb-1">Price (KSh)</label>
                          <input type="number" placeholder="1500" value={tier.price || ''}
                            onChange={(e) => updateTier(i, 'price', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-background-100 border border-background-300/60 text-xs text-foreground-50 focus:outline-none focus:border-primary-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground-400 mb-1">Capacity</label>
                          <input type="number" placeholder="100" value={tier.capacity || ''}
                            onChange={(e) => updateTier(i, 'capacity', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-background-100 border border-background-300/60 text-xs text-foreground-50 focus:outline-none focus:border-primary-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-foreground-400 mb-1">Description</label>
                          <input type="text" placeholder="What's included" value={tier.description}
                            onChange={(e) => updateTier(i, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-background-100 border border-background-300/60 text-xs text-foreground-50 focus:outline-none focus:border-primary-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2 flex-shrink-0">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-md text-sm border border-background-300/60 text-foreground-400 hover:text-foreground-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploading} className="flex-1 btn-primary text-sm py-2">
                  {uploading ? 'Uploading...' : saving ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
