/**
 * Survey Creator License Banner Remover
 * Automatically removes the Survey Creator license banner when detected
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        BANNER_SELECTOR: '.svc-creator__banner',
        CONTAINER_SELECTORS: [
            '.svc-full-container.svc-creator__area.svc-flex-column.svc-creator__area--with-banner',
            '.svc-full-container.svc-creator__area.svc-flex-column',
            '.svc-creator__area'
        ],
        CHECK_INTERVAL: 500, // milliseconds
        MAX_CHECK_DURATION: 30000, // 30 seconds
        OBSERVER_CONFIG: {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
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
     * Ensure Survey Creator container takes full screen
     */
    function ensureFullScreen() {
        CONFIG.CONTAINER_SELECTORS.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                // Remove banner class that might affect styling
                container.classList.remove('svc-creator__area--with-banner');
                console.log('🔧 Survey Creator container optimized for full screen');
            }
        });
    }
    
    /**
     * Apply full screen styles programmatically as backup
     */
    function applyFullScreenStyles() {
        const container = document.querySelector('.svc-creator__area');
        if (container) {
            // Check if we're in admin page (has sidebar)
            const isAdminPage = document.querySelector('.col-md-3.sidebar') !== null;
            
            if (isAdminPage) {
                // For admin page - respect the Bootstrap layout
                const styles = {
                    height: 'calc(100vh - 120px)',
                    minHeight: 'calc(100vh - 120px)',
                    width: '100%',
                    position: 'relative',
                    overflow: 'auto'
                };
                Object.assign(container.style, styles);
                console.log('🎨 Content area styles applied for admin layout');
            } else {
                // For standalone page - full screen
                const styles = {
                    height: '100vh',
                    minHeight: '100vh',
                    width: '100vw',
                    minWidth: '100vw',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    zIndex: '1000',
                    overflow: 'auto'
                };
                Object.assign(container.style, styles);
                console.log('🎨 Full screen styles applied for standalone layout');
            }
        }
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
                        // Check if Survey Creator container was added
                        if (node.classList && (
                            node.classList.contains('svc-creator__area') ||
                            node.querySelector && node.querySelector('.svc-creator__area')
                        )) {
                            setTimeout(() => {
                                ensureFullScreen();
                                applyFullScreenStyles();
                            }, 100);
                        }
                    }
                });
            } else if (mutation.type === 'attributes') {
                const target = mutation.target;
                if (target.classList && target.classList.contains('svc-creator__area')) {
                    setTimeout(() => {
                        ensureFullScreen();
                        applyFullScreenStyles();
                    }, 100);
                }
            }
        });
    }
    
    /**
     * Start the banner removal system
     */
    function start() {
        // Try immediate removal and full screen setup
        removeBanner();
        ensureFullScreen();
        applyFullScreenStyles();
        
        // Set up MutationObserver
        if (window.MutationObserver) {
            observer = new MutationObserver(handleMutations);
            observer.observe(document.body || document.documentElement, CONFIG.OBSERVER_CONFIG);
        }
        
        // Set up periodic check as fallback
        intervalId = setInterval(() => {
            removeBanner();
            ensureFullScreen();
        }, CONFIG.CHECK_INTERVAL);
        
        // Auto cleanup after max duration
        timeoutId = setTimeout(stop, CONFIG.MAX_CHECK_DURATION);
        
        console.log('🔧 Survey Creator banner remover and full screen optimizer initialized');
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
        removeBanner: removeBanner,
        ensureFullScreen: ensureFullScreen,
        applyFullScreenStyles: applyFullScreenStyles
    };
    
})();
