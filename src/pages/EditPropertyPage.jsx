import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { propertiesAPI, aiAPI, api } from '../services/api';
import { 
  PhotoIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowUpCircleIcon
} from '@heroicons/react/24/outline';

const EditPropertyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 8, totalRemaining: 8 });
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const pdfInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    province: '',
    price_per_night: '',
    bedrooms: '',
    bathrooms: '',
    max_guests: '',
    amenities: '',
    imageInputs: ['', '', ''],
    property_type: 'apartment',
    available_from: '',
    available_to: '',
    houseRules: '',
    rental_agreement: ''
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' }
  ];

  // Fetch property data on mount
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setFetching(true);
        const response = await api.get(`/properties/${id}`);
        const property = response.data.property;
        
        if (property) {
          // Convert images array to imageInputs format
          const images = Array.isArray(property.images) ? property.images : [];
          const imageInputs = ['', '', ''];
          images.slice(0, 3).forEach((img, idx) => {
            imageInputs[idx] = img || '';
          });

          setFormData({
            name: property.name || '',
            description: property.description || '',
            address: property.address || '',
            city: property.city || '',
            province: property.province || '',
            price_per_night: (property.price_per_night || '').toString(),
            bedrooms: (property.bedrooms || '').toString(),
            bathrooms: (property.bathrooms || '').toString(),
            max_guests: (property.max_guests || '').toString(),
            amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : (property.amenities || ''),
            imageInputs,
            property_type: property.property_type || 'apartment',
            available_from: property.available_from ? property.available_from.split('T')[0] : '',
            available_to: property.available_to ? property.available_to.split('T')[0] : '',
            houseRules: property.houseRules || '',
            rental_agreement: property.rental_agreement || ''
          });

          // Set PDF preview if rental agreement exists
          if (property.rental_agreement) {
            setPdfPreview('Existing Rental Agreement');
          }
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property');
        navigate('/properties');
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, navigate]);

  // Fetch AI usage on mount
  useEffect(() => {
    const fetchAiUsage = async () => {
      try {
        const usage = await aiAPI.getUsage();
        setAiUsage(usage);
      } catch (err) {
        console.error('Failed to fetch AI usage:', err);
      }
    };
    if (user?.role === 'realtor') {
      fetchAiUsage();
    }
  }, [user]);

  // AI Generate handler
  const handleAIGenerate = async () => {
    if (aiUsage.totalRemaining <= 0) {
      toast.error('AI generation limit reached. Please upgrade your plan.');
      return;
    }

    if (!formData.city || !formData.property_type) {
      toast.error('Please fill in at least City and Property Type to generate');
      return;
    }

    try {
      setAiGenerating(true);
      
      const payload = {
        beds: formData.bedrooms || '2',
        baths: formData.bathrooms || '1',
        propertyType: propertyTypes.find(t => t.value === formData.property_type)?.label || 'Apartment',
        suburb: formData.city,
        province: formData.province || 'South Africa',
        price: formData.price_per_night || '1500',
        amenities: formData.amenities || ''
      };

      const response = await aiAPI.generate(payload);
      
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          name: response.data.title || prev.name,
          description: response.data.description || prev.description,
          amenities: Array.isArray(response.data.amenities) 
            ? response.data.amenities.join(', ') 
            : prev.amenities
        }));

        if (response.usage) {
          setAiUsage(prev => ({
            ...prev,
            used: response.usage.count,
            totalRemaining: Math.max(0, (prev.limit || 8) - response.usage.count)
          }));
        }

        toast.success('AI generated your listing! Review and edit as needed.');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      if (error.response?.status === 402 || error.response?.status === 429) {
        toast.error('AI generation limit reached. Upgrade your plan for more.');
        setAiUsage(prev => ({ ...prev, totalRemaining: 0 }));
      } else {
        toast.error('Failed to generate listing. Please try again.');
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageInputChange = (index, value) => {
    setFormData(prev => {
      const nextImages = [...prev.imageInputs];
      nextImages[index] = value;
      return {
        ...prev,
        imageInputs: nextImages
      };
    });
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('PDF file must be less than 10MB');
      return;
    }

    setPdfFile(file);
    setPdfPreview(file.name);
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfPreview(null);
    setFormData(prev => ({ ...prev, rental_agreement: '' }));
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to edit a property');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'realtor') {
      toast.error('Only realtors can edit properties');
      return;
    }

    if (!formData.name || !formData.address || !formData.city || !formData.price_per_night) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      let rentalAgreementData = formData.rental_agreement || '';
      if (pdfFile) {
        try {
          rentalAgreementData = await fileToBase64(pdfFile);
        } catch (err) {
          toast.error('Failed to process PDF file');
          setLoading(false);
          return;
        }
      }
      
      const propertyData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        property_type: formData.property_type,
        price_per_night: parseFloat(formData.price_per_night) || 0,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        max_guests: parseInt(formData.max_guests) || 2,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
        images: formData.imageInputs ? formData.imageInputs.map(i => i.trim()).filter(i => i) : [],
        rental_agreement: rentalAgreementData,
        available_from: formData.available_from || null,
        available_to: formData.available_to || null,
        houseRules: formData.houseRules
      };

      console.log('🏠 Updating property data:', propertyData);
      
      const response = await api.put(`/properties/${id}`, propertyData);
      console.log('✅ Property update response:', response);
      
      toast.success('Property updated successfully!');
      navigate('/properties');
    } catch (error) {
      console.error('❌ Property update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (user?.role !== 'realtor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 mb-6">Only realtors can edit properties.</p>
          <button
            onClick={() => navigate('/browse')}
            className="btn-primary-gradient px-6 py-3 rounded-xl font-semibold"
          >
            Browse Properties Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-2xl shadow-2xl">
                <BuildingOfficeIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 text-transparent bg-clip-text mb-2">
                Edit Property
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full mx-auto" />
            </div>
          </div>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Update your property listing details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                    <HomeIcon className="w-6 h-6 text-white" />
                  </div>
                  Basic Information
                </h2>
                
                {/* AI Generate Button with Usage Badge */}
                <div className="flex flex-col items-end gap-2">
                  {aiUsage.totalRemaining > 0 ? (
                    <button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={aiGenerating}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-amber-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5" />
                          <span>Generate with AI</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to="/billing?intent=upgrade&reason=ai-limit"
                      className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200"
                    >
                      <ArrowUpCircleIcon className="w-5 h-5" />
                      <span>Upgrade to Pro</span>
                    </Link>
                  )}
                  
                  {/* Usage Badge */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`px-3 py-1 rounded-full ${
                      aiUsage.totalRemaining > 0 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      <span className="font-semibold">{aiUsage.used}/{aiUsage.limit}</span>
                      <span className="ml-1 opacity-80">AI generations used</span>
                    </div>
                  </div>
                </div>
              </div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Beautiful 2BR Apartment in City Center"
                    className="input-dark w-full text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Property Type *
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="input-dark w-full"
                    required
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-purple-400" />
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., 123 Main Street"
                    className="input-dark w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Cape Town"
                    className="input-dark w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="e.g., Western Cape"
                    className="input-dark w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your property, amenities, and what makes it special..."
                    className="input-dark w-full resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                Property Details
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="input-dark w-full text-center font-semibold text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    step="0.5"
                    className="input-dark w-full text-center font-semibold text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4 text-purple-400" />
                    Max Guests *
                  </label>
                  <input
                    type="number"
                    name="max_guests"
                    value={formData.max_guests}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="input-dark w-full text-center font-semibold text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-purple-400" />
                    Price/Night (R) *
                  </label>
                  <input
                    type="number"
                    name="price_per_night"
                    value={formData.price_per_night}
                    onChange={handleInputChange}
                    min="50"
                    step="50"
                    placeholder="1500"
                    className="input-dark w-full text-center font-semibold text-lg"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities & Images */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <PhotoIcon className="w-6 h-6 text-white" />
                </div>
                Amenities & Images
              </h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Amenities
                  </label>
                  <textarea
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g., WiFi, Swimming Pool, Parking, Kitchen, Air Conditioning..."
                    className="input-dark w-full resize-none"
                  />
                  <p className="text-sm text-slate-400 mt-2">Separate amenities with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-4">
                    Property Images (up to 3)
                  </label>
                  <div className="space-y-5">
                    {formData.imageInputs.map((url, index) => (
                      <div key={index} className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                          Image {index + 1}
                        </label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleImageInputChange(index, e.target.value)}
                          placeholder="https://example.com/property-image.jpg"
                          className="input-dark w-full"
                        />
                        {url && (
                          <div className="h-40 rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all duration-200">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 mt-4">
                    These photos will be shown on the public browse page so guests can preview your space.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Agreement */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                Rental Agreement
              </h2>

              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Upload Rental Agreement (PDF)
                  </label>
                  
                  {!pdfFile && !formData.rental_agreement ? (
                    <div 
                      onClick={() => pdfInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:bg-slate-800/50"
                    >
                      <CloudArrowUpIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">Click to upload PDF</p>
                      <p className="text-slate-400 text-sm">Maximum file size: 10MB</p>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-purple-500/30">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <DocumentTextIcon className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {pdfPreview || 'Rental Agreement'}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'Existing document'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removePdf}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-700"></div>
                  <span className="text-slate-500 text-sm">OR</span>
                  <div className="flex-1 h-px bg-slate-700"></div>
                </div>

                {/* URL Input (fallback) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    External Link (Google Drive, Dropbox, etc.)
                  </label>
                  <input
                    type="url"
                    name="rental_agreement"
                    value={pdfFile ? '' : formData.rental_agreement}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/file/d/..."
                    className="input-dark w-full"
                    disabled={!!pdfFile}
                  />
                  <p className="text-sm text-slate-400 mt-2">
                    If your PDF is larger than 10MB, upload it to a cloud service and paste the public link here.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-violet-500/10 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                Availability
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Available From
                  </label>
                  <input
                    type="date"
                    name="available_from"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    className="input-dark w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Available To
                  </label>
                  <input
                    type="date"
                    name="available_to"
                    value={formData.available_to}
                    onChange={handleInputChange}
                    className="input-dark w-full"
                    min={formData.available_from || ''}
                  />
                </div>
              </div>

              <p className="text-sm text-slate-400 mt-4">
                Leave blank for ongoing availability
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between gap-6 pt-6">
            <button
              type="button"
              onClick={() => navigate('/properties')}
              className="flex-1 bg-slate-700/80 hover:bg-slate-600/80 backdrop-blur-sm px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all duration-200 border border-slate-600/50"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 btn-primary-gradient px-8 py-4 rounded-xl text-lg font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Property...</span>
                </>
              ) : (
                <>
                  <BuildingOfficeIcon className="w-6 h-6" />
                  <span>Update Property</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyPage;
