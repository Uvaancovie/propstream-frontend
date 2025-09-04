import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseExample = () => {
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWaitlistEntries();
  }, []);

  const fetchWaitlistEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setWaitlistEntries(data || []);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWaitlist = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: newEmail,
            source: 'example_component',
          }
        ])
        .select();

      if (error) throw error;
      
      setNewEmail('');
      await fetchWaitlistEntries(); // Refresh the list
      alert('Successfully added to waitlist!');
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Supabase Waitlist Example</h2>
      
      {/* Add to waitlist form */}
      <form onSubmit={addToWaitlist} className="mb-6">
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add to Waitlist'}
          </button>
        </div>
      </form>

      {/* Waitlist entries */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Recent Waitlist Entries</h3>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : waitlistEntries.length > 0 ? (
          <ul className="space-y-2">
            {waitlistEntries.map((entry) => (
              <li key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-800">{entry.email}</span>
                <span className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No entries yet.</p>
        )}
      </div>
    </div>
  );
};

export default SupabaseExample;
