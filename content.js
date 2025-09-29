// Monitor for CAPTCHA elements on the page
function monitorCaptchas() {
  // Check for reCAPTCHA
  if (typeof grecaptcha !== 'undefined') {
    chrome.runtime.sendMessage({
      type: 'CAPTCHA_DETECTED',
      captchaType: 'RECAPTCHA'
    });
  }
  
  // Check for hCaptcha
  if (document.querySelector('[data-sitekey]')) {
    chrome.runtime.sendMessage({
      type: 'CAPTCHA_DETECTED',
      captchaType: 'HCAPTCHA'
    });
  }
  
  // Check for image CAPTCHAs
  const imageCaptchas = document.querySelectorAll('img[src*="captcha"], img[alt*="captcha"]');
  if (imageCaptchas.length > 0) {
    chrome.runtime.sendMessage({
      type: 'CAPTCHA_DETECTED',
      captchaType: 'IMAGE',
      count: imageCaptchas.length
    });
  }
}

// Run monitoring when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', monitorCaptchas);
} else {
  monitorCaptchas();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SOLVE_CAPTCHA') {
    // Handle CAPTCHA solving based on type
    solveCaptcha(request.captchaType, request.apiKey)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Will respond asynchronously
  }
});