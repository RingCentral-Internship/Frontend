// display AI generated lead summary
document.addEventListener("DOMContentLoaded", function () {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
