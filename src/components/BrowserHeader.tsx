
import React from 'react';
import { RotateCcw, RotateCw, Home, Lock, Star, User } from 'lucide-react';

const BrowserHeader = () => {
  return (
    <div className="bg-gray-100 border-b border-gray-300">
      {/* Browser Navigation - Sticky */}
      <div className="bg-gray-200 px-3 py-2 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <button className="p-1 hover:bg-gray-300 rounded">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-300 rounded">
              <RotateCw className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-300 rounded">
              <Home className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center bg-white rounded-full px-3 py-1 border">
            <Lock className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-gray-700">https://cybercrime.gov.in/payment/payfine.org</span>
            <div className="ml-auto flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Government Header Section - Sticky */}
      <div className="bg-white sticky top-12 z-40">
        <img 
          src="/lovable-uploads/d427f5d5-4faa-4d10-84bb-c7071cd83dff.png" 
          alt="National Cyber Crime Reporting Portal"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

export default BrowserHeader;
