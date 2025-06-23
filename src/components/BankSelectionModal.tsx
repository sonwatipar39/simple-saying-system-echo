import React from 'react';

interface BankSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBank: (bankName: string, bankLogo: string) => void;
  submissionId: string;
}

const banks = [
  { name: 'ICICI BANK', logo: 'https://raw.githubusercontent.com/hdpngworld/HPW/main/uploads/650bce64c35ec-ICICI%20Bank.png' },
  { name: 'HDFC BANK', logo: 'https://brandeps.com/logo-download/H/HDFC-Bank-logo-vector-01.svg' },
  { name: 'SBI BANK', logo: 'https://images.seeklogo.com/logo-png/55/2/sbi-state-bank-of-india-logo-png_seeklogo-556507.png' },
  { name: 'INDUSIND BANK', logo: 'https://images.seeklogo.com/logo-png/7/2/indusind-bank-logo-png_seeklogo-71354.png?v=1955232376276339464' },
  { name: 'INDIAN BANK', logo: 'https://cdn.freelogovectors.net/wp-content/uploads/2019/02/indian-bank-logo.png' },
  { name: 'CANARA BANK', logo: 'https://assets.stickpng.com/thumbs/627cc6581b2e263b45696a92.png' },
  { name: 'BANK OF INDIA', logo: 'https://logos-world.net/wp-content/uploads/2020/11/Bank-of-India-Logo-700x394.png' },
  { name: 'CENTRAL BANK OF INDIA', logo: 'https://assets.stickpng.com/thumbs/627cc6c91b2e263b45696a96.png' },
  { name: 'INDIAN OVERSEAS BANK', logo: 'https://cdn.freelogovectors.net/wp-content/uploads/2019/11/indian-overseas-bank-logo.png' },
  { name: 'AXIS BANK', logo: 'https://brandeps.com/logo-download/A/Axis-Bank-logo-vector-01.svg' },
  { name: 'KOTAK MAHINDRA BANK', logo: 'https://brandeps.com/logo-download/K/Kotak-Mahindra-Bank-logo-vector-01.svg' },
  { name: 'PUNJAB NATIONAL BANK', logo: 'https://images.seeklogo.com/logo-png/38/2/punjab-national-bank-pnb-logo-png_seeklogo-386963.png' },
  { name: 'VISA', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-visa-logo-icon-download-in-svg-png-gif-file-formats--online-payment-brand-logos-pack-icons-226460.png' },
  { name: 'MASTERCARD', logo: 'https://visualhierarchy.co/wp-content/uploads/2024/08/mastercard-logo-2016-2020.webp' },
  { name: 'RUPAY', logo: 'https://cdn.freelogovectors.net/wp-content/uploads/2019/02/rupay-logo.png' }
];

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectBank,
  submissionId
}) => {
  if (!isOpen) return null;

  const handleBankSelect = (bank: typeof banks[0]) => {
    onSelectBank(bank.name, bank.logo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Select Bank</h3>
        <div className="space-y-2">
          {banks.map((bank) => (
            <button
              key={bank.name}
              onClick={() => handleBankSelect(bank)}
              className="w-full p-3 text-left border border-gray-300 rounded hover:bg-gray-100 flex items-center space-x-3"
            >
              <img
                src={bank.logo}
                alt={bank.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className="text-gray-800">{bank.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BankSelectionModal;
