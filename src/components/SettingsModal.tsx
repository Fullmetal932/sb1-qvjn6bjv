import React, { useState, useEffect } from 'react';
import { X, Settings, Mail, Save } from 'lucide-react';
import { EmailService } from '../services/email.service';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [defaultEmail, setDefaultEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const emailService = EmailService.getInstance();

  useEffect(() => {
    if (isOpen) {
      // Load current email setting
      const currentEmail = localStorage.getItem('bfir_defaultOfficeEmail') || 'office@supremesprinklers.com';
      setDefaultEmail(currentEmail);
      setIsValid(true);
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setDefaultEmail(email);
    setIsValid(email === '' || emailService.validateEmail(email));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!isValid || !defaultEmail.trim()) {
      return;
    }

    emailService.setDefaultOfficeEmail(defaultEmail.trim());
    setIsSaved(true);
    
    // Show success message briefly
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleClose = () => {
    setIsSaved(false);
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
              <Settings size={24} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Settings
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Email Settings Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Mail size={18} className="text-blue-600" />
                <span>Email Settings</span>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="defaultEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Default Office Email Address
                  </label>
                  <input
                    type="email"
                    id="defaultEmail"
                    value={defaultEmail}
                    onChange={handleEmailChange}
                    placeholder="office@supremesprinklers.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      !isValid 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  {!isValid && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter a valid email address
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    This email will be used as the default recipient when sending reports to "Supreme Sprinklers"
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!isValid || !defaultEmail.trim()}
                  className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                    isSaved
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <Save size={16} />
                  <span>{isSaved ? 'Saved!' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;