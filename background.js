let createdWindowId = null;  // globally define side window panel to manage and update

// Handle button click message by creating a new window
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "openWindow") {
      // screen dimensions
      let screenWidth = request.screenWidth;
      let screenHeight = request.screenHeight;
  
      let leadID = request.leadID; // lead ID
  
      // Calculate dimensions for current web page and side window panel
      let mainWidth = Math.floor(screenWidth * 0.7);
      let sidePanelWidth = Math.floor(screenWidth * 0.3);
  
      // Positioning
      let newLeft = 0; // Position of the main window on the left
      let newTop = 0; // Position of both windows (same top position)
      let sidePanelLeft = mainWidth; // Position of the side panel window on the right
  
      // Resize current web page to take up 70% of the screen
      chrome.windows.update(
        sender.tab.windowId,
        {
          width: mainWidth,
          height: screenHeight,
          left: newLeft,
          top: newTop,
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
                // check if window has already been opened
                if (createdWindowId) { // not null
                    chrome.windows.get(createdWindowId, (win) => {
                        if (chrome.runtime.lastError || !win) {  // DNE or window has been closed-- create new window
                            createNewWindow(leadData, sidePanelWidth, screenHeight, sidePanelLeft, newTop);
                        } else {  // window is open
                            if (win.state === 'minimized') {  // minimized screen view-- trigger re-expanision
                                chrome.windows.update(createdWindowId, { state: 'normal' }, () => {  // set state back
                                    updateWindowWithLeadData(leadData);
                                });
                            }
                            updateWindowWithLeadData(leadData);
                        }
                    });
                } else {  // no window has been created
                    createNewWindow(leadData, sidePanelWidth, screenHeight, sidePanelLeft, newTop);
                }
            })
              .catch((error) =>
                console.error("Error querying lead data:", error)
              );
          }
        }
      );
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

  function createNewWindow(leadData, sidePanelWidth, screenHeight, sidePanelLeft, newTop) {  // create new side window panel
    chrome.windows.create(
        // parameters 
        {
            url: chrome.runtime.getURL("panel.html"),
            type: "popup",
            width: sidePanelWidth, 
            height: screenHeight,
            left: sidePanelLeft,
            top: newTop
        },
        function (newWindow) {  
            if (chrome.runtime.lastError) {
                // failure
                console.error("Error creating window:", chrome.runtime.lastError);
            } else {
                // success
                console.log("New window created:", newWindow);
                createdWindowId = newWindow.id; // define new window ID
                waitForContentScriptToLoad(newWindow.id, leadData);  // wait for script load
            }
        }
    );
  }


function updateWindowWithLeadData(leadData) {  // get queried lead data and send to render
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
}


function waitForContentScriptToLoad(windowId, leadData) {  // get queried lead data and send to render
    chrome.tabs.query({ windowId: windowId }, function (tabs) {
        if (tabs.length > 0) {
            let newTabID = tabs[0].id;
            const checkContentScriptLoaded = setInterval(() => {  // poll until the content script is loaded
                chrome.tabs.sendMessage(newTabID, { type: "ping" }, (response) => {  // check for script response 
                    if (response && response.status === "ready") {
                        clearInterval(checkContentScriptLoaded);
                        chrome.tabs.sendMessage(newTabID, {  // send POST request response 
                            type: "displayLeadData",
                            data: leadData
                        });
                    }
                });
            }, 100);
        }
    });
}