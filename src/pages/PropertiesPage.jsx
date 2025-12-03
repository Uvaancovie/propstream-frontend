import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    description: '',
    price_per_night: '',
    max_guests: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
    houseRules: '',
    images: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      const propertyData = response.data.properties || [];
      setProperties(Array.isArray(propertyData) ? propertyData : []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      province: '',
      description: '',
      price_per_night: '',
      max_guests: '',
      bedrooms: '',
      bathrooms: '',
      amenities: '',
      houseRules: '',
      images: ''
    });
  };

  // format as ZAR
  const formatZAR = (value) => {
    const num = Number(value) || 0;
    return 'R' + num.toLocaleString('en-ZA', { maximumFractionDigits: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting property formData:', formData);

    try {
      const required = ['name', 'description', 'address', 'city', 'province', 'price_per_night', 'bedrooms', 'bathrooms', 'max_guests'];
      for (const key of required) {
        const val = formData[key];
        if (val === undefined || val === null || String(val).trim() === '') {
          throw new Error(`Please provide a valid value for ${key.replace(/_/g, ' ')}`);
        }
      }

      const propertyData = {
        name: String(formData.name).trim(),
        description: String(formData.description).trim(),
        address: String(formData.address).trim(),
        city: String(formData.city).trim(),
        province: String(formData.province).trim(),
        price_per_night: Number(formData.price_per_night) || 0,
        bedrooms: parseInt(formData.bedrooms, 10) || 1,
        bathrooms: parseFloat(formData.bathrooms) || 1,
        max_guests: parseInt(formData.max_guests, 10) || 1,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
        images: formData.images ? formData.images.split(',').map(i => i.trim()).filter(i => i) : []
      };

      console.log('Sending property data:', propertyData);

      if (selectedProperty) {
        await api.put(`/properties/${selectedProperty._id}`, propertyData);
      } else {
        await api.post('/properties', propertyData);
      }

      setShowModal(false);
      setSelectedProperty(null);
      resetForm();
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      const serverMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message;
      try {
        const toast = (await import('react-hot-toast')).default;
        toast.error(String(serverMessage));
      } catch (e) {
        alert(String(serverMessage));
      }
    }
  };

  const handleEdit = (property) => {
    navigate(`/properties/edit/${property._id}`);
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/properties/${propertyId}`);
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="mt-2 text-gray-600">Manage your rental properties and listings</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchProperties} className="btn bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg p-2">
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          <button onClick={() => navigate('/properties/add')} className="btn bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200">Add Property</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <CurrencyDollarIcon className="w-8 h-8 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue/Night</p>
              <p className="text-3xl font-bold text-gray-900">{formatZAR(properties.reduce((sum, p) => sum + (Number(p.price_per_night) || 0), 0))}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <UserGroupIcon className="w-8 h-8 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Capacity</p>
              <p className="text-3xl font-bold text-gray-900">{properties.reduce((sum, p) => sum + (Number(p.max_guests) || 0), 0)} guests</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 shadow-sm">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
              <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Price/Night</p>
              <p className="text-3xl font-bold text-gray-900">{formatZAR(properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + (Number(p.price_per_night) || 0), 0) / properties.length) : 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property._id} className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col transform hover:-translate-y-1">
            <div className="relative overflow-hidden">
              <img src={(property.images && property.images[0]) || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'} alt={property.name} className="w-full h-64 object-cover" />
              <div className="absolute top-3 right-3 bg-white bg-opacity-95 backdrop-blur-sm text-blue-700 font-bold px-3 py-2 rounded-full text-sm shadow-lg border">{formatZAR(property.price_per_night || 0)}<span className="text-xs text-gray-600 block">per night</span></div>
              <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">{property.bedrooms || 0}BR • {property.bathrooms || 0}BA</div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-3">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{property.name}</h3>
                <div className="flex items-center text-gray-600 mb-3"><MapPinIcon className="w-4 h-4 mr-2 text-blue-500" /> <span className="text-sm">{property.address}, {property.city}</span></div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{property.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center"><UserGroupIcon className="w-5 h-5 mx-auto text-blue-500 mb-1" /><span className="text-sm font-semibold text-gray-700">{property.max_guests || 0} Guests</span></div>
                <div className="text-center"><BuildingOfficeIcon className="w-5 h-5 mx-auto text-green-500 mb-1" /><span className="text-sm font-semibold text-gray-700">{property.bedrooms || 0} Bedrooms</span></div>
              </div>

              <div className="flex space-x-2 pt-4 border-t mt-auto">
                <button onClick={() => handleEdit(property)} className="flex-1 btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"><PencilIcon className="w-4 h-4 mr-1" />Edit</button>
                <button onClick={() => handleDelete(property._id)} className="btn bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg" title="Delete Property"><TrashIcon className="w-4 h-4" /></button>
                <button className="btn bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg" title="View Property"><EyeIcon className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-xl flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">{selectedProperty ? 'Edit Property' : 'Add Property'}</h2>
              <p className="text-blue-100 mt-1">{selectedProperty ? 'Update your property details' : 'Create a new property'}</p>
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-white hover:text-blue-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" /> Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
                      <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><MapPinIcon className="w-5 h-5 mr-2 text-blue-600" /> Property Details</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price/Night (R) *</label>
                      <input type="number" required min="0" step="0.01" className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg" value={formData.price_per_night} onChange={(e) => setFormData({...formData, price_per_night: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests *</label>
                      <input type="number" required min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={formData.max_guests} onChange={(e) => setFormData({...formData, max_guests: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
                      <input type="number" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label>
                      <input type="number" required min="0" step="0.5" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={formData.amenities} onChange={(e) => setFormData({...formData, amenities: e.target.value})} placeholder="WiFi, Pool, Parking" />

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={formData.images} onChange={(e) => setFormData({...formData, images: e.target.value})} placeholder="https://... , https://..." />
                  </div>
                </div>

                <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
                  <div className="flex space-x-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white">Cancel</button>
                    <button type="submit" className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg">{selectedProperty ? 'Update Property' : 'Create Property'}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
