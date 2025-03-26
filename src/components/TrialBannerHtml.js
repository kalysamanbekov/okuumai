import React from 'react';
import ReactDOM from 'react-dom';
import TrialBanner from './TrialBanner';

// u041au043eu043cu043fu043eu043du0435u043du0442 u0434u043bu044f u0432u0441u0442u0440u0430u0438u0432u0430u043du0438u044f u0431u0430u043du043du0435u0440u0430 u0442u0440u0438u0430u043bu0430 u0432 HTML-u0441u0442u0440u0430u043du0438u0446u0443
const TrialBannerHtml = () => {
  // u041fu0440u043eu0432u0435u0440u044fu0435u043c, u0435u0441u0442u044c u043bu0438 u044du043bu0435u043cu0435u043du0442 u0434u043bu044f u0432u0441u0442u0440u0430u0438u0432u0430u043du0438u044f u0431u0430u043du043du0435u0440u0430
  const trialBannerContainer = document.getElementById('trial-banner-container');
  
  if (trialBannerContainer) {
    // u0412u0441u0442u0440u0430u0438u0432u0430u0435u043c React-u043au043eu043cu043fu043eu043du0435u043du0442 u0432 HTML-u0441u0442u0440u0430u043du0438u0446u0443
    ReactDOM.render(<TrialBanner />, trialBannerContainer);
  }
  
  return null;
};

export default TrialBannerHtml;

// u0418u043du0438u0446u0438u0430u043bu0438u0437u0438u0440u0443u0435u043c u043au043eu043cu043fu043eu043du0435u043du0442, u0435u0441u043bu0438 u0441u0442u0440u0430u043du0438u0446u0430 u0437u0430u0433u0440u0443u0436u0435u043du0430
if (typeof window !== 'undefined' && document.getElementById('trial-banner-container')) {
  ReactDOM.render(<TrialBanner />, document.getElementById('trial-banner-container'));
}
