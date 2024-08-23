# Frontend

**Purpose**
A Chrome extension designed for RingCentral sales representatives to streamline the process of gathering and learning about Salesforce (SFDC) leads. This extension will help sales reps quickly familiarize themselves with key details about each lead, highlight and suggest talking points for engagement, and simplify the overall sales process, making it more efficient and effective.

**Description**
- a manifest chrome extension
- provides an interface for SFDC Lead Summary Battle Card
   - injects button to generate AI driven lead summary into SFDC lead profile pages
   - opens a side window panel with SFDC Lead Summary Battle Card. Includes general info about lead, product interest, where and why, historical relationship, and a sales enablement hook


**Configuration**
- local build
  1. go to chrome extensions and turn on developer mode
  2. load unpack project directory containing this interface
  3. connect to backend and run!
- deployment to server (TBD)

**Tech Stack**
- Programming Language:
  - Dynamic communication with Backend API endpoint, interactive functionalities: JS
  - Interface and UI elements: HTML5
  - Stylesheet: CSS (button, layouts, design)
- Chrome Extension API configuration: Manifest V3 (interacting with browser events, tabs, windows, message sending/ recieving)
- Communication with Backend: Fetch API (make HTTP requests to backend Flask server)

**File Description**
- images folder: provides all images used (three sizes of logo and RC logo)
- manifest.json: configuration file for chrome extension
  - define permissions, resources, background scripts, content scripts, behavior, metadata (extension name, version, description, icons) 
- content.js: interacts with web page
  - functions:
    - detect SFDC lead profile page
    - inject button into SFDC profile page
    - read URL (reads for lead ID) 
    - message sending (messages sent to background.js when user interacts with injected button)
    - monitors changes in page URL (injecting/ removing button dynamically as user navigates SDFC)
    - detect SFDC interface (SFDC classic or lightning experience) 
- background.js: service worker
  - handles background tasks--
     - message listening (messages sent from files-- mainly content.js)
     - functions:
       - manage window states (creation/ state of side window panel and resizing of current window)
       - sends POST request to backend (uses window URL for lead ID and calls backend for querying and summarizing)
       - recieves response from backend and send to panel.js for rendering
       - polling for content script load
- panel.html: interface structure for side window panel 
  - layout for displaying AI driven lead summary
  - placeholders for dynamic content population
  - renders data from backend
  - chatbot UI included (not yet finished-- did create a system prompt + function in backend to activate chatbot, chatbot is suppose to use queried lead data to respond to questions about the lead if applicable)
- panel.js: AI driven lead summary renderer
  - script responsible for populating panel.html side window panel
  - manages interaction within side panel
  - functions:
    - accordion toggle (expanding/ collapsing sections)
    - loading display
    - message listening (messages sent from background.js; recieves AI driven summaries)
    - process, format and render lead summaries
      - constructing lead and oppurtunity proifle links for duplicates (for SFDC classic and lightning experience)
      - phone link (convert phone number to a dialable link)
      - apply HTML tags + formatting
- style.css: style sheet + themes 
