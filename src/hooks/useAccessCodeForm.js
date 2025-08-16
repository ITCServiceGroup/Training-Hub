import { useState, useEffect, useCallback } from 'react';
import { organizationService } from '../services/api/organization';
import { isValidEmail, getEmailErrorMessage } from '../utils/validation';

export const useAccessCodeForm = () => {
  const [testTakerInfo, setTestTakerInfo] = useState({
    ldap: '',
    email: '',
    supervisor: '',
    market: ''
  });
  const [supervisors, setSupervisors] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);

  // Fetch initial options
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const [supervisorsData, marketsData] = await Promise.all([
          organizationService.getActiveSupervisors(),
          organizationService.getMarkets()
        ]);
        setSupervisors(supervisorsData);
        setMarkets(marketsData);
      } catch (error) {
        console.error('Failed to fetch organization data:', error);
        setError('Failed to load supervisor and market options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // Update supervisors when market changes
  useEffect(() => {
    const updateSupervisors = async () => {
      if (testTakerInfo.market && testTakerInfo.market !== '') {
        try {
          const marketId = markets.find(m => m.name === testTakerInfo.market)?.id;
          if (marketId) {
            const supervisorsForMarket = await organizationService.getSupervisorsByMarket(marketId);
            setSupervisors(supervisorsForMarket);
          }
        } catch (error) {
          console.error('Failed to fetch supervisors for market:', error);
        }
      } else {
        // If no market selected, show all active supervisors
        try {
          const allSupervisors = await organizationService.getActiveSupervisors();
          setSupervisors(allSupervisors);
        } catch (error) {
          console.error('Failed to fetch all supervisors:', error);
        }
      }
    };

    updateSupervisors();
  }, [testTakerInfo.market, markets]);

  const resetForm = useCallback(() => {
    setTestTakerInfo({
      ldap: '',
      email: '',
      supervisor: '',
      market: ''
    });
    setError(null);
    setEmailError(null);
  }, []);

  const handleChange = useCallback((field, value) => {
    setTestTakerInfo(prev => {
      const newInfo = { ...prev, [field]: value };
      
      // If market changes, reset supervisor selection
      if (field === 'market') {
        newInfo.supervisor = '';
      }
      
      return newInfo;
    });
    setError(null);
    
    // Validate email field in real-time
    if (field === 'email') {
      if (value.trim() === '') {
        setEmailError(null); // Clear error when field is empty
      } else if (!isValidEmail(value)) {
        setEmailError(getEmailErrorMessage(value));
      } else {
        setEmailError(null);
      }
    }
  }, []);

  const validateForm = useCallback(() => {
    if (!isValidEmail(testTakerInfo.email)) {
      setEmailError(getEmailErrorMessage(testTakerInfo.email));
      return false;
    }
    return true;
  }, [testTakerInfo.email]);

  return {
    testTakerInfo,
    supervisors,
    markets,
    isLoading,
    error,
    emailError,
    resetForm,
    handleChange,
    validateForm,
    setError
  };
};

export default useAccessCodeForm;