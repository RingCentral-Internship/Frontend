document.addEventListener("DOMContentLoaded", function () {
  console.log("Panel.js is loaded and listening for messages"); // wait for script to load

  const loadingElement = document.getElementById("loading");
  const accordionContainer = document.getElementById("accordionContainer");
  const chatLog = document.getElementById("chatLog");
  const chatInpput = document.getElementById("chatInput");
  const sendButton = document.getElementById("sendButton");

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ping") {
      // side panel window is ready
      sendResponse({ status: "ready" });
    } else if (request.type === "displayLoading") {
      // display loading gif-- waiting for query response
      loadingElement.style.display = "flex"; // render loading icon
      accordionContainer.style.display = "none"; // don't show until query is complete
    } else if (request.type === "displayLeadData") {
      // render data from query
      console.log("Message received in panel.js:", request);
      const isLightning = request.isLightningExperience; // store interface
      const leadData = request.data; // data in message
      console.log("Lead Data: ", leadData);

      loadingElement.style.display = "none"; // stop rendering loading icon
      accordionContainer.style.display = "block"; // render accordion toggles

      /* sections for html page */
      const sections = {
        leadInfo: ["Name", "Company", "Email", "Phone", "Status", "Title", "Segment Name", "SM Employees"],
        productInterest: ["Product Interest"],
        whereWhy: ["Where and Why"],
        historicalRelationship: ["Historical Relationship"],
        duplicates: ["Duplicate Leads", "Duplicate Opportunities"],
        salesHook: ["Sales Enablement Hook"],
      };

      for (const section in sections) {
        // traverse each section and render data
        sections[section].forEach((field) => {
          const element = document.getElementById(field.replace(/ /g, "_"));
          if (element) {
            const formattedText = formatText(
              leadData[field] || "N/A",
              field,
              isLightning
            );

            if (section === duplicates) {
              if (leadData["Duplicate Leads"] && leadData["Duplicate Opportunities"]) {
                if (leadData["Duplicate Leads"].length + leadData["Duplicate Opportunities"].length > 0) {
                    // duplicates exist
                    element.innerHTML = formattedText; // Render links
                    const duplicateToggle =
                      document.getElementById("duplicates");
                    if (duplicateToggle) {
                      duplicateToggle.style.display = "block"; // Show the toggle
                    }
                } else {
                    // no duplicates exist
                    const duplicateToggle = document.getElementById("duplicates");
                    if (duplicateToggle) {
                    duplicateToggle.style.display = "none"; // Hide the toggle
                    }
                }
              } 
            } else {
              element.innerHTML = formattedText; // render AI generated summaries
            }
          }
        });
      }
    }
  });

  /* logic for accordion toggle visibility */
  var toggles = document.getElementsByClassName("accordion-toggle");
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener("click", function () {
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
function formatText(text, fieldName, isLightning) {
  if (
    fieldName === "Duplicate Leads" ||
    fieldName === "Duplicate Opportunities"
  ) {  // create SFDC links
    if (!Array.isArray(text) || text.length === 0) return ""; // return empty if no duplicates

    let dupType;
    if (fieldName === "Duplicate Leads") {  // for lead URL construction 
        dupType = "Lead"
    } else {  // for opportunity URL construction
        dupType = "Opportunity"
    }

    const links = text.map((id) => {
      // construct SFDC links for lead profiles
      let salesforceURL = isLightning
        ? `https://rc.lightning.force.com/lightning/r/${dupType}/${id}/view`
        : `https://rc.my.salesforce.com/${id}`;
      return `<a href="${salesforceURL}" target="_blank">${id}</a>`; // convert into clickable
    });
    return links.join("<br>");
  } else if (fieldName === "Phone") {  // create phone link
    return `<p><a href="tel:${text}" class="aligned-phone">${text}</a></p>`;
  } else {
    // formatting AI generated summaries
    // Convert **text** to <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Convert line breaks to <br>
    text = text.replace(/\n/g, "<br>");
    // Convert plain text bullet points to HTML unordered list
    text = text.replace(/-\s/g, "<li>"); // Assuming bullets are indicated with "- "
    text = "<ul>" + text.replace(/<\/li><br>/g, "</li>") + "</ul>"; // Convert and wrap in <ul>
    return text;
  }
}
