document.addEventListener("DOMContentLoaded", function() {
    console.log("Panel.js is loaded and listening for messages");  // wait for script to load 

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "ping") {  // side panel window is ready
            sendResponse({ status: "ready" });
        } else if (request.type === "displayLeadData") {  // render data from query 
            console.log("Message received in panel.js:", request);
            const leadData = request.data;  // data in message
            console.log("Lead Data: ", leadData);
            /* sections for html page */
            const sections = {
                leadInfo: ["Name", "Company", "Email", "Phone", 'Status'],
                productInterest: ["ProductInterest"],
                leadSource: ["LeadSource", "LeadSourceDescription", "LeadEngagementScore", "CampaignHistory"],
                leadHistory: ["LeadHistory"],
                salesHook: ["SalesHook"]
            };

            for (const section in sections) {  // traverse each section and render data 
                sections[section].forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        element.textContent = leadData[field] || "N/A";
                    }
                });
            }
        }
    });

    /* logic for accordion toggle visiblity */
    var toggles = document.getElementsByClassName("accordion-toggle");
    for (var i = 0; i < toggles.length; i++) {
        toggles[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }
});
