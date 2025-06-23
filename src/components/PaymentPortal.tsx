
import React from 'react';
import LeftContent from './LeftContent';
import PaymentForm from './PaymentForm';

interface PaymentPortalProps {
  highlightFields: boolean;
  clickTrigger: number;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ highlightFields, clickTrigger }) => {
  return (
    <div className="bg-gray-50">
      <div className="flex h-full">
        <LeftContent />
        <PaymentForm highlightFields={highlightFields} clickTrigger={clickTrigger} />
      </div>
      
      {/* Bottom Banner - Full Width with bottom spacing for Windows taskbar */}
      <div className="w-full pb-10">
        <img 
          src="/lovable-uploads/d3cde66f-7ccc-43bd-a1f4-f05ac7d71302.png"
          alt="Government Footer Banner"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};

export default PaymentPortal;
