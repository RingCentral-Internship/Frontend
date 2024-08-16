document.addEventListener("DOMContentLoaded", function() {
    console.log("Panel.js is loaded and listening for messages");  // wait for script to load 

    const loadingElement = document.getElementById("loading");
    const accordionContainer = document.getElementById("accordionContainer");

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "ping") {  // side panel window is ready
            sendResponse({ status: "ready" });
        } else if (request.type === "displayLoading"){  // display loading gif-- waiting for query response
            loadingElement.style.display = "flex";  // render loading icon 
            accordionContainer.style.display = "none"; // don't show until query is complete 
        } else if (request.type === "displayLeadData") {  // render data from query 
            console.log("Message received in panel.js:", request);
            const leadData = request.data;  // data in message
            console.log("Lead Data: ", leadData);

            loadingElement.style.display = "none";  // stop rendering loading icon 
            accordionContainer.style.display = "block"; // render accordion toggles

            /* sections for html page */
            const sections = {
                leadInfo: ["Name", "Company", "Email", "Phone", "Status", "Title"],
                productInterest: ["Product Interest"],
                whereWhy: ["Where and Why"],
                historicalRelationship: ["Historical Relationship"],
                salesHook: ["Sales Enablement Hook"]
            };

            for (const section in sections) {  // traverse each section and render data 
                sections[section].forEach(field => {
                    const element = document.getElementById(field.replace(/ /g, '_'));
                    if (element) {
                        element.innerHTML = formatText(leadData[field] || "N/A");
                    }
                });
            }
        }
    });

    /* logic for accordion toggle visibility */
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

/* format json response for html */

function formatText(text) {
  // Convert **text** to <strong>text</strong>
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Convert line breaks to <br>
  text = text.replace(/\n/g, "<br>");
  // Convert plain text bullet points to HTML unordered list
  text = text.replace(/-\s/g, "<li>"); // Assuming bullets are indicated with "- "
  text = "<ul>" + text.replace(/<\/li><br>/g, "</li>") + "</ul>"; // Convert and wrap in <ul>
  return text;
}