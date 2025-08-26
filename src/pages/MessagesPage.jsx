import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ClockIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const MessagesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'welcome',
    subject: '',
    content: '',
    trigger: 'manual',
    isActive: true
  });

  const templateTypes = [
    { value: 'welcome', label: 'Welcome Message', description: 'Sent after booking confirmation' },
    { value: 'checkin', label: 'Check-in Instructions', description: 'Sent before guest arrival' },
    { value: 'checkout', label: 'Check-out Instructions', description: 'Sent before guest departure' },
    { value: 'thank_you', label: 'Thank You', description: 'Sent after guest checkout' },
    { value: 'reminder', label: 'Reminder', description: 'Custom reminder messages' },
    { value: 'custom', label: 'Custom', description: 'Other message types' }
  ];

  const triggerTypes = [
    { value: 'manual', label: 'Manual', description: 'Send manually when needed' },
    { value: 'booking_confirmed', label: 'Booking Confirmed', description: 'Auto-send when booking is confirmed' },
    { value: 'day_before_checkin', label: 'Day Before Check-in', description: 'Auto-send 24 hours before arrival' },
    { value: 'day_of_checkout', label: 'Day of Check-out', description: 'Auto-send on checkout day' },
    { value: 'after_checkout', label: 'After Check-out', description: 'Auto-send after guest leaves' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/messages');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTemplate) {
        await api.put(`/api/messages/${selectedTemplate._id}`, formData);
      } else {
        await api.post('/api/messages', formData);
      }

      setShowModal(false);
      setSelectedTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      content: template.content,
      trigger: template.trigger,
      isActive: template.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this message template?')) {
      try {
        await api.delete(`/api/messages/${templateId}`);
        fetchTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleCopyContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(content);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying content:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'welcome',
      subject: '',
      content: '',
      trigger: 'manual',
      isActive: true
    });
  };

  const openModal = () => {
    resetForm();
    setSelectedTemplate(null);
    setShowModal(true);
  };

  const getTypeLabel = (type) => {
    const typeObj = templateTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getTriggerLabel = (trigger) => {
    const triggerObj = triggerTypes.find(t => t.value === trigger);
    return triggerObj ? triggerObj.label : trigger;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'welcome': '👋',
      'checkin': '🗝️',
      'checkout': '👋',
      'thank_you': '🙏',
      'reminder': '⏰',
      'custom': '💬'
    };
    return icons[type] || '💬';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
          <p className="mt-2 text-gray-600">
            Create and manage automated guest communication templates
          </p>
        </div>
        <button
          onClick={openModal}
          className="btn btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No message templates yet</h3>
          <p className="text-gray-600 mb-6">Create your first template to automate guest communications.</p>
          <button
            onClick={openModal}
            className="btn btn-primary"
          >
            Create First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div key={template._id} className="card hover:shadow-lg transition-shadow duration-200">
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(template.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600">{getTypeLabel(template.type)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    template.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Template Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>Trigger: {getTriggerLabel(template.trigger)}</span>
                </div>

                {template.subject && (
                  <div className="flex items-start text-sm text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Subject:</span> {template.subject}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Content Preview:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-24 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{template.content.substring(0, 200)}
                      {template.content.length > 200 && '...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Actions */}
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleCopyContent(template.content)}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center space-x-1"
                >
                  {copiedId === template.content ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center space-x-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(template._id)}
                  className="btn btn-danger text-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Variables Info */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Template Variables</h2>
        <p className="text-gray-600 mb-4">Use these variables in your templates to personalize messages:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Guest Information</h3>
            <div className="space-y-1 text-gray-600">
              <p><code className="bg-gray-100 px-1 rounded">{{guestName}}</code> - Guest's full name</p>
              <p><code className="bg-gray-100 px-1 rounded">{{guestEmail}}</code> - Guest's email</p>
              <p><code className="bg-gray-100 px-1 rounded">{{guestPhone}}</code> - Guest's phone</p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Booking Details</h3>
            <div className="space-y-1 text-gray-600">
              <p><code className="bg-gray-100 px-1 rounded">{{checkInDate}}</code> - Check-in date</p>
              <p><code className="bg-gray-100 px-1 rounded">{{checkOutDate}}</code> - Check-out date</p>
              <p><code className="bg-gray-100 px-1 rounded">{{numberOfGuests}}</code> - Guest count</p>
              <p><code className="bg-gray-100 px-1 rounded">{{totalAmount}}</code> - Total booking amount</p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Property Details</h3>
            <div className="space-y-1 text-gray-600">
              <p><code className="bg-gray-100 px-1 rounded">{{propertyName}}</code> - Property name</p>
              <p><code className="bg-gray-100 px-1 rounded">{{propertyAddress}}</code> - Full address</p>
              <p><code className="bg-gray-100 px-1 rounded">{{houseRules}}</code> - Property rules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedTemplate ? 'Edit Template' : 'Add New Template'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Welcome Message for Airbnb"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Type *
                    </label>
                    <select
                      required
                      className="input"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      {templateTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Welcome to {{propertyName}}!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content *
                  </label>
                  <textarea
                    required
                    rows="8"
                    className="input"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Hi {{guestName}},

Welcome to {{propertyName}}! We're excited to host you from {{checkInDate}} to {{checkOutDate}}.

Here are your check-in details:
- Address: {{propertyAddress}}
- Check-in time: 3:00 PM
- Check-out time: 11:00 AM

If you have any questions, please don't hesitate to reach out.

Best regards,
Your Host"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trigger
                    </label>
                    <select
                      className="input"
                      value={formData.trigger}
                      onChange={(e) => setFormData({...formData, trigger: e.target.value})}
                    >
                      {triggerTypes.map((trigger) => (
                        <option key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="input"
                      value={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    {selectedTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
