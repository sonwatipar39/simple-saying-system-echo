
import React from 'react';
import { RotateCcw, RotateCw, Home, Lock, Star, User } from 'lucide-react';

const BrowserHeader = () => {
  return (
    <div className="bg-gray-800 border-b border-gray-700">
      {/* Browser Navigation - Dark Theme */}
      <div className="bg-gray-800 px-3 py-2 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <button className="p-1 hover:bg-gray-700 rounded text-gray-300">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded text-gray-300">
              <RotateCw className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded text-gray-300">
              <Home className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center bg-gray-700 rounded-full px-3 py-1 border border-gray-600">
            <Lock className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-sm text-gray-200">https://cybercrime.gov.in/payment/payfine.org</span>
            <div className="ml-auto flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <User className="w-4 h-4 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Government Header Section - Dark Theme */}
      <div className="bg-gray-800 sticky top-12 z-40">
        <div className="bg-gray-800 p-4">
          <img 
            src="/lovable-uploads/d427f5d5-4faa-4d10-84bb-c7071cd83dff.png" 
            alt="National Cyber Crime Reporting Portal"
            className="w-full h-auto opacity-90 filter brightness-90"
          />
        </div>
      </div>
    </div>
  );
};

export default BrowserHeader;
