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

/**
 * Gets a streaming completion from OpenRouter API
 * 
 * @param {CompletionRequest} request - The completion request
 * @param {string} apiKey - OpenRouter API key
 * @param {Function} onChunk - Callback for each chunk of streamed response
 * @param {Function} onComplete - Callback when streaming is complete
 * @param {Function} onError - Callback when an error occurs
 * @param {number} [timeout=30000] - Request timeout in milliseconds
 */
function getCompletionStreaming(request, apiKey, onChunk, onComplete, onError, timeout = 30000) {
    // Add stream parameter to request
    const streamingRequest = {
        ...request,
        stream: true
    };
    
    let fullResponse = "";
    let content = "";
    let responseObj = null;
    
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://openrouter.ai/api/v1/chat/completions",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://greasyfork.org/en/scripts/532459-tweetfilter-ai",
            "X-Title": "TweetFilter-AI"
        },
        data: JSON.stringify(streamingRequest),
        timeout: timeout,
        responseType: "stream",
        onloadstart: function(response) {
            // Get the ReadableStream from the response
            const reader = response.response.getReader();
            
            // Setup timeout to prevent hanging indefinitely
            let streamTimeout = null;
            const resetStreamTimeout = () => {
                if (streamTimeout) clearTimeout(streamTimeout);
                streamTimeout = setTimeout(() => {
                    console.log("Stream timed out after inactivity");
                    if (!streamComplete) {
                        streamComplete = true;
                        // Call onComplete with whatever we have so far
                        onComplete({
                            content: content,
                            fullResponse: fullResponse,
                            data: responseObj,
                            timedOut: true
                        });
                    }
                }, 10000); // 10 second timeout without activity
            };
            
            // Flag to track if we've completed
            let streamComplete = false;
            
            // Process the stream
            const processStream = async () => {
                try {
                    resetStreamTimeout(); // Initial timeout
                    let isDone = false;
                    let emptyChunksCount = 0;
                    
                    while (!isDone && !streamComplete) {
                        const { done, value } = await reader.read();
                        
                        if (done) {
                            isDone = true;
                            break;
                        }
                        
                        // Convert the chunk to text
                        const chunk = new TextDecoder().decode(value);
                        
                        // Reset timeout on activity
                        resetStreamTimeout();
                        
                        // Check for empty chunks - may indicate end of stream
                        if (chunk.trim() === '') {
                            emptyChunksCount++;
                            // After receiving 3 consecutive empty chunks, consider the stream done
                            if (emptyChunksCount >= 3) {
                                isDone = true;
                                break;
                            }
                            continue;
                        }
                        
                        emptyChunksCount = 0; // Reset the counter if we got content
                        fullResponse += chunk;
                        
                        // Split by lines - server-sent events format
                        const lines = chunk.split("\n");
                        for (const line of lines) {
                            if (line.startsWith("data: ")) {
                                const data = line.substring(6);
                                
                                // Check for the end of the stream
                                if (data === "[DONE]") {
                                    isDone = true;
                                    break;
                                }
                                
                                try {
                                    const parsed = JSON.parse(data);
                                    responseObj = parsed;
                                    
                                    // Extract the content
                                    if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                                        const delta = parsed.choices[0].delta.content || "";
                                        content += delta;
                                        
                                        // Call the chunk callback
                                        onChunk({
                                            chunk: delta,
                                            content: content,
                                            data: parsed
                                        });
                                    }
                                } catch (e) {
                                    console.error("Error parsing SSE data:", e, data);
                                }
                            }
                        }
                    }
                    
                    // When done, call the complete callback if not already completed
                    if (!streamComplete) {
                        streamComplete = true;
                        if (streamTimeout) clearTimeout(streamTimeout);
                        
                        onComplete({
                            content: content,
                            fullResponse: fullResponse,
                            data: responseObj
                        });
                    }
                    
                } catch (error) {
                    console.error("Stream processing error:", error);
                    // Make sure we clean up and call onError
                    if (streamTimeout) clearTimeout(streamTimeout);
                    if (!streamComplete) {
                        streamComplete = true;
                        onError({
                            error: true,
                            message: `Stream processing error: ${error.toString()}`,
                            data: null
                        });
                    }
                }
            };
            
            processStream().catch(error => {
                console.error("Unhandled stream error:", error);
                if (streamTimeout) clearTimeout(streamTimeout);
                if (!streamComplete) {
                    streamComplete = true;
                    onError({
                        error: true,
                        message: `Unhandled stream error: ${error.toString()}`,
                        data: null
                    });
                }
            });
        },
        onerror: function(error) {
            onError({
                error: true,
                message: `Request error: ${error.toString()}`,
                data: null
            });
        },
        ontimeout: function() {
            onError({
                error: true,
                message: `Request timed out after ${timeout}ms`,
                data: null
            });
        }
    });
}

/** 
 * Formats description text for the tooltip.
 * Copy of the function from ui.js to ensure it's available for streaming.
 */
function formatTooltipDescription(description) {
    if (!description) return '';
    // Basic formatting, can be expanded
    description = description.replace(/SCORE_(\d+)/g, '<span style="display:inline-block;background-color:#1d9bf0;color:white;padding:3px 10px;border-radius:9999px;margin:8px 0;font-weight:bold;">SCORE: $1</span>');
    description = description.replace(/\n\n/g, '</p><p style="margin-top: 10px;">'); // Smaller margin
    description = description.replace(/\n/g, '<br>');
    return `<p>${description}</p>`;
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
 * @returns {Promise<{score: number, content: string, error: boolean, cached?: boolean, data?: any}>} The rating result
 */
async function rateTweetWithOpenRouter(tweetText, tweetId, apiKey, mediaUrls, maxRetries = 3) {
    // Create the request body
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

    // Check if streaming is enabled
    const useStreaming = GM_getValue('enableStreaming', false);
    
    // Implement retry logic
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
        
        try {
            let result;
            
            // Call appropriate rating function based on streaming setting
            if (useStreaming) {
                result = await rateTweetStreaming(request, apiKey, tweetId, tweetText);
            } else {
                result = await rateTweet(request, apiKey);
            }
            
            pendingRequests--;
            showStatus(`Rating tweet... (${pendingRequests} pending)`);
            
            // Parse the result for score
            if (!result.error && result.content) {
                const scoreMatch = result.content.match(/SCORE_(\d+)/);
                
                if (scoreMatch) {
                    const score = parseInt(scoreMatch[1], 10);
                    
                    return {
                        score,
                        content: result.content,
                        error: false,
                        cached: false,
                        data: result.data
                    };
                }
            }
            // If we get here, we couldn't find a score in the response
            if (attempt < maxRetries) {
                const backoffDelay = Math.pow(attempt, 2) * 1000;
                console.log(`Attempt ${attempt}/${maxRetries} failed. Retrying in ${backoffDelay}ms...`);
                console.log('Response:', result);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
        } catch (error) {
            pendingRequests--;
            showStatus(`Rating tweet... (${pendingRequests} pending)`);
            console.error(`API error during attempt ${attempt}:`, error);
            
            if (attempt < maxRetries) {
                const backoffDelay = Math.pow(attempt, 2) * 1000;
                console.log(`Error in attempt ${attempt}/${maxRetries}. Retrying in ${backoffDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
        }
    }
    
    // If we get here, all retries failed
    return {
        score: 5,
        content: "Failed to get valid rating after multiple attempts",
        error: true,
        data: null
    };
}

/**
 * Performs a non-streaming tweet rating request
 * 
 * @param {Object} request - The formatted request body
 * @param {string} apiKey - API key for authentication
 * @returns {Promise<{content: string, error: boolean, data: any}>} The rating result
 */
async function rateTweet(request, apiKey) {
    const result = await getCompletion(request, apiKey);
    
    if (!result.error && result.data?.choices?.[0]?.message?.content) {
        const content = result.data.choices[0].message.content;
        return {
            content,
            error: false,
            data: result.data
        };
    } else {
        return {
            content: result.message || "Error getting response",
            error: true,
            data: result.data
        };
    }
}

/**
 * Performs a streaming tweet rating request with real-time UI updates
 * 
 * @param {Object} request - The formatted request body
 * @param {string} apiKey - API key for authentication
 * @param {string} tweetId - The tweet ID
 * @param {string} tweetText - The text content of the tweet
 * @returns {Promise<{content: string, error: boolean, data: any}>} The rating result
 */
async function rateTweetStreaming(request, apiKey, tweetId, tweetText) {
    return new Promise((resolve, reject) => {
        // Find the tweet article element for this tweet ID
        const tweetArticle = Array.from(document.querySelectorAll('article[data-testid="tweet"]'))
            .find(article => getTweetID(article) === tweetId);
        
        let aggregatedContent = "";
        let finalData = null;
        
        getCompletionStreaming(
            request,
            apiKey,
            // onChunk callback - update the tweet's rating indicator in real-time
            (chunkData) => {
                aggregatedContent += chunkData.chunk;
                
                if (tweetArticle) {
                    // Look for a score in the accumulated content so far
                    const scoreMatch = aggregatedContent.match(/SCORE_(\d+)/);
                    let currentScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
                    
                    // Store references and current state
                    const indicator = tweetArticle.querySelector('.score-indicator');
                    const tooltip = indicator?.scoreTooltip;
                    
                    // Update the indicator with current partial content
                    tweetArticle.dataset.streamingContent = aggregatedContent;
                    tweetArticle.dataset.ratingStatus = 'streaming';
                    tweetArticle.dataset.ratingDescription = aggregatedContent;
                    
                    // Don't cache the streaming result until we have a score
                    if (currentScore !== null) {
                        // Only initialize cache if we have a score
                        if (!tweetIDRatingCache[tweetId]) {
                            tweetIDRatingCache[tweetId] = {
                                tweetContent: tweetText,
                                score: currentScore,
                                description: aggregatedContent,
                                streaming: true  // Mark as streaming/incomplete
                            };
                        } else {
                            // Update existing cache entry if it exists
                            tweetIDRatingCache[tweetId].description = aggregatedContent;
                            tweetIDRatingCache[tweetId].score = currentScore;
                            tweetIDRatingCache[tweetId].streaming = true;
                        }
                        
                        tweetArticle.dataset.sloppinessScore = currentScore.toString();
                        
                        // Save to storage periodically (once per second max)
                        if (!window.lastCacheSaveTime || Date.now() - window.lastCacheSaveTime > 1000) {
                            saveTweetRatings();
                            window.lastCacheSaveTime = Date.now();
                        }
                    }
                    
                    // Only update the tooltip directly
                    if (tooltip) {
                        // Update tooltip content
                        tooltip.innerHTML = formatTooltipDescription(aggregatedContent);
                        tooltip.classList.add('streaming-tooltip');
                        
                        // Auto-scroll to the bottom of the tooltip to show new content
                        if (tooltip.style.display === 'block') {
                            // Check if scroll is at or near the bottom before auto-scrolling
                            const isAtBottom = tooltip.scrollHeight - tooltip.scrollTop - tooltip.clientHeight < 30;
                            
                            // Only auto-scroll if user was already at the bottom
                            if (isAtBottom) {
                                tooltip.scrollTop = tooltip.scrollHeight;
                            }
                        }
                    }
                    
                    if (currentScore !== null) {
                        // Update the score display but not the tooltip
                        if (indicator) {
                            // Use setScoreIndicator to ensure classes are properly set
                            // Set streaming status to keep the streaming styling/animation
                            tweetArticle.dataset.sloppinessScore = currentScore.toString();
                            setScoreIndicator(tweetArticle, currentScore, 'streaming', aggregatedContent);
                            //filterSingleTweet(tweetArticle);
                        }
                    } else if (indicator) {
                        // Just update the streaming indicator without changing the tooltip
                        setScoreIndicator(tweetArticle, null, 'streaming', aggregatedContent);
                    }
                }
            },
            // onComplete callback - finalize the rating
            (finalResult) => {
                finalData = finalResult.data;
                
                // When streaming completes, update the cache with the final result
                if (tweetArticle) {
                    // Check for a score in the final content
                    const scoreMatch = aggregatedContent.match(/SCORE_(\d+)/);
                    if (scoreMatch) {
                        const score = parseInt(scoreMatch[1], 10);
                        
                        // Update cache with final result (non-streaming)
                        tweetIDRatingCache[tweetId] = {
                            tweetContent: tweetText,
                            score: score,
                            description: aggregatedContent,
                            streaming: false,  // Mark as complete
                            timestamp: Date.now()
                        };
                        saveTweetRatings();
                        
                        // Finalize UI update
                        tweetArticle.dataset.ratingStatus = 'rated';
                        tweetArticle.dataset.ratingDescription = aggregatedContent;
                        tweetArticle.dataset.sloppinessScore = score.toString();
                        
                        // Remove streaming class from tooltip
                        const indicator = tweetArticle.querySelector('.score-indicator');
                        if (indicator && indicator.scoreTooltip) {
                            indicator.scoreTooltip.classList.remove('streaming-tooltip');
                        }
                        
                        // Set final indicator state
                        setScoreIndicator(tweetArticle, score, 'rated', aggregatedContent);
                        // The caller will handle filterSingleTweet
                    }
                }
                
                resolve({
                    content: aggregatedContent,
                    error: false,
                    data: finalData
                });
            },
            // onError callback
            (errorData) => {
                // Update UI on error
                if (tweetArticle) {
                    tweetArticle.dataset.ratingStatus = 'error';
                    tweetArticle.dataset.ratingDescription = errorData.message;
                    tweetArticle.dataset.sloppinessScore = '5';
                    
                    // Remove streaming class from tooltip
                    const indicator = tweetArticle.querySelector('.score-indicator');
                    if (indicator && indicator.scoreTooltip) {
                        indicator.scoreTooltip.classList.remove('streaming-tooltip');
                    }
                    
                    setScoreIndicator(tweetArticle, 5, 'error', errorData.message);
                }
                
                reject(new Error(errorData.message));
            }
        );
    });
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

