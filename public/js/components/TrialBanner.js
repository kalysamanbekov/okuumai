// u0418u0441u043fu043eu043bu044cu0437u0443u0435u043c u0433u043bu043eu0431u0430u043bu044cu043du044bu0435 u043fu0435u0440u0435u043cu0435u043du043du044bu0435 React, u0437u0430u0433u0440u0443u0436u0435u043du043du044bu0435 u0447u0435u0440u0435u0437 CDN
const React = window.React;
const { useState, useEffect } = React;
import { auth, checkTrialStatus } from '../firebase.js';

const TrialBanner = () => {
  const [trialStatus, setTrialStatus] = useState({
    isActive: false,
    timeRemaining: 0,
    loading: true,
    error: null
  });
  
  // u0424u043eu0440u043cu0430u0442u0438u0440u043eu0432u0430u043du0438u0435 u043eu0441u0442u0430u0432u0448u0435u0433u043eu0441u044f u0432u0440u0435u043cu0435u043du0438 u0432 u0444u043eu0440u043cu0430u0442 u0427u0427:u041cu041c:u0421u0421
  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return '00:00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // u041fu043eu043bu0443u0447u0435u043du0438u0435 u0441u0442u0430u0442u0443u0441u0430 u0442u0440u0438u0430u043bu0430
  useEffect(() => {
    const fetchTrialStatus = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        setTrialStatus(prev => ({ ...prev, loading: false }));
        return;
      }
      
      try {
        const result = await checkTrialStatus(user.uid);
        setTrialStatus({
          isActive: result.isActive,
          timeRemaining: result.timeLeft,
          loading: false,
          error: result.error
        });
      } catch (error) {
        setTrialStatus({
          isActive: false,
          timeRemaining: 0,
          loading: false,
          error: error.message
        });
      }
    };
    
    fetchTrialStatus();
    
    // u041eu0431u043du043eu0432u043bu044fu0435u043c u0441u0442u0430u0442u0443u0441 u0442u0440u0438u0430u043bu0430 u043au0430u0436u0434u0443u044e u043cu0438u043du0443u0442u0443
    const intervalId = setInterval(fetchTrialStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // u041eu0431u043du043eu0432u043bu0435u043du0438u0435 u0442u0430u0439u043cu0435u0440u0430 u043au0430u0436u0434u0443u044e u0441u0435u043au0443u043du0434u0443
  useEffect(() => {
    if (!trialStatus.isActive || trialStatus.loading) return;
    
    const timerId = setInterval(() => {
      setTrialStatus(prev => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1000)
      }));
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [trialStatus.isActive, trialStatus.loading]);
  
  // u0415u0441u043bu0438 u0434u0430u043du043du044bu0435 u0437u0430u0433u0440u0443u0436u0430u044eu0442u0441u044f u0438u043bu0438 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044c u043du0435 u0430u0432u0442u043eu0440u0438u0437u043eu0432u0430u043d, u043du0435 u043fu043eu043au0430u0437u044bu0432u0430u0435u043c u0431u0430u043du043du0435u0440
  if (trialStatus.loading || !auth.currentUser) {
    return null;
  }
  
  // u0415u0441u043bu0438 u0442u0440u0438u0430u043b u0430u043au0442u0438u0432u0435u043d, u043fu043eu043au0430u0437u044bu0432u0430u0435u043c u0431u0430u043du043du0435u0440 u0441 u0442u0430u0439u043cu0435u0440u043eu043c
  if (trialStatus.isActive) {
    return (
      <div className="trial-banner trial-active">
        <h3>u0414u043eu0431u0440u043e u043fu043eu0436u0430u043bu043eu0432u0430u0442u044c u0432 u041eu0420u0422 u0422u0440u0435u043du0430u0436u0451u0440!</h3>
        <p>u0423 u0432u0430u0441 u0435u0441u0442u044c u0434u043eu0441u0442u0443u043f u043au043e u0432u0441u0435u043c u043fu0440u043eu0431u043du044bu043c u0442u0435u0441u0442u0430u043c u0432 u0442u0435u0447u0435u043du0438u0435 24 u0447u0430u0441u043eu0432</p>
        <div className="trial-timer">
          u041eu0441u0442u0430u043bu043eu0441u044c u0432u0440u0435u043cu0435u043du0438: {formatTimeRemaining(trialStatus.timeRemaining)}
        </div>
        <button 
          className="trial-banner-button"
          onClick={() => window.location.href = 'catalog.html'}
        >
          u041fu0435u0440u0435u0439u0442u0438 u043a u0442u0435u0441u0442u0430u043c
        </button>
      </div>
    );
  }
  
  // u0415u0441u043bu0438 u0442u0440u0438u0430u043b u0438u0441u0442u0451u043a, u043fu043eu043au0430u0437u044bu0432u0430u0435u043c u0431u0430u043du043du0435u0440 u0441 u043fu0440u0435u0434u043bu043eu0436u0435u043du0438u0435u043c u043au0443u043fu0438u0442u044c u0434u043eu0441u0442u0443u043f
  return (
    <div className="trial-banner trial-expired">
      <h3>u041fu0440u043eu0431u043du044bu0439 u0434u043eu0441u0442u0443u043f u0437u0430u0432u0435u0440u0448u0451u043d</h3>
      <p>u0410u043au0442u0438u0432u0438u0440u0443u0439u0442u0435 u043fu043eu043bu043du044bu0439 u0434u043eu0441u0442u0443u043f u043a u0442u0440u0435u043du0430u0436u0451u0440u0443!</p>
      <button 
        className="trial-banner-button"
        onClick={() => window.location.href = 'payment.html'}
      >
        u041au0443u043fu0438u0442u044c u0434u043eu0441u0442u0443u043f u0437u0430 890 u0441u043eu043c
      </button>
    </div>
  );
};

export default TrialBanner;
