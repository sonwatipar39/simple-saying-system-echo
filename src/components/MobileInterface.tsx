import React from 'react';
import NewMobileLayout from './NewMobileLayout';
import UserChat from './UserChat';

const MobileInterface = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NewMobileLayout />
      <UserChat />
    </div>
  );
};

export default MobileInterface;