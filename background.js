// handle button click message by creating new window
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "openWindow") {
    // recieve message
    // total screen dimensions to work with
    let totalScreenWidth = request.screenWidth;
    let totalScreenHeight = request.screenHeight;

    // window dimensions for current web page open and side window panel
    let mainWidth = Math.floor(totalScreenWidth * 0.7);
    let sidePanelWidth = Math.floor(totalScreenWidth * 0.3);

    // positioning
    let newLeft = 0; // Position of the main window
    let newTop = 0; // Position of both windows (same top position)
    let sidePanelLeft = mainWidth; // Position of the side panel window

    // resize current web page open to take up 70% of the screen
    chrome.windows.update(
      sender.tab.windowId,
      {
        width: mainWidth,
        height: totalScreenHeight,
        left: newLeft,
        top: newTop,
      },
      function (updatedWindow) {
        // check for success
        if (chrome.runtime.lastError) {
          // failed
          console.error(
            "Error resizing current web page: ",
            chrome.runtime.lastError,
          );
        } else {
          // success
          console.log("Window resized: ", updatedWindow);

          // create side window panel to take up 30% of the screen
          chrome.windows.create(
            {
              url: chrome.runtime.getURL("panel.html"),
              type: "popup",
              width: sidePanelWidth,
              height: totalScreenHeight,
              left: sidePanelLeft,
              top: newTop,
            },
            function (newWindow) {
              // check for success
              if (chrome.runtime.lastError) {
                // failed
                console.error(
                  "Error creating window:",
                  chrome.runtime.lastError,
                );
              } else {
                // success
                console.log("New window created:", newWindow);
              }
            },
          );
        }
      },
    );
  }
});
