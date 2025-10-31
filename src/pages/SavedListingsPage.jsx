import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { propertyAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, EyeIcon, HomeIcon } from '@heroicons/react/24/outline';

const SavedListingsPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchSavedListings();
  }, []);

  const fetchSavedListings = async () => {
    try {
      const response = await propertyAPI.getSavedListings();
      setListings(response.data || []);
    } catch (error) {
      toast.error('Failed to load saved listings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing) => {
    setEditing(listing._id);
    setEditData({ ...listing });
  };

  const handleSaveEdit = async () => {
    try {
      await propertiesAPI.update(editing, editData);
      toast.success('Listing updated successfully!');
      setEditing(null);
      fetchSavedListings();
    } catch (error) {
      toast.error('Failed to update listing');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this saved listing?')) return;
    try {
      await propertiesAPI.delete(id);
      toast.success('Listing deleted successfully!');
      fetchSavedListings();
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading saved listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HomeIcon className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-violet-600 text-transparent bg-clip-text">
              Saved Listings
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Manage your saved property listings. You can edit, publish, or delete them.
          </p>
        </header>

        {listings.length === 0 ? (
          <div className="text-center p-10 text-slate-500">
            <HomeIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-lg">No saved listings yet.</p>
            <p className="text-sm mt-2">Generate and save listings from the AI Studio!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing._id} className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 shadow-xl">
                {editing === listing._id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="input-dark w-full"
                      placeholder="Property name"
                    />
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows="4"
                      className="input-dark w-full"
                      placeholder="Description"
                    />
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="input-dark w-full"
                      placeholder="Address"
                    />
                    <input
                      type="number"
                      value={editData.price_per_night}
                      onChange={(e) => setEditData({ ...editData, price_per_night: e.target.value })}
                      className="input-dark w-full"
                      placeholder="Price per night"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="btn-primary-gradient px-4 py-2 rounded-lg font-semibold text-black">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-lg">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{listing.name}</h3>
                    <p className="text-slate-300 mb-2">{listing.address}</p>
                    <p className="text-purple-400 font-semibold mb-4">R{listing.price_per_night} / night</p>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">{listing.description}</p>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => handleEdit(listing)} className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm flex items-center gap-1">
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(listing._id)} className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg text-sm flex items-center gap-1">
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedListingsPage;