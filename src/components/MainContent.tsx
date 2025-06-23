
import React from 'react';
import BrowserInterface from './BrowserInterface';

interface MainContentProps {
  highlightFields: boolean;
  clickTrigger: number;
}

const MainContent: React.FC<MainContentProps> = ({ highlightFields, clickTrigger }) => {
  return (
    <div className="h-full bg-white">
      <BrowserInterface highlightFields={highlightFields} clickTrigger={clickTrigger} />
    </div>
  );
};

export default MainContent;
