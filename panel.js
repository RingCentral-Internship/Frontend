// display AI generated lead summary 
document.addEventListener("DOMContentLoaded", function () {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {  // listen for lead data display message 
    if (request.type === 'displayLeadData') {  // lead data is ready 
      const leadData = request.data;
      document.getElementById("summaryContent").innerText = `
        ID: ${leadData.id}
        Name: ${leadData.name}
        Email: ${leadData.email}
        Company: ${leadData.company}
      `;
    }
  });
});
