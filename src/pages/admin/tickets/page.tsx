import { useState, useEffect } from 'react';
import supabase from '@/hooks/useSupabase';

interface Ticket {
  id: string;
  event_id: string;
  name: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  is_active: boolean;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
}

interface TicketWithEvent extends Ticket {
  event?: Event;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketWithEvent | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form state
  const [formData, setFormData] = useState({
    event_id: '',
    name: '',
    price: 0,
    quantity_available: 0,
  });

  useEffect(() => {
    fetchTickets();
    fetchEvents();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select(`
          *,
          event:event_id (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []) as TicketWithEvent[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('title', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.event_id || !formData.name || formData.quantity_available <= 0) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingTicket) {
        // Update existing ticket
        const { error } = await supabase
          .from('ticket_types')
          .update({
            name: formData.name,
            price: formData.price,
            quantity_available: formData.quantity_available,
          })
          .eq('id', editingTicket.id);

        if (error) throw error;
        alert('Ticket updated successfully');
      } else {
        // Create new ticket
        const { error } = await supabase
          .from('ticket_types')
          .insert({
            event_id: formData.event_id,
            name: formData.name,
            price: formData.price,
            quantity_available: formData.quantity_available,
            is_active: true,
          });

        if (error) throw error;
        alert('Ticket created successfully');
      }

      // Reset form and refetch
      setFormData({ event_id: '', name: '', price: 0, quantity_available: 0 });
      setEditingTicket(null);
      setShowForm(false);
      fetchTickets();
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  const handleEdit = (ticket: TicketWithEvent) => {
    setEditingTicket(ticket);
    setFormData({
      event_id: ticket.event_id,
      name: ticket.name,
      price: ticket.price,
      quantity_available: ticket.quantity_available,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (ticket: TicketWithEvent) => {
    try {
      const { error } = await supabase
        .from('ticket_types')
        .update({ is_active: !ticket.is_active })
        .eq('id', ticket.id);

      if (error) throw error;
      fetchTickets();
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  const handleDelete = async (ticket: TicketWithEvent) => {
    if (!confirm(`Delete ticket "${ticket.name}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', ticket.id);

      if (error) throw error;
      alert('Ticket deleted successfully');
      fetchTickets();
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'active') return ticket.is_active;
    if (filter === 'inactive') return !ticket.is_active;
    return true;
  });

  const totalRevenue = filteredTickets.reduce((sum, ticket) => {
    return sum + (ticket.price * ticket.quantity_sold);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-xl md:text-2xl text-foreground-50">Ticket Management</h1>
        <p className="text-sm text-foreground-500 mt-1">Create and manage event tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Tickets', value: tickets.length },
          { label: 'Active', value: tickets.filter((t) => t.is_active).length },
          { label: 'Total Sold', value: tickets.reduce((sum, t) => sum + t.quantity_sold, 0) },
          { label: 'Revenue', value: `KES ${totalRevenue.toLocaleString()}` },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs text-foreground-500">{stat.label}</p>
            <p className="text-2xl font-heading font-bold text-foreground-50 mt-1">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Create Button */}
      <button
        onClick={() => {
          setEditingTicket(null);
          setFormData({ event_id: '', name: '', price: 0, quantity_available: 0 });
          setShowForm(!showForm);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
      >
        <i className="ri-add-line" />
        {showForm ? 'Cancel' : 'New Ticket'}
      </button>

      {/* Form */}
      {showForm && (
        <div className="card p-5 space-y-4">
          <h3 className="font-heading font-semibold text-foreground-50">
            {editingTicket ? 'Edit Ticket' : 'Create New Ticket'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground-300 mb-1.5">Event *</label>
                <select
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-300 mb-1.5">Ticket Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., General Admission"
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-300 mb-1.5">Price (KES) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-300 mb-1.5">Quantity Available *</label>
                <input
                  type="number"
                  value={formData.quantity_available}
                  onChange={(e) => setFormData({ ...formData, quantity_available: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                {editingTicket ? 'Update Ticket' : 'Create Ticket'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-md border border-background-300/60 text-foreground-400 text-sm font-medium hover:text-foreground-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-primary-500 text-background-50'
                : 'bg-background-100 text-foreground-400 hover:text-foreground-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-background-200" />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-foreground-500">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const sellPercent = ticket.quantity_available > 0
              ? Math.round((ticket.quantity_sold / ticket.quantity_available) * 100)
              : 0;

            return (
              <div key={ticket.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-heading font-semibold text-foreground-50 truncate">{ticket.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                        ticket.is_active
                          ? 'bg-primary-500/15 text-primary-400'
                          : 'bg-foreground-500/15 text-foreground-400'
                      }`}>
                        {ticket.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-500">{ticket.event?.title || 'Unknown Event'}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-heading font-bold text-primary-400">
                      KES {ticket.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-foreground-500">{ticket.quantity_sold}/{ticket.quantity_available} sold</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-foreground-500">Sales Progress</span>
                    <span className="text-xs font-medium text-foreground-400">{sellPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-background-300/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${sellPercent}%` }}
                    />
                  </div>
                </div>

                {/* Revenue */}
                <div className="mt-3 pt-3 border-t border-background-300/30">
                  <p className="text-xs text-foreground-500">
                    Revenue: <span className="font-medium text-foreground-300">
                      KES {(ticket.price * ticket.quantity_sold).toLocaleString()}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(ticket)}
                    className="flex-1 px-3 py-1.5 rounded-md bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors text-xs font-medium"
                  >
                    <i className="ri-edit-line mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(ticket)}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      ticket.is_active
                        ? 'bg-accent-500/10 text-accent-400 hover:bg-accent-500/20'
                        : 'bg-secondary-500/10 text-secondary-400 hover:bg-secondary-500/20'
                    }`}
                  >
                    <i className={`ri-${ticket.is_active ? 'close' : 'check'}-line mr-1`} />
                    {ticket.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(ticket)}
                    className="flex-1 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
                  >
                    <i className="ri-delete-line mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
