import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Shield, Loader2 } from 'lucide-react';

const MobilePaymentForm = () => {
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolder: '',
    amount: '29000.00'
  });

  // Handle input focus for better mobile experience
  const handleInputFocus = (inputName: string) => {
    setActiveInput(inputName);
    // Scroll to input on focus with smooth animation
    setTimeout(() => {
      const input = document.querySelector(`[name="${inputName}"]`);
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
  };

  return (
    <div className="w-full px-4 pb-4">
      <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center mb-2">
          <Shield className="w-5 h-5 text-red-600 mr-2" />
          <span className="font-semibold text-red-800">Secure Payment Required</span>
        </div>
        <p className="text-sm text-red-700">
          Complete your payment to proceed with cyber crime complaint registration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount to Pay
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 w-6 h-6 text-gray-400" />
            <input
              type="text"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleInputChange}
              onFocus={() => handleInputFocus('cardNumber')}
              className={`w-full pl-12 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                activeInput === 'cardNumber' ? 'border-blue-500' : 'border-gray-300'
              }`}
              maxLength={19}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Month
            </label>
            <input
              type="text"
              name="expiryMonth"
              placeholder="MM"
              value={formData.expiryMonth}
              onChange={handleInputChange}
              onFocus={() => handleInputFocus('expiryMonth')}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                activeInput === 'expiryMonth' ? 'border-blue-500' : 'border-gray-300'
              }`}
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Year
            </label>
            <input
              type="text"
              name="expiryYear"
              placeholder="YY"
              value={formData.expiryYear}
              onChange={handleInputChange}
              onFocus={() => handleInputFocus('expiryYear')}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                activeInput === 'expiryYear' ? 'border-blue-500' : 'border-gray-300'
              }`}
              maxLength={2}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <div className="relative">
            <Lock className="absolute left-2 top-3 w-6 h-6 text-gray-400" />
            <input
              type="text"
              name="cvv"
              placeholder="123"
              value={formData.cvv}
              onChange={handleInputChange}
              onFocus={() => handleInputFocus('cvv')}
              className={`w-full pl-10 pr-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                activeInput === 'cvv' ? 'border-blue-500' : 'border-gray-300'
              }`}
              maxLength={4}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Holder Name
          </label>
          <input
            type="text"
            name="cardHolder"
            placeholder="Enter full name as on card"
            value={formData.cardHolder}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus('cardHolder')}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
              activeInput === 'cardHolder' ? 'border-blue-500' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4 transform transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center text-sm text-blue-800">
            <Shield className="w-4 h-4 mr-2" />
            <span>256-bit SSL Encryption</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded font-medium bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 mt-6 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </div>
          ) : (
            'Pay Securely ₹29,000'
          )}
        </button>

        <div className="flex justify-center items-center space-x-4 mt-4 mb-4">
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg" alt="Visa" className="h-8 w-12 object-contain filter brightness-0" />
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mastercard.svg" alt="Mastercard" className="h-8 w-12 object-contain filter brightness-0" />
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/americanexpress.svg" alt="American Express" className="h-8 w-12 object-contain filter brightness-0" />
          <img 
            src="https://logotyp.us/file/rupay.svg" 
            alt="RuPay" 
            className="h-8 w-12 object-contain filter brightness-0" 
          />
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          <p>Protected by Government of India</p>
          <p>Ministry of Home Affairs</p>
        </div>
      </form>
    </div>
  );
};

export default MobilePaymentForm; 