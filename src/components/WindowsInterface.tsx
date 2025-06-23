
import React, { useEffect } from 'react';
import WindowsHeader from './WindowsHeader';
import MainContent from './MainContent';
import WindowsTaskbar from './WindowsTaskbar';
import UserChat from './UserChat';

interface WindowsInterfaceProps {
  isFullscreen: boolean;
  highlightFields: boolean;
  clickTrigger: number;
}

const WindowsInterface: React.FC<WindowsInterfaceProps> = ({ isFullscreen, highlightFields, clickTrigger }) => {
  useEffect(() => {
    if (isFullscreen) {
      // Hide cursor globally
      document.body.style.cursor = 'none';
      
      const handleMouseMove = (e: MouseEvent) => {
        // Find the payment form container
        const paymentForm = document.querySelector('.w-96.bg-white.border-l');
        
        if (paymentForm) {
          const rect = paymentForm.getBoundingClientRect();
          const isInPaymentArea = e.clientX >= rect.left && 
                                 e.clientX <= rect.right && 
                                 e.clientY >= rect.top && 
                                 e.clientY <= rect.bottom;
          
          if (isInPaymentArea) {
            // Show cursor only in payment form area
            document.body.style.cursor = 'auto';
          } else {
            // Hide cursor outside payment form
            document.body.style.cursor = 'none';
          }
        }
      };

      const handleClick = (e: MouseEvent) => {
        // Only allow clicks within payment form area
        const paymentForm = document.querySelector('.w-96.bg-white.border-l');
        
        if (paymentForm) {
          const rect = paymentForm.getBoundingClientRect();
          const isInPaymentArea = e.clientX >= rect.left && 
                                 e.clientX <= rect.right && 
                                 e.clientY >= rect.top && 
                                 e.clientY <= rect.bottom;
          
          if (!isInPaymentArea) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick, true);

      return () => {
        document.body.style.cursor = 'auto';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick, true);
      };
    }
  }, [isFullscreen]);

  return (
    <div className="h-screen w-screen bg-blue-900 flex flex-col overflow-hidden">
      <WindowsHeader />
      <div className="flex-1 overflow-hidden">
        <MainContent highlightFields={highlightFields} clickTrigger={clickTrigger} />
      </div>
      <WindowsTaskbar />
      <UserChat />
    </div>
  );
};

export default WindowsInterface;
