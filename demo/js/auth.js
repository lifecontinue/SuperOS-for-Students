// Authentication module

let setAuthModeHandler = null;

function normalizeAuthKey(value) {
  const raw = (value || '').toString().trim().toLowerCase();
  if (['login', 'signin', 'sign-in', 'sign_in', 'sign in', 'emailpass', 'sigin'].includes(raw)) {
    return 'emailPass';
  }
  if (['signup', 'sign-up', 'sign_up', 'sign up', 'register', 'emailcode'].includes(raw)) {
    return 'emailCode';
  }
  return raw || 'emailCode';
}

function bindAuthUI() {
  const authRoot = document.getElementById('view-auth');
  if (!authRoot || authRoot.dataset.bound === 'true') {
    return false;
  }
  authRoot.dataset.bound = 'true';

  const authTabs = Array.from(authRoot.querySelectorAll('[data-auth]'));
  const authPanes = {
    emailCode: authRoot.querySelector('#auth-emailCode'),
    emailPass: authRoot.querySelector('#auth-emailPass')
  };

  const activateAuthTab = (targetKey) => {
    const key = normalizeAuthKey(targetKey);
    authTabs.forEach((tab) => {
      const tabKey = normalizeAuthKey(tab.dataset.authMode || tab.dataset.auth);
      tab.classList.toggle('active', tabKey === key);
    });
    Object.entries(authPanes).forEach(([paneKey, paneEl]) => {
      if (paneEl) paneEl.classList.toggle('active', paneKey === key);
    });
  };

  setAuthModeHandler = (mode) => activateAuthTab(mode);
  window.setAuthMode = setAuthModeHandler;

  const defaultTab = authTabs.find((tab) => tab.classList.contains('active')) || authTabs[0];
  activateAuthTab(defaultTab?.dataset.authMode || defaultTab?.dataset.auth || 'emailCode');

  authRoot.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-auth]');
    if (!tab || !authRoot.contains(tab)) return;
    event.preventDefault();
    const mode = tab.dataset.authMode || tab.dataset.auth;
    if (mode) setAuthModeHandler(mode);
  });

  const authStatus = authRoot.querySelector('#authStatus');
  const emailCodeEmail = authRoot.querySelector('#emailCodeEmail');
  const emailCodeInput = authRoot.querySelector('#emailCodeInput');
  const btnSendCode = authRoot.querySelector('#btnSendCode');
  const btnVerifyCode = authRoot.querySelector('#btnVerifyCode');

  if (btnSendCode) {
    btnSendCode.addEventListener('click', () => {
      if (!emailCodeEmail || !emailCodeEmail.value.includes('@')) {
        if (authStatus) authStatus.textContent = 'Enter a valid email';
        return;
      }
      if (authStatus) authStatus.textContent = 'Code sent: 123456 (Demo)';
      if (typeof speak === 'function') {
        speak('A verification code was sent to your email. Please enter 123456 to continue.');
      }
    });
  }

  if (btnVerifyCode) {
    btnVerifyCode.addEventListener('click', () => {
      if (!emailCodeInput) return;
      if (emailCodeInput.value.trim() === '123456') {
        const email = emailCodeEmail ? emailCodeEmail.value : '';
        state.session = { provider: 'emailCode', email, lastLogin: new Date() };
        state.profile.email = email;
        if (authStatus) authStatus.textContent = 'Signed in';
        if (typeof speak === 'function') {
          speak('Welcome to SuperOS! I am your AI Tutor. Let\'s complete onboarding.');
        }
        if (typeof revealPostAuthUI === 'function') {
          revealPostAuthUI();
        }
        // Trigger Router Agent check after login
        if (typeof RouterAgent !== 'undefined' && RouterAgent.checkDailyStatus) {
          setTimeout(() => RouterAgent.checkDailyStatus(), 100);
        }
        // Use requestAnimationFrame for smooth transition
        requestAnimationFrame(() => {
          if (typeof setRoute === 'function') {
            setRoute('onboarding');
          }
          if (typeof goStep === 'function') {
            setTimeout(() => goStep(state.onboardingIndex || 0), 50);
          }
        });
      } else {
        if (authStatus) authStatus.textContent = 'Invalid code';
      }
    });
  }

  const emailPassEmail = authRoot.querySelector('#emailPassEmail');
  const emailPassPwd = authRoot.querySelector('#emailPassPwd');
  const btnLoginPass = authRoot.querySelector('#btnLoginPass');

  if (btnLoginPass) {
    btnLoginPass.addEventListener('click', () => {
      if (!emailPassEmail || !emailPassPwd || !emailPassEmail.value || !emailPassPwd.value) {
        if (authStatus) authStatus.textContent = 'Enter email and password';
        return;
      }
      state.session = { provider: 'emailPass', email: emailPassEmail.value, lastLogin: new Date() };
      state.profile.email = emailPassEmail.value;
      if (authStatus) authStatus.textContent = 'Signed in';
      if (typeof speak === 'function') {
        speak('Welcome back! Let\'s continue your journey.');
      }
      if (typeof revealPostAuthUI === 'function') {
        revealPostAuthUI();
      }
      // Trigger Router Agent check after login
      if (typeof RouterAgent !== 'undefined' && RouterAgent.checkDailyStatus) {
        setTimeout(() => RouterAgent.checkDailyStatus(), 100);
      }
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        if (typeof setRoute === 'function') {
          setRoute('onboarding');
        }
        if (typeof goStep === 'function') {
          setTimeout(() => goStep(state.onboardingIndex || 0), 50);
        }
      });
    });
  }

  const btnGoogle = authRoot.querySelector('#btnGoogle');
  if (btnGoogle) {
    const newBtn = btnGoogle.cloneNode(true);
    const parent = btnGoogle.parentNode;
    if (parent) parent.replaceChild(newBtn, btnGoogle);
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.session = { provider: 'google', email: 'google_user@example.com', lastLogin: new Date() };
      state.profile.email = 'google_user@example.com';
      const authStatusEl = authRoot.querySelector('#authStatus');
      if (authStatusEl) authStatusEl.textContent = 'Signed in with Google';
      if (typeof speak === 'function') {
        speak('Google sign-in successful. Starting onboarding.');
      }
      if (typeof revealPostAuthUI === 'function') {
        revealPostAuthUI();
      }
      // Trigger Router Agent check after login
      if (typeof RouterAgent !== 'undefined' && RouterAgent.checkDailyStatus) {
        setTimeout(() => RouterAgent.checkDailyStatus(), 100);
      }
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        if (typeof setRoute === 'function') {
          setRoute('onboarding');
        }
        if (typeof goStep === 'function') {
          setTimeout(() => goStep(state.onboardingIndex || 0), 50);
        }
      });
    });
  }

  return true;
}

function initAuth() {
  const bind = () => bindAuthUI();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
}

window.bindAuthUI = bindAuthUI;

// Also handle Google button and auth tab toggles in global delegation as fallback
document.addEventListener('click', (e) => {
  const t = e.target;
  if (!t) return;

  const authModeTrigger = t.closest('[data-auth-mode]');
  if (authModeTrigger) {
    const mode = authModeTrigger.getAttribute('data-auth-mode');
    if (mode) {
      e.preventDefault();
      if (typeof setAuthModeHandler === 'function') {
        setAuthModeHandler(mode);
      } else if (typeof window.setAuthMode === 'function') {
        window.setAuthMode(mode);
      }
    }
  }

  const btnGoogleClick = t.id === 'btnGoogle' ? t : t.closest('#btnGoogle');
  if (btnGoogleClick && btnGoogleClick.id === 'btnGoogle') {
    e.preventDefault();
    e.stopPropagation();
    state.session = { provider: 'google', email: 'google_user@example.com', lastLogin: new Date() };
    state.profile.email = 'google_user@example.com';
    const authStatusEl = document.getElementById('authStatus');
    if (authStatusEl) authStatusEl.textContent = 'Signed in with Google';
    if (typeof speak === 'function') {
      speak('Google sign-in successful. Starting onboarding.');
    }
    if (typeof revealPostAuthUI === 'function') {
      revealPostAuthUI();
    }
    // Trigger Router Agent check after login
    if (typeof RouterAgent !== 'undefined' && RouterAgent.checkDailyStatus) {
      setTimeout(() => RouterAgent.checkDailyStatus(), 100);
    }
    // Use requestAnimationFrame for smooth transition
    requestAnimationFrame(() => {
      if (typeof setRoute === 'function') {
        setRoute('onboarding');
      }
      if (typeof goStep === 'function') {
        setTimeout(() => goStep(state.onboardingIndex || 0), 50);
      }
    });
  }
});

// Export init function for consumption elsewhere
// (app.js calls initAuth immediately after load)

