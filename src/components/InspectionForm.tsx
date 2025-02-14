import React from 'react';
import type { InspectionFormData } from '../types/inspection';

interface InspectionFormProps {
  formData: InspectionFormData;
  onChange: (data: Partial<InspectionFormData>) => void;
}

const InspectionForm: React.FC<InspectionFormProps> = ({
  formData,
  onChange
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const newValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;
    
    onChange({
      [name]: newValue
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter street address"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter ZIP code"
          />
        </div>

        <div>
          <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-1">
            Device Type
          </label>
          <input
            type="text"
            id="deviceType"
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter device type"
          />
        </div>

        <div>
          <label htmlFor="deviceSize" className="block text-sm font-medium text-gray-700 mb-1">
            Device Size
          </label>
          <input
            type="text"
            id="deviceSize"
            name="deviceSize"
            value={formData.deviceSize}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter device size"
          />
        </div>

        <div>
          <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Serial Number
          </label>
          <input
            type="text"
            id="serialNumber"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter serial number"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Test Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="test1A" className="block text-sm font-medium text-gray-700 mb-1">
              First Test A
            </label>
            <input
              type="text"
              id="test1A"
              name="test1A"
              value={formData.test1A}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter test result"
            />
          </div>

          <div>
            <label htmlFor="test1B" className="block text-sm font-medium text-gray-700 mb-1">
              First Test B
            </label>
            <input
              type="text"
              id="test1B"
              name="test1B"
              value={formData.test1B}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter test result"
            />
          </div>

          <div>
            <label htmlFor="test3" className="block text-sm font-medium text-gray-700 mb-1">
              Third Test
            </label>
            <input
              type="text"
              id="test3"
              name="test3"
              value={formData.test3}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter test result"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              id="secondTestNF"
              name="secondTestNF"
              checked={formData.secondTestNF}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
            />
            <span className="ml-2 text-sm text-gray-700">Second Test - NF</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          placeholder="Enter any additional notes"
        />
      </div>
    </div>
  );
};

export default InspectionForm;