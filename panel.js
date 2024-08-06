// display AI generated lead summary
document.addEventListener("DOMContentLoaded", function () {
  console.log("Panel.js is loaded and listening for messages");
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message recieved in panel.js:", request);
        // listen for lead data display message
    if (request.type === "displayLeadData") {
      // lead data is ready
      const leadData = request.data;
      document.getElementById("summaryContent").innerText = `
        ID: ${leadData.Id}
        Name: ${leadData.Name}
        Company: ${leadData.Company}
        Email: ${leadData.Email}
        Phone: ${leadData.Phone}
        Status: ${leadData.Status}
      `;
    } else {
      // failure
      document.getElementById("summaryContent").innerText =
        "No lead data found.";
    }
  });
});
