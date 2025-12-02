import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { aiAPI, propertyAPI } from '../services/api';
import toast from 'react-hot-toast';
import UsageBadge from '../components/UsageBadge';
import { SparklesIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon, HomeIcon, CurrencyDollarIcon, MapPinIcon, WrenchScrewdriverIcon, BookmarkIcon, DocumentTextIcon, TagIcon, ClockIcon } from '@heroicons/react/24/outline';

// --- Helper Components ---

const StatCard = ({ label, value, limit, icon: Icon }) => (
  <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700">
    <Icon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
    <p className="text-sm text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-white">
      {value} <span className="text-base font-normal text-slate-300">/ {limit}</span>
    </p>
  </div>
);

const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors">
      {copied ? <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
    </button>
  );
};

const SkeletonLoader = () => (
  <div className="space-y-8 animate-pulse">
    {/* Title skeleton */}
    <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6 rounded-2xl border border-slate-600/30">
      <div className="h-6 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg w-24 mb-3"></div>
      <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg w-3/4"></div>
    </div>

    {/* Description skeleton */}
    <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6 rounded-2xl border border-slate-600/30">
      <div className="h-6 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-full"></div>
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-5/6"></div>
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-4/5"></div>
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-3/4"></div>
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-2/3"></div>
      </div>
    </div>

    {/* Bottom grid skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6 rounded-2xl border border-slate-600/30">
        <div className="h-6 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg w-28 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-2/3"></div>
          <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-1/2"></div>
          <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-3/5"></div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6 rounded-2xl border border-slate-600/30">
        <div className="h-6 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg w-32 mb-4"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full w-20"></div>
          <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full w-16"></div>
          <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full w-24"></div>
          <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full w-18"></div>
          <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full w-22"></div>
        </div>
      </div>
    </div>
  </div>
);


// --- Main Page Component ---

const AIGeneratorPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    beds: '3',
    baths: '2',
    propertyType: 'House',
    suburb: 'Sandton',
    province: 'Gauteng',
    price: '2500000',
    amenities: 'Pool, Garden, Garage, Air Conditioning, Pet Friendly',
  });
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await aiAPI.getHistory();
      setHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGenerated(null);
    try {
      const response = await aiAPI.generate(formData);
      setGenerated(response.data);
      setUsage(response.usage);
      toast.success('Content generated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred.';
      
      // Handle 402 - limit exceeded
      if (error.response?.status === 402) {
        navigate('/billing?intent=upgrade&reason=limit');
        return;
      }
      
      toast.error(errorMessage);
      if (error.response?.data?.usage) {
        setUsage(error.response.data.usage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generated) return;
    try {
      const saveData = {
        ...generated,
        ...formData
      };
      const response = await propertyAPI.saveListing(saveData);
      if (response.success) {
        toast.success('Listing saved successfully!');
      } else {
        toast.error(response.error || 'Failed to save listing');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while saving.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-2xl shadow-2xl">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 text-transparent bg-clip-text mb-2">
                AI Listing Studio
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full mx-auto" />
            </div>
          </div>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Generate compelling property listings in seconds with AI-powered content creation.
            <span className="block mt-2 text-purple-400 font-semibold">
              Current Plan: <span className="text-white">{user?.plan || 'free'}</span>
            </span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Usage */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
              {/* Form background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />

              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                    <HomeIcon className="w-6 h-6 text-white" />
                  </div>
                  Property Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Property Specs Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Property Specs</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <input
                          type="number"
                          name="beds"
                          value={formData.beds}
                          onChange={handleChange}
                          className="input-dark text-center font-semibold"
                          placeholder="3"
                          min="1"
                        />
                        <p className="text-xs text-slate-400 text-center font-medium">Bedrooms</p>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="number"
                          name="baths"
                          value={formData.baths}
                          onChange={handleChange}
                          className="input-dark text-center font-semibold"
                          placeholder="2"
                          min="1"
                        />
                        <p className="text-xs text-slate-400 text-center font-medium">Bathrooms</p>
                      </div>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <HomeIcon className="w-4 h-4 text-purple-400" />
                      Property Type
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="input-dark"
                    >
                      <option value="House">🏠 House</option>
                      <option value="Apartment">🏢 Apartment</option>
                      <option value="Townhouse">🏘️ Townhouse</option>
                      <option value="Duplex">🏠 Duplex</option>
                      <option value="Villa">🏰 Villa</option>
                      <option value="Cottage">🏕️ Cottage</option>
                      <option value="Condo">🏙️ Condo</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-purple-400" />
                      Location
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="suburb"
                          value={formData.suburb}
                          onChange={handleChange}
                          className="input-dark"
                          placeholder="e.g., Sandton"
                        />
                        <p className="text-xs text-slate-400 font-medium">Suburb</p>
                      </div>
                      <div className="space-y-2">
                        <select
                          name="province"
                          value={formData.province}
                          onChange={handleChange}
                          className="input-dark"
                        >
                          <option value="Gauteng">Gauteng</option>
                          <option value="Western Cape">Western Cape</option>
                          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                          <option value="Eastern Cape">Eastern Cape</option>
                          <option value="Limpopo">Limpopo</option>
                          <option value="Mpumalanga">Mpumalanga</option>
                          <option value="North West">North West</option>
                          <option value="Northern Cape">Northern Cape</option>
                          <option value="Free State">Free State</option>
                        </select>
                        <p className="text-xs text-slate-400 font-medium">Province</p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-purple-400" />
                      Price (ZAR)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="input-dark text-lg font-semibold"
                      placeholder="e.g., 2500000"
                      min="0"
                    />
                  </div>

                  {/* Amenities */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <WrenchScrewdriverIcon className="w-4 h-4 text-purple-400" />
                      Key Amenities
                    </label>
                    <textarea
                      name="amenities"
                      value={formData.amenities}
                      onChange={handleChange}
                      rows="4"
                      className="input-dark resize-none"
                      placeholder="Comma-separated, e.g., Pool, Garden, Garage, Security"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary-gradient w-full flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 group"
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-6 h-6 group-hover:animate-pulse" />
                        <span>Generate Listing</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            {usage && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                  <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    Usage This Month
                  </h3>
                  <UsageBadge
                    used={usage.count}
                    limit={usage.limit}
                    label="AI Generations"
                    compact={false}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <StatCard
                      label="Used"
                      value={usage.count}
                      limit={usage.limit}
                      icon={SparklesIcon}
                    />
                    <StatCard
                      label="Remaining"
                      value={usage.limit - usage.count}
                      limit={usage.limit}
                      icon={HomeIcon}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl min-h-[600px] relative overflow-hidden">
              {/* Output background decoration */}
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                      <DocumentTextIcon className="w-6 h-6 text-white" />
                    </div>
                    Generated Content
                  </h2>
                  {generated && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="bg-slate-700/80 hover:bg-slate-600/80 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-slate-600/50"
                      >
                        <ClockIcon className="w-4 h-4" />
                        {showHistory ? 'Hide' : 'Show'} History ({history.length})
                      </button>
                      <button
                        onClick={handleSave}
                        className="btn-primary-gradient px-6 py-2 rounded-xl font-semibold text-black hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
                      >
                        <BookmarkIcon className="w-5 h-5" />
                        Save Listing
                      </button>
                    </div>
                  )}
                </div>

                {loading && <SkeletonLoader />}

                {!loading && !generated && (
                  <div className="text-center p-12 text-slate-400">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full blur-xl opacity-30" />
                      <div className="relative bg-gradient-to-r from-purple-500/20 to-violet-600/20 p-6 rounded-2xl border border-purple-500/30">
                        <SparklesIcon className="w-20 h-20 mx-auto text-purple-400 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Ready to Generate</h3>
                    <p className="text-lg">Fill out the form and click Generate to create your AI-powered property listing!</p>
                  </div>
                )}

                {generated && (
                  <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    {/* Title Section */}
                    <div className="relative bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 shadow-lg group hover:shadow-purple-500/10 transition-all duration-300">
                      <div className="absolute top-4 right-4">
                        <CopyButton textToCopy={generated.title} />
                      </div>
                      <h3 className="font-bold text-purple-300 mb-3 flex items-center gap-2 text-lg">
                        <HomeIcon className="w-5 h-5 text-purple-400" />
                        Title
                      </h3>
                      <p className="text-white text-xl font-semibold leading-relaxed">{generated.title}</p>
                    </div>

                    {/* Description Section */}
                    <div className="relative bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 shadow-lg group hover:shadow-purple-500/10 transition-all duration-300">
                      <div className="absolute top-4 right-4">
                        <CopyButton textToCopy={generated.description} />
                      </div>
                      <h3 className="font-bold text-purple-300 mb-4 flex items-center gap-2 text-lg">
                        <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                        Description
                      </h3>
                      <p className="text-slate-200 whitespace-pre-wrap text-base leading-relaxed">{generated.description}</p>
                    </div>

                    {/* Bottom Grid: Amenities and Keywords */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Amenities */}
                      <div className="relative bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 shadow-lg group hover:shadow-purple-500/10 transition-all duration-300">
                        <div className="absolute top-4 right-4">
                          <CopyButton textToCopy={generated.amenities.join('\n')} />
                        </div>
                        <h3 className="font-bold text-purple-300 mb-4 flex items-center gap-2 text-lg">
                          <WrenchScrewdriverIcon className="w-5 h-5 text-purple-400" />
                          Amenities
                        </h3>
                        <ul className="space-y-2">
                          {generated.amenities.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-200">
                              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* SEO Keywords */}
                      <div className="relative bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/50 shadow-lg group hover:shadow-purple-500/10 transition-all duration-300">
                        <div className="absolute top-4 right-4">
                          <CopyButton textToCopy={generated.keywords.join(', ')} />
                        </div>
                        <h3 className="font-bold text-purple-300 mb-4 flex items-center gap-2 text-lg">
                          <TagIcon className="w-5 h-5 text-purple-400" />
                          SEO Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {generated.keywords.map((item, i) => (
                            <span
                              key={i}
                              className="bg-gradient-to-r from-purple-500/20 to-violet-600/20 text-purple-200 text-sm px-4 py-2 rounded-full border border-purple-500/30 font-medium hover:from-purple-500/30 hover:to-violet-600/30 transition-all duration-200"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* History Section */}
                {showHistory && history.length > 0 && (
                  <div className="mt-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent flex-1" />
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 px-4">
                        <ClockIcon className="w-5 h-5 text-purple-400" />
                        Generation History
                      </h3>
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent flex-1" />
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                      {history.map((item, index) => (
                        <div
                          key={item._id}
                          className="bg-gradient-to-r from-slate-900/60 to-slate-800/60 backdrop-blur-sm p-5 rounded-xl border border-slate-600/30 shadow-lg hover:shadow-purple-500/5 transition-all duration-200 group"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-sm text-slate-400 font-medium">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                            <button
                              onClick={() => setGenerated(item.output)}
                              className="text-purple-400 hover:text-purple-300 text-sm font-medium px-3 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-200"
                            >
                              Load This
                            </button>
                          </div>
                          <p className="font-bold text-purple-300 text-lg mb-2">{item.output.title}</p>
                          <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed mb-3">{item.output.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <HomeIcon className="w-3 h-3" />
                              {item.input.beds} beds, {item.input.baths} baths
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              {item.input.suburb}
                            </span>
                            <span className="flex items-center gap-1">
                              <CurrencyDollarIcon className="w-3 h-3" />
                              R{item.input.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorPage;
