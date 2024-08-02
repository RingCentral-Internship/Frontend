// inject summarizer button into SFDC lead pages
console.log("Content script loaded");

window.onload = function () {
  // wait for web page to load
  console.log("Window fully loaded"); // web page is full loaded and parsed

  if (/\/00Q\d+/.test(document.location.href)) {
    // lead profile page
    console.log("On a lead profile page");

    // button creation
    const button = document.createElement("button"); // create HTML button
    button.id = "summarizeButton"; // name HTML button
    button.innerText = "AI Summary"; // button name

    // CSS style for button
    button.style.position = "fixed";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.zIndex = 1000;
    button.style.padding = "10px 20px";
    button.style.color = "#002855";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";

    document.body.appendChild(button); // inject button

    button.addEventListener("click", function () {
      // button is clicked
      console.log("button clicked");
      chrome.runtime.sendMessage({
        // send message to create window
        type: "openWindow",
        screenWidth: window.screen.availWidth,
        screenHeight: window.screen.availHeight,
      });
    });
  } else {
    // on SFDC
    console.log("Not on a lead page: ", document.location.href);
  }
};
