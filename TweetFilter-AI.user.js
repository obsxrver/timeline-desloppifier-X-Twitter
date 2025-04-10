// ==UserScript==
// @name         TweetFilter AI
// @namespace    http://tampermonkey.net/
// @version      Version 1.3.2
// @description  A highly customizable AI rates tweets 1-10 and removes all the slop, saving your braincells!
// @author       Obsxrver(3than)
// @match        *://twitter.com/*
// @match        *://x.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @connect      openrouter.ai
// @run-at       document-idle
// @license      MIT
// ==/UserScript==
(function() {
    'use strict';
    console.log("X/Twitter Tweet De-Sloppification Activated (Combined Version)");

    // Embedded Menu.html
    const MENU = `
<style>
/*
        Modern X-Inspired Styles - Enhanced
        ---------------------------------
    */

    /* Main tweet filter container */
    #tweet-filter-container {
        position: fixed;
        top: 70px;
        right: 15px;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 10px 12px;
        border-radius: 12px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Close button styles */
    .close-button {
        background: none;
        border: none;
        color: #e7e9ea;
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
        border-radius: 50%;
    }

    .close-button:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.1);
    }

    /* Hidden state */
    .hidden {
        display: none !important;
    }

    /* Show/hide button */
    .toggle-button {
        position: fixed;
        right: 15px;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        z-index: 9999;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
    }
    
    .toggle-button:hover {
        background-color: rgba(29, 155, 240, 0.2);
    }

    #filter-toggle {
        top: 70px;
    }

    #settings-toggle {
        top: 120px;
    }

    #tweet-filter-container label {
        margin: 0;
        font-weight: bold;
    }

    #tweet-filter-slider {
        cursor: pointer;
        width: 120px;
        vertical-align: middle;
        accent-color: #1d9bf0;
    }

    #tweet-filter-value {
        min-width: 20px;
        text-align: center;
        font-weight: bold;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 2px 5px;
        border-radius: 4px;
    }

    /* Settings UI with Tabs */
    #settings-container {
        position: fixed;
        top: 70px;
        right: 15px;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 0; /* Remove padding to accommodate sticky header */
        border-radius: 16px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        box-shadow: 0 2px 18px rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        width: 380px;
        max-height: 85vh;
        overflow: hidden; /* Hide overflow to make the sticky header work properly */
        border: 1px solid rgba(255, 255, 255, 0.1);
        line-height: 1.3;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform-origin: top right;
    }
    
    #settings-container.hidden {
        opacity: 0;
        transform: scale(0.9);
        pointer-events: none;
    }
    
    /* Header section */
    .settings-header {
        padding: 12px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        background-color: rgba(22, 24, 28, 0.98);
        z-index: 20;
        border-radius: 16px 16px 0 0;
    }
    
    .settings-title {
        font-weight: bold;
        font-size: 16px;
    }
    
    /* Content area with scrolling */
    .settings-content {
        overflow-y: auto;
        max-height: calc(85vh - 110px); /* Account for header and tabs */
        padding: 0;
    }
    
    /* Scrollbar styling for settings container */
    .settings-content::-webkit-scrollbar {
        width: 6px;
    }

    .settings-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
    }

    .settings-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .settings-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    /* Tab Navigation */
    .tab-navigation {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        position: sticky;
        top: 0;
        background-color: rgba(22, 24, 28, 0.98);
        z-index: 10;
        padding: 10px 15px;
        gap: 8px;
    }

    .tab-button {
        padding: 6px 10px;
        background: none;
        border: none;
        color: #e7e9ea;
        font-weight: bold;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        flex: 1;
        text-align: center;
    }

    .tab-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .tab-button.active {
        color: #1d9bf0;
        background-color: rgba(29, 155, 240, 0.1);
        border-bottom: 2px solid #1d9bf0;
    }

    /* Tab Content */
    .tab-content {
        display: none;
        animation: fadeIn 0.3s ease;
        padding: 15px;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .tab-content.active {
        display: block;
    }

    /* Enhanced dropdowns */
    .select-container {
        position: relative;
        margin-bottom: 15px;
    }
    
    .select-container .search-field {
        position: sticky;
        top: 0;
        background-color: rgba(39, 44, 48, 0.95);
        padding: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 1;
    }
    
    .select-container .search-input {
        width: 100%;
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(39, 44, 48, 0.9);
        color: #e7e9ea;
        font-size: 12px;
        transition: border-color 0.2s;
    }
    
    .select-container .search-input:focus {
        border-color: #1d9bf0;
        outline: none;
    }
    
    .custom-select {
        position: relative;
        display: inline-block;
        width: 100%;
    }
    
    .select-selected {
        background-color: rgba(39, 44, 48, 0.95);
        color: #e7e9ea;
        padding: 10px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        cursor: pointer;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        transition: border-color 0.2s;
    }
    
    .select-selected:hover {
        border-color: rgba(255, 255, 255, 0.4);
    }
    
    .select-selected:after {
        content: "";
        width: 8px;
        height: 8px;
        border: 2px solid #e7e9ea;
        border-width: 0 2px 2px 0;
        display: inline-block;
        transform: rotate(45deg);
        margin-left: 10px;
        transition: transform 0.2s;
    }
    
    .select-selected.select-arrow-active:after {
        transform: rotate(-135deg);
    }
    
    .select-items {
        position: absolute;
        background-color: rgba(39, 44, 48, 0.98);
        top: 100%;
        left: 0;
        right: 0;
        z-index: 99;
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        margin-top: 5px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        display: none;
    }
    
    .select-items div {
        color: #e7e9ea;
        padding: 10px 12px;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .select-items div:hover {
        background-color: rgba(29, 155, 240, 0.1);
    }
    
    .select-items div.same-as-selected {
        background-color: rgba(29, 155, 240, 0.2);
    }
    
    /* Scrollbar for select items */
    .select-items::-webkit-scrollbar {
        width: 6px;
    }
    
    .select-items::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }
    
    .select-items::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }
    
    .select-items::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    /* Form elements */
    #openrouter-api-key,
    #user-instructions {
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin-bottom: 12px;
        background-color: rgba(39, 44, 48, 0.95);
        color: #e7e9ea;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        transition: border-color 0.2s;
    }
    
    #openrouter-api-key:focus,
    #user-instructions:focus {
        border-color: #1d9bf0;
        outline: none;
    }

    #user-instructions {
        height: 120px;
        resize: vertical;
    }

    /* Parameter controls */
    .parameter-row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        gap: 8px;
        padding: 6px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }
    
    .parameter-row:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .parameter-label {
        flex: 1;
        font-size: 13px;
        color: #e7e9ea;
    }

    .parameter-control {
        flex: 1.5;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .parameter-value {
        min-width: 28px;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 3px 5px;
        border-radius: 4px;
        font-size: 12px;
    }

    .parameter-slider {
        flex: 1;
        -webkit-appearance: none;
        height: 4px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.2);
        outline: none;
        cursor: pointer;
    }

    .parameter-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #1d9bf0;
        cursor: pointer;
        transition: transform 0.1s;
    }
    
    .parameter-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    /* Section styles */
    .section-title {
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 8px;
        color: #e7e9ea;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
    }
    
    .section-title:first-child {
        margin-top: 0;
    }

    .section-description {
        font-size: 12px;
        margin-bottom: 8px;
        opacity: 0.8;
        line-height: 1.4;
    }
    
    /* Advanced options section */
    .advanced-options {
        margin-top: 5px;
        margin-bottom: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        background-color: rgba(255, 255, 255, 0.03);
        overflow: hidden;
    }
    
    .advanced-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        margin-bottom: 5px;
    }
    
    .advanced-toggle-title {
        font-weight: bold;
        font-size: 13px;
        color: #e7e9ea;
    }
    
    .advanced-toggle-icon {
        transition: transform 0.3s;
    }
    
    .advanced-toggle-icon.expanded {
        transform: rotate(180deg);
    }
    
    .advanced-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-in-out;
    }
    
    .advanced-content.expanded {
        max-height: 300px;
    }

    /* Handle list styling */
    .handle-list {
        margin-top: 10px;
        max-height: 120px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 5px;
    }

    .handle-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .handle-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .handle-item:last-child {
        border-bottom: none;
    }

    .handle-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 12px;
    }

    .remove-handle {
        background: none;
        border: none;
        color: #ff5c5c;
        cursor: pointer;
        font-size: 14px;
        padding: 0 3px;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    
    .remove-handle:hover {
        opacity: 1;
    }

    .add-handle-btn {
        background-color: #1d9bf0;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 7px 10px;
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
        margin-left: 5px;
        transition: background-color 0.2s;
    }
    
    .add-handle-btn:hover {
        background-color: #1a8cd8;
    }

    /* Button styling */
    .settings-button {
        background-color: #1d9bf0;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        margin-top: 8px;
        width: 100%;
        font-size: 13px;
    }

    .settings-button:hover {
        background-color: #1a8cd8;
    }

    .settings-button.secondary {
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    .settings-button.secondary:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }

    .settings-button.danger {
        background-color: #ff5c5c;
    }

    .settings-button.danger:hover {
        background-color: #e53935;
    }
    
    /* For smaller buttons that sit side by side */
    .button-row {
        display: flex;
        gap: 8px;
        margin-top: 10px;
    }
    
    .button-row .settings-button {
        margin-top: 0;
    }
    
    /* Stats display */
    .stats-container {
        background-color: rgba(255, 255, 255, 0.05);
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
    }
    
    .stats-row {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .stats-row:last-child {
        border-bottom: none;
    }
    
    .stats-label {
        font-size: 12px;
        opacity: 0.8;
    }
    
    .stats-value {
        font-weight: bold;
    }

    /* Rating indicator shown on tweets */ 
    .score-indicator {
        position: absolute;
        top: 10px;
        right: 10.5%;
        background-color: rgba(22, 24, 28, 0.9);
        color: #e7e9ea;
        padding: 4px 10px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        z-index: 100;
        cursor: pointer;
        border: 1px solid rgba(255, 255, 255, 0.1);
        min-width: 20px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        transition: transform 0.15s ease;
    }
    
    .score-indicator:hover {
        transform: scale(1.05);
    }

    /* Refresh animation */
    .refreshing {
        animation: spin 1s infinite linear;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* The description box for ratings */
    .score-description {
        display: none;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        z-index: 99999999;
        position: absolute;
        width: clamp(300px, 30vw, 500px);
        max-height: 60vh;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        word-wrap: break-word;
    }

    /* Rating status classes */
    .cached-rating {
        background-color: rgba(76, 175, 80, 0.9) !important;
        color: white !important;
    }

    .blacklisted-rating {
        background-color: rgba(255, 193, 7, 0.9) !important;
        color: black !important;
    }

    .pending-rating {
        background-color: rgba(255, 152, 0, 0.9) !important;
        color: white !important;
    }

    .error-rating {
        background-color: rgba(244, 67, 54, 0.9) !important;
        color: white !important;
    }

    /* Status indicator at bottom-right */
    #status-indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 10px 15px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 12px;
        z-index: 9999;
        display: none;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        transform: translateY(100px);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    #status-indicator.active {
        display: block;
        transform: translateY(0);
    }
    
    /* Toggle switch styling */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
    }
    
    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.2);
        transition: .3s;
        border-radius: 34px;
    }
    
    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
    }
    
    input:checked + .toggle-slider {
        background-color: #1d9bf0;
    }
    
    input:checked + .toggle-slider:before {
        transform: translateX(16px);
    }
    
    .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        margin-bottom: 12px;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        transition: background-color 0.2s;
    }
    
    .toggle-row:hover {
        background-color: rgba(255, 255, 255, 0.08);
    }
    
    .toggle-label {
        font-size: 13px;
        color: #e7e9ea;
    }

    /* Existing styles */
    
    /* Sort container styles */
    .sort-container {
        margin: 10px 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .sort-container label {
        font-size: 14px;
        color: var(--text-color);
    }
    
    .sort-container select {
        padding: 5px 10px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(39, 44, 48, 0.95);
        color: #e7e9ea;
        font-size: 14px;
        cursor: pointer;
    }
    
    .sort-container select:hover {
        border-color: #1d9bf0;
    }
    
    .sort-container select:focus {
        outline: none;
        border-color: #1d9bf0;
        box-shadow: 0 0 0 2px rgba(29, 155, 240, 0.2);
    }
    
    /* Dropdown option styling */
    .sort-container select option {
        background-color: rgba(39, 44, 48, 0.95);
        color: #e7e9ea;
    }
</style>
<div id="tweetfilter-root-container">
    <button id="filter-toggle" class="toggle-button" style="display: none;">Filter Slider</button>
    <div id="tweet-filter-container">
        <button class="close-button" data-action="close-filter">×</button>
        <label for="tweet-filter-slider">SlopScore:</label>
        <input type="range" id="tweet-filter-slider" min="0" max="10" step="1">
        <span id="tweet-filter-value">5</span>
    </div>

    <button id="settings-toggle" class="toggle-button">
        <span style="font-size: 14px;">⚙️</span> Settings
    </button>
    <div id="settings-container" class="hidden">
        <div class="settings-header">
            <div class="settings-title">Twitter De-Sloppifier</div>
            <button class="close-button" data-action="close-settings">×</button>
        </div>
        <div class="settings-content">
            <div class="tab-navigation">
                <button class="tab-button active" data-tab="general">General</button>
                <button class="tab-button" data-tab="models">Models</button>
                <button class="tab-button" data-tab="instructions">Instructions</button>
            </div>
            <div id="general-tab" class="tab-content active">
                <div class="section-title"><span style="font-size: 14px;">🔑</span> OpenRouter API Key <a href="https://openrouter.ai/" target="_blank">Get one here</a></div>
                <input id="openrouter-api-key" placeholder="Enter your OpenRouter API key">
                <button class="settings-button" data-action="save-api-key">Save API Key</button>
                <div class="section-title" style="margin-top: 20px;"><span style="font-size: 14px;">🗄️</span> Cache Statistics</div>
                <div class="stats-container">
                    <div class="stats-row">
                        <div class="stats-label">Cached Tweet Ratings</div>
                        <div class="stats-value" id="cached-ratings-count">0</div>
                    </div>
                    <div class="stats-row">
                        <div class="stats-label">Whitelisted Handles</div>
                        <div class="stats-value" id="whitelisted-handles-count">0</div>
                    </div>
                </div>
                <button id="clear-cache" class="settings-button danger" data-action="clear-cache">Clear Rating Cache</button>
                <div class="section-title" style="margin-top: 20px;">
                    <span style="font-size: 14px;">💾</span> Backup &amp; Restore
                </div>
                <div class="section-description">
                    Export your settings and cached ratings to a file for backup, or import previously saved settings.
                </div>
                <div class="button-row">
                    <button class="settings-button secondary" data-action="export-settings">Export Settings</button>
                    <button class="settings-button secondary" data-action="import-settings">Import Settings</button>
                </div>
                <button class="settings-button danger" style="margin-top: 15px;" data-action="reset-settings">Reset to Defaults</button>
                <div id="version-info" style="margin-top: 20px; font-size: 11px; opacity: 0.6; text-align: center;">Twitter De-Sloppifier v?.?</div>
            </div>
            <div id="models-tab" class="tab-content">
                <div class="section-title">
                    <span style="font-size: 14px;">🧠</span> Tweet Rating Model
                </div>
                <div class="section-description">
                    Hint: If you want to rate tweets with images, you need to select an image model.
                </div>
                <div class="sort-container">
                    <label for="model-sort-order">Sort models by: </label>
                    <select id="model-sort-order" data-setting="modelSortOrder">
                        <option value="price-low-to-high">Price (Low to High)</option>
                        <option value="price-high-to-low">Price (High to Low)</option>
                        <option value="throughput-high-to-low">Throughput (High to Low)</option>
                        <option value="throughput-low-to-high">Throughput (Low to High)</option>
                        <option value="latency-low-to-high">Latency (Low to High)</option>
                        <option value="latency-high-to-low">Latency (High to Low)</option>
                    </select>
                </div>
                <div class="select-container" id="model-select-container">
                </div>
                <div class="advanced-options" id="rating-advanced-options">
                    <div class="advanced-toggle" data-toggle="rating-advanced-content">
                        <div class="advanced-toggle-title">Advanced Options</div>
                        <div class="advanced-toggle-icon">▼</div>
                    </div>
                    <div class="advanced-content" id="rating-advanced-content">
                        <div class="parameter-row" data-param-name="modelTemperature">
                            <div class="parameter-label" title="How random the model responses should be (0.0-1.0)">Temperature</div>
                            <div class="parameter-control">
                                <input type="range" class="parameter-slider" min="0" max="2" step="0.1">
                                <input type="number" class="parameter-value" min="0" max="2" step="0.1" style="width: 60px;">
                            </div>
                        </div>
                        <div class="parameter-row" data-param-name="modelTopP">
                            <div class="parameter-label" title="Nucleus sampling parameter (0.0-1.0)">Top-p</div>
                            <div class="parameter-control">
                                <input type="range" class="parameter-slider" min="0" max="1" step="0.1">
                                <input type="number" class="parameter-value" min="0" max="1" step="0.1" style="width: 60px;">
                            </div>
                        </div>
                        <div class="parameter-row" data-param-name="maxTokens">
                            <div class="parameter-label" title="Maximum number of tokens for the response (0 means no limit)">Max Tokens</div>
                            <div class="parameter-control">
                                <input type="range" class="parameter-slider" min="0" max="2000" step="100">
                                <input type="number" class="parameter-value" min="0" max="2000" step="100" style="width: 60px;">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="section-title" style="margin-top: 25px;"><span style="font-size: 14px;">🖼️</span> Image Processing Model</div>
                <div class="section-description">This model generates <strong>text descriptions</strong> of images, which are then sent to the rating model above. If you've selected an image-capable model (🖼️) as your main rating model above, you can disable this to process images directly.</div>
                <div class="toggle-row">
                    <div class="toggle-label">Enable Image Descriptions</div>
                    <label class="toggle-switch">
                        <input type="checkbox" data-setting="enableImageDescriptions">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div id="image-model-container" style="display: none;">
                    <div class="section-description">Select a model with vision capabilities to describe images in tweets.</div>
                    <div class="select-container" id="image-model-select-container">
                    </div>
                    <div class="advanced-options" id="image-advanced-options">
                        <div class="advanced-toggle" data-toggle="image-advanced-content">
                            <div class="advanced-toggle-title">Advanced Options</div>
                            <div class="advanced-toggle-icon">▼</div>
                        </div>
                        <div class="advanced-content" id="image-advanced-content">
                            <div class="parameter-row" data-param-name="imageModelTemperature">
                                <div class="parameter-label" title="Randomness for image descriptions (0.0-1.0)">Temperature</div>
                                <div class="parameter-control">
                                    <input type="range" class="parameter-slider" min="0" max="2" step="0.1">
                                    <input type="number" class="parameter-value" min="0" max="2" step="0.1" style="width: 60px;">
                                </div>
                            </div>
                            <div class="parameter-row" data-param-name="imageModelTopP">
                                <div class="parameter-label" title="Nucleus sampling for image model (0.0-1.0)">Top-p</div>
                                <div class="parameter-control">
                                    <input type="range" class="parameter-slider" min="0" max="1" step="0.1">
                                    <input type="number" class="parameter-value" min="0" max="1" step="0.1" style="width: 60px;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="instructions-tab" class="tab-content">
                <div class="section-title">Custom Tweet Rating Instructions</div>
                <div class="section-description">Add custom instructions for how the model should score tweets:</div>
                <textarea id="user-instructions" placeholder="Examples:
                - Give high scores to tweets about technology
                - Penalize clickbait-style tweets
                - Rate educational content higher" data-setting="userDefinedInstructions" value=""></textarea>
                <button class="settings-button" data-action="save-instructions">Save Instructions</button>
                <div class="section-title" style="margin-top: 20px;">Auto-Rate Handles as 10/10</div>
                <div class="section-description">Add Twitter handles to automatically rate as 10/10:</div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input id="handle-input" type="text" placeholder="Twitter handle (without @)">
                    <button class="add-handle-btn" data-action="add-handle">Add</button>
                </div>
                <div class="handle-list" id="handle-list">
                </div>
            </div>
        </div>
        <div id="status-indicator" class=""></div>
    </div>
</div>`;

    // Embedded style.css
    const STYLE = `/*
        Modern X-Inspired Styles - Enhanced
        ---------------------------------
    */

    /* Main tweet filter container */
    #tweet-filter-container {
        position: fixed;
        top: 70px;
        right: 15px;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 10px 12px;
        border-radius: 12px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Close button styles */
    .close-button {
        background: none;
        border: none;
        color: #e7e9ea;
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
        border-radius: 50%;
    }

    .close-button:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.1);
    }

    /* Hidden state */
    .hidden {
        display: none !important;
    }

    /* Show/hide button */
    .toggle-button {
        position: fixed;
        right: 15px;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        z-index: 9999;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
    }
    
    .toggle-button:hover {
        background-color: rgba(29, 155, 240, 0.2);
    }

    #filter-toggle {
        top: 70px;
    }

    #settings-toggle {
        top: 120px;
    }

    #tweet-filter-container label {
        margin: 0;
        font-weight: bold;
    }

    #tweet-filter-slider {
        cursor: pointer;
        width: 120px;
        vertical-align: middle;
        accent-color: #1d9bf0;
    }

    #tweet-filter-value {
        min-width: 20px;
        text-align: center;
        font-weight: bold;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 2px 5px;
        border-radius: 4px;
    }

    /* Settings UI with Tabs */
    #settings-container {
        position: fixed;
        top: 70px;
        right: 15px;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 0; /* Remove padding to accommodate sticky header */
        border-radius: 16px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        box-shadow: 0 2px 18px rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        width: 380px;
        max-height: 85vh;
        overflow: hidden; /* Hide overflow to make the sticky header work properly */
        border: 1px solid rgba(255, 255, 255, 0.1);
        line-height: 1.3;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform-origin: top right;
    }
    
    #settings-container.hidden {
        opacity: 0;
        transform: scale(0.9);
        pointer-events: none;
    }
    
    /* Header section */
    .settings-header {
        padding: 12px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        background-color: rgba(22, 24, 28, 0.98);
        z-index: 20;
        border-radius: 16px 16px 0 0;
    }
    
    .settings-title {
        font-weight: bold;
        font-size: 16px;
    }
    
    /* Content area with scrolling */
    .settings-content {
        overflow-y: auto;
        max-height: calc(85vh - 110px); /* Account for header and tabs */
        padding: 0;
    }
    
    /* Scrollbar styling for settings container */
    .settings-content::-webkit-scrollbar {
        width: 6px;
    }

    .settings-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
    }

    .settings-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .settings-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    /* Tab Navigation */
    .tab-navigation {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        position: sticky;
        top: 0;
        background-color: rgba(22, 24, 28, 0.98);
        z-index: 10;
        padding: 10px 15px;
        gap: 8px;
    }

    .tab-button {
        padding: 6px 10px;
        background: none;
        border: none;
        color: #e7e9ea;
        font-weight: bold;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        flex: 1;
        text-align: center;
    }

    .tab-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .tab-button.active {
        color: #1d9bf0;
        background-color: rgba(29, 155, 240, 0.1);
        border-bottom: 2px solid #1d9bf0;
    }

    /* Tab Content */
    .tab-content {
        display: none;
        animation: fadeIn 0.3s ease;
        padding: 15px;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .tab-content.active {
        display: block;
    }

    /* Enhanced dropdowns */
    .select-container {
        position: relative;
        margin-bottom: 15px;
    }
    
    .select-container .search-field {
        position: sticky;
        top: 0;
        background-color: rgba(39, 44, 48, 0.95);
        padding: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 1;
    }
    
    .select-container .search-input {
        width: 100%;
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(39, 44, 48, 0.9);
        color: #e7e9ea;
        font-size: 12px;
        transition: border-color 0.2s;
    }
    
    .select-container .search-input:focus {
        border-color: #1d9bf0;
        outline: none;
    }
    
    .custom-select {
        position: relative;
        display: inline-block;
        width: 100%;
    }
    
    .select-selected {
        background-color: rgba(39, 44, 48, 0.95);
        color: #e7e9ea;
        padding: 10px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        cursor: pointer;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        transition: border-color 0.2s;
    }
    
    .select-selected:hover {
        border-color: rgba(255, 255, 255, 0.4);
    }
    
    .select-selected:after {
        content: "";
        width: 8px;
        height: 8px;
        border: 2px solid #e7e9ea;
        border-width: 0 2px 2px 0;
        display: inline-block;
        transform: rotate(45deg);
        margin-left: 10px;
        transition: transform 0.2s;
    }
    
    .select-selected.select-arrow-active:after {
        transform: rotate(-135deg);
    }
    
    .select-items {
        position: absolute;
        background-color: rgba(39, 44, 48, 0.98);
        top: 100%;
        left: 0;
        right: 0;
        z-index: 99;
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        margin-top: 5px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        display: none;
    }
    
    .select-items div {
        color: #e7e9ea;
        padding: 10px 12px;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .select-items div:hover {
        background-color: rgba(29, 155, 240, 0.1);
    }
    
    .select-items div.same-as-selected {
        background-color: rgba(29, 155, 240, 0.2);
    }
    
    /* Scrollbar for select items */
    .select-items::-webkit-scrollbar {
        width: 6px;
    }
    
    .select-items::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }
    
    .select-items::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }
    
    .select-items::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    /* Form elements */
    #openrouter-api-key,
    #user-instructions {
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin-bottom: 12px;
        background-color: rgba(39, 44, 48, 0.95);
        color: #e7e9ea;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        transition: border-color 0.2s;
    }
    
    #openrouter-api-key:focus,
    #user-instructions:focus {
        border-color: #1d9bf0;
        outline: none;
    }

    #user-instructions {
        height: 120px;
        resize: vertical;
    }

    /* Parameter controls */
    .parameter-row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        gap: 8px;
        padding: 6px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }
    
    .parameter-row:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .parameter-label {
        flex: 1;
        font-size: 13px;
        color: #e7e9ea;
    }

    .parameter-control {
        flex: 1.5;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .parameter-value {
        min-width: 28px;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 3px 5px;
        border-radius: 4px;
        font-size: 12px;
    }

    .parameter-slider {
        flex: 1;
        -webkit-appearance: none;
        height: 4px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.2);
        outline: none;
        cursor: pointer;
    }

    .parameter-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #1d9bf0;
        cursor: pointer;
        transition: transform 0.1s;
    }
    
    .parameter-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    /* Section styles */
    .section-title {
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 8px;
        color: #e7e9ea;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
    }
    
    .section-title:first-child {
        margin-top: 0;
    }

    .section-description {
        font-size: 12px;
        margin-bottom: 8px;
        opacity: 0.8;
        line-height: 1.4;
    }
    
    /* Advanced options section */
    .advanced-options {
        margin-top: 5px;
        margin-bottom: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        background-color: rgba(255, 255, 255, 0.03);
        overflow: hidden;
    }
    
    .advanced-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        margin-bottom: 5px;
    }
    
    .advanced-toggle-title {
        font-weight: bold;
        font-size: 13px;
        color: #e7e9ea;
    }
    
    .advanced-toggle-icon {
        transition: transform 0.3s;
    }
    
    .advanced-toggle-icon.expanded {
        transform: rotate(180deg);
    }
    
    .advanced-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-in-out;
    }
    
    .advanced-content.expanded {
        max-height: 300px;
    }

    /* Handle list styling */
    .handle-list {
        margin-top: 10px;
        max-height: 120px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 5px;
    }

    .handle-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .handle-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .handle-item:last-child {
        border-bottom: none;
    }

    .handle-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 12px;
    }

    .remove-handle {
        background: none;
        border: none;
        color: #ff5c5c;
        cursor: pointer;
        font-size: 14px;
        padding: 0 3px;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    
    .remove-handle:hover {
        opacity: 1;
    }

    .add-handle-btn {
        background-color: #1d9bf0;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 7px 10px;
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
        margin-left: 5px;
        transition: background-color 0.2s;
    }
    
    .add-handle-btn:hover {
        background-color: #1a8cd8;
    }

    /* Button styling */
    .settings-button {
        background-color: #1d9bf0;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        margin-top: 8px;
        width: 100%;
        font-size: 13px;
    }

    .settings-button:hover {
        background-color: #1a8cd8;
    }

    .settings-button.secondary {
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    .settings-button.secondary:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }

    .settings-button.danger {
        background-color: #ff5c5c;
    }

    .settings-button.danger:hover {
        background-color: #e53935;
    }
    
    /* For smaller buttons that sit side by side */
    .button-row {
        display: flex;
        gap: 8px;
        margin-top: 10px;
    }
    
    .button-row .settings-button {
        margin-top: 0;
    }
    
    /* Stats display */
    .stats-container {
        background-color: rgba(255, 255, 255, 0.05);
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
    }
    
    .stats-row {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .stats-row:last-child {
        border-bottom: none;
    }
    
    .stats-label {
        font-size: 12px;
        opacity: 0.8;
    }
    
    .stats-value {
        font-weight: bold;
    }

    /* Rating indicator shown on tweets */ 
    .score-indicator {
        position: absolute;
        top: 10px;
        right: 10.5%;
        background-color: rgba(22, 24, 28, 0.9);
        color: #e7e9ea;
        padding: 4px 10px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        z-index: 100;
        cursor: pointer;
        border: 1px solid rgba(255, 255, 255, 0.1);
        min-width: 20px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        transition: transform 0.15s ease;
    }
    
    .score-indicator:hover {
        transform: scale(1.05);
    }

    /* Refresh animation */
    .refreshing {
        animation: spin 1s infinite linear;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* The description box for ratings */
    .score-description {
        display: none;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        z-index: 99999999;
        position: absolute;
        width: clamp(300px, 30vw, 500px);
        max-height: 60vh;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        word-wrap: break-word;
    }

    /* Rating status classes */
    .cached-rating {
        background-color: rgba(76, 175, 80, 0.9) !important;
        color: white !important;
    }

    .blacklisted-rating {
        background-color: rgba(255, 193, 7, 0.9) !important;
        color: black !important;
    }

    .pending-rating {
        background-color: rgba(255, 152, 0, 0.9) !important;
        color: white !important;
    }

    .error-rating {
        background-color: rgba(244, 67, 54, 0.9) !important;
        color: white !important;
    }

    /* Status indicator at bottom-right */
    #status-indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(22, 24, 28, 0.95);
        color: #e7e9ea;
        padding: 10px 15px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 12px;
        z-index: 9999;
        display: none;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        transform: translateY(100px);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    #status-indicator.active {
        display: block;
        transform: translateY(0);
    }
    
    /* Toggle switch styling */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
    }
    
    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.2);
        transition: .3s;
        border-radius: 34px;
    }
    
    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
    }
    
    input:checked + .toggle-slider {
        background-color: #1d9bf0;
    }
    
    input:checked + .toggle-slider:before {
        transform: translateX(16px);
    }
    
    .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        margin-bottom: 12px;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        transition: background-color 0.2s;
    }
    
    .toggle-row:hover {
        background-color: rgba(255, 255, 255, 0.08);
    }
    
    .toggle-label {
        font-size: 13px;
        color: #e7e9ea;
    }

    /* Existing styles */
    
    /* Sort container styles */
    .sort-container {
        margin: 10px 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .sort-container label {
        font-size: 14px;
        color: var(--text-color);
    }
    
    .sort-container select {
        padding: 5px 10px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(39, 44, 48, 0.95);
        color: #e7e9ea;
        font-size: 14px;
        cursor: pointer;
    }
    
    .sort-container select:hover {
        border-color: #1d9bf0;
    }
    
    .sort-container select:focus {
        outline: none;
        border-color: #1d9bf0;
        box-shadow: 0 0 0 2px rgba(29, 155, 240, 0.2);
    }
    
    /* Dropdown option styling */
    .sort-container select option {
        background-color: rgba(39, 44, 48, 0.95);
        color: #e7e9ea;
    }`;

    // Apply CSS
    GM_addStyle(STYLE);

    // Set menu HTML
    GM_setValue('menuHTML', MENU);

    // ----- twitter-desloppifier.js -----
(function () {
    'use strict';
    console.log("X/Twitter Tweet De-Sloppification Activated (v1.3.2 - Enhanced)");
    
    // Load CSS stylesheet
    //const css = GM_getResourceText('STYLESHEET');
    let menuhtml = GM_getResourceText("MENU_HTML");
    GM_setValue('menuHTML', menuhtml);
    let firstRun = GM_getValue('firstRun', true);
    
    //GM_addStyle(css);

    // ----- Initialization -----
    
    /**
     * Initializes the observer on the main content area, adds the UI elements,
     * starts processing visible tweets, and sets up periodic checks.
     */
    function initializeObserver() {
        const target = document.querySelector('main') || document.querySelector('div[data-testid="primaryColumn"]');
        if (target) {
            observedTargetNode = target;
            console.log("X/Twitter Tweet De-Sloppification: Target node found. Observing...");
            initialiseUI();
            if (firstRun){
                resetSettings(true);
                GM_setValue('firstRun', false);
            }
            // If no API key is found, prompt the user
            const apiKey = GM_getValue('openrouter-api-key', '');
            if (!apiKey) {
                apiKey = alert("<TweetFilter AI>\nPlease enter your OpenRouter API key. You can get one at https://openrouter.ai/");
                if (apiKey) {
                    GM_setValue('openrouter-api-key', apiKey);
                }
                showStatus("No API key found. Please enter your OpenRouter API key.");
            } else {
                showStatus(`Loaded ${Object.keys(tweetIDRatingCache).length} cached ratings. Starting to rate visible tweets...`);
                fetchAvailableModels();
            }
            // Process all currently visible tweets
            observedTargetNode.querySelectorAll(TWEET_ARTICLE_SELECTOR).forEach(scheduleTweetProcessing);
            const observer = new MutationObserver(handleMutations);
            observer.observe(observedTargetNode, { childList: true, subtree: true });
            ensureAllTweetsRated();
            window.addEventListener('beforeunload', () => {
                saveTweetRatings();
                observer.disconnect();
                const sliderUI = document.getElementById('tweet-filter-container');
                if (sliderUI) sliderUI.remove();
                const settingsUI = document.getElementById('settings-container');
                if (settingsUI) settingsUI.remove();
                const statusIndicator = document.getElementById('status-indicator');
                if (statusIndicator) statusIndicator.remove();
                // Clean up all description elements
                cleanupDescriptionElements();
                console.log("X/Twitter Tweet De-Sloppification Deactivated.");
            });
        } else {
            setTimeout(initializeObserver, 1000);
        }
    }
    // Start observing tweets and initializing the UI
    initializeObserver();
})();

    // ----- config.js -----
const processedTweets = new Set(); // Set of tweet IDs already processed in this session
const tweetIDRatingCache = {}; // ID-based cache for persistent storage
const PROCESSING_DELAY_MS = 500; // Delay before processing a tweet (ms)
const API_CALL_DELAY_MS = 250; // Minimum delay between API calls (ms)
let USER_DEFINED_INSTRUCTIONS = GM_getValue('userDefinedInstructions', `- Give high scores to insightful and impactful tweets
- Give low scores to clickbait, fearmongering, and ragebait
- Give high scores to high-effort content and artistic content`);
let currentFilterThreshold = GM_getValue('filterThreshold', 1); // Filter threshold for tweet visibility
let observedTargetNode = null;
let lastAPICallTime = 0;
let pendingRequests = 0;
const MAX_RETRIES = 3;
let availableModels = []; // List of models fetched from API
let selectedModel = GM_getValue('selectedModel', 'google/gemini-2.0-flash-lite-001');
let selectedImageModel = GM_getValue('selectedImageModel', 'google/gemini-2.0-flash-lite-001');
let blacklistedHandles = GM_getValue('blacklistedHandles', '').split('\n').filter(h => h.trim() !== '');

let storedRatings = GM_getValue('tweetRatings', '{}');
let threadHist = "";
// Settings variables
let enableImageDescriptions = GM_getValue('enableImageDescriptions', false);


// Model parameters
const SYSTEM_PROMPT=`You are a tweet filtering AI. Your task is to rate tweets on a scale of 0 to 10 based on user-defined instructions.
You will be given a Tweet, structured like this:
_______TWEET SCHEMA_______
_______BEGIN TWEET_______
[TWEET {TweetID}]
{the text of the tweet being replied to}
[MEDIA_DESCRIPTION]:
[IMAGE 1]: {description}, [IMAGE 2]: {description}, etc.
[REPLY] (if the author is replying to another tweet)
[TWEET {TweetID}]: (the tweet which you are to review)
@{the author of the tweet}
{the text of the tweet}
[MEDIA_DESCRIPTION]:
[IMAGE 1]: {description}, [IMAGE 2]: {description}, etc.
[QUOTED_TWEET]: (if the author is quoting another tweet)
{the text of the quoted tweet}
[QUOTED_TWEET_MEDIA_DESCRIPTION]:
[IMAGE 1]: {description}, [IMAGE 2]: {description}, etc.
_______END TWEET_______
_______END TWEET SCHEMA_______

You are to review and provide a rating for the tweet with the specified tweet ID.
Ensure that you consider the user-defined instructions in your analysis and scoring, specified by:
[USER-DEFINED INSTRUCTIONS]:

Provide a concise explanation of your reasoning and then, on a new line, output your final rating in the exact format:
SCORE_X where X is a number from 0 (lowest quality) to 10 (highest quality).
for example: SCORE_0, SCORE_1, SCORE_2, SCORE_3, etc.
If one of the above is not present, the program will not be able to parse the response and will return an error.
`
let modelTemperature = GM_getValue('modelTemperature', 0.5);
let modelTopP = GM_getValue('modelTopP', 0.9);
let imageModelTemperature = GM_getValue('imageModelTemperature', 0.5);
let imageModelTopP = GM_getValue('imageModelTopP', 0.9);
let maxTokens = GM_getValue('maxTokens', 0); // Maximum number of tokens for API requests, 0 means no limit
let imageModelMaxTokens = GM_getValue('imageModelMaxTokens', 0); // Maximum number of tokens for image model API requests, 0 means no limit
//let menuHTML= "";

// ----- DOM Selectors (for tweet elements) -----
const TWEET_ARTICLE_SELECTOR = 'article[data-testid="tweet"]';
const QUOTE_CONTAINER_SELECTOR = 'div[role="link"][tabindex="0"]';
const USER_NAME_SELECTOR = 'div[data-testid="User-Name"] span > span';
const USER_HANDLE_SELECTOR = 'div[data-testid="User-Name"] a[role="link"]';
const TWEET_TEXT_SELECTOR = 'div[data-testid="tweetText"]';
const MEDIA_IMG_SELECTOR = 'div[data-testid="tweetPhoto"] img, img[src*="pbs.twimg.com/media"]';
const MEDIA_VIDEO_SELECTOR = 'video[poster*="pbs.twimg.com"], video';
const PERMALINK_SELECTOR = 'a[href*="/status/"] time';
// ----- Dom Elements -----
/**
 * Helper function to check if a model supports images based on its architecture
 * @param {string} modelId - The model ID to check
 * @returns {boolean} - Whether the model supports image input
 */
function modelSupportsImages(modelId) {
    if (!availableModels || availableModels.length === 0) {
        return false; // If we don't have model info, assume it doesn't support images
    }

    const model = availableModels.find(m => m.slug === modelId);
    if (!model) {
        return false; // Model not found in available models list
    }

    // Check if model supports images based on its architecture
    return model.input_modalities &&
        model.input_modalities.includes('image');
}

try {
    Object.assign(tweetIDRatingCache, JSON.parse(storedRatings));
    console.log(`Loaded ${Object.keys(tweetIDRatingCache).length} cached tweet ratings`);
} catch (e) {
    console.error('Error loading stored ratings:', e);
}


    // ----- api.js -----
/**
 * @typedef {Object} CompletionResponse
 * @property {string} id - Response ID from OpenRouter
 * @property {string} model - Model used for completion
 * @property {Array<{
 *   message: {
 *     role: string,
 *     content: string
 *   },
 *   finish_reason: string,
 *   index: number
 * }>} choices - Array of completion choices
 * @property {Object} usage - Token usage statistics
 * @property {number} usage.prompt_tokens - Number of tokens in prompt
 * @property {number} usage.completion_tokens - Number of tokens in completion
 * @property {number} usage.total_tokens - Total tokens used
 */

/**
 * @typedef {Object} CompletionRequest
 * @property {string} model - Model ID to use
 * @property {Array<{role: string, content: Array<{type: string, text?: string, image_url?: {url: string}}>}>} messages - Messages for completion
 * @property {number} temperature - Temperature for sampling
 * @property {number} top_p - Top P for sampling
 * @property {number} max_tokens - Maximum tokens to generate
 * @property {Object} provider - Provider settings
 * @property {string} provider.sort - Sort order for models
 * @property {boolean} provider.allow_fallbacks - Whether to allow fallback models
 */

/**
 * @typedef {Object} CompletionResult
 * @property {boolean} error - Whether an error occurred
 * @property {string} message - Error or success message
 * @property {CompletionResponse|null} data - The completion response data if successful
 */

/**
 * Gets a completion from OpenRouter API
 * 
 * @param {CompletionRequest} request - The completion request
 * @param {string} apiKey - OpenRouter API key
 * @param {number} [timeout=30000] - Request timeout in milliseconds
 * @returns {Promise<CompletionResult>} The completion result
 */
async function getCompletion(request, apiKey, timeout = 30000) {
    return new Promise((resolve) => {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://openrouter.ai/api/v1/chat/completions",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://greasyfork.org/en/scripts/532459-tweetfilter-ai",
                "X-Title": "TweetFilter-AI"
            },
            data: JSON.stringify(request),
            timeout: timeout,
            onload: function (response) {
                if (response.status >= 200 && response.status < 300) {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data.content==="") {
                            resolve({
                                error: true,
                                message: `No content returned${data.choices[0].native_finish_reason=="SAFETY"?" (SAFETY FILTER)":""}`,
                                data: data
                            });
                        }
                        resolve({
                            error: false,
                            message: "Request successful",
                            data: data
                        });
                    } catch (error) {
                        resolve({
                            error: true,
                            message: `Failed to parse response: ${error.message}`,
                            data: null
                        });
                    }
                } else {
                    resolve({
                        error: true,
                        message: `Request failed with status ${response.status}: ${response.responseText}`,
                        data: null
                    });
                }
            },
            onerror: function (error) {
                resolve({
                    error: true,
                    message: `Request error: ${error.toString()}`,
                    data: null
                });
            },
            ontimeout: function () {
                resolve({
                    error: true,
                    message: `Request timed out after ${timeout}ms`,
                    data: null
                });
            }
        });
    });
}
const safetySettings = [
    {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_CIVIC_INTEGRITY",
        threshold: "BLOCK_NONE",
    },
];
/**
 * Rates a tweet using the OpenRouter API with automatic retry functionality.
 * 
 * @param {string} tweetText - The text content of the tweet
 * @param {string} tweetId - The unique tweet ID
 * @param {string} apiKey - The API key for authentication
 * @param {string[]} mediaUrls - Array of media URLs associated with the tweet
 * @param {number} [maxRetries=3] - Maximum number of retry attempts
 * @returns {Promise<{score: number, content: string, error: boolean}>} The rating result
 */
async function rateTweetWithOpenRouter(tweetText, tweetId, apiKey, mediaUrls, maxRetries = 3) {
    const request = {
        model: selectedModel,
        messages: [{
            role: "system",
            content: [{
                type: "text",
                text: `
                ${SYSTEM_PROMPT}`
            },]
        },
        {
            role: "user",
            content: [{
                type: "text",
                text:
                    `provide your reasoning, and a rating (eg. SCORE_0, SCORE_1, SCORE_2, SCORE_3, etc.) for the tweet with tweet ID ${tweetId}.
        [USER-DEFINED INSTRUCTIONS]:
        ${USER_DEFINED_INSTRUCTIONS}
                _______BEGIN TWEET_______
                ${tweetText}
                _______END TWEET_______`
            }]
        }]
    };

    if (selectedModel.includes('gemini')) {
        request.config = {
            safetySettings: safetySettings,
        };
    }

    // Add image URLs if present and supported
    if (mediaUrls?.length > 0 && modelSupportsImages(selectedModel)) {
        for (const url of mediaUrls) {
            request.messages[1].content.push({
                type: "image_url",
                image_url: { url }
            });
        }
    }

    // Add model parameters
    request.temperature = modelTemperature;
    request.top_p = modelTopP;
    request.max_tokens = maxTokens;

    // Add provider settings
    const sortOrder = GM_getValue('modelSortOrder', 'throughput-high-to-low');
    request.provider = {
        sort: sortOrder.split('-')[0],
        allow_fallbacks: true
    };

    // Implement retry logic with exponential backoff
    let attempt = 0;
    while (attempt < maxRetries) {
        attempt++;

        // Rate limiting
        const now = Date.now();
        const timeElapsed = now - lastAPICallTime;
        if (timeElapsed < API_CALL_DELAY_MS) {
            await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY_MS - timeElapsed));
        }
        lastAPICallTime = now;

        // Update status
        pendingRequests++;
        showStatus(`Rating tweet... (${pendingRequests} pending)`);

        // Make API request
        const result = await getCompletion(request, apiKey);
        pendingRequests--;
        showStatus(`Rating tweet... (${pendingRequests} pending)`);

        if (!result.error && result.data?.choices?.[0]?.message?.content) {
            const content = result.data.choices[0].message.content;
            const scoreMatch = content.match(/\SCORE_(\d+)/);

            if (scoreMatch) {
                const score = parseInt(scoreMatch[1], 10);

                tweetIDRatingCache[tweetId] = {
                    tweetContent: tweetText,
                    score: score,
                    description: content
                };
                saveTweetRatings();
                return { score, content, error: false };
            }
        }

        // Handle retries
        if (attempt < maxRetries) {
            const backoffDelay = Math.pow(attempt, 2) * 1000;
            console.log(`Attempt ${attempt}/${maxRetries} failed. Retrying in ${backoffDelay}ms...`);
            console.log('Response:', {
                error: result.error,
                message: result.message,
                data: result.data,
                content: result.data?.choices?.[0]?.message?.content
            });
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }

    return {
        score: 5,
        content: "Failed to get valid rating after multiple attempts",
        error: true
    };
}

/**
 * Gets descriptions for images using the OpenRouter API
 * 
 * @param {string[]} urls - Array of image URLs to get descriptions for
 * @param {string} apiKey - The API key for authentication
 * @param {string} tweetId - The unique tweet ID
 * @param {string} userHandle - The Twitter user handle
 * @returns {Promise<string>} Combined image descriptions
 */
async function getImageDescription(urls, apiKey, tweetId, userHandle) {
    if (!urls?.length || !enableImageDescriptions) {
        return !enableImageDescriptions ? '[Image descriptions disabled]' : '';
    }

    let descriptions = [];
    for (const url of urls) {
        const request = {
            model: selectedImageModel,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Describe what you see in this image in a concise way, focusing on the main elements and any text visible. Keep the description under 100 words."
                    },
                    {
                        type: "image_url",
                        image_url: { url }
                    }
                ]
            }],
            temperature: imageModelTemperature,
            top_p: imageModelTopP,
            max_tokens: maxTokens,
            provider: {
                sort: GM_getValue('modelSortOrder', 'throughput-high-to-low').split('-')[0],
                allow_fallbacks: true
            }
        };
        if (selectedImageModel.includes('gemini')) {
            request.config = {
                safetySettings: safetySettings,
            }
        }
        const result = await getCompletion(request, apiKey);
        if (!result.error && result.data?.choices?.[0]?.message?.content) {
            descriptions.push(result.data.choices[0].message.content);
        } else {
            descriptions.push('[Error getting image description]');
        }
    }

    return descriptions.map((desc, i) => `[IMAGE ${i + 1}]: ${desc}`).join('\n');
}

/**
 * Fetches the list of available models from the OpenRouter API.
 * Uses the stored API key, and updates the model selector upon success.
 */
function fetchAvailableModels() {
    const apiKey = GM_getValue('openrouter-api-key', '');
    if (!apiKey) {
        console.log('No API key available, skipping model fetch');
        showStatus('Please enter your OpenRouter API key');
        return;
    }
    showStatus('Fetching available models...');
    const sortOrder = GM_getValue('modelSortOrder', 'throughput-high-to-low');
    GM_xmlhttpRequest({
        method: "GET",
        url: `https://openrouter.ai/api/frontend/models/find?order=${sortOrder}`,
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://greasyfork.org/en/scripts/532182-twitter-x-ai-tweet-filter", // Use a more generic referer if preferred
            "X-Title": "Tweet Rating Tool"
        },
        onload: function (response) {
            try {
                const data = JSON.parse(response.responseText);
                if (data.data && data.data.models) {
                    availableModels = data.data.models || [];
                    refreshModelsUI();
                    showStatus('Models updated!');
                }
            } catch (error) {
                console.error('Error parsing model list:', error);
                showStatus('Error parsing models list');
            }
        },
        onerror: function (error) {
            console.error('Error fetching models:', error);
            showStatus('Error fetching models!');
        }
    });
}


    // ----- domScraper.js -----
/**
     * Extracts and returns trimmed text content from the given element(s).
     * @param {Node|NodeList} elements - A DOM element or a NodeList.
     * @returns {string} The trimmed text content.
     */
function getElementText(elements) {
    if (!elements) return '';
    const elementList = elements instanceof NodeList ? Array.from(elements) : [elements];
    for (const element of elementList) {
        const text = element?.textContent?.trim();
        if (text) return text;
    }
    return '';
}
/**
 * Extracts the tweet ID from a tweet article element.
 * @param {Element} tweetArticle - The tweet article element.
 * @returns {string} The tweet ID.
 */
function getTweetID(tweetArticle) {
    const timeEl = tweetArticle.querySelector(PERMALINK_SELECTOR);
    let tweetId = timeEl?.parentElement?.href;
    if (tweetId && tweetId.includes('/status/')) {
        const match = tweetId.match(/\/status\/(\d+)/);
        if (match && match[1]) {
            return match[1];
        }
        return tweetId.substring(tweetId.indexOf('/status/') + 1);
    }
    return `tweet-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
}

/**
 * Extracts the Twitter handle from a tweet article element.
 * @param {Element} tweetArticle - The tweet article element.
 * @returns {array} The user and quoted user handles.
 */
function getUserHandles(tweetArticle) {
    const handleElement = tweetArticle.querySelectorAll(USER_HANDLE_SELECTOR);
    let handles=[];
    if (handleElement) {
        /*
        const href = handleElement.getAttribute('href');
        if (href && href.startsWith('/')) {
            return href.slice(1);
        }
        */
       handleElement.forEach(element => {
        const href = element.getAttribute('href');
        if (href && href.startsWith('/')) {
            handles.push(href.slice(1));
        }
       });
    }
    return handles.length>0?handles:[''];
}


/**
 * Extracts and returns an array of media URLs from the tweet element.
 * @param {Element} scopeElement - The tweet element.
 * @returns {string[]} An array of media URLs.
 */
function extractMediaLinks(scopeElement) {
    if (!scopeElement) return [];
    
    const mediaLinks = new Set();
    
    // Find all images and videos in the tweet
    const imgSelector = `${MEDIA_IMG_SELECTOR}, [data-testid="tweetPhoto"] img, img[src*="pbs.twimg.com/media"]`;
    const videoSelector = `${MEDIA_VIDEO_SELECTOR}, video[poster*="pbs.twimg.com"], video`;
    
    // First try the standard selectors
    let mediaElements = scopeElement.querySelectorAll(`${imgSelector}, ${videoSelector}`);
    
    // If no media found and this is a quoted tweet, try more aggressive selectors
    if (mediaElements.length === 0 && scopeElement.matches(QUOTE_CONTAINER_SELECTOR)) {
        // Try to find any image within the quoted tweet
        mediaElements = scopeElement.querySelectorAll('img[src*="pbs.twimg.com"], video[poster*="pbs.twimg.com"]');
    }
    
    mediaElements.forEach(mediaEl => {
        // Get the source URL (src for images, poster for videos)
        const sourceUrl = mediaEl.tagName === 'IMG' ? mediaEl.src : mediaEl.poster;
        
        // Skip if not a Twitter media URL or if undefined or if it's a profile image
        if (!sourceUrl || 
           !(sourceUrl.includes('pbs.twimg.com/')) ||
           sourceUrl.includes('profile_images')) {
            return;
        }
        
        try {
            // Parse the URL to handle format parameters
            const url = new URL(sourceUrl);
            const format = url.searchParams.get('format');
            const name = url.searchParams.get('name'); // 'small', 'medium', 'large', etc.
            
            // Create the final URL with the right format and size
            let finalUrl = sourceUrl;
            
            // Try to get the original size by removing size indicator
            if (name && name !== 'orig') {
                // Replace format=jpg&name=small with format=jpg&name=orig
                finalUrl = sourceUrl.replace(`name=${name}`, 'name=orig');
            }
            
            mediaLinks.add(finalUrl);
        } catch (error) {
            // Fallback: just add the raw URL as is
            mediaLinks.add(sourceUrl);
        }
    });
    
    return Array.from(mediaLinks);
}

// ----- Rating Indicator Functions -----

/**
 * Processes a single tweet after a delay.
 * It first sets a pending indicator, then either applies a cached rating,
 * or calls the API to rate the tweet (with retry logic).
 * Finally, it applies the filtering logic.
 * @param {Element} tweetArticle - The tweet element.
 * @param {string} tweetId - The tweet ID.
 */
// Helper function to determine if a tweet is the original tweet in a conversation.
// We check if the tweet article has a following sibling with data-testid="inline_reply_offscreen".
function isOriginalTweet(tweetArticle) {
    let sibling = tweetArticle.nextElementSibling;
    while (sibling) {
        if (sibling.matches && sibling.matches('div[data-testid="inline_reply_offscreen"]')) {
            return true;
        }
        sibling = sibling.nextElementSibling;
    }
    return false;
}


// ----- MutationObserver Setup -----
/**
 * Handles DOM mutations to detect new tweets added to the timeline.
 * @param {MutationRecord[]} mutationsList - List of observed mutations.
 */
function handleMutations(mutationsList) {

    for (const mutation of mutationsList) {
        handleThreads();
        if (mutation.type === 'childList') {
            // Process added nodes
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches && node.matches(TWEET_ARTICLE_SELECTOR)) {
                            scheduleTweetProcessing(node);
                        }
                        else if (node.querySelectorAll) {
                            const tweetsInside = node.querySelectorAll(TWEET_ARTICLE_SELECTOR);
                            tweetsInside.forEach(scheduleTweetProcessing);
                        }
                    }
                });
            }

            // Process removed nodes to clean up description elements
            if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the removed node is a tweet article or contains tweet articles
                        const isTweet = node.matches && node.matches(TWEET_ARTICLE_SELECTOR);
                        const removedTweets = isTweet ? [node] :
                            (node.querySelectorAll ? Array.from(node.querySelectorAll(TWEET_ARTICLE_SELECTOR)) : []);

                        // For each removed tweet, find and remove its description element
                        removedTweets.forEach(tweet => {
                            const indicator = tweet.querySelector('.score-indicator');
                            if (indicator && indicator.dataset.id) {
                                const descId = 'desc-' + indicator.dataset.id;
                                const descBox = document.getElementById(descId);
                                if (descBox) {
                                    descBox.remove();
                                    //console.debug(`Removed description box ${descId} for tweet that was removed from the DOM`);
                                }
                            }
                        });
                    }
                });
            }
        }
    }
}
    // ----- ratingEngine.js -----
/**
 * Applies filtering to a single tweet by hiding it if its score is below the threshold.
 * Also updates the rating indicator.
 * @param {Element} tweetArticle - The tweet element.
 */
function filterSingleTweet(tweetArticle) {
    const score = parseInt(tweetArticle.dataset.sloppinessScore || '1', 10);
    // Update the indicator based on the tweet's rating status
    setScoreIndicator(tweetArticle, score, tweetArticle.dataset.ratingStatus || 'rated', tweetArticle.dataset.ratingDescription);
    // If the tweet is still pending a rating, keep it visible
    const currentFilterThreshold=GM_getValue('filterThreshold', 1);
    if (tweetArticle.dataset.ratingStatus === 'pending') {
        //tweetArticle.style.display = '';
        tweetArticle.closest('div[data-testid="cellInnerDiv"]').style.display= '';
    } else if (isNaN(score) || score < currentFilterThreshold) {
        //tweetArticle.style.display = 'none';
        tweetArticle.closest('div[data-testid="cellInnerDiv"]').style.display= 'none';
    } else {
        //tweetArticle.style.display = '';
        tweetArticle.closest('div[data-testid="cellInnerDiv"]').style.display= '';
    }
}

/**
 * Applies a cached rating (if available) to a tweet article.
 * Also sets the rating status to 'rated' and updates the indicator.
 * @param {Element} tweetArticle - The tweet element.
 * @returns {boolean} True if a cached rating was applied.
 */
function applyTweetCachedRating(tweetArticle) {
    const tweetId = getTweetID(tweetArticle);
    const handles = getUserHandles(tweetArticle);
    const userHandle = handles.length > 0 ? handles[0] : '';
    // Blacklisted users are automatically given a score of 10
    if (userHandle && isUserBlacklisted(userHandle)) {
        //console.debug(`Blacklisted user detected: ${userHandle}, assigning score 10`);
        tweetArticle.dataset.sloppinessScore = '10';
        tweetArticle.dataset.blacklisted = 'true';
        tweetArticle.dataset.ratingStatus = 'blacklisted';
        tweetArticle.dataset.ratingDescription = 'Whtielisted user';
        setScoreIndicator(tweetArticle, 10, 'blacklisted', "User is whitelisted");
        filterSingleTweet(tweetArticle);
        return true;
    }
    // Check ID-based cache
    if (tweetIDRatingCache[tweetId]) {
        const score = tweetIDRatingCache[tweetId].score;
        const desc = tweetIDRatingCache[tweetId].description;
        //console.debug(`Applied cached rating for tweet ${tweetId}: ${score}`);
        tweetArticle.dataset.sloppinessScore = score.toString();
        tweetArticle.dataset.cachedRating = 'true';
        tweetArticle.dataset.ratingStatus = 'cached';
        tweetArticle.dataset.ratingDescription = desc;
        setScoreIndicator(tweetArticle, score, 'cached', desc);
        filterSingleTweet(tweetArticle);
        return true;
    }

    return false;
}
// ----- UI Helper Functions -----

/**
 * Saves the tweet ratings (by tweet ID) to persistent storage and updates the UI.
 */
function saveTweetRatings() {
    GM_setValue('tweetRatings', JSON.stringify(tweetIDRatingCache));
    
    // Dynamically update the UI cache stats counter
    // Only try to update if the element exists (the settings panel is open)
    const cachedCountEl = document.getElementById('cached-ratings-count');
    if (cachedCountEl) {
        cachedCountEl.textContent = Object.keys(tweetIDRatingCache).length;
    }
    
    // Also update the cache stats in the settings panel
    try {
        // Use the UI function if it's available
        if (typeof updateCacheStatsUI === 'function') {
            updateCacheStatsUI();
        }
    } catch (e) {
        console.error('Error updating cache stats UI:', e);
    }
}
/**
 * Checks if a given user handle is in the blacklist.
 * @param {string} handle - The Twitter handle.
 * @returns {boolean} True if blacklisted, false otherwise.
 */
function isUserBlacklisted(handle) {
    if (!handle) return false;
    handle = handle.toLowerCase().trim();
    return blacklistedHandles.some(h => h.toLowerCase().trim() === handle);
}

async function delayedProcessTweet(tweetArticle, tweetId) {
    const apiKey = GM_getValue('openrouter-api-key', '');
    if (!apiKey) {
        tweetArticle.dataset.ratingStatus = 'error';
        tweetArticle.dataset.ratingDescription = "No API key";
        try {
            setScoreIndicator(tweetArticle, 5, 'error', "No API key");
            // Verify indicator was actually created
            if (!tweetArticle.querySelector('.score-indicator')) {
                console.error(`Failed to create score indicator for tweet ${tweetId}`);
            }
        } catch (e) {
            console.error(`Error setting score indicator for tweet ${tweetId}:`, e);
        }
        filterSingleTweet(tweetArticle);
        // Remove from processedTweets to allow retrying
        processedTweets.delete(tweetId);
        console.error(`Failed to process tweet ${tweetId}: No API key`);
        return;
    }
    let score = 5; // Default score if rating fails
    let description = "";
    let processingSuccessful = false;

    try {
        // Get user handle
        const handles = getUserHandles(tweetArticle);
        const userHandle = handles.length > 0 ? handles[0] : '';
        // Check if tweet's author is blacklisted (fast path)
        if (userHandle && isUserBlacklisted(userHandle)) {
            tweetArticle.dataset.sloppinessScore = '10';
            tweetArticle.dataset.blacklisted = 'true';
            tweetArticle.dataset.ratingStatus = 'blacklisted';
            tweetArticle.dataset.ratingDescription = "Blacklisted user";
            try {
                setScoreIndicator(tweetArticle, 10, 'blacklisted', "User is blacklisted");
                // Verify indicator was actually created
                if (!tweetArticle.querySelector('.score-indicator')) {
                    throw new Error("Failed to create score indicator");
                }
            } catch (e) {
                console.error(`Error setting blacklist indicator for tweet ${tweetId}:`, e);
                // Even if indicator fails, we've set the dataset properties
            }
            filterSingleTweet(tweetArticle);
            processingSuccessful = true;
            return;
        }
        // Check if a cached rating exists
        if (applyTweetCachedRating(tweetArticle)) {
            // Verify the indicator exists after applying cached rating
            if (!tweetArticle.querySelector('.score-indicator')) {
                console.error(`Missing indicator after applying cached rating to tweet ${tweetId}`);
                processingSuccessful = false;
            } else {
                processingSuccessful = true;
            }
            return;
        }
       
        const fullContextWithImageDescription = await getFullContext(tweetArticle, tweetId, apiKey);
        if (!fullContextWithImageDescription) {
            throw new Error("Failed to get tweet context");
        }
        
        //Get the media URLS from the entire fullContextWithImageDescription, and pass that to the rating engine
        //This allows us to get the media links from the thread history as well
        const mediaURLs = [];
        // Extract regular media URLs
        const mediaMatches = fullContextWithImageDescription.match(/\[MEDIA_URLS\]:\s*\n(.*?)(?:\n|$)/);
        if (mediaMatches && mediaMatches[1]) {
            mediaURLs.push(...mediaMatches[1].split(', '));
        }
        // Extract quoted tweet media URLs
        const quotedMediaMatches = fullContextWithImageDescription.match(/\[QUOTED_TWEET_MEDIA_URLS\]:\s*\n(.*?)(?:\n|$)/);
        if (quotedMediaMatches && quotedMediaMatches[1]) {
            mediaURLs.push(...quotedMediaMatches[1].split(', '));
        }

        // --- API Call or Fallback ---
        if (apiKey && fullContextWithImageDescription) {
            try {
                const rating = await rateTweetWithOpenRouter(fullContextWithImageDescription, tweetId, apiKey, mediaURLs);
                score = rating.score;
                description = rating.content;
                tweetArticle.dataset.ratingStatus = rating.error ? 'error' : 'rated';
                tweetArticle.dataset.ratingDescription = description || "not available";
                tweetArticle.dataset.sloppinessScore = score.toString();
                
                try {
                    setScoreIndicator(tweetArticle, score, tweetArticle.dataset.ratingStatus, tweetArticle.dataset.ratingDescription);
                    // Verify the indicator exists
                    if (!tweetArticle.querySelector('.score-indicator')) {
                        throw new Error("Failed to create score indicator");
                    }
                } catch (e) {
                    console.error(`Error setting rated indicator for tweet ${tweetId}:`, e);
                    // Continue even if indicator fails - we've set the dataset properties
                }
                
                filterSingleTweet(tweetArticle);
                processingSuccessful = !rating.error;
                
                // Store the full context after rating is complete
                if (tweetIDRatingCache[tweetId]) {
                    tweetIDRatingCache[tweetId].score = score;
                    tweetIDRatingCache[tweetId].description = description;
                    tweetIDRatingCache[tweetId].tweetContent = fullContextWithImageDescription;
                } else {
                    tweetIDRatingCache[tweetId] = {
                        score: score,
                        description: description,
                        tweetContent: fullContextWithImageDescription
                    };
                }
                
                // Save ratings to persistent storage
                saveTweetRatings();

            } catch (apiError) {
                console.error(`API error for tweet ${tweetId}: ${apiError}`);
                score = 10; // Fallback to a random score
                tweetArticle.dataset.ratingStatus = 'error';
                tweetArticle.dataset.ratingDescription = "API error";
                // Don't consider API errors as successful processing
                processingSuccessful = false;
            }
        } else if (fullContextWithImageDescription) {
            score = 10;
            //show all tweets that errored
            tweetArticle.dataset.ratingStatus = 'error';
            tweetArticle.dataset.ratingDescription = "No API key";
            processingSuccessful = true;
        }else{
            //show all tweets that errored
            score=10;
            tweetArticle.dataset.ratingStatus = 'error';
            tweetArticle.dataset.ratingDescription = "No content";
            processingSuccessful = true;
        }

        tweetArticle.dataset.sloppinessScore = score.toString();
        try {
            console.log(`Tweet ${tweetId}
${fullContextWithImageDescription}
Status: ${tweetArticle.dataset.ratingStatus}
Score: ${score}
Model: ${GM_getValue('selectedModel', '')}
${GM_getValue('enableImageDescriptions', false) ? `Image Model: ${GM_getValue('selectedImageModel', '')}` : ""}
Description: ${description}
                `)
            setScoreIndicator(tweetArticle, score, tweetArticle.dataset.ratingStatus, tweetArticle.dataset.ratingDescription || "");
            // Final verification of indicator
            if (!tweetArticle.querySelector('.score-indicator')) {
                console.error(`Final indicator check failed for tweet ${tweetId}`);
                processingSuccessful = false;
            }
            
        } catch (e) {
            console.error(`Final error setting indicator for tweet ${tweetId}:`, e);
            processingSuccessful = false;
        }
        
        filterSingleTweet(tweetArticle);
        
        // Log processed status
        //console.log(`Tweet ${tweetId} processed: score=${score}, status=${tweetArticle.dataset.ratingStatus}`);

    } catch (error) {
        console.error(`Error processing tweet ${tweetId}: ${error}`);
        if (!tweetArticle.dataset.sloppinessScore) {
            tweetArticle.dataset.sloppinessScore = '5';
            tweetArticle.dataset.ratingStatus = 'error';
            tweetArticle.dataset.ratingDescription = "error processing tweet";
            try {
                setScoreIndicator(tweetArticle, 5, 'error', 'Error processing tweet');
                // Verify indicator exists
                if (!tweetArticle.querySelector('.score-indicator')) {
                    console.error(`Failed to create error indicator for tweet ${tweetId}`);
                }
            } catch (e) {
                console.error(`Error setting error indicator for tweet ${tweetId}:`, e);
            }
            filterSingleTweet(tweetArticle);
        }
        processingSuccessful = false;
    } finally {
        // If processing was not successful, remove from processedTweets
        // to allow future retry attempts
        if (!processingSuccessful) {
            console.warn(`Removing tweet ${tweetId} from processedTweets to allow retry`);
            processedTweets.delete(tweetId);
        }
    }
}

/**
 * Schedules processing of a tweet if it hasn't been processed yet.
 * @param {Element} tweetArticle - The tweet element.
 */
function scheduleTweetProcessing(tweetArticle) {
    // First, ensure the tweet has a valid ID
    const tweetId = getTweetID(tweetArticle);
    if (!tweetId) {
        console.error("Cannot schedule tweet without valid ID", tweetArticle);
        return;
    }

    // Fast-path: if author is blacklisted, assign score immediately
    const handles = getUserHandles(tweetArticle);
    const userHandle = handles.length > 0 ? handles[0] : '';
    if (userHandle && isUserBlacklisted(userHandle)) {
        tweetArticle.dataset.sloppinessScore = '10';
        tweetArticle.dataset.blacklisted = 'true';
        tweetArticle.dataset.ratingStatus = 'rated';
        tweetArticle.dataset.ratingDescription = "Whitelisted user";
        setScoreIndicator(tweetArticle, 10, 'blacklisted', "User is whitelisted");
        filterSingleTweet(tweetArticle);
        return;
    }
    
    // If a cached rating is available, use it immediately
    if (tweetIDRatingCache[tweetId]) {
        applyTweetCachedRating(tweetArticle);
        return;
    }
    
    // Skip if already processed in this session
    if (processedTweets.has(tweetId)) {
        // Verify that the tweet actually has an indicator - if not, remove from processed
        const hasIndicator = !!tweetArticle.querySelector('.score-indicator');
        if (!hasIndicator) {
            console.warn(`Tweet ${tweetId} was marked as processed but has no indicator, reprocessing`);
            processedTweets.delete(tweetId);
        } else {
            return;
        }
    }

    // Immediately mark as pending before scheduling actual processing
    processedTweets.add(tweetId);
    tweetArticle.dataset.ratingStatus = 'pending';
    
    // Ensure indicator is set
    try {
        setScoreIndicator(tweetArticle, null, 'pending');
    } catch (e) {
        console.error(`Failed to set indicator for tweet ${tweetId}:`, e);
    }

    // Now schedule the actual rating processing
    setTimeout(() => { 
        try {
            delayedProcessTweet(tweetArticle, tweetId); 
        } catch (e) {
            console.error(`Error in delayed processing of tweet ${tweetId}:`, e);
            processedTweets.delete(tweetId);
        }
    }, PROCESSING_DELAY_MS);
}

/**
 * Extracts the full context of a tweet article and returns a formatted string.
 *
 * Schema:
 * [TWEET]:
 * @[the author of the tweet]
 * [the text of the tweet]
 * [MEDIA_DESCRIPTION]:
 * [IMAGE 1]: [description], [IMAGE 2]: [description], etc.
 * [QUOTED_TWEET]:
 * [the text of the quoted tweet]
 * [QUOTED_TWEET_MEDIA_DESCRIPTION]:
 * [IMAGE 1]: [description], [IMAGE 2]: [description], etc.
 *
 * @param {Element} tweetArticle - The tweet article element.
 * @param {string} tweetId - The tweet's ID.
 * @param {string} apiKey - API key used for getting image descriptions.
 * @returns {Promise<string>} - The full context string.
 */
async function getFullContext(tweetArticle, tweetId, apiKey) {
    const handles = getUserHandles(tweetArticle);
    const userHandle = handles.length > 0 ? handles[0] : '';
    const quotedHandle = handles.length > 1 ? handles[1] : '';
    // --- Extract Main Tweet Content ---
    const mainText = getElementText(tweetArticle.querySelector(TWEET_TEXT_SELECTOR));
    
    // Allow a small delay for images to load
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let allMediaLinks = extractMediaLinks(tweetArticle);

        // --- Extract Quoted Tweet Content (if any) ---
        let quotedText = "";
        let quotedMediaLinks = [];
        const quoteContainer = tweetArticle.querySelector(QUOTE_CONTAINER_SELECTOR);
        if (quoteContainer) {
            quotedText = getElementText(quoteContainer.querySelector(TWEET_TEXT_SELECTOR)) || "";
            // Short delay to ensure quoted tweet images are loaded
            await new Promise(resolve => setTimeout(resolve, 300));
            quotedMediaLinks = extractMediaLinks(quoteContainer);
            console.log(`Quoted media links for tweet ${tweetId}:`, quotedMediaLinks);
        }
        // Remove any media links from the main tweet that also appear in the quoted tweet
        let mainMediaLinks = allMediaLinks.filter(link => !quotedMediaLinks.includes(link));
        let fullContextWithImageDescription = `[TWEET ${tweetId}]
 Author:@${userHandle}:
` + mainText;

        if (mainMediaLinks.length > 0) {
            // Process main tweet images only if image descriptions are enabled
            if (enableImageDescriptions=GM_getValue('enableImageDescriptions', false)) {
                let mainMediaLinksDescription = await getImageDescription(mainMediaLinks, apiKey, tweetId, userHandle);
                fullContextWithImageDescription += `
[MEDIA_DESCRIPTION]:
${mainMediaLinksDescription}`;
            }
            // Just add the URLs when descriptions are disabled
            fullContextWithImageDescription += `
[MEDIA_URLS]:
${mainMediaLinks.join(", ")}`;
            
        }
        // --- Quoted Tweet Handling ---
        if (quotedText||quotedMediaLinks.length > 0) {
            fullContextWithImageDescription += `
[QUOTED_TWEET]:
 Author:@${quotedHandle}:
${quotedText}`;
            if (quotedMediaLinks.length > 0) {
                // Process quoted tweet images only if image descriptions are enabled
                if (enableImageDescriptions) {
                    let quotedMediaLinksDescription = await getImageDescription(quotedMediaLinks, apiKey, tweetId, userHandle);
                    fullContextWithImageDescription += `
[QUOTED_TWEET_MEDIA_DESCRIPTION]:
${quotedMediaLinksDescription}`;
                }
                // Just add the URLs when descriptions are disabled
                fullContextWithImageDescription += `
[QUOTED_TWEET_MEDIA_URLS]:
${quotedMediaLinks.join(", ")}`;
                
            }
        }
        
        tweetArticle.dataset.fullContext = fullContextWithImageDescription;
        // --- Conversation Thread Handling ---
        const conversation = document.querySelector('div[aria-label="Timeline: Conversation"]');
        if (conversation && conversation.dataset.threadHist) {
            // If this tweet is not the original tweet, prepend the thread history.
            if (!isOriginalTweet(tweetArticle)) {
                fullContextWithImageDescription = conversation.dataset.threadHist + `
[REPLY]
` + fullContextWithImageDescription;
                
            }
        }
        
        tweetArticle.dataset.fullContext = fullContextWithImageDescription;
        return fullContextWithImageDescription;
    
}


/**
 * Applies filtering to all tweets currently in the observed container.
 */
function applyFilteringToAll() {
    if (!observedTargetNode) return;
    const tweets = observedTargetNode.querySelectorAll(TWEET_ARTICLE_SELECTOR);
    tweets.forEach(filterSingleTweet);
}


function ensureAllTweetsRated() {
    if (!observedTargetNode) return;
    const tweets = observedTargetNode.querySelectorAll(TWEET_ARTICLE_SELECTOR);
    
    if (tweets.length > 0) {
        console.log(`Checking ${tweets.length} tweets to ensure all are rated...`);
        let unreatedCount = 0;
        
        tweets.forEach(tweet => {
            const tweetId = getTweetID(tweet);
            if (!tweetId) return; // Skip tweets without a valid ID
            
            // Check for any issues that would require processing:
            // 1. No score data attribute
            // 2. Error status
            // 3. Missing indicator element (even if in processedTweets)
            const hasScore = !!tweet.dataset.sloppinessScore;
            const hasError = tweet.dataset.ratingStatus === 'error';
            const hasIndicator = !!tweet.querySelector('.score-indicator');
            
            // If tweet is in processedTweets but missing indicator, remove it from processed
            if (processedTweets.has(tweetId) && !hasIndicator) {
                console.warn(`Tweet ${tweetId} in processedTweets but missing indicator, removing`);
                processedTweets.delete(tweetId);
            }
            
            // Schedule processing if needed and not already in progress
            const needsProcessing = !hasScore || hasError || !hasIndicator;
            if (needsProcessing && !processedTweets.has(tweetId)) {
                unreatedCount++;
                const status = !hasIndicator ? 'missing indicator' : 
                               !hasScore ? 'unrated' : 
                               hasError ? 'error' : 'unknown issue';
                               
                //console.log(`Found tweet ${tweetId} with ${status}, scheduling processing`);
                scheduleTweetProcessing(tweet);
            }
        });
        
        if (unreatedCount > 0) {
            //console.log(`Scheduled ${unreatedCount} tweets for processing`);
        }
    }
}

async function handleThreads() {
    let conversation = document.querySelector('div[aria-label="Timeline: Conversation"]');
    if (conversation) {

        if (conversation.dataset.threadHist == undefined) {

            threadHist = "";
            const firstArticle = document.querySelector('article[data-testid="tweet"]');
            if (firstArticle) {
                conversation.dataset.threadHist = 'pending';
                const tweetId = getTweetID(firstArticle);
                
                const apiKey = GM_getValue('openrouter-api-key', '');
                const fullcxt = await getFullContext(firstArticle, tweetId, apiKey);
                threadHist = fullcxt;
                
                conversation.dataset.threadHist = threadHist;
                //this lets us know if we are still on the main post of the conversation or if we are on a reply to the main post. Will disapear every time we dive deeper
                conversation.firstChild.dataset.canary = "true";
                
                // Schedule processing for the original tweet
                if (!processedTweets.has(tweetId)) {
                    scheduleTweetProcessing(firstArticle);
                }
            }
        }
        else if (conversation.dataset.threadHist == "pending") {
            return;
        }
        else if (conversation.dataset.threadHist != "pending" && conversation.firstChild.dataset.canary == undefined) {
            conversation.firstChild.dataset.canary = "pending";
            const nextArticle = document.querySelector('article[data-testid="tweet"]:has(~ div[data-testid="inline_reply_offscreen"])');
            if (nextArticle) {
                const tweetId = getTweetID(nextArticle);
                if (tweetIDRatingCache[tweetId] && tweetIDRatingCache[tweetId].tweetContent) {
                    threadHist = threadHist + "\n[REPLY]\n" + tweetIDRatingCache[tweetId].tweetContent;
                } else {
                    const apiKey = GM_getValue('openrouter-api-key', '');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const newContext = await getFullContext(nextArticle, tweetId, apiKey);
                    threadHist = threadHist + "\n[REPLY]\n" + newContext;
                }
                conversation.dataset.threadHist = threadHist;
            }
        }
    }
}


    // ----- ui.js -----
// --- Constants ---
const VERSION = '1.3.2'; // Update version here

// --- Utility Functions ---

/**
 * Displays a temporary status message on the screen.
 * @param {string} message - The message to display.
 */
function showStatus(message) {
    const indicator = document.getElementById('status-indicator');
    if (!indicator) {
        console.error('#status-indicator element not found.');
        return;
    }
    indicator.textContent = message;
    indicator.classList.add('active');
    setTimeout(() => { indicator.classList.remove('active'); }, 3000);
}

/**
 * Toggles the visibility of an element and updates the corresponding toggle button text.
 * @param {HTMLElement} element - The element to toggle.
 * @param {HTMLElement} toggleButton - The button that controls the toggle.
 * @param {string} openText - Text for the button when the element is open.
 * @param {string} closedText - Text for the button when the element is closed.
 */
function toggleElementVisibility(element, toggleButton, openText, closedText) {
    if (!element || !toggleButton) return;

    const isHidden = element.classList.toggle('hidden');
    toggleButton.innerHTML = isHidden ? closedText : openText;

    // Special case for filter slider button (hide it when panel is shown)
    if (element.id === 'tweet-filter-container') {
        const filterToggle = document.getElementById('filter-toggle');
        if (filterToggle) {
            filterToggle.style.display = isHidden ? 'block' : 'none';
        }
    }
}

// --- Core UI Logic ---

/**
 * Injects the UI elements from the HTML resource into the page.
 */
function injectUI() {
    //combined userscript has a const named MENU. If it exists, use it.
    let menuHTML;
    if(MENU){
        menuHTML = MENU;
    }else{
        menuHTML = GM_getValue('menuHTML');
    }
    
    if (!menuHTML) {
        console.error('Failed to load Menu.html resource!');
        showStatus('Error: Could not load UI components.');
        return null;
    }

    // Create a container to inject HTML
    const containerId = 'tweetfilter-root-container'; // Use the ID from the updated HTML
    let uiContainer = document.getElementById(containerId);
    if (uiContainer) {
        console.warn('UI container already exists. Skipping injection.');
        return uiContainer; // Return existing container
    }

    uiContainer = document.createElement('div');
    uiContainer.id = containerId;
    uiContainer.innerHTML = menuHTML;

    // Inject styles
    const stylesheet = uiContainer.querySelector('style');
    if (stylesheet) {
        GM_addStyle(stylesheet.textContent);
        console.log('Injected styles from Menu.html');
        stylesheet.remove(); // Remove style tag after injecting
    } else {
        console.warn('No <style> tag found in Menu.html');
    }

    // Append the rest of the UI elements
    document.body.appendChild(uiContainer);
    console.log('TweetFilter UI Injected from HTML resource.');

    // Set version number
    const versionInfo = uiContainer.querySelector('#version-info');
    if (versionInfo) {
        versionInfo.textContent = `Twitter De-Sloppifier v${VERSION}`;
    }

    return uiContainer; // Return the newly created container
}

/**
 * Initializes all UI event listeners using event delegation.
 * @param {HTMLElement} uiContainer - The root container element for the UI.
 */
function initializeEventListeners(uiContainer) {
    if (!uiContainer) {
        console.error('UI Container not found for event listeners.');
        return;
    }

    console.log('Wiring UI events...');

    const settingsContainer = uiContainer.querySelector('#settings-container');
    const filterContainer = uiContainer.querySelector('#tweet-filter-container');
    const settingsToggleBtn = uiContainer.querySelector('#settings-toggle');
    const filterToggleBtn = uiContainer.querySelector('#filter-toggle');

    // --- Delegated Event Listener for Clicks ---
    uiContainer.addEventListener('click', (event) => {
        const target = event.target;
        const action = target.dataset.action;
        const setting = target.dataset.setting;
        const paramName = target.closest('.parameter-row')?.dataset.paramName;
        const tab = target.dataset.tab;
        const toggleTargetId = target.closest('[data-toggle]')?.dataset.toggle;

        // Button Actions
        if (action) {
            switch (action) {
                case 'close-filter':
                    toggleElementVisibility(filterContainer, filterToggleBtn, 'Filter Slider', 'Filter Slider');
                    break;
                case 'close-settings':
                    toggleElementVisibility(settingsContainer, settingsToggleBtn, '<span style="font-size: 14px;">✕</span> Close', '<span style="font-size: 14px;">⚙️</span> Settings');
                    break;
                case 'save-api-key':
                    saveApiKey();
                    break;
                case 'clear-cache':
                    clearTweetRatingsAndRefreshUI();
                    break;
                case 'export-settings':
                    exportSettings();
                    break;
                case 'import-settings':
                    importSettings();
                    break;
                case 'reset-settings':
                    resetSettings();
                    break;
                case 'save-instructions':
                    saveInstructions();
                    break;
                case 'add-handle':
                    addHandleFromInput();
                    break;
            }
        }

        // Handle List Removal (delegated)
        if (target.classList.contains('remove-handle')) {
            const handleItem = target.closest('.handle-item');
            const handleTextElement = handleItem?.querySelector('.handle-text');
            if (handleTextElement) {
                const handle = handleTextElement.textContent.substring(1); // Remove '@'
                removeHandleFromBlacklist(handle);
            }
        }

        // Tab Switching
        if (tab) {
            switchTab(tab);
        }

        // Advanced Options Toggle
        if (toggleTargetId) {
            toggleAdvancedOptions(toggleTargetId);
        }
    });

    // --- Delegated Event Listener for Input/Change ---
    uiContainer.addEventListener('input', (event) => {
        const target = event.target;
        const setting = target.dataset.setting;
        const paramName = target.closest('.parameter-row')?.dataset.paramName;

        // Settings Inputs / Toggles
        if (setting) {
            handleSettingChange(target, setting);
        }

        // Parameter Controls (Sliders/Number Inputs)
        if (paramName) {
            handleParameterChange(target, paramName);
        }

        // Filter Slider
        if (target.id === 'tweet-filter-slider') {
            handleFilterSliderChange(target);
        }
    });

    uiContainer.addEventListener('change', (event) => {
        const target = event.target;
        const setting = target.dataset.setting;

         // Settings Inputs / Toggles (for selects like sort order)
         if (setting === 'modelSortOrder') {
            handleSettingChange(target, setting);
            fetchAvailableModels(); // Refresh models on sort change
         }

          // Settings Checkbox toggle (need change event for checkboxes)
          if (setting === 'enableImageDescriptions') {
             handleSettingChange(target, setting);
          }
    });

    // --- Direct Event Listeners (Less common cases) ---

    // Settings Toggle Button
    if (settingsToggleBtn) {
        settingsToggleBtn.onclick = () => {
            toggleElementVisibility(settingsContainer, settingsToggleBtn, '<span style="font-size: 14px;">✕</span> Close', '<span style="font-size: 14px;">⚙️</span> Settings');
        };
    }

    // Filter Toggle Button
    if (filterToggleBtn) {
        filterToggleBtn.onclick = () => {
             // Ensure filter container is shown and button is hidden
             if (filterContainer) filterContainer.classList.remove('hidden');
             filterToggleBtn.style.display = 'none';
        };
    }

    // Close custom selects when clicking outside
    document.addEventListener('click', closeAllSelectBoxes);

    console.log('UI events wired.');
}

// --- Event Handlers ---

/** Saves the API key from the input field. */
function saveApiKey() {
    const apiKeyInput = document.getElementById('openrouter-api-key');
    const apiKey = apiKeyInput.value.trim();
    let previousAPIKey = GM_getValue('openrouter-api-key', '').length>0?true:false;
    if (apiKey) {
        if (!previousAPIKey){
            resetSettings(true);
            //jank hack to get the UI defaults to load correctly
        }
        GM_setValue('openrouter-api-key', apiKey);
        showStatus('API key saved successfully!');
        fetchAvailableModels(); // Refresh model list
        //refresh the website
        location.reload();
    } else {
        showStatus('Please enter a valid API key');
    }
}

/** Clears tweet ratings and updates the relevant UI parts. */
function clearTweetRatingsAndRefreshUI() {
    if (confirm('Are you sure you want to clear all cached tweet ratings?')) {
        Object.keys(tweetIDRatingCache).forEach(key => delete tweetIDRatingCache[key]);
        GM_setValue('tweetRatings', '{}');
        showStatus('All cached ratings cleared!');
        console.log('Cleared all tweet ratings');

        updateCacheStatsUI();

        // Re-process visible tweets
        if (observedTargetNode) {
            observedTargetNode.querySelectorAll(TWEET_ARTICLE_SELECTOR).forEach(tweet => {
                tweet.dataset.sloppinessScore = ''; // Clear potential old score attribute
                delete tweet.dataset.cachedRating;
                delete tweet.dataset.blacklisted;
                processedTweets.delete(getTweetID(tweet));
                scheduleTweetProcessing(tweet);
            });
        }
    }
}

/** Saves the custom instructions from the textarea. */
function saveInstructions() {
    const instructionsTextarea = document.getElementById('user-instructions');
    USER_DEFINED_INSTRUCTIONS = instructionsTextarea.value;
    GM_setValue('userDefinedInstructions', USER_DEFINED_INSTRUCTIONS);
    showStatus('Scoring instructions saved! New tweets will use these instructions.');
    if (confirm('Do you want to clear the rating cache to apply these instructions to all tweets?')) {
        clearTweetRatingsAndRefreshUI();
    }
}

/** Adds a handle from the input field to the blacklist. */
function addHandleFromInput() {
    const handleInput = document.getElementById('handle-input');
    const handle = handleInput.value.trim();
    if (handle) {
        addHandleToBlacklist(handle);
        handleInput.value = ''; // Clear input after adding
    }
}

/**
 * Handles changes to general setting inputs/toggles.
 * @param {HTMLElement} target - The input/toggle element that changed.
 * @param {string} settingName - The name of the setting (from data-setting).
 */
function handleSettingChange(target, settingName) {
    let value;
    if (target.type === 'checkbox') {
        value = target.checked;
    } else {
        value = target.value;
    }

    // Update global variable if it exists
    if (window[settingName] !== undefined) {
        window[settingName] = value;
    }

    // Save to GM storage
    GM_setValue(settingName, value);

    // Special UI updates for specific settings
    if (settingName === 'enableImageDescriptions') {
        const imageModelContainer = document.getElementById('image-model-container');
        if (imageModelContainer) {
            imageModelContainer.style.display = value ? 'block' : 'none';
        }
        showStatus('Image descriptions ' + (value ? 'enabled' : 'disabled'));
    }
}

/**
 * Handles changes to parameter control sliders/number inputs.
 * @param {HTMLElement} target - The slider or number input element.
 * @param {string} paramName - The name of the parameter (from data-param-name).
 */
function handleParameterChange(target, paramName) {
    const row = target.closest('.parameter-row');
    if (!row) return;

    const slider = row.querySelector('.parameter-slider');
    const valueInput = row.querySelector('.parameter-value');
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    let newValue = parseFloat(target.value);

    // Clamp value if it's from the number input
    if (target.type === 'number' && !isNaN(newValue)) {
        newValue = Math.max(min, Math.min(max, newValue));
    }

    // Update both slider and input
    if (slider && valueInput) {
            slider.value = newValue;
        valueInput.value = newValue;
    }

    // Update global variable
    if (window[paramName] !== undefined) {
        window[paramName] = newValue;
    }

    // Save to GM storage
    GM_setValue(paramName, newValue);
}

/**
 * Handles changes to the main filter slider.
 * @param {HTMLElement} slider - The filter slider element.
 */
function handleFilterSliderChange(slider) {
    const valueDisplay = document.getElementById('tweet-filter-value');
    currentFilterThreshold = parseInt(slider.value, 10);
    if (valueDisplay) {
        valueDisplay.textContent = currentFilterThreshold.toString();
    }
    GM_setValue('filterThreshold', currentFilterThreshold);
    applyFilteringToAll();
}

/**
 * Switches the active tab in the settings panel.
 * @param {string} tabName - The name of the tab to activate (from data-tab).
 */
function switchTab(tabName) {
    const settingsContent = document.querySelector('#settings-container .settings-content');
    if (!settingsContent) return;

    const tabs = settingsContent.querySelectorAll('.tab-content');
    const buttons = settingsContent.querySelectorAll('.tab-navigation .tab-button');

    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    const tabToShow = settingsContent.querySelector(`#${tabName}-tab`);
    const buttonToActivate = settingsContent.querySelector(`.tab-navigation .tab-button[data-tab="${tabName}"]`);

    if (tabToShow) tabToShow.classList.add('active');
    if (buttonToActivate) buttonToActivate.classList.add('active');
}

/**
 * Toggles the visibility of advanced options sections.
 * @param {string} contentId - The ID of the content element to toggle.
 */
function toggleAdvancedOptions(contentId) {
    const content = document.getElementById(contentId);
    const toggle = document.querySelector(`[data-toggle="${contentId}"]`);
    if (!content || !toggle) return;

    const icon = toggle.querySelector('.advanced-toggle-icon');
    const isExpanded = content.classList.toggle('expanded');

    if (icon) {
        icon.classList.toggle('expanded', isExpanded);
    }

    // Adjust max-height for smooth animation
    if (isExpanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
    } else {
        content.style.maxHeight = '0';
    }
}

// --- UI Update Functions ---

/** Updates the cache statistics display in the General tab. */
function updateCacheStatsUI() {
    const cachedCountEl = document.getElementById('cached-ratings-count');
    const whitelistedCountEl = document.getElementById('whitelisted-handles-count');

    if (cachedCountEl) {
        cachedCountEl.textContent = Object.keys(tweetIDRatingCache).length;
    }
    if (whitelistedCountEl) {
        whitelistedCountEl.textContent = blacklistedHandles.length;
    }
}

/**
 * Refreshes the entire settings UI to reflect current settings.
 */
function refreshSettingsUI() {
    // Update general settings inputs/toggles
    document.querySelectorAll('[data-setting]').forEach(input => {
        const settingName = input.dataset.setting;
        const value = GM_getValue(settingName, window[settingName]); // Get saved or default value
        if (input.type === 'checkbox') {
            input.checked = value;
            // Trigger change handler for side effects (like hiding/showing image model section)
            handleSettingChange(input, settingName);
        } else {
            input.value = value;
        }
    });

    // Update parameter controls (sliders/number inputs)
    document.querySelectorAll('.parameter-row[data-param-name]').forEach(row => {
        const paramName = row.dataset.paramName;
        const slider = row.querySelector('.parameter-slider');
        const valueInput = row.querySelector('.parameter-value');
        const value = GM_getValue(paramName, window[paramName]);

        if (slider) slider.value = value;
        if (valueInput) valueInput.value = value;
    });

    // Update filter slider
    const filterSlider = document.getElementById('tweet-filter-slider');
    const filterValueDisplay = document.getElementById('tweet-filter-value');
    if (filterSlider && filterValueDisplay) {
        filterSlider.value = currentFilterThreshold.toString();
        filterValueDisplay.textContent = currentFilterThreshold.toString();
    }

    // Refresh dynamically populated lists/dropdowns
        refreshHandleList(document.getElementById('handle-list'));
    refreshModelsUI(); // Refreshes model dropdowns

    // Update cache stats
    updateCacheStatsUI();

    // Set initial state for advanced sections (collapsed by default unless CSS specifies otherwise)
    document.querySelectorAll('.advanced-content').forEach(content => {
        if (!content.classList.contains('expanded')) {
            content.style.maxHeight = '0';
        }
    });
    document.querySelectorAll('.advanced-toggle-icon.expanded').forEach(icon => {
        // Ensure icon matches state if CSS defaults to expanded
        if (!icon.closest('.advanced-toggle')?.nextElementSibling?.classList.contains('expanded')) {
           icon.classList.remove('expanded');
        }
    });
}

/**
 * Refreshes the handle list UI.
 * @param {HTMLElement} listElement - The list element to refresh.
 */
function refreshHandleList(listElement) {
    if (!listElement) return;

    listElement.innerHTML = ''; // Clear existing list

    if (blacklistedHandles.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = 'padding: 8px; opacity: 0.7; font-style: italic;';
        emptyMsg.textContent = 'No handles added yet';
        listElement.appendChild(emptyMsg);
        return;
    }

    blacklistedHandles.forEach(handle => {
        const item = document.createElement('div');
        item.className = 'handle-item';

        const handleText = document.createElement('div');
        handleText.className = 'handle-text';
        handleText.textContent = '@' + handle;
        item.appendChild(handleText);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-handle';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove from list';
        // removeBtn listener is handled by delegation in initializeEventListeners
        item.appendChild(removeBtn);

        listElement.appendChild(item);
    });
}

/**
 * Updates the model selection dropdowns based on availableModels.
 */
function refreshModelsUI() {
    const modelSelectContainer = document.getElementById('model-select-container');
    const imageModelSelectContainer = document.getElementById('image-model-select-container');

    const models = availableModels || []; // Ensure availableModels is an array

    // Update main model selector
    if (modelSelectContainer) {
        modelSelectContainer.innerHTML = ''; // Clear current
    createCustomSelect(
        modelSelectContainer,
            'model-selector', // ID for the custom select element
            models.map(model => ({ value: model.slug || model.id, label: formatModelLabel(model) })),
            selectedModel, // Current selected value
            (newValue) => { // onChange callback
            selectedModel = newValue;
            GM_setValue('selectedModel', selectedModel);
            showStatus('Rating model updated');
        },
            'Search rating models...' // Placeholder
        );
    }

    // Update image model selector
    if (imageModelSelectContainer) {
        const visionModels = models.filter(model =>
            model.input_modalities?.includes('image') ||
            model.architecture?.input_modalities?.includes('image') ||
            model.architecture?.modality?.includes('image')
        );

        imageModelSelectContainer.innerHTML = ''; // Clear current
    createCustomSelect(
        imageModelSelectContainer,
            'image-model-selector', // ID for the custom select element
            visionModels.map(model => ({ value: model.slug || model.id, label: formatModelLabel(model) })),
            selectedImageModel, // Current selected value
            (newValue) => { // onChange callback
            selectedImageModel = newValue;
            GM_setValue('selectedImageModel', selectedImageModel);
            showStatus('Image model updated');
        },
            'Search vision models...' // Placeholder
        );
    }
}

/**
 * Formats a model object into a string for display in dropdowns.
 * @param {Object} model - The model object from the API.
 * @returns {string} A formatted label string.
 */
function formatModelLabel(model) {
    let label = model.slug || model.id || model.name || 'Unknown Model';
    let pricingInfo = '';

    // Extract pricing
    const pricing = model.endpoint?.pricing || model.pricing;
    if (pricing) {
        const promptPrice = parseFloat(pricing.prompt);
        const completionPrice = parseFloat(pricing.completion);

        if (!isNaN(promptPrice)) {
            pricingInfo += ` - $${promptPrice.toFixed(7)}/in`;
            if (!isNaN(completionPrice) && completionPrice !== promptPrice) {
                pricingInfo += ` $${completionPrice.toFixed(7)}/out`;
            }
        } else if (!isNaN(completionPrice)) {
            // Handle case where only completion price is available (less common)
            pricingInfo += ` - $${completionPrice.toFixed(7)}/out`;
        }
    }

    // Add vision icon
    const isVision = model.input_modalities?.includes('image') ||
                     model.architecture?.input_modalities?.includes('image') ||
                     model.architecture?.modality?.includes('image');
    if (isVision) {
        label = '🖼️ ' + label;
    }

    return label + pricingInfo;
}

// --- Custom Select Dropdown Logic (largely unchanged, but included for completeness) ---

/**
 * Creates a custom select dropdown with search functionality.
 * @param {HTMLElement} container - Container to append the custom select to.
 * @param {string} id - ID for the root custom-select div.
 * @param {Array<{value: string, label: string}>} options - Options for the dropdown.
 * @param {string} initialSelectedValue - Initially selected value.
 * @param {Function} onChange - Callback function when selection changes.
 * @param {string} searchPlaceholder - Placeholder text for the search input.
 */
function createCustomSelect(container, id, options, initialSelectedValue, onChange, searchPlaceholder) {
    let currentSelectedValue = initialSelectedValue;

    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';
    customSelect.id = id;

    const selectSelected = document.createElement('div');
    selectSelected.className = 'select-selected';

    const selectItems = document.createElement('div');
    selectItems.className = 'select-items';
    selectItems.style.display = 'none'; // Initially hidden

    const searchField = document.createElement('div');
    searchField.className = 'search-field';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = searchPlaceholder || 'Search...';
    searchField.appendChild(searchInput);
    selectItems.appendChild(searchField);

    // Function to render options
    function renderOptions(filter = '') {
        // Clear previous options (excluding search field)
        while (selectItems.childNodes.length > 1) {
            selectItems.removeChild(selectItems.lastChild);
        }

        const filteredOptions = options.filter(opt =>
            opt.label.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredOptions.length === 0) {
            const noResults = document.createElement('div');
            noResults.textContent = 'No matches found';
            noResults.style.cssText = 'opacity: 0.7; font-style: italic; padding: 10px; text-align: center; cursor: default;';
            selectItems.appendChild(noResults);
        }

        filteredOptions.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.textContent = option.label;
            optionDiv.dataset.value = option.value;
            if (option.value === currentSelectedValue) {
                optionDiv.classList.add('same-as-selected');
            }

            optionDiv.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing immediately
                currentSelectedValue = option.value;
                selectSelected.textContent = option.label;
                selectItems.style.display = 'none';
                selectSelected.classList.remove('select-arrow-active');

                // Update classes for all items
                selectItems.querySelectorAll('div[data-value]').forEach(div => {
                    div.classList.toggle('same-as-selected', div.dataset.value === currentSelectedValue);
            });

                onChange(currentSelectedValue);
            });
            selectItems.appendChild(optionDiv);
        });
    }

    // Set initial display text
    const initialOption = options.find(opt => opt.value === currentSelectedValue);
    selectSelected.textContent = initialOption ? initialOption.label : 'Select an option';

    customSelect.appendChild(selectSelected);
    customSelect.appendChild(selectItems);
    container.appendChild(customSelect);

    // Initial rendering
    renderOptions();

    // Event listeners
    searchInput.addEventListener('input', () => renderOptions(searchInput.value));
    searchInput.addEventListener('click', e => e.stopPropagation()); // Prevent closing

    selectSelected.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllSelectBoxes(customSelect); // Close others
        const isHidden = selectItems.style.display === 'none';
        selectItems.style.display = isHidden ? 'block' : 'none';
        selectSelected.classList.toggle('select-arrow-active', isHidden);
        if (isHidden) {
            searchInput.focus();
            searchInput.select(); // Select text for easy replacement
            renderOptions(); // Re-render in case options changed
        }
    });
}

/** Closes all custom select dropdowns except the one passed in. */
function closeAllSelectBoxes(exceptThisOne = null) {
    document.querySelectorAll('.custom-select').forEach(select => {
        if (select === exceptThisOne) return;
        const items = select.querySelector('.select-items');
        const selected = select.querySelector('.select-selected');
        if (items) items.style.display = 'none';
        if (selected) selected.classList.remove('select-arrow-active');
    });
}

// --- Rating Indicator Logic (Simplified, assuming CSS handles most styling) ---

/**
 * Updates or creates the rating indicator on a tweet article.
 * @param {Element} tweetArticle - The tweet article element.
 * @param {number|null} score - The numeric rating (null if pending/error).
 * @param {string} status - 'pending', 'rated', 'error', 'cached', 'blacklisted'.
 * @param {string} [description] - Optional description for hover tooltip.
 */
function setScoreIndicator(tweetArticle, score, status, description = "") {
    let indicator = tweetArticle.querySelector('.score-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'score-indicator';
        tweetArticle.style.position = 'relative'; // Ensure parent is positioned
        tweetArticle.appendChild(indicator);
        
        // Add hover listeners only once when creating the indicator
        indicator.addEventListener('mouseenter', handleIndicatorMouseEnter);
        indicator.addEventListener('mouseleave', handleIndicatorMouseLeave);
    }

    // Update status class and text content
    indicator.classList.remove('pending-rating', 'rated-rating', 'error-rating', 'cached-rating', 'blacklisted-rating'); // Clear previous
    indicator.dataset.description = description || ''; // Store description

    switch (status) {
        case 'pending':
        indicator.classList.add('pending-rating');
        indicator.textContent = '⏳';
            break;
        case 'error':
        indicator.classList.add('error-rating');
        indicator.textContent = '⚠️';
            break;
        case 'cached':
            indicator.classList.add('cached-rating');
        indicator.textContent = score;
             break;
        case 'blacklisted':
             indicator.classList.add('blacklisted-rating');
             indicator.textContent = score; // Typically 10 for blacklisted
             break;
        case 'rated': // Default/normal rated
        default:
            indicator.classList.add('rated-rating'); // Add a general rated class
            indicator.textContent = score;
            break;
    }
}

/** Global tooltip element */
let scoreTooltip = null;

/** Creates or gets the shared tooltip element. */
function getScoreTooltip() {
    if (!scoreTooltip) {
        scoreTooltip = document.createElement('div');
        scoreTooltip.className = 'score-description'; // Use the class from HTML/CSS
        scoreTooltip.style.display = 'none'; // Initially hidden
        scoreTooltip.style.position = 'fixed'; // Use fixed positioning
        scoreTooltip.style.zIndex = '99999999';
        document.body.appendChild(scoreTooltip);

        // Keep tooltip visible when hovering over it
        scoreTooltip.addEventListener('mouseenter', () => {
            scoreTooltip.style.display = 'block';
        });
        scoreTooltip.addEventListener('mouseleave', () => {
            scoreTooltip.style.display = 'none';
        });
    }
    return scoreTooltip;
}

/** Formats description text for the tooltip. */
function formatTooltipDescription(description) {
    if (!description) return '';
    // Basic formatting, can be expanded
        description = description.replace(/\{score:\s*(\d+)\}/g, '<span style="display:inline-block;background-color:#1d9bf0;color:white;padding:3px 10px;border-radius:9999px;margin:8px 0;font-weight:bold;">SCORE: $1</span>');
    description = description.replace(/\n\n/g, '</p><p style="margin-top: 10px;">'); // Smaller margin
        description = description.replace(/\n/g, '<br>');
    return `<p>${description}</p>`;
}

/** Handles mouse enter event for score indicators. */
function handleIndicatorMouseEnter(event) {
    const indicator = event.target;
    const description = indicator.dataset.description;
    if (!description) return;

    const tooltip = getScoreTooltip();
    tooltip.innerHTML = formatTooltipDescription(description);

    // Position the tooltip
        const rect = indicator.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth; // Get width after setting content
    const tooltipHeight = tooltip.offsetHeight;
    const margin = 10;

    let left = rect.right + margin;
    let top = rect.top + (rect.height / 2) - (tooltipHeight / 2);

    // Adjust if going off-screen
    if (left + tooltipWidth > window.innerWidth - margin) {
        left = rect.left - tooltipWidth - margin;
    }
    if (top < margin) {
        top = margin;
    }
    if (top + tooltipHeight > window.innerHeight - margin) {
        top = window.innerHeight - tooltipHeight - margin;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.display = 'block';
}

/** Handles mouse leave event for score indicators. */
function handleIndicatorMouseLeave() {
    const tooltip = getScoreTooltip();
    // Hide with a slight delay to allow moving cursor to the tooltip
        setTimeout(() => {
        if (tooltip && tooltip.style.display !== 'none' && !tooltip.matches(':hover')) {
           tooltip.style.display = 'none';
        }
        }, 100);
}

/** Cleans up the global score tooltip element. */
function cleanupDescriptionElements() {
    if (scoreTooltip) {
        scoreTooltip.remove();
        scoreTooltip = null;
    }
}

// --- Settings Import/Export (Simplified) ---

/**
 * Exports all settings and cache to a JSON file.
 */
function exportSettings() {
    try {
        const settingsToExport = {
            apiKey: GM_getValue('openrouter-api-key', ''),
            selectedModel: GM_getValue('selectedModel', 'google/gemini-flash-1.5-8b'),
            selectedImageModel: GM_getValue('selectedImageModel', 'google/gemini-flash-1.5-8b'),
            enableImageDescriptions: GM_getValue('enableImageDescriptions', false),
            modelTemperature: GM_getValue('modelTemperature', 0.5),
            modelTopP: GM_getValue('modelTopP', 0.9),
            imageModelTemperature: GM_getValue('imageModelTemperature', 0.5),
            imageModelTopP: GM_getValue('imageModelTopP', 0.9),
            maxTokens: GM_getValue('maxTokens', 0),
            filterThreshold: GM_getValue('filterThreshold', 1),
            userDefinedInstructions: GM_getValue('userDefinedInstructions', 'Rate the tweet on a scale from 1 to 10 based on its clarity, insight, creativity, and overall quality.'),
            modelSortOrder: GM_getValue('modelSortOrder', 'throughput-high-to-low')
        };

        const data = {
            version: VERSION,
            date: new Date().toISOString(),
            settings: settingsToExport,
            blacklistedHandles: blacklistedHandles || [],
            tweetRatings: tweetIDRatingCache || {}
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tweetfilter-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showStatus('Settings exported successfully!');
    } catch (error) {
        console.error('Error exporting settings:', error);
        showStatus('Error exporting settings: ' + error.message);
    }
}

/**
 * Imports settings and cache from a JSON file.
 */
function importSettings() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data.settings) throw new Error('Invalid backup file format');

                    // Import settings
                    for (const key in data.settings) {
                        if (window[key] !== undefined) {
                            window[key] = data.settings[key];
                        }
                        GM_setValue(key, data.settings[key]);
                    }

                    // Import blacklisted handles
                    if (data.blacklistedHandles && Array.isArray(data.blacklistedHandles)) {
                        blacklistedHandles = data.blacklistedHandles;
                        GM_setValue('blacklistedHandles', blacklistedHandles.join('\n'));
                    }

                    // Import tweet ratings (merge with existing)
                    if (data.tweetRatings && typeof data.tweetRatings === 'object') {
                        Object.assign(tweetIDRatingCache, data.tweetRatings);
                        saveTweetRatings();
                    }

                    refreshSettingsUI();
                    fetchAvailableModels();
                    showStatus('Settings imported successfully!');

                } catch (error) {
                    console.error('Error parsing settings file:', error);
                    showStatus('Error importing settings: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    } catch (error) {
        console.error('Error importing settings:', error);
        showStatus('Error importing settings: ' + error.message);
    }
}

/**
 * Resets all configurable settings to their default values.
 */
function resetSettings(noconfirm=false) {
    if (noconfirm || confirm('Are you sure you want to reset all settings to their default values? This will not clear your cached ratings or blacklisted handles.')) {
        // Define defaults (should match config.js ideally)
        const defaults = {
            selectedModel: 'google/gemini-2.0-flash-lite-001',
            selectedImageModel: 'google/gemini-2.0-flash-lite-001',
            enableImageDescriptions: false,
            modelTemperature: 0.5,
            modelTopP: 0.9,
            imageModelTemperature: 0.5,
            imageModelTopP: 0.9,
            maxTokens: 0,
            filterThreshold: 5,
            userDefinedInstructions: 'Rate the tweet on a scale from 1 to 10 based on its clarity, insight, creativity, and overall quality.',
            modelSortOrder: 'throughput-high-to-low'
        };

        // Apply defaults
        for (const key in defaults) {
            if (window[key] !== undefined) {
                window[key] = defaults[key];
            }
            GM_setValue(key, defaults[key]);
        }

        refreshSettingsUI();
        fetchAvailableModels();
        showStatus('Settings reset to defaults');
    }
}

// --- Blacklist/Whitelist Logic ---

/**
 * Adds a handle to the blacklist, saves, and refreshes the UI.
 * @param {string} handle - The Twitter handle to add (with or without @).
 */
function addHandleToBlacklist(handle) {
    handle = handle.trim().replace(/^@/, ''); // Clean handle
    if (handle === '' || blacklistedHandles.includes(handle)) {
        showStatus(handle === '' ? 'Handle cannot be empty.' : `@${handle} is already on the list.`);
            return;
        }
    blacklistedHandles.push(handle);
    GM_setValue('blacklistedHandles', blacklistedHandles.join('\n'));
    refreshHandleList(document.getElementById('handle-list'));
    updateCacheStatsUI();
    showStatus(`Added @${handle} to auto-rate list.`);
}

/**
 * Removes a handle from the blacklist, saves, and refreshes the UI.
 * @param {string} handle - The Twitter handle to remove (without @).
 */
function removeHandleFromBlacklist(handle) {
    const index = blacklistedHandles.indexOf(handle);
    if (index > -1) {
        blacklistedHandles.splice(index, 1);
        GM_setValue('blacklistedHandles', blacklistedHandles.join('\n'));
        refreshHandleList(document.getElementById('handle-list'));
        updateCacheStatsUI();
        showStatus(`Removed @${handle} from auto-rate list.`);
                } else {
        console.warn(`Attempted to remove non-existent handle: ${handle}`);
    }
}

// --- Initialization ---

/**
 * Main initialization function for the UI module.
 */
function initialiseUI() {
    const uiContainer = injectUI();
    if (!uiContainer) return; // Stop if injection failed

    initializeEventListeners(uiContainer);
    refreshSettingsUI(); // Set initial state from saved settings
    fetchAvailableModels(); // Fetch models async
    
    // Initialize the floating cache stats badge
    updateFloatingCacheStats();
    
    // Set up a periodic refresh of the cache stats to catch any updates
    setInterval(updateFloatingCacheStats, 10000); // Update every 10 seconds
}

/**
 * Creates or updates a floating badge showing the current cache statistics
 * This provides real-time feedback when tweets are rated and cached,
 * even when the settings panel is not open.
 */
function updateFloatingCacheStats() {
    let statsBadge = document.getElementById('tweet-filter-stats-badge');
    
    if (!statsBadge) {
        statsBadge = document.createElement('div');
        statsBadge.id = 'tweet-filter-stats-badge';
        statsBadge.className = 'tweet-filter-stats-badge';
        statsBadge.style.cssText = `
            position: fixed;
            bottom: 50px;
            right: 20px;
            background-color: rgba(29, 155, 240, 0.9);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 9999;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: opacity 0.3s;
            cursor: pointer;
            display: flex;
            align-items: center;
        `;
        
        // Add tooltip functionality
        statsBadge.title = 'Click to open settings';
        
        // Add click event to open settings
        statsBadge.addEventListener('click', () => {
            const settingsToggle = document.querySelector('.settings-toggle');
            if (settingsToggle) {
                settingsToggle.click();
            }
        });
        
        document.body.appendChild(statsBadge);
        
        // Auto-hide after 5 seconds of inactivity
        let fadeTimeout;
        const resetFadeTimeout = () => {
            clearTimeout(fadeTimeout);
            statsBadge.style.opacity = '1';
            fadeTimeout = setTimeout(() => {
                statsBadge.style.opacity = '0.3';
            }, 5000);
        };
        
        statsBadge.addEventListener('mouseenter', () => {
            statsBadge.style.opacity = '1';
            clearTimeout(fadeTimeout);
        });
        
        statsBadge.addEventListener('mouseleave', resetFadeTimeout);
        
        resetFadeTimeout();
    }
    
    // Update the content
    const cachedCount = Object.keys(tweetIDRatingCache).length;
    const wlCount = blacklistedHandles.length;
    
    statsBadge.innerHTML = `
        <span style="margin-right: 5px;">🧠</span>
        <span>${cachedCount} rated</span>
        ${wlCount > 0 ? `<span style="margin-left: 5px;"> | ${wlCount} whitelisted</span>` : ''}
    `;
    
    // Make it visible and reset the timeout
    statsBadge.style.opacity = '1';
    clearTimeout(statsBadge.fadeTimeout);
    statsBadge.fadeTimeout = setTimeout(() => {
        statsBadge.style.opacity = '0.3';
    }, 5000);
}

// Extend the updateCacheStatsUI function to also update the floating stats badge
const originalUpdateCacheStatsUI = updateCacheStatsUI;
updateCacheStatsUI = function() {
    // Call the original function
    originalUpdateCacheStatsUI.apply(this, arguments);
    
    // Update the floating badge
    updateFloatingCacheStats();
};

})();
