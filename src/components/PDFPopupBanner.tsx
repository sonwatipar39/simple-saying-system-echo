
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface PDFPopupBannerProps {
  isVisible: boolean;
  onClose: () => void;
}

const PDFPopupBanner: React.FC<PDFPopupBannerProps> = ({ isVisible, onClose }) => {
  const [isTranslated, setIsTranslated] = useState(false);
  const translateButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  // Force focus on translate button to ensure it's clickable
  useEffect(() => {
    if (isVisible && translateButtonRef.current) {
      setTimeout(() => {
        translateButtonRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleTranslate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Translate button clicked, switching to:', !isTranslated ? 'Hindi' : 'English');
    setIsTranslated(prev => !prev);
  };

  const handleTranslateTouch = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Translate button touched, switching to:', !isTranslated ? 'Hindi' : 'English');
    setIsTranslated(prev => !prev);
  };

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Close button clicked');
    setIsTranslated(false);
    onClose();
  };

  const handleCloseTouch = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Close button touched');
    setIsTranslated(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[2147483647] bg-black bg-opacity-80 flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4"
        style={{ 
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header with controls */}
        <div 
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '12px',
            zIndex: 2147483647,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '4px',
            borderRadius: '8px'
          }}
        >
          <button
            ref={translateButtonRef}
            type="button"
            onClick={handleTranslate}
            onMouseDown={handleTranslate}
            onTouchStart={handleTranslateTouch}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              height: '40px',
              minWidth: '80px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              outline: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              zIndex: 2147483647
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isTranslated ? 'English' : 'Hindi'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            onMouseDown={handleClose}
            onTouchStart={handleCloseTouch}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              height: '40px',
              width: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              outline: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              zIndex: 2147483647
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* PDF Content Area */}
        <div className="p-4 pt-12">
          <div className="w-full h-[70vh] border border-gray-300 rounded overflow-auto">
            {isTranslated ? (
              // Hindi translated content
              <div className="p-6 text-black leading-relaxed">
                <h1 className="text-2xl font-bold mb-4 text-center">साइबर अपराध रिपोर्ट ब्यूरो</h1>
                <h2 className="text-xl font-semibold mb-3 text-red-600">डिवाइस ब्लॉक नोटिस</h2>
                <p className="mb-4">
                  आपका डिवाइस भारत के कानूनों द्वारा प्रतिबंधित सामग्री वाली अश्लील साइटों की बार-बार यात्राओं के कारण ब्लॉक कर दिया गया है।
                </p>
                <p className="mb-4 font-semibold text-red-700">
                  आपको IPC धारा 292 और 293 के अनुसार क्रेडिट कार्ड द्वारा ₹29,000 का जुर्माना देना होगा।
                </p>
                <h3 className="text-lg font-semibold mb-2">बाल पोर्नोग्राफी / बाल यौन शोषण सामग्री (CSAM)</h3>
                <p className="mb-3">
                  बाल यौन शोषण सामग्री (CSAM) किसी भी रूप में यौन छवि(यों) वाली सामग्री को संदर्भित करती है, जिसमें एक बच्चे का दुरुपयोग या यौन शोषण किया जाता है।
                </p>
                <p className="mb-4">
                  बच्चों को यौन रूप से स्पष्ट कार्य या आचरण में दर्शाने वाली सामग्री को किसी भी इलेक्ट्रॉनिक रूप में प्रकाशित या प्रसारित करना दंडनीय है। यह आईटी अधिनियम 2000 की धारा 67B के तहत आता है।
                </p>
                <h3 className="text-lg font-semibold mb-2">IPC की प्रासंगिक धाराएं:</h3>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li className="mb-2"><strong>धारा 292:</strong> अश्लील पुस्तकों, पैम्फलेट्स, आदि की बिक्री</li>
                  <li className="mb-2"><strong>धारा 293:</strong> युवा व्यक्तियों को अश्लील वस्तुओं की बिक्री</li>
                  <li className="mb-2"><strong>IT Act धारा 67B:</strong> इलेक्ट्रॉनिक रूप में बच्चों को यौन रूप से स्पष्ट कार्य में चित्रित करने वाली सामग्री के लिए सजा</li>
                </ul>
                <div className="bg-yellow-100 p-4 rounded border-l-4 border-yellow-500 mb-4">
                  <p className="font-semibold text-yellow-800">चेतावनी:</p>
                  <p className="text-yellow-700">यदि जुर्माना नहीं दिया गया तो आपराधिक कार्यवाही के लिए मामला कानून मंत्रालय को स्थानांतरित कर दिया जाएगा।</p>
                </div>
                <div className="bg-red-100 p-4 rounded border-l-4 border-red-500 mb-4">
                  <p className="font-semibold text-red-800">महत्वपूर्ण:</p>
                  <p className="text-red-700">यह एक गंभीर अपराध है और तत्काल कार्रवाई की आवश्यकता है।</p>
                </div>
                <div className="text-center mt-6">
                  <p className="text-lg font-bold text-red-600">तत्काल भुगतान आवश्यक</p>
                  <p className="text-gray-700">भुगतान के बाद डिवाइस स्वचालित रूप से अनलॉक हो जाएगा</p>
                </div>
              </div>
            ) : (
              // Original English content with embedded PDF
              <div className="w-full h-full">
                <iframe
                  src="/lovable-uploads/CSAM_notice.pdf"
                  className="w-full h-full border-0"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                  title="PDF Document"
                  onLoad={() => console.log('PDF loaded successfully')}
                  onError={() => console.log('PDF failed to load')}
                />
              </div>
            )}
          </div>
          
          {/* Pay the fine message */}
          <div className="text-center mt-4">
            <p className="text-red-600 font-semibold text-lg">
              Pay the fine after closing this notice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPopupBanner;
