import { useEffect } from 'react';

/**
 * useFocusSync Hook
 * 
 * Detects route/view changes and broadcasts them to any parent window.
 * Useful for syncing states when the app is embedded in an iframe.
 * 
 * @param {string} view - The current view/path identifier
 */
export const useFocusSync = (view) => {
  useEffect(() => {
    // Broadcast message only if we are in an iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { 
          type: 'ROUTE_CHANGE', 
          path: window.location.pathname,
          view: view // Adding view for more context in state-based navigation
        }, 
        '*'
      );
    }
  }, [view]);
};
