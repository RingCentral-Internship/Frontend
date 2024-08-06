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
              chrome.windows.create(
                // create new side window panel
                {
                  url: chrome.runtime.getURL("panel.html"),
                  type: "popup",
                  width: sidePanelWidth,
                  height: screenHeight,
                  left: sidePanelLeft,
                  top: newTop,
                },
                function (newWindow) {
                  if (chrome.runtime.lastError) {
                    // failure
                    console.error(
                      "Error creating window:",
                      chrome.runtime.lastError
                    );
                  } else {
                    // success
                    console.log("New window created:", newWindow);
                    // send lead data to side window panel
                    let newWindowID = newWindow.id; // new window id
                    chrome.tabs.query(
                      { windowId: newWindowID },
                      function (tabs) {
                        // get current side window panel
                        if (tabs.length > 0) {
                          let newTabID = tabs[0].id;
                          setTimeout(() => {  // delay sending message to make sure panel.js script is loaded
                            chrome.tabs.sendMessage(newTabID, {  // send POST request response
                              type: "displayLeadData",
                              data: leadData,
                            });
                          }, 500); // adjust the delay as needed
                        }
                      }
                    );
                  }
                }
              );
            })
            .catch((error) =>
              console.error("Error querying lead data:", error)
            );
        }
      }
    );
  }
});
