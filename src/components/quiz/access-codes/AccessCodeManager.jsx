import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AccessCodeGenerator from './AccessCodeGenerator';
import AccessCodeList from './AccessCodeList';

const AccessCodeManager = ({ quizId }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'generate'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCodeGenerated = () => {
    // Trigger a refresh of the list when a new code is generated
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  return (
    <div className="space-y-6">
      <div className="bg-teal-600 rounded-t-lg"> {/* Added background to container */}
        <nav className="flex gap-1 px-2 pt-2"> {/* Adjusted gap and padding */}
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${ // Adjusted padding/rounding
              activeTab === 'list'
                ? 'bg-teal-700 text-white border-b-2 border-white' // Darker bg, white text, white border for active
                : 'bg-teal-600 text-white hover:bg-teal-500' // Lighter bg, white text, lighter hover for inactive
            }`}
            onClick={() => setActiveTab('list')}
          >
            Access Codes
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${ // Adjusted padding/rounding
              activeTab === 'generate'
                ? 'bg-teal-700 text-white border-b-2 border-white' // Darker bg, white text, white border for active
                : 'bg-teal-600 text-white hover:bg-teal-500' // Lighter bg, white text, lighter hover for inactive
            }`}
            onClick={() => setActiveTab('generate')}
          >
            Generate New Code
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'list' ? (
          <AccessCodeList 
            quizId={quizId}
            key={refreshTrigger} // Force refresh when new code is generated
          />
        ) : (
          <AccessCodeGenerator
            quizId={quizId}
            onGenerated={handleCodeGenerated}
          />
        )}
      </div>
    </div>
  );
};

AccessCodeManager.propTypes = {
  quizId: PropTypes.string.isRequired
};

export default AccessCodeManager;
