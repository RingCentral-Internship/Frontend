console.log("Content script loaded");

function injectSummarizerButton() {
  // for classic: URL needs to contain /00Q (ID length: 15)
  const leadIDClassic = /\/00Q[A-Za-z0-9]{12}(\/|$)/;
  // for lightning: URL needs to contain /lightning/r/Lead/00Q (ID length: 18)
  const leadIDLightning = /\/lightning\/r\/Lead\/00Q[A-Za-z0-9]{15}(\/|$)/;

  isLightning = leadIDLightning.test(document.location.href);

  // check if current web page open is a lead profile page
  const isLeadProfilePage =
    leadIDClassic.test(document.location.href) ||
    leadIDLightning.test(document.location.href);
    
  // inspect web page URL
  // definetly not a lead profile page if URL contains '?'
  if (isLeadProfilePage && !document.location.href.includes("?")) {
    // ensure that current page open is a lead profile page
    console.log("On a lead profile page");

    // define lead ID
    let leadID;
    if (leadIDClassic.test(document.location.href)) {
      // classic lead ID
      leadID = document.location.href.match(leadIDClassic)[0].split("/")[1];
    } else {
      // lightning lead ID
      leadID = document.location.href.match(leadIDLightning)[0].split("/")[4];
    }
    console.log("lead ID: ", leadID);

    chrome.runtime.sendMessage({
      type: "leadInfo",
      leadID: leadID,
      isLightningExperience: isLightning
    });

    if (!document.getElementById("summarizeButton")) {
      // check if button exists
      const button = document.createElement("button"); // create button instance
      button.id = "summarizeButton"; // element name for button
      button.innerText = "Generate AI Lead Summary"; // button name

      // CSS style for button
      button.style.position = "fixed";
      button.style.bottom = "20px";
      button.style.right = "20px";
      button.style.zIndex = 1000;
      button.style.padding = "10px 20px";
      button.style.color = "#002855";
      button.style.border = "none";
      button.style.borderRadius = "5px";
      button.style.cursor = "pointer";

      document.body.appendChild(button); // render button

      // set button text based on side window panel state
      updateButtonText(button);
      setInterval(() => {
        // poll window state so button text is dynamically updated
        updateButtonText(button);
      }, 1000);

      button.addEventListener("click", function () {
        // handle click
        console.log("button clicked");
        chrome.runtime.sendMessage({
          // send message to function in background.js
          type: "openWindow",
          screenWidth: Math.floor(window.outerWidth), // width window is open at
          screenHeight: Math.floor(window.outerHeight), // height window is open at
          screenTop: Math.floor(window.screenY), // top position window is open at (y)
          screenLeft: Math.floor(window.screenX), // left position window is open at (x)
          leadID: leadID, // current lead window is open at
        });
      });
    }
  } else {
    // not on lead profile page
    console.log("Not on a lead page: ", document.location.href);
    const existingButton = document.getElementById("summarizeButton");
    if (existingButton) {
      // check if button exists
      existingButton.remove(); // remove button
    }
  }
}

function updateButtonText(button) {
  // check state of side window panel and set button accordingly
  chrome.runtime.sendMessage({ type: "checkWindowState" }, (response) => {
    if (response && response.windowOpen) {
      // side window panel is open
      button.innerText = "Refresh AI Lead Summary";
    } else {
      // side window panel has not been opened
      button.innerText = "Generate AI Lead Summary";
    }
  });
}

// make sure that button injection is in sync with page
let lastUrl = document.location.href; // last URL
function checkUrlChange() {
  const currentUrl = document.location.href; // current URL
  if (currentUrl !== lastUrl) {
    // URL has changed
    lastUrl = currentUrl; // reassign last URL
    console.log("URL changed to: ", currentUrl);
    injectSummarizerButton(); // check what page is open and inject button if on lead profile page
  }
}

// Observe changes in the DOM
const observer = new MutationObserver((mutationsList, observer) => {
  checkUrlChange();
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial injection attempt for newly loaded window
window.addEventListener("load", () => {
  console.log("Window fully loaded");
  injectSummarizerButton();
});
