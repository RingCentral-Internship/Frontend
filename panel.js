// scripts for rendering on html page (side window panel)
document.addEventListener("DOMContentLoaded", function () {
    console.log("Panel.js is loaded and listening for messages");
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === "ping") {  // new window loaded and created 
        sendResponse({ status: "ready" });
      } else if (request.type === "displayLeadData") {  // lead data is ready to render
        console.log("Message received in panel.js:", request);
        const leadData = request.data;
        document.getElementById("summaryContent").innerText = `
          ID: ${leadData.Id}
          Name: ${leadData.Name}
          Company: ${leadData.Company}
          Email: ${leadData.Email}
          Phone: ${leadData.Phone}
          Status: ${leadData.Status}
        `;
      }
    });
  });
  