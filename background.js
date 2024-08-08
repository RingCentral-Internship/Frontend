let createdWindowId = null;  // globally define side window panel to manage and update

// Handle button click message by creating a new window
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "openWindow") {
      // screen dimensions and position: full area to work with
      let screenWidth = Math.floor(request.screenWidth);
      let screenHeight = Math.floor(request.screenHeight);
      let screenLeft = Math.floor(request.screenLeft);  // (x)
      let screenTop = Math.floor(request.screenTop);   // (y)
  
      let leadID = request.leadID; // lead ID
  
      // Calculate dimensions for current web page and side window panel
      let mainWidth = Math.floor(screenWidth * 0.7);
      let sidePanelWidth = Math.floor(screenWidth * 0.3);
  
      // Positioning
      let sidePanelLeft = Math.floor(screenLeft + mainWidth); // (x) Position of the side window panel 
  
      // Check if side window panel is already open 
      if (createdWindowId) {  // not null
        chrome.windows.get(createdWindowId, (win) => {
            if (chrome.runtime.lastError || !win) {  // DNE or window has been closed-- create new one
                resizeAndCreateWindow(sender.tab.windowId, screenLeft, screenTop, mainWidth, screenHeight, sidePanelWidth, sidePanelLeft, leadID);
            } else {  // window is open
                if (win.state === 'minimized') {  // mnimized screen view-- re expand and render lead data
                    chrome.windows.update(createdWindowId, { state: 'normal'}, () => {  // re expand
                        updateWindowWithLeadData(leadID);
                    });
                } else {  // render lead data
                    updateWindowWithLeadData(leadID);
                }
            }
        });
      } else {  // null-- create window
        resizeAndCreateWindow(sender.tab.windowId, screenLeft, screenTop, mainWidth, screenHeight, sidePanelWidth, sidePanelLeft, leadID);
      }
    } else if (request.type === "checkWindowState") {  // check if window is open and send back state to content.js
        if (createdWindowId) {  // not null
            chrome.windows.get(createdWindowId, (win) => {
                if (chrome.runtime.lastError || !win) {  // side window panel is not open 
                    sendResponse({ windowOpen: false });
                } else {  // side window panel is open
                    sendResponse({ windowOpen: true });
                }
            });
        } else {  // side window panel is not open
            sendResponse({ windowOpen: false });  
        }
        return true;  // keep callback alive for asynchronousity
    }
  });

  function resizeAndCreateWindow(windowId, screenLeft, screenTop, mainWidth, screenHeight, sidePanelWidth, sidePanelLeft, leadID) {  // resize window and create side window panel 
    // Resize current web page to take up 70% of the screen
    chrome.windows.update(
        windowId,
        {
            width: mainWidth,
            height: screenHeight,
            left: screenLeft,
            top: screenTop,
        },
        function (updatedWindow) {
            if (chrome.runtime.lastError) {
                // failure
                console.error(
                "Error resizing current web page: ",
                chrome.runtime.lastError
                );
            } else {
                // success
                console.log("Window resized: ", updatedWindow);
                createNewWindow(sidePanelWidth, screenHeight, sidePanelLeft, screenTop, leadID); // create side window panel and render lead data
            }
        }
      );
  }

function createNewWindow(sidePanelWidth, screenHeight, sidePanelLeft, screenTop, leadID) {  // create side window panel
    chrome.windows.create(
        // parameters 
        {
            url: chrome.runtime.getURL("panel.html"),
            type: "popup",
            width: sidePanelWidth, 
            height: screenHeight,
            left: sidePanelLeft,
            top: screenTop
        },
        function (newWindow) {  
            if (chrome.runtime.lastError) {
                // failure
                console.error("Error creating window:", chrome.runtime.lastError);
            } else {
                // success
                console.log("New window created:", newWindow);
                createdWindowId = newWindow.id; // define new window ID
                waitForContentScriptToLoad(newWindow.id, leadID);  // wait for script load
            }
        }
    );
}


function updateWindowWithLeadData(leadID) {  // get queried lead data and send to render
    // Fetch lead data using the leadId from the Python server
    fetch(`http://localhost:5000/query_lead`, {
        // creating POST request for Python API endpoint
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ lead_id: leadID }), // pass in Lead ID
    })
    .then((response) => response.json()) // waitiing for response (query result)
    .then((leadData) => {
        console.log(leadData);
        chrome.tabs.query({ windowId: createdWindowId }, function (tabs) {
            if (tabs.length > 0) {
                let newTabID = tabs[0].id;
                setTimeout(() => {  // delay sending message to make sure panel.js script is loaded
                    chrome.tabs.sendMessage(newTabID, {  // send POST request response 
                        type: "displayLeadData",
                        data: leadData
                    });
                }, 500);  
            }
        });
    })
    .catch((error) =>  // failure
        console.error("Error querying lead data: ",error)
    );
}


function waitForContentScriptToLoad(windowId, leadID) {  // get queried lead data and send to render
    chrome.tabs.query({ windowId: windowId }, function (tabs) {
        if (tabs.length > 0) {
            let newTabID = tabs[0].id;
            const checkContentScriptLoaded = setInterval(() => {  // poll until the content script is loaded
                chrome.tabs.sendMessage(newTabID, { type: "ping" }, (response) => {  // check for script response 
                    if (response && response.status === "ready") {
                        clearInterval(checkContentScriptLoaded);
                        chrome.tabs.sendMessage(newTabID, {  // send POST request response 
                            type: "displayLoading",
                        });
                        updateWindowWithLeadData(leadID); // fetch and render lead data
                    }
                });
            }, 100);
        }
    });
}