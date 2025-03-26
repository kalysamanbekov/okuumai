import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';
import '../styles/PhoneAuth.css';

const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone' u0438u043bu0438 'code'

  // u041du0430u0441u0442u0440u043eu0439u043au0430 reCAPTCHA
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA u0440u0435u0448u0435u043du0430
        },
        'expired-callback': () => {
          // reCAPTCHA u0438u0441u0442u0435u043au043bu0430
          setError('reCAPTCHA u0438u0441u0442u0435u043au043bu0430. u041fu043eu0436u0430u043bu0443u0439u0441u0442u0430, u043fu043eu043fu0440u043eu0431u0443u0439u0442u0435 u0441u043du043eu0432u0430.');
        }
      });
    }
  };

  // u041eu0442u043fu0440u0430u0432u043au0430 u043au043eu0434u0430 u0432u0435u0440u0438u0444u0438u043au0430u0446u0438u0438
  const sendVerificationCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // u0424u043eu0440u043cu0430u0442u0438u0440u043eu0432u0430u043du0438u0435 u043du043eu043cu0435u0440u0430 u0442u0435u043bu0435u0444u043eu043du0430
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+${phoneNumber}`;
      
      setupRecaptcha();
      
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhoneNumber, 
        appVerifier
      );
      
      setVerificationId(confirmationResult);
      setStep('code');
      setLoading(false);
    } catch (err) {
      console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0442u043fu0440u0430u0432u043au0435 u043au043eu0434u0430:', err);
      setError(`u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0442u043fu0440u0430u0432u043au0435 u043au043eu0434u0430: ${err.message}`);
      setLoading(false);
      
      // u0421u0431u0440u043eu0441u0438u0442u044c reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  // u041fu043eu0434u0442u0432u0435u0440u0436u0434u0435u043du0438u0435 u043au043eu0434u0430 u0432u0435u0440u0438u0444u0438u043au0430u0446u0438u0438
  const confirmVerificationCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await verificationId.confirm(verificationCode);
      // u0423u0441u043fu0435u0448u043du0430u044f u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u044f
      setLoading(false);
      // u0417u0434u0435u0441u044c u043cu043eu0436u043du043e u043fu0435u0440u0435u043du0430u043fu0440u0430u0432u0438u0442u044c u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f u043du0430 u0433u043bu0430u0432u043du0443u044e u0441u0442u0440u0430u043du0438u0446u0443
    } catch (err) {
      console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu0434u0442u0432u0435u0440u0436u0434u0435u043du0438u0438 u043au043eu0434u0430:', err);
      setError(`u041du0435u0432u0435u0440u043du044bu0439 u043au043eu0434. u041fu043eu0436u0430u043bu0443u0439u0441u0442u0430, u043fu043eu043fu0440u043eu0431u0443u0439u0442u0435 u0441u043du043eu0432u0430.`);
      setLoading(false);
    }
  };

  return (
    <div className="phone-auth-container">
      <div className="auth-card">
        <h2>OKUUM.AI</h2>
        <h3>u0412u0445u043eu0434 u0432 u0441u0438u0441u0442u0435u043cu0443</h3>
        
        {step === 'phone' ? (
          <form onSubmit={sendVerificationCode}>
            <div className="form-group">
              <label htmlFor="phone">u041du043eu043cu0435u0440 u0442u0435u043bu0435u0444u043eu043du0430</label>
              <input
                type="tel"
                id="phone"
                placeholder="+996XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <p className="hint">u0412u0432u0435u0434u0438u0442u0435 u043du043eu043cu0435u0440 u0442u0435u043bu0435u0444u043eu043du0430 u0432 u043cu0435u0436u0434u0443u043du0430u0440u043eu0434u043du043eu043c u0444u043eu0440u043cu0430u0442u0435</p>
            </div>
            
            <div id="recaptcha-container"></div>
            
            {error && <p className="error">{error}</p>}
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || !phoneNumber}
            >
              {loading ? 'u041eu0442u043fu0440u0430u0432u043au0430...' : 'u041fu043eu043bu0443u0447u0438u0442u044c u043au043eu0434'}
            </button>
          </form>
        ) : (
          <form onSubmit={confirmVerificationCode}>
            <div className="form-group">
              <label htmlFor="code">u041au043eu0434 u043fu043eu0434u0442u0432u0435u0440u0436u0434u0435u043du0438u044f</label>
              <input
                type="text"
                id="code"
                placeholder="u0412u0432u0435u0434u0438u0442u0435 u043au043eu0434 u0438u0437 SMS"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              <p className="hint">u041au043eu0434 u043eu0442u043fu0440u0430u0432u043bu0435u043d u043du0430 u043du043eu043cu0435u0440 {phoneNumber}</p>
            </div>
            
            {error && <p className="error">{error}</p>}
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || !verificationCode}
            >
              {loading ? 'u041fu0440u043eu0432u0435u0440u043au0430...' : 'u041fu043eu0434u0442u0432u0435u0440u0434u0438u0442u044c'}
            </button>
            
            <button 
              type="button" 
              className="back-btn" 
              onClick={() => {
                setStep('phone');
                setError('');
                if (window.recaptchaVerifier) {
                  window.recaptchaVerifier.clear();
                  window.recaptchaVerifier = null;
                }
              }}
            >
              u041du0430u0437u0430u0434
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PhoneAuth;
