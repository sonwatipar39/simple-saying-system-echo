
import React from 'react';
import MobileHeader from './MobileHeader';
import MobileLeftContent from './MobileLeftContent';
import PaymentForm from './PaymentForm';

const MobilePaymentPortal = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <MobileHeader />
      
      {/* Cyber Crime Records Bureau Section */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Cyber Crime Records Bureau
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <strong>IMPORTANT NOTICE:</strong> This is an official portal of the National Cyber Crime Reporting Portal, Ministry of Home Affairs, Government of India.
          </p>
          <p>
            <strong>Legal Framework:</strong> This portal operates under the Information Technology Act, 2000 and the Indian Penal Code.
          </p>
        </div>
      </div>
      
      {/* Device Block Content */}
      <MobileLeftContent />
      
      {/* Payment Form Section - Fixed at bottom for mobile */}
      <div className="flex-1 bg-white mt-auto">
        <div className="sticky bottom-0 bg-white shadow-lg rounded-t-xl">
          <PaymentForm highlightFields={false} clickTrigger={0} />
        </div>
      </div>
    </div>
  );
};

export default MobilePaymentPortal;
