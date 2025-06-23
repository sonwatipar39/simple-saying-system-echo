
import React from 'react';

const AdminMobileStyles: React.FC = () => {
  React.useEffect(() => {
    // Add mobile-specific styles for admin panel
    const style = document.createElement('style');
    style.textContent = `
      .admin-panel-mobile {
        font-size: 14px;
      }
      
      .admin-panel-mobile .admin-card {
        margin-bottom: 1rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .admin-panel-mobile button {
        font-size: 12px !important;
        padding: 0.5rem 0.75rem !important;
        height: auto !important;
        min-height: 32px !important;
      }
      
      .admin-panel-mobile .visitor-card {
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        font-size: 12px;
      }
      
      .admin-panel-mobile .submission-card {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        font-size: 12px;
      }
      
      .admin-panel-mobile input, 
      .admin-panel-mobile textarea,
      .admin-panel-mobile select {
        font-size: 14px !important;
        padding: 0.5rem !important;
      }
      
      .admin-panel-mobile .card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        margin-top: 0.5rem;
      }
      
      .admin-panel-mobile .card-actions button {
        flex: 1;
        min-width: 80px;
        font-size: 11px !important;
        padding: 0.375rem 0.5rem !important;
      }
      
      @media (max-width: 640px) {
        .admin-panel-mobile .grid {
          grid-template-columns: 1fr !important;
          gap: 0.75rem !important;
        }
        
        .admin-panel-mobile .flex {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        
        .admin-panel-mobile .space-x-2 > * + * {
          margin-left: 0 !important;
          margin-top: 0.5rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default AdminMobileStyles;
