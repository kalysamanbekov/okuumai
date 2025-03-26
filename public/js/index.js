import React from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0';
import TrialBanner from './components/TrialBanner.js';
import { auth, getGoogleRedirectResult } from './firebase.js';

// u041fu0440u043eu0432u0435u0440u043au0430 u0440u0435u0437u0443u043bu044cu0442u0430u0442u0430 u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u0438 u0447u0435u0440u0435u0437 Google
const checkGoogleRedirect = async () => {
  try {
    const result = await getGoogleRedirectResult();
    if (result.user) {
      console.log('u0423u0441u043fu0435u0448u043du044bu0439 u0432u0445u043eu0434 u0447u0435u0440u0435u0437 Google:', result.user.email);
    }
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu043bu0443u0447u0435u043du0438u0438 u0440u0435u0437u0443u043bu044cu0442u0430u0442u0430 u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u0438 Google:', error);
  }
};

// u0418u043du0438u0446u0438u0430u043bu0438u0437u0430u0446u0438u044f u043au043eu043cu043fu043eu043du0435u043du0442u0430 u0431u0430u043du043du0435u0440u0430 u0442u0440u0438u0430u043bu0430
const initTrialBanner = () => {
  const trialBannerContainer = document.getElementById('trial-banner-container');
  if (trialBannerContainer) {
    ReactDOM.render(
      <React.StrictMode>
        <TrialBanner />
      </React.StrictMode>,
      trialBannerContainer
    );
  }
};

// u041fu0440u043eu0432u0435u0440u043au0430 u0441u043eu0441u0442u043eu044fu043du0438u044f u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u0438
const initAuth = () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('u041fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044c u0430u0432u0442u043eu0440u0438u0437u043eu0432u0430u043d:', user.email);
      // u0418u043du0438u0446u0438u0430u043bu0438u0437u0438u0440u0443u0435u043c u0431u0430u043du043du0435u0440 u0442u0440u0438u0430u043bu0430
      initTrialBanner();
    } else {
      console.log('u041fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044c u043du0435 u0430u0432u0442u043eu0440u0438u0437u043eu0432u0430u043d');
      // u041fu0435u0440u0435u043du0430u043fu0440u0430u0432u043bu044fu0435u043c u043du0430 u0441u0442u0440u0430u043du0438u0446u0443 u0432u0445u043eu0434u0430, u0435u0441u043bu0438 u043cu044b u043du0435 u043du0430 u043du0435u0439
      const currentPath = window.location.pathname;
      if (currentPath !== '/login.html' && currentPath !== '/register.html' && currentPath !== '/') {
        window.location.href = '/login.html';
      }
    }
  });
};

// u0418u043du0438u0446u0438u0430u043bu0438u0437u0430u0446u0438u044f u043fu0440u0438u043bu043eu0436u0435u043du0438u044f
const initApp = () => {
  checkGoogleRedirect();
  initAuth();
};

// u0417u0430u043fu0443u0441u043a u043fu0440u0438u043bu043eu0436u0435u043du0438u044f u043fu043eu0441u043bu0435 u0437u0430u0433u0440u0443u0437u043au0438 u0441u0442u0440u0430u043du0438u0446u044b
document.addEventListener('DOMContentLoaded', initApp);
