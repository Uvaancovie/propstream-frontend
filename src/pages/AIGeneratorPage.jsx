import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI, propertyAPI } from '../services/api';
import toast from 'react-hot-toast';
import { SparklesIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon, HomeIcon, CurrencyDollarIcon, MapPinIcon, WrenchScrewdriverIcon, BookmarkIcon } from '@heroicons/react/24/outline';

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
  <div className="space-y-4">
    <div className="h-6 bg-slate-700 rounded animate-pulse"></div>
    <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
    <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
    <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SparklesIcon className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-violet-600 text-transparent bg-clip-text">
              AI Listing Studio
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Generate compelling property listings in seconds. Your current plan is <span className="font-semibold text-purple-400">{user?.plan || 'free'}</span>.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Usage */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <HomeIcon className="w-5 h-5 text-purple-400" />
                Property Details
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Property Specs</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input type="number" name="beds" value={formData.beds} onChange={handleChange} className="input-dark w-full" placeholder="3" min="1" />
                      <p className="text-xs text-slate-500 mt-1">Bedrooms</p>
                    </div>
                    <div className="flex-1">
                      <input type="number" name="baths" value={formData.baths} onChange={handleChange} className="input-dark w-full" placeholder="2" min="1" />
                      <p className="text-xs text-slate-500 mt-1">Bathrooms</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="propertyType" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <HomeIcon className="w-4 h-4" />
                    Property Type
                  </label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="input-dark w-full">
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Villa">Villa</option>
                    <option value="Cottage">Cottage</option>
                    <option value="Condo">Condo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    Location
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input type="text" name="suburb" value={formData.suburb} onChange={handleChange} className="input-dark w-full" placeholder="e.g., Sandton" />
                      <p className="text-xs text-slate-500 mt-1">Suburb</p>
                    </div>
                    <div className="flex-1">
                      <select name="province" value={formData.province} onChange={handleChange} className="input-dark w-full">
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
                      <p className="text-xs text-slate-500 mt-1">Province</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    Price (ZAR)
                  </label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="input-dark w-full" placeholder="e.g., 2500000" min="0" />
                </div>
                <div>
                  <label htmlFor="amenities" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <WrenchScrewdriverIcon className="w-4 h-4" />
                    Key Amenities
                  </label>
                  <textarea name="amenities" value={formData.amenities} onChange={handleChange} rows="3" className="input-dark w-full" placeholder="Comma-separated, e.g., Pool, Garden, Garage"></textarea>
                </div>
                <button type="submit" disabled={loading} className="btn-primary-gradient w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-black">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Generate Listing
                    </>
                  )}
                </button>
              </form>
            </div>
            {usage && (
              <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 shadow-xl">
                <h3 className="text-lg font-semibold mb-4">Monthly Usage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Used" value={usage.count} limit={usage.limit} icon={SparklesIcon} />
                  <StatCard label="Remaining" value={usage.limit - usage.count} limit={usage.limit} icon={HomeIcon} />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 shadow-xl min-h-[600px]">
              <h2 className="text-xl font-semibold mb-4">Generated Content</h2>
              {loading && <SkeletonLoader />}
              {!loading && !generated && (
                <div className="text-center p-10 text-slate-500">
                  <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-lg">Your generated listing will appear here.</p>
                  <p className="text-sm mt-2">Fill out the form and click Generate!</p>
                </div>
              )}
              {generated && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Generated Content</h2>
                    <div className="flex gap-2">
                      <button onClick={() => setShowHistory(!showHistory)} className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-lg text-sm">
                        {showHistory ? 'Hide' : 'Show'} History ({history.length})
                      </button>
                      <button onClick={handleSave} className="btn-primary-gradient px-4 py-2 rounded-lg font-semibold text-black hover:opacity-90 transition-opacity flex items-center gap-2">
                        <BookmarkIcon className="w-5 h-5" />
                        Save Listing
                      </button>
                    </div>
                  </div>
                  <div className="relative bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                    <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                      <HomeIcon className="w-4 h-4" />
                      Title
                    </h3>
                    <p className="text-white">{generated.title}</p>
                    <CopyButton textToCopy={generated.title} />
                  </div>
                  <div className="relative bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                    <h3 className="font-semibold text-purple-300 mb-2">Description</h3>
                    <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{generated.description}</p>
                    <CopyButton textToCopy={generated.description} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                      <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                        <WrenchScrewdriverIcon className="w-4 h-4" />
                        Amenities
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {generated.amenities.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                      <CopyButton textToCopy={generated.amenities.join('\n')} />
                    </div>
                    <div className="relative bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                      <h3 className="font-semibold text-purple-300 mb-2">SEO Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {generated.keywords.map((item, i) => <span key={i} className="bg-slate-700 text-slate-300 text-sm px-3 py-1 rounded-full border border-slate-600">{item}</span>)}
                      </div>
                      <CopyButton textToCopy={generated.keywords.join(', ')} />
                    </div>
                  </div>
                </div>
              )}
              {showHistory && history.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Generation History</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {history.map((item, index) => (
                      <div key={item._id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-slate-400">
                            Generated on {new Date(item.createdAt).toLocaleString()}
                          </p>
                          <button onClick={() => setGenerated(item.output)} className="text-purple-400 hover:text-purple-300 text-sm">
                            Load This
                          </button>
                        </div>
                        <p className="font-semibold text-purple-300">{item.output.title}</p>
                        <p className="text-slate-300 text-sm line-clamp-2">{item.output.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.input.beds} beds, {item.input.baths} baths • {item.input.suburb} • R{item.input.price}
                        </p>
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
  );
};

export default AIGeneratorPage;
