import React, { useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';

interface SendToOfficePageProps {
  onBack: () => void;
  onSend: (customerName: string) => void;
}

const SendToOfficePage: React.FC<SendToOfficePageProps> = ({ onBack, onSend }) => {
  const [selectedCustomerOption, setSelectedCustomerOption] = useState<'supreme' | 'other'>('supreme');
  const [customCustomerName, setCustomCustomerName] = useState('');

  const handleCustomerOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCustomerOption(event.target.value as 'supreme' | 'other');
    if (event.target.value === 'supreme') {
      setCustomCustomerName(''); // Clear custom name if switching back to Supreme
    }
  };

  const handleCustomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCustomerName(event.target.value);
  };

  const handleSendClick = () => {
    const customerNameToSend = selectedCustomerOption === 'supreme' ? 'Supreme Sprinklers' : customCustomerName;
    onSend(customerNameToSend);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 text-gray-600 hover:text-gray-800">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Send Report to Office</h2>
      </div>

      <p className="text-gray-600 text-xs sm:text-sm mb-6">
        Please select the customer name. This will appear in the email subject line.
      </p>

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="radio"
            id="supreme"
            name="customerOption"
            value="supreme"
            checked={selectedCustomerOption === 'supreme'}
            onChange={handleCustomerOptionChange}
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
          />
          <label htmlFor="supreme" className="ml-2 block text-sm font-medium text-gray-700">
            Supreme Sprinklers
          </label>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="radio"
            id="other"
            name="customerOption"
            value="other"
            checked={selectedCustomerOption === 'other'}
            onChange={handleCustomerOptionChange}
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
          />
          <label htmlFor="other" className="ml-2 block text-sm font-medium text-gray-700">
            Other
          </label>
        </div>

        {selectedCustomerOption === 'other' && (
          <div className="mt-4">
            <label htmlFor="customCustomerName" className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              id="customCustomerName"
              value={customCustomerName}
              onChange={handleCustomNameChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter customer name"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSendClick}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedCustomerOption === 'other' && customCustomerName.trim() === ''}
        >
          <Send className="mr-2" size={20} />
          Send
        </button>
      </div>
    </div>
  );
};

export default SendToOfficePage;