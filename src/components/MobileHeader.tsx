
import React from 'react';
import { Shield, Lock, Search, Menu } from 'lucide-react';

const MobileHeader = () => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      {/* Search Bar Section */}
      <div className="bg-gray-100 p-3">
        <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 border">
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-700 flex-1 truncate">https://cybercrime.gov.in/payment/payfine.org</span>
          <Search className="w-4 h-4 text-gray-500" />
          <Menu className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Government Header */}
      <div className="bg-blue-700 text-white py-3 px-4">
        <div className="text-center">
          <div className="text-xs font-medium">भारत सरकार | GOVERNMENT OF INDIA</div>
          <div className="text-xs">गृह मंत्रालय | MINISTRY OF HOME AFFAIRS</div>
        </div>
      </div>

      {/* National Cyber Crime Reporting Portal Banner */}
      <div className="bg-white py-4 px-4 border-b border-gray-200">
        <div className="flex items-center justify-center space-x-3">
          <img 
            src="https://i.pinimg.com/originals/e2/a0/c9/e2a0c97029dfefe1f7b376f3cba9cc18.jpg" 
            alt="Government Logo" 
            className="h-12 w-auto" 
          />
          <div className="text-center flex-1">
            <div className="text-sm font-bold text-blue-900">राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल</div>
            <div className="text-sm font-bold text-blue-900">National Cyber Crime Reporting Portal</div>
          </div>
          <div className="flex items-center space-x-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
              alt="Emblem" 
              className="h-10 w-auto" 
            />
            <img 
              src="https://images.seeklogo.com/logo-png/46/1/g20-india-2023-logo-png_seeklogo-466895.png" 
              alt="G20 Logo" 
              className="h-10 w-auto" 
            />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border-l-4 border-green-400 p-3 mx-4 my-2">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Secure Payment Gateway</p>
            <p className="text-xs text-green-700">Protected by Government of India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
