import React, { useState } from 'react';
import { X, Mail, ArrowLeft } from 'lucide-react';

interface SendToOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (recipient: string, recipientName: string) => void;
  address?: string;
}

const SendToOfficeModal: React.FC<SendToOfficeModalProps> = ({
  isOpen,
  onClose,
  onSend,
  address
}) => {
  const [selectedRecipient, setSelectedRecipient] = useState<'supreme' | 'other'>('supreme');
  const [customRecipient, setCustomRecipient] = useState('');

  const handleSend = () => {
    if (selectedRecipient === 'supreme') {
      onSend('supreme', 'Supreme Sprinklers');
    } else {
      if (!customRecipient.trim()) {
        alert('Please enter a recipient name/email');
        return;
      }
      onSend('other', customRecipient.trim());
    }
  };

  const handleClose = () => {
    setSelectedRecipient('supreme');
    setCustomRecipient('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:my-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Send Report to Office
                </h3>
                {address && (
                  <p className="text-sm text-gray-500 mt-1">
                    Report for: {address}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Recipient selection */}
          <div className="space-y-4 mb-6">
            <div className="space-y-3">
              {/* Supreme Sprinklers option */}
              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <input
                  type="radio"
                  name="recipient"
                  value="supreme"
                  checked={selectedRecipient === 'supreme'}
                  onChange={(e) => setSelectedRecipient(e.target.value as 'supreme')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-900">Supreme Sprinklers</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Send to the main office
                  </p>
                </div>
              </label>

              {/* Other recipient option */}
              <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <input
                  type="radio"
                  name="recipient"
                  value="other"
                  checked={selectedRecipient === 'other'}
                  onChange={(e) => setSelectedRecipient(e.target.value as 'other')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-600" />
                    <span className="font-medium text-gray-900">Other</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Send to a custom recipient
                  </p>
                </div>
              </label>
            </div>

            {/* Custom recipient input */}
            {selectedRecipient === 'other' && (
              <div className="mt-4 pl-7">
                <label htmlFor="customRecipient" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name/Email
                </label>
                <input
                  type="text"
                  id="customRecipient"
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  placeholder="Enter recipient name or email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base"
            >
              Back
            </button>
            <button
              onClick={handleSend}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm sm:text-base flex items-center justify-center space-x-2"
            >
              <Mail size={16} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendToOfficeModal;