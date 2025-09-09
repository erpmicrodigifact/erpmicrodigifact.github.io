/**
 * Survey Creator License Banner Remover
 * Automatically removes the Survey Creator license banner when detected
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        BANNER_SELECTOR: '.svc-creator__banner',
        CHECK_INTERVAL: 500, // milliseconds
        MAX_CHECK_DURATION: 30000, // 30 seconds
        OBSERVER_CONFIG: {
            childList: true,
            subtree: true
        }
    };
    
    let observer = null;
    let intervalId = null;
    let timeoutId = null;
    
    /**
     * Remove the license banner if found
     * @returns {boolean} True if banner was found and removed
     */
    function removeBanner() {
        const banner = document.querySelector(CONFIG.BANNER_SELECTOR);
        if (banner) {
            banner.remove();
            console.log('✅ Survey Creator license banner removed');
            return true;
        }
        return false;
    }
    
    /**
     * Handle DOM mutations
     * @param {MutationRecord[]} mutations 
     */
    function handleMutations(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if added node contains the banner
                        if (node.querySelector && node.querySelector(CONFIG.BANNER_SELECTOR)) {
                            removeBanner();
                        }
                        // Check if added node is the banner itself
                        if (node.classList && node.classList.contains('svc-creator__banner')) {
                            node.remove();
                            console.log('✅ Survey Creator license banner removed (direct)');
                        }
                    }
                });
            }
        });
    }
    
    /**
     * Start the banner removal system
     */
    function start() {
        // Try immediate removal
        removeBanner();
        
        // Set up MutationObserver
        if (window.MutationObserver) {
            observer = new MutationObserver(handleMutations);
            observer.observe(document.body || document.documentElement, CONFIG.OBSERVER_CONFIG);
        }
        
        // Set up periodic check as fallback
        intervalId = setInterval(removeBanner, CONFIG.CHECK_INTERVAL);
        
        // Auto cleanup after max duration
        timeoutId = setTimeout(stop, CONFIG.MAX_CHECK_DURATION);
        
        console.log('🔧 Survey Creator banner remover initialized');
    }
    
    /**
     * Stop the banner removal system
     */
    function stop() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        
        console.log('🛑 Survey Creator banner remover stopped');
    }
    
    /**
     * Initialize when DOM is ready
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            // DOM already loaded
            setTimeout(start, 100);
        }
    }
    
    // Auto-initialize
    init();
    
    // Expose global functions for manual control
    window.SurveyCreatorBannerRemover = {
        start: start,
        stop: stop,
        removeBanner: removeBanner
    };
    
})();
