import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const useInactivityDetector = (timeoutMinutes = 30) => {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = (timeoutMinutes - 2) * 60 * 1000; 

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }


    if (isAuthenticated) {
  
      warningTimeoutRef.current = setTimeout(() => {
        const event = new CustomEvent('sessionWarning', {
          detail: { remainingMinutes: 2 }
        });
        window.dispatchEvent(event);
      }, warningMs);


      timeoutRef.current = setTimeout(() => {

        const event = new CustomEvent('sessionExpiredByInactivity');
        window.dispatchEvent(event);
        

        setTimeout(() => {
          logout();
        }, 100);
      }, timeoutMs);
    }
  }, [isAuthenticated, logout, timeoutMs, warningMs]);

  const handleActivity = useCallback(() => {
    if (isAuthenticated) {
      resetTimer();
    }
  }, [isAuthenticated, resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) {

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      return;
    }


    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];


    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });


    resetTimer();


    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isAuthenticated, handleActivity, resetTimer]);

  return {
    resetTimer,
    lastActivity: lastActivityRef.current
  };
};

export default useInactivityDetector;