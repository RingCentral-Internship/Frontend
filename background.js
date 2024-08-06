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
                    // Pass the lead data to render in side window panel
                    chrome.runtime.sendMessage(newWindow.id, {
                      type: "displayLeadData",
                      data: leadData,
                    });
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
