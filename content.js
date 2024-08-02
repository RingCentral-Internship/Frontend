console.log('Content script loaded');

function injectSummarizerButton() {
    // inspect web page URL
    const isLeadProfilePage = /\/00Q\d+/.test(document.location.href) || 
    /\/lightning\/r\/Lead\/00Q\d+/.test(document.location.href);

    if (isLeadProfilePage) { // ensure that current page open is a lead profile page
        console.log('On a lead profile page');
        
        if (!document.getElementById('summarizeButton')) { // check if button exists
            const button = document.createElement('button'); // create button instance
            button.id = 'summarizeButton'; // element name for button 
            button.innerText = 'AI Summary'; // button name 

            // CSS style for button
            button.style.position = 'fixed'; 
            button.style.bottom = '20px';
            button.style.right = '20px';
            button.style.zIndex = 1000;
            button.style.padding = '10px 20px';
            button.style.color = '#002855';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';

            document.body.appendChild(button); // render button 

            button.addEventListener('click', function() {  // handle click
                console.log('button clicked');
                chrome.runtime.sendMessage({ // send message to function in background.js
                    type: 'openWindow',
                    screenWidth: window.screen.availWidth,
                    screenHeight: window.screen.availHeight
                });
            });
        }
    } else { // not on lead profile page 
        console.log('Not on a lead page: ', document.location.href);
        const existingButton = document.getElementById('summarizeButton');
        if (existingButton) {  // check if button exists 
            existingButton.remove();  // remove button 
        }
    }
}

let lastUrl = document.location.href;  // last URL 
function checkUrlChange() {
    const currentUrl = document.location.href;  // current URL 
    if (currentUrl !== lastUrl) {  // URL has changed 
        lastUrl = currentUrl;  // reassign last URL 
        console.log('URL changed to: ', currentUrl);  
        injectSummarizerButton();  // check what page is open and inject button if on lead profile page
    }
}

// Observe changes in the DOM
const observer = new MutationObserver((mutationsList, observer) => {
    checkUrlChange();  
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial injection attempt for newly loaded window 
window.addEventListener('load', () => {
    console.log('Window fully loaded');
    injectSummarizerButton();  
});
