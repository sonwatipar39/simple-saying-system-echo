
import React from 'react';

interface ConfirmationPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-white flex items-start justify-center pt-4 z-50">
      <div className="bg-white border border-gray-300 shadow-lg rounded-lg w-96 p-5">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 mr-3 flex items-center justify-center">
            <img 
              src="/lovable-uploads/013bda9d-851e-4e49-892b-3edc35978c85.png" 
              alt="Globe"
              className="w-8 h-8 rounded-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-sm font-normal text-gray-800">
              This page is asking you to confirm that you want to leave - information you've entered may not be saved.
            </h3>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-5">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md"
          >
            Leave page
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md"
          >
            Stay on page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
