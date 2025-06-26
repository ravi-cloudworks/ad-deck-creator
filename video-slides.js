// Video Slides Module for Brand Strategy Presentation Tool
// Handles video URL parsing, video/image slide creation and management

// Global video-related variables
let masterVideoElement = null;
let videoSegments = [];
let videoLoaded = false;
let currentVideoUrl = null;

// Initialize video functionality
function initVideoSlides() {
    console.log('\n🏁 STARTING initVideoSlides');
    debugSlideState('BEFORE video initialization');

    // Get master video element
    masterVideoElement = document.getElementById('masterVideo');
    if (!masterVideoElement) {
        console.error('❌ Master video element not found');
        return;
    }

    // Check JSON data on initial load
    checkJsonData();

    // ADD THIS: Listen for textarea changes (for testing)
    const editorTextarea = document.getElementById('editor');
    if (editorTextarea) {
        editorTextarea.addEventListener('input', function() {
            console.log('📝 Textarea content changed, re-parsing JSON...');
            checkJsonData();
        });
        
        // Also trigger on paste event
        editorTextarea.addEventListener('paste', function() {
            setTimeout(() => {
                console.log('📋 JSON pasted, re-parsing...');
                checkJsonData();
            }, 100); // Small delay to let paste complete
        });
        
        console.log('👂 Added textarea change listeners');
    }

    // Setup video event listeners
    setupVideoEventListeners();

    console.log('✅ Video slides module initialized');
    debugSlideState('AFTER video initialization');
}

// ALTERNATIVE: Add manual trigger button for testing
function addTestTriggerButton() {
    const button = document.createElement('button');
    button.textContent = '🔄 Parse JSON';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 9999;
        padding: 10px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    button.onclick = () => {
        console.log('🔄 Manual trigger clicked');
        checkJsonData();
    };
    document.body.appendChild(button);
    console.log('✅ Added manual trigger button');
}


// MODIFIED: Check video URL parameter with debug
// function checkVideoUrlParameter() {
//     console.log('\n🔍 Checking URL parameters...');

//     const urlParams = new URLSearchParams(window.location.search);
//     const videoUrl = urlParams.get('video_url');
//     const frontCover = urlParams.get('front_cover');
//     const backCover = urlParams.get('back_cover');
//     const backgroundImage = urlParams.get('background_image');

//     console.log('URL Parameters found:', {
//         video_url: videoUrl,
//         front_cover: frontCover,
//         back_cover: backCover,
//         background_image: backgroundImage
//     });

//     // Apply background image if provided
//     if (backgroundImage) {
//         console.log('🖼️ Background image URL found, loading...');
//         loadBackgroundFromUrl(backgroundImage);
//     }

//     if (videoUrl) {
//         console.log('📹 Video URL found, loading video...');
//         loadVideoFromUrl(videoUrl);
//     } else {
//         console.log('📊 No video URL parameter found, keeping chart slides');
//     }
// }

function checkJsonData() {
    console.log('\n🔍 Checking JSON data from textarea...');

    // Get data from hidden textarea (like reference app)
    const editorTextarea = document.getElementById('editor');
    if (!editorTextarea || !editorTextarea.value.trim()) {
        console.log('📊 No JSON data found in textarea, keeping chart slides only');
        return;
    }

    try {
        // Parse JSON data (like reference app)
        const jsonData = JSON.parse(editorTextarea.value);
        console.log('✅ JSON data parsed successfully:', jsonData);

        // Extract video and image URLs
        const videoUrl = jsonData['video-source'];
        const frontCover = jsonData['front-cover'];
        const backCover = jsonData['last-cover'];
        const backgroundImage = jsonData['background'];
        const videoSegments = jsonData['video-ads']; // This replaces filename parsing!

        console.log('📹 Video source:', videoUrl);
        console.log('🎬 Video segments:', videoSegments);
        console.log('🖼️ Front cover:', frontCover);
        console.log('🖼️ Back cover:', backCover);
        console.log('🖼️ Background:', backgroundImage);

        // Apply background image if provided
        if (backgroundImage) {
            console.log('🖼️ Loading background image from JSON...');
            loadBackgroundFromUrl(backgroundImage);
        }

        // Load video and create slides if video data exists
        if (videoUrl && videoSegments) {
            console.log('📹 Loading video from JSON data...');
            loadVideoFromJsonData(videoUrl, videoSegments, frontCover, backCover);
        } else {
            console.log('📊 No video data found, keeping chart slides only');
        }

    } catch (error) {
        console.error('❌ Error parsing JSON from textarea:', error);
        console.log('📊 Falling back to chart slides only');
    }
}

function loadVideoFromJsonData(videoUrl, videoSegmentsString, frontCover, backCover) {
    try {
        console.log('\n🎬 STARTING loadVideoFromJsonData');
        debugSlideState('BEFORE loading video from JSON');

        currentVideoUrl = videoUrl;

        // Parse video segments from JSON field (instead of filename)
        console.log('Parsing video segments from JSON field:', videoSegmentsString);
        videoSegments = parseVideoSegmentsFromString(videoSegmentsString);
        console.log('Parsed video segments:', videoSegments);

        // Set video source
        masterVideoElement.src = videoUrl;

        // Setup timeline previews if controls exist
        const timelinePreview = document.getElementById('timelinePreview');
        if (timelinePreview) {
            timelinePreview.src = videoUrl;
            setupTimelinePreview();
        }

        const editTimelinePreview = document.getElementById('editTimelinePreview');
        if (editTimelinePreview) {
            editTimelinePreview.src = videoUrl;
        }

        const imageTimelinePreview = document.getElementById('imageTimelinePreview');
        if (imageTimelinePreview) {
            imageTimelinePreview.src = videoUrl;
            setupImageTimelinePreview();
        }

        // Create slides based on segments
        if (videoSegments.length > 0) {
            console.log('Creating slides from', videoSegments.length, 'segments...');
            createSlidesFromSegmentsWithCovers(frontCover, backCover);

            // Show appropriate initial slide after all slides are created
            setTimeout(() => {
                console.log('Setting up initial slide display...');
                debugSlideState('BEFORE initial slide display');

                if (slides.length > 0) {
                    // Always start with the front cover if it exists
                    const frontCoverIndex = slides.findIndex(s => s.isCoverSlide && s.coverPosition === 'front');

                    if (frontCoverIndex !== -1) {
                        console.log('Starting with front cover at index:', frontCoverIndex);
                        currentSlideIndex = frontCoverIndex;
                    } else {
                        console.log('No front cover, starting with first slide');
                        currentSlideIndex = 0;
                    }

                    console.log('Showing initial slide at index:', currentSlideIndex);
                    showSlide(currentSlideIndex);
                    debugSlideState('AFTER initial slide display');
                }
            }, 100);
        } else {
            console.log('No video segments found, keeping existing slides');
        }

        console.log('✅ COMPLETED loadVideoFromJsonData');

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('❌ Error loading video from JSON data:', error);
    }
}

function parseVideoSegmentsFromString(segmentsString) {
    try {
        // Input: "ad-0s-15s_img-16s_ad-17s-30s_img-31s_ad-32s-60s"
        // Same parsing logic, but from string instead of filename

        if (!segmentsString || typeof segmentsString !== 'string') {
            console.log('No valid segments string provided');
            return [];
        }

        // Split by underscore to get segments
        const segmentParts = segmentsString.split('_');

        if (segmentParts.length < 1) {
            console.log('No segments found in string');
            return [];
        }

        const segments = [];

        segmentParts.forEach((segment, index) => {
            const parsed = parseSegment(segment, index);
            if (parsed) {
                parsed.campaignName = 'Campaign'; // Default campaign name
                segments.push(parsed);
            }
        });

        return segments;

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error parsing video segments from string:', error);
        return [];
    }
}

function createSlidesFromSegmentsWithCovers(frontCover, backCover) {
    console.log('\n🔍 STARTING createSlidesFromSegmentsWithCovers');
    debugSlideState('BEFORE creating video slides');

    if (videoSegments.length === 0) {
        console.log('No video segments to create slides from');
        return;
    }

    console.log('Creating slides from segments...');
    console.log('Video segments found:', videoSegments.length);

    // ✅ FIXED: Clear existing slides first to prevent duplicates
    console.log('🧹 Clearing existing slides to prevent duplicates...');
    clearAllSlides();

    // STEP 1: Create front cover if exists
    if (frontCover) {
        console.log('Creating front cover...');
        createCoverSlide(frontCover, 'Front Cover', 'front');
        debugSlideState('AFTER creating front cover');
    }

    // STEP 2: Create default chart slide (always needed)
    console.log('📊 Creating default chart slide...');
    const chartSlideId = `slide-${Date.now()}`;
    const chartSlide = {
        id: chartSlideId,
        chartType: 'bar',
        theme: 'custom',
        backgroundImage: globalBackgroundImage,
        title: 'Monthly Sales Data',
        customTextColor: null,
        colors: [...themeColors.custom]
    };
    
    slides.push(chartSlide);
    
    // Create chart slide element
    const chartSlideElement = document.createElement('div');
    chartSlideElement.className = 'slide';
    chartSlideElement.id = chartSlideId;
    chartSlideElement.innerHTML = `
        <div class="slide-content">
            <h2 class="slide-title">${chartSlide.title}</h2>
            <div class="chart-container">
                <div id="chart-${chartSlideId}" style="width: 100%; height: 100%;"></div>
            </div>
        </div>
    `;
    
    if (globalBackgroundImage) {
        chartSlideElement.style.backgroundImage = `url(${globalBackgroundImage})`;
        chartSlideElement.style.backgroundSize = 'cover';
        chartSlideElement.style.backgroundPosition = 'center';
        chartSlideElement.style.backgroundRepeat = 'no-repeat';
    }
    
    const slideContainer = document.getElementById('slideContainer');
    if (slideContainer) {
        slideContainer.appendChild(chartSlideElement);
    }

    // STEP 3: Create slides for each video segment (insert at end, before back cover)
    console.log('Creating slides for', videoSegments.length, 'video segments...');
    videoSegments.forEach((segment, index) => {
        console.log(`Creating slide ${index + 1}/${videoSegments.length} for segment:`, segment.title);
        createSlideFromSegmentSimple(segment, index);
    });

    debugSlideState('AFTER creating video segment slides');

    // STEP 4: Create back cover if exists (add at very end)
    if (backCover) {
        console.log('Creating back cover...');
        createCoverSlide(backCover, 'Back Cover', 'back');
        debugSlideState('AFTER creating back cover');
    }

    // Update UI
    updateSlideList();
    updateNavigation();

    console.log(`✅ COMPLETED: Created ${slides.length} slides total`);
    debugSlideState('FINAL STATE after createSlidesFromSegmentsWithCovers');
}


function createSlideFromSegmentSimple(segment, index) {
    try {
        const slideId = `video-slide-${Date.now()}-${index}`;

        const slide = {
            id: slideId,
            chartType: segment.type === 'video' ? 'video' : 'image',
            theme: 'custom',
            backgroundImage: globalBackgroundImage,
            title: segment.title,
            customTextColor: null,
            videoSegment: segment,
            isVideoSlide: true
        };

        // ✅ SIMPLE: Just append to slides array (no complex insertion logic)
        slides.push(slide);
        console.log(`Added ${segment.title} at index ${slides.length - 1}`);

        // Create slide element
        const slideElement = document.createElement('div');
        slideElement.className = 'slide video-slide';
        slideElement.id = slideId;

        if (segment.type === 'video') {
            slideElement.innerHTML = `
                <div class="slide-content">
                    <h2 class="slide-title">${segment.title}</h2>
                    <div class="video-container">
                        <div class="video-placeholder">
                            📹 Video Segment
                            <div class="video-details">Click play to view</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            slideElement.innerHTML = `
                <div class="slide-content">
                    <h2 class="slide-title">${segment.title}</h2>
                    <div class="image-container">
                        <div class="image-placeholder">
                            🖼️ Campaign Image
                            <div class="image-details">Video frame capture</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Apply background if exists
        if (globalBackgroundImage) {
            slideElement.style.backgroundImage = `url(${globalBackgroundImage})`;
            slideElement.style.backgroundSize = 'cover';
            slideElement.style.backgroundPosition = 'center';
            slideElement.style.backgroundRepeat = 'no-repeat';
        }

        // ✅ SIMPLE: Just append to slide container
        const slideContainer = document.getElementById('slideContainer');
        if (slideContainer) {
            slideContainer.appendChild(slideElement);
            console.log(`DOM: Appended ${segment.title}`);
        }

        console.log('✅ Created slide for segment:', segment.title);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('❌ Error creating slide from segment:', error);
    }
}

function loadBackgroundFromUrl(imageUrl) {
    try {
        console.log('🖼️ Loading background image from URL:', imageUrl);

        // Create a temporary image element to load the URL
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Handle CORS if needed

        img.onload = function () {
            // Convert image to canvas then to data URL (same format as file upload)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Convert to data URL (same format as FileReader)
            const dataUrl = canvas.toDataURL('image/png');

            // Create a fake file-like object
            const fakeFile = {
                type: 'image/png'
            };

            // Reuse the existing background handling logic
            const reader = {
                result: dataUrl,
                onload: function () {
                    // Call the existing handleBackgroundFile logic directly
                    globalBackgroundImage = this.result;

                    // Apply background to all existing slides EXCEPT cover slides
                    slides.forEach(slide => {
                        // Skip cover slides - they keep their own backgrounds
                        if (slide.isCoverSlide) {
                            console.log('Skipping background update for cover slide:', slide.title);
                            return;
                        }

                        slide.backgroundImage = globalBackgroundImage;
                        const slideElement = document.getElementById(slide.id);
                        if (slideElement) {
                            slideElement.style.backgroundImage = `url(${globalBackgroundImage})`;
                            slideElement.style.backgroundSize = 'cover';
                            slideElement.style.backgroundPosition = 'center';
                            slideElement.style.backgroundRepeat = 'no-repeat';
                        }
                    });

                    if (typeof updateSlideList === 'function') {
                        updateSlideList();
                    }
                    if (typeof updateChart === 'function') {
                        updateChart();
                    }

                    console.log('✅ Background image applied from URL');
                }
            };

            // Trigger the existing logic
            reader.onload();
        };

        img.onerror = function () {
            console.error('❌ Failed to load background image from URL:', imageUrl);
        };

        // Start loading the image
        img.src = imageUrl;

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('❌ Error loading background from URL:', error);
    }
}

// Add these new functions here:
// Check for cover images in URL parameters
function checkCoverParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const frontCover = urlParams.get('front_cover');
    const backCover = urlParams.get('back_cover');

    return { frontCover, backCover };
}

function debugSlideState(location) {
    console.log(`\n=== SLIDE DEBUG: ${location} ===`);
    console.log('Total slides:', slides.length);
    console.log('Current slide index:', currentSlideIndex);

    slides.forEach((slide, index) => {
        console.log(`Slide ${index}:`, {
            id: slide.id,
            title: slide.title,
            chartType: slide.chartType,
            isVideoSlide: slide.isVideoSlide || false,
            isCoverSlide: slide.isCoverSlide || false,
            coverPosition: slide.coverPosition || 'n/a'
        });
    });

    // Check DOM elements
    const slideElements = document.querySelectorAll('.slide');
    console.log('DOM slide elements:', slideElements.length);
    slideElements.forEach((el, index) => {
        console.log(`DOM Slide ${index}:`, {
            id: el.id,
            className: el.className,
            isActive: el.classList.contains('active')
        });
    });
    console.log('=== END SLIDE DEBUG ===\n');
}



// Create cover slide
function createCoverSlide(imageUrl, title, position) {
    try {
        console.log(`\n🖼️ Creating ${position} cover slide:`, title);
        debugSlideState(`BEFORE creating ${position} cover`);

        const slideId = `cover-slide-${position}-${Date.now()}`;

        const slide = {
            id: slideId,
            chartType: 'cover',
            theme: 'custom',
            backgroundImage: imageUrl,
            title: title,
            customTextColor: null,
            isCoverSlide: true,
            coverPosition: position
        };

        // Create slide element
        const slideElement = document.createElement('div');
        slideElement.className = 'slide cover-slide';
        slideElement.id = slideId;
        slideElement.innerHTML = `
            <div class="slide-content">
                <!-- Empty slide with just background -->
            </div>
        `;

        // Apply background image
        slideElement.style.backgroundImage = `url(${imageUrl})`;
        slideElement.style.backgroundSize = 'contain';
        slideElement.style.backgroundPosition = 'center';
        slideElement.style.backgroundRepeat = 'no-repeat';
        slideElement.style.backgroundColor = '#000';

        // Add to slide container
        const slideContainer = document.getElementById('slideContainer');
        if (slideContainer) {
            if (position === 'front') {
                console.log('Inserting front cover at beginning');
                console.log('Current slide index before insert:', currentSlideIndex);

                // Insert at beginning of arrays and DOM
                slides.unshift(slide);
                slideContainer.insertBefore(slideElement, slideContainer.firstChild);

                // Update currentSlideIndex for ALL existing slides
                // Since we inserted at position 0, everything else shifts right
                currentSlideIndex++;
                console.log('Current slide index after insert:', currentSlideIndex);

                // Update the slide order - chart slide is now at index 1
                console.log('Chart slide is now at index 1 (after front cover)');

            } else {
                console.log('Adding back cover at end');
                slides.push(slide);
                slideContainer.appendChild(slideElement);
            }
        }

        console.log(`✅ Created ${position} cover slide successfully`);
        debugSlideState(`AFTER creating ${position} cover`);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error(`❌ Error creating ${position} cover slide:`, error);
    }
}

// Load video from URL and parse filename for segments
function loadVideoFromUrl(videoUrl) {
    try {
        console.log('\n🎬 STARTING loadVideoFromUrl:', videoUrl);
        debugSlideState('BEFORE loading video');

        currentVideoUrl = videoUrl;

        // Extract filename from URL (handle both full URLs and filenames)
        let filename;
        if (videoUrl.includes('/')) {
            filename = videoUrl.split('/').pop();
        } else {
            filename = videoUrl;
        }

        console.log('Parsing filename:', filename);

        // Parse segments from filename
        videoSegments = parseVideoSegments(filename);
        console.log('Parsed video segments:', videoSegments);

        // Set video source
        masterVideoElement.src = videoUrl;

        // Setup timeline previews if controls exist
        const timelinePreview = document.getElementById('timelinePreview');
        if (timelinePreview) {
            timelinePreview.src = videoUrl;
            setupTimelinePreview();
        }

        const editTimelinePreview = document.getElementById('editTimelinePreview');
        if (editTimelinePreview) {
            editTimelinePreview.src = videoUrl;
        }

        const imageTimelinePreview = document.getElementById('imageTimelinePreview');
        if (imageTimelinePreview) {
            imageTimelinePreview.src = videoUrl;
            setupImageTimelinePreview();
        }

        // Create slides based on segments
        if (videoSegments.length > 0) {
            console.log('Creating slides from', videoSegments.length, 'segments...');
            createSlidesFromSegments();

            // FIXED: Show appropriate initial slide after all slides are created
            setTimeout(() => {
                console.log('Setting up initial slide display...');
                debugSlideState('BEFORE initial slide display');

                if (slides.length > 0) {
                    // Always start with the front cover if it exists
                    const frontCoverIndex = slides.findIndex(s => s.isCoverSlide && s.coverPosition === 'front');

                    if (frontCoverIndex !== -1) {
                        console.log('Starting with front cover at index:', frontCoverIndex);
                        currentSlideIndex = frontCoverIndex;
                    } else {
                        // No front cover, start with first slide
                        console.log('No front cover, starting with first slide');
                        currentSlideIndex = 0;
                    }

                    console.log('Showing initial slide at index:', currentSlideIndex);
                    showSlide(currentSlideIndex);
                    debugSlideState('AFTER initial slide display');
                }
            }, 100);
        } else {
            console.log('No video segments found, keeping existing slides');
        }

        console.log('✅ COMPLETED loadVideoFromUrl');

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('❌ Error loading video from URL:', error);
    }
}

// Parse video segments from filename
// Format: campaignname_ad-0s-15s_img-16s_ad-17s-30s_img-31s_ad-32s-60s.mp4
function parseVideoSegments(filename) {
    try {
        // Remove file extension
        const nameWithoutExtension = filename.replace(/\.(mp4|mov|avi|mkv)$/i, '');

        // Split by underscore to get segments
        const parts = nameWithoutExtension.split('_');

        if (parts.length < 2) {
            console.log('No segments found in filename');
            return [];
        }

        // First part is campaign name, rest are segments
        const campaignName = parts[0];
        const segmentParts = parts.slice(1);

        const segments = [];

        segmentParts.forEach((segment, index) => {
            const parsed = parseSegment(segment, index);
            if (parsed) {
                parsed.campaignName = campaignName;
                segments.push(parsed);
            }
        });

        return segments;

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error parsing video segments:', error);
        return [];
    }
}

// Parse individual segment
// Formats: ad-0s-15s (video), img-16s (image)
function parseSegment(segmentString, index) {
    try {
        const parts = segmentString.split('-');

        if (parts.length < 2) {
            console.warn('Invalid segment format:', segmentString);
            return null;
        }

        const type = parts[0]; // 'ad' or 'img'

        if (type === 'ad' && parts.length >= 3) {
            // Video segment: ad-0s-15s
            const startTime = parseTimeToSeconds(parts[1]);
            const endTime = parseTimeToSeconds(parts[2]);

            return {
                type: 'video',
                startTime: startTime,
                endTime: endTime,
                duration: endTime - startTime,
                title: `Video Ad ${index + 1}`,
                originalSegment: segmentString
            };

        } else if (type === 'img' && parts.length >= 2) {
            // Image segment: img-16s
            const time = parseTimeToSeconds(parts[1]);

            return {
                type: 'image',
                time: time,
                title: `Campaign Image ${index + 1}`,
                originalSegment: segmentString
            };

        } else {
            console.warn('Unknown segment type or format:', segmentString);
            return null;
        }

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error parsing segment:', segmentString, error);
        return null;
    }
}

// Convert time string to seconds (e.g., "15s" -> 15, "1m30s" -> 90)
function parseTimeToSeconds(timeString) {
    try {
        // Remove 's' suffix
        const cleanTime = timeString.replace('s', '');

        // Handle minutes if needed (future enhancement)
        if (cleanTime.includes('m')) {
            const parts = cleanTime.split('m');
            const minutes = parseInt(parts[0]) || 0;
            const seconds = parseInt(parts[1]) || 0;
            return minutes * 60 + seconds;
        }

        // Simple seconds
        return parseInt(cleanTime) || 0;

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error parsing time string:', timeString, error);
        return 0;
    }
}

// Setup video event listeners
function setupVideoEventListeners() {
    if (!masterVideoElement) return;

    masterVideoElement.addEventListener('loadedmetadata', function () {
        console.log('Video metadata loaded, duration:', this.duration);
        videoLoaded = true;

        // Validate segments against video duration
        validateSegments();

        // Add preload for Safari
        preloadVideoForSafari();
    });

    masterVideoElement.addEventListener('error', function (e) {
        console.error('Video loading error:', e);
        showshowAlert('Error loading video. Please check the URL and try again.');
    });

    masterVideoElement.addEventListener('canplay', function () {
        console.log('Video can play');
    });

    // Safari-specific events
    masterVideoElement.addEventListener('canplaythrough', function () {
        console.log('Safari: Video can play through');
    });

    // Force preload for Safari
    masterVideoElement.preload = 'auto';
    masterVideoElement.load();
}


function preloadVideoForSafari() {
    if (!masterVideoElement || !currentVideoUrl) return;

    console.log('Preloading video for Safari...');

    // Force Safari to buffer the video
    masterVideoElement.preload = 'auto';
    masterVideoElement.muted = true;
    masterVideoElement.playsinline = true;
    masterVideoElement.setAttribute('webkit-playsinline', 'true');

    // Create a hidden play/pause cycle to force buffering
    const preloadPromise = masterVideoElement.play();
    if (preloadPromise !== undefined) {
        preloadPromise.then(() => {
            // Immediately pause after starting
            masterVideoElement.pause();
            masterVideoElement.currentTime = 0;
            console.log('Video preloaded successfully');
        }).catch(error => {
            console.log('Preload play failed, but video should still buffer');
        });
    }
}

// Validate segments against actual video duration
function validateSegments() {
    if (!masterVideoElement || !videoLoaded) return;

    const videoDuration = masterVideoElement.duration;
    console.log('Validating segments against video duration:', videoDuration);

    videoSegments.forEach((segment, index) => {
        if (segment.type === 'video') {
            if (segment.endTime > videoDuration) {
                console.warn(`Segment ${index + 1} end time (${segment.endTime}s) exceeds video duration (${videoDuration}s)`);
                segment.endTime = videoDuration;
                segment.duration = segment.endTime - segment.startTime;
            }
        } else if (segment.type === 'image') {
            if (segment.time > videoDuration) {
                console.warn(`Segment ${index + 1} time (${segment.time}s) exceeds video duration (${videoDuration}s)`);
                segment.time = videoDuration;
            }
        }
    });
}

// Create slides from parsed segments
function createSlidesFromSegments() {
    console.log('\n🔍 STARTING createSlidesFromSegments');
    debugSlideState('BEFORE creating video slides');

    if (videoSegments.length === 0) {
        console.log('No video segments to create slides from');
        return;
    }

    console.log('Creating slides from segments...');
    console.log('Video segments found:', videoSegments.length);

    // Get current slide count to know where to insert
    const existingSlideCount = slides.length;
    console.log('Existing slides before video processing:', existingSlideCount);

    // Check for cover images and background image
    const { frontCover, backCover } = checkCoverParameters();
    console.log('Cover images:', { frontCover: !!frontCover, backCover: !!backCover });

    // STEP 1: Create front cover if exists (insert at beginning)  
    if (frontCover) {
        console.log('Creating front cover...');
        createCoverSlide(frontCover, 'Front Cover', 'front');
        debugSlideState('AFTER creating front cover');
    }

    // STEP 2: Create slides for each segment (these go AFTER front cover and chart slide, BEFORE back cover)
    console.log('Creating slides for', videoSegments.length, 'video segments...');
    videoSegments.forEach((segment, index) => {
        console.log(`Creating slide ${index + 1}/${videoSegments.length} for segment:`, segment.title);
        createSlideFromSegmentFixed(segment, index);
    });

    debugSlideState('AFTER creating video segment slides');

    // STEP 3: Create back cover if exists (add at end)
    if (backCover) {
        console.log('Creating back cover...');
        createCoverSlide(backCover, 'Back Cover', 'back');
        debugSlideState('AFTER creating back cover');
    }

    // Update UI
    updateSlideList();
    updateNavigation();

    const newSlideCount = slides.length - existingSlideCount;
    console.log(`✅ COMPLETED: Created ${slides.length} slides total (${existingSlideCount} existing + ${newSlideCount} new)`);
    debugSlideState('FINAL STATE after createSlidesFromSegments');
}

// Create a single slide from a segment
function createSlideFromSegmentFixed(segment, index) {
    try {
        const slideId = `video-slide-${Date.now()}-${index}`;

        const slide = {
            id: slideId,
            chartType: segment.type === 'video' ? 'video' : 'image',
            theme: 'custom',
            backgroundImage: globalBackgroundImage,
            title: segment.title,
            customTextColor: null,
            videoSegment: segment,
            isVideoSlide: true
        };

        // CORRECT INSERTION LOGIC:
        // Order should be: Front Cover -> Chart Slide -> Video Slides -> Back Cover

        const backCoverIndex = slides.findIndex(s => s.isCoverSlide && s.coverPosition === 'back');

        if (backCoverIndex !== -1) {
            // Insert before back cover
            slides.splice(backCoverIndex, 0, slide);
            console.log(`Inserted ${segment.title} before back cover at index ${backCoverIndex}`);
        } else {
            // No back cover, add at end
            slides.push(slide);
            console.log(`Added ${segment.title} at end, index ${slides.length - 1}`);
        }

        // Create slide element
        const slideElement = document.createElement('div');
        slideElement.className = 'slide video-slide';
        slideElement.id = slideId;

        if (segment.type === 'video') {
            slideElement.innerHTML = `
                <div class="slide-content">
                    <h2 class="slide-title">${segment.title}</h2>
                    <div class="video-container">
                        <div class="video-placeholder">
                            📹 Video Segment
                            <div class="video-details">Click play to view</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            slideElement.innerHTML = `
                <div class="slide-content">
                    <h2 class="slide-title">${segment.title}</h2>
                    <div class="image-container">
                        <div class="image-placeholder">
                            🖼️ Campaign Image
                            <div class="image-details">Video frame capture</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Apply background if exists
        if (globalBackgroundImage) {
            slideElement.style.backgroundImage = `url(${globalBackgroundImage})`;
            slideElement.style.backgroundSize = 'cover';
            slideElement.style.backgroundPosition = 'center';
            slideElement.style.backgroundRepeat = 'no-repeat';
        }

        // DOM INSERTION: Insert in correct position
        const slideContainer = document.getElementById('slideContainer');
        if (slideContainer) {
            if (backCoverIndex !== -1) {
                // Find the back cover element and insert before it
                const currentBackCoverIndex = slides.findIndex(s => s.isCoverSlide && s.coverPosition === 'back');
                const backCoverElement = document.getElementById(slides[currentBackCoverIndex].id);
                if (backCoverElement) {
                    slideContainer.insertBefore(slideElement, backCoverElement);
                    console.log(`DOM: Inserted ${segment.title} before back cover element`);
                } else {
                    slideContainer.appendChild(slideElement);
                    console.log(`DOM: Appended ${segment.title} (back cover element not found)`);
                }
            } else {
                slideContainer.appendChild(slideElement);
                console.log(`DOM: Appended ${segment.title} at end`);
            }
        }

        console.log('✅ Created slide for segment:', segment.title);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('❌ Error creating slide from segment:', error);
    }
}

// Show video/image slide (called when slide becomes active)
function showVideoSlide(slideIndex) {
    try {
        const slide = slides[slideIndex];
        if (!slide || !slide.isVideoSlide || !slide.videoSegment) {
            return false; // Not a video slide
        }

        const segment = slide.videoSegment;
        console.log('Showing video slide:', segment.title);

        if (segment.type === 'video') {
            // Check if video player already exists
            const existingPlayer = document.getElementById(`player-${slide.id}`);
            if (existingPlayer) {
                // Reset and replay existing video
                console.log('Resetting existing video player');
                resetAndPlayVideo(slide.id, segment);
            } else {
                // Create new video player (first time)
                console.log('Creating new video player');
                seekVideoToTime(segment.startTime);
                showVideoPlayer(slide.id, segment);
            }
        } else if (segment.type === 'image') {
            // Check if image frame already exists
            const existingFrame = slide.id && document.querySelector(`#${slide.id} .image-frame`);
            if (!existingFrame) {
                // Create new image frame with Safari-compatible capture
                console.log('Creating new image frame for:', segment.title, 'at time:', segment.time);
                captureVideoFrameSafari(slide.id, segment);
            }
        }

        return true; // Successfully handled video slide

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error showing video slide:', error);
        return false;
    }
}

// Reset and replay existing video
function resetAndPlayVideo(slideId, segment) {
    try {
        const playerVideo = document.getElementById(`player-${slideId}`);
        if (!playerVideo) return;

        console.log('Resetting video for replay:', segment.title);

        // Remove any existing event listeners to prevent conflicts
        const newPlayerVideo = playerVideo.cloneNode(true);
        playerVideo.parentNode.replaceChild(newPlayerVideo, playerVideo);

        // Reset video properties
        newPlayerVideo.currentTime = segment.startTime;
        newPlayerVideo.muted = true;

        // Auto-play the reset video
        const playPromise = newPlayerVideo.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Reset video playing successfully');

                // Re-add stop listener for this segment
                const stopPlayback = () => {
                    if (newPlayerVideo.currentTime >= segment.endTime) {
                        newPlayerVideo.pause();
                        newPlayerVideo.removeEventListener('timeupdate', stopPlayback);
                        console.log('Reset video segment completed');
                    }
                };

                newPlayerVideo.addEventListener('timeupdate', stopPlayback);

            }).catch(error => {
                console.log('Reset video autoplay prevented:', error);
            });
        }

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error resetting video:', error);
    }
}

// Seek video to specific time
function seekVideoToTime(timeInSeconds) {
    if (!masterVideoElement || !videoLoaded) {
        console.warn('Video not ready for seeking');
        return;
    }

    try {
        masterVideoElement.currentTime = timeInSeconds;
        console.log('Seeked video to:', timeInSeconds, 'seconds');
    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error seeking video:', error);
    }
}

// Show video player in slide
function showVideoPlayer(slideId, segment) {
    try {
        const slideElement = document.getElementById(slideId);
        if (!slideElement) {
            console.log('Slide element not found:', slideId);
            return;
        }

        const placeholder = slideElement.querySelector('.video-placeholder');
        if (!placeholder) {
            console.log('Video placeholder not found - player may already exist');
            return;
        }

        console.log('Creating video player for first time:', segment.title);

        // Create clean video player container (no controls)
        const playerContainer = document.createElement('div');
        playerContainer.className = 'video-player';

        // Clone the master video element instead of creating new (for Safari buffering)
        const playerVideo = masterVideoElement.cloneNode(true);
        playerVideo.id = `player-${slideId}`;
        playerVideo.style.cssText = 'width: 100%; height: 100%; border-radius: 12px;';
        playerVideo.removeAttribute('style'); // Remove any inline styles from master
        playerVideo.style.width = '100%';
        playerVideo.style.height = '100%';
        playerVideo.style.borderRadius = '12px';

        playerContainer.appendChild(playerVideo);

        // Replace placeholder with video player
        placeholder.parentNode.replaceChild(playerContainer, placeholder);

        console.log('Setting up video source and playback for:', segment.title);

        // Simplified play approach for iPad
        const playVideo = () => {
            playerVideo.currentTime = segment.startTime;
            const playPromise = playerVideo.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Video playing successfully');

                    // Stop at segment end
                    const stopPlayback = () => {
                        if (playerVideo.currentTime >= segment.endTime) {
                            playerVideo.pause();
                            playerVideo.removeEventListener('timeupdate', stopPlayback);
                            console.log('Video segment completed');
                        }
                    };
                    playerVideo.addEventListener('timeupdate', stopPlayback);

                }).catch(() => {
                    console.log('Autoplay prevented, adding play button');
                    // Only add play button if truly needed
                    addSafariPlayButton(playerContainer, playerVideo, segment);
                });
            }
        };

        // Try to play immediately since video is pre-buffered
        playVideo();

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error showing video player:', error);
    }
}

// Add Safari-specific play button when autoplay fails
function addSafariPlayButton(container, video, segment) {
    try {
        // Check if play button already exists
        if (container.querySelector('.safari-play-btn')) return;

        const playButton = document.createElement('button');
        playButton.className = 'safari-play-btn';
        playButton.innerHTML = '▶️ Tap to Play';
        playButton.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            z-index: 10;
        `;

        playButton.onclick = () => {
            video.currentTime = segment.startTime;
            video.play().then(() => {
                playButton.remove();
                console.log('Safari manual play successful');

                // Add stop listener
                const stopPlayback = () => {
                    if (video.currentTime >= segment.endTime) {
                        video.pause();
                        video.removeEventListener('timeupdate', stopPlayback);
                        console.log('Safari manual video segment completed');
                    }
                };

                video.addEventListener('timeupdate', stopPlayback);

            }).catch(error => {
                console.error('Safari manual play failed:', error);
            });
        };

        container.style.position = 'relative';
        container.appendChild(playButton);

        console.log('Safari play button added');

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error adding Safari play button:', error);
    }
}

// Auto-play video segment (no button needed)
function playVideoSegmentAuto(slideId, segment) {
    try {
        const playerVideo = document.getElementById(`player-${slideId}`);
        if (!playerVideo) return;

        // Set start time and play automatically
        playerVideo.currentTime = segment.startTime;

        // Play the video (handle Safari autoplay restrictions)
        const playPromise = playerVideo.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Auto-playing video segment:', segment.startTime, 'to', segment.endTime);
            }).catch(error => {
                console.log('Autoplay prevented by browser, user interaction needed');
                // Could show a simple play button here if needed
            });
        }

        // Stop at end time
        const stopPlayback = () => {
            if (playerVideo.currentTime >= segment.endTime) {
                playerVideo.pause();
                playerVideo.removeEventListener('timeupdate', stopPlayback);
                console.log('Video segment completed');
            }
        };

        playerVideo.addEventListener('timeupdate', stopPlayback);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error auto-playing video segment:', error);
    }
}

// Play video segment
function playVideoSegment(slideId) {
    try {
        const playerVideo = document.getElementById(`player-${slideId}`);
        if (!playerVideo) return;

        const slide = slides.find(s => s.id === slideId);
        if (!slide || !slide.videoSegment) return;

        const segment = slide.videoSegment;

        // Set start time and play
        playerVideo.currentTime = segment.startTime;
        playerVideo.play();

        // Stop at end time
        const stopPlayback = () => {
            if (playerVideo.currentTime >= segment.endTime) {
                playerVideo.pause();
                playerVideo.removeEventListener('timeupdate', stopPlayback);
                console.log('Video segment playback completed');
            }
        };

        playerVideo.addEventListener('timeupdate', stopPlayback);

        console.log('Playing video segment:', segment.startTime, 'to', segment.endTime);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error playing video segment:', error);
    }
}

// Capture video frame for image slides
function captureVideoFrameSafari(slideId, segment, retryCount = 0) {
    const maxRetries = 5; // Increased for Safari

    try {
        console.log(`Safari: Attempting to capture frame for ${segment.title} at ${segment.time}s (attempt ${retryCount + 1})`);

        const slideElement = document.getElementById(slideId);
        if (!slideElement) {
            console.error('Slide element not found:', slideId);
            return;
        }

        const placeholder = slideElement.querySelector('.image-placeholder');
        if (!placeholder) {
            console.log('Image placeholder not found - frame may already exist');
            return;
        }

        // Show loading state
        placeholder.innerHTML = `
            🖼️ Loading Frame...
            <div class="image-details">Capturing at ${segment.time}s</div>
        `;

        // Ensure master video is ready and loaded
        if (!masterVideoElement || masterVideoElement.readyState < 2) {
            console.warn('Safari: Master video not ready, waiting...');
            if (retryCount < maxRetries) {
                setTimeout(() => {
                    captureVideoFrameSafari(slideId, segment, retryCount + 1);
                }, 1000); // Longer delay for Safari
            } else {
                console.error('Safari: Max retries reached, video not ready');
                showImageErrorSafari(slideId, 'Video not loaded');
            }
            return;
        }

        // Safari-specific: Ensure video dimensions are available
        if (masterVideoElement.videoWidth === 0 || masterVideoElement.videoHeight === 0) {
            console.warn('Safari: Video dimensions not available, waiting...');
            if (retryCount < maxRetries) {
                setTimeout(() => {
                    captureVideoFrameSafari(slideId, segment, retryCount + 1);
                }, 800);
            } else {
                showImageErrorSafari(slideId, 'Video dimensions unavailable');
            }
            return;
        }

        // Set current time and wait for Safari to actually seek
        masterVideoElement.currentTime = segment.time;

        // Safari-specific: Use multiple event listeners for better compatibility
        let seekCompleted = false;
        let timeoutId = null;

        const completeCapture = () => {
            if (seekCompleted) return; // Prevent double execution
            seekCompleted = true;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // Additional delay for Safari to ensure frame is ready
            setTimeout(() => {
                performSafariFrameCapture(slideId, segment, retryCount);
            }, 300); // Longer delay for Safari
        };

        // Safari compatibility: Listen to multiple events
        const onSeeked = () => {
            console.log('Safari: Video seeked to:', masterVideoElement.currentTime);
            masterVideoElement.removeEventListener('seeked', onSeeked);
            completeCapture();
        };

        const onTimeUpdate = () => {
            if (Math.abs(masterVideoElement.currentTime - segment.time) < 0.5) {
                console.log('Safari: Time update reached target:', masterVideoElement.currentTime);
                masterVideoElement.removeEventListener('timeupdate', onTimeUpdate);
                completeCapture();
            }
        };

        // Set up event listeners
        masterVideoElement.addEventListener('seeked', onSeeked, { once: true });
        masterVideoElement.addEventListener('timeupdate', onTimeUpdate);

        // Safari fallback: Force capture after timeout
        timeoutId = setTimeout(() => {
            if (!seekCompleted) {
                console.warn('Safari: Seek timeout, forcing capture');
                masterVideoElement.removeEventListener('seeked', onSeeked);
                masterVideoElement.removeEventListener('timeupdate', onTimeUpdate);
                completeCapture();
            }
        }, 3000); // Longer timeout for Safari

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Safari: Error in captureVideoFrameSafari:', error);
        if (retryCount < maxRetries) {
            setTimeout(() => {
                captureVideoFrameSafari(slideId, segment, retryCount + 1);
            }, 1000);
        } else {
            showImageErrorSafari(slideId, 'Capture failed');
        }
    }
}

function performSafariFrameCapture(slideId, segment, retryCount) {
    try {
        const slideElement = document.getElementById(slideId);
        const placeholder = slideElement?.querySelector('.image-placeholder');

        if (!slideElement || !placeholder) {
            console.error('Safari: Slide elements not found during capture');
            return;
        }

        // Final check of video readiness
        if (masterVideoElement.readyState < 2 || masterVideoElement.videoWidth === 0) {
            console.warn('Safari: Video still not ready during capture, retrying...');
            if (retryCount < 5) {
                setTimeout(() => {
                    captureVideoFrameSafari(slideId, segment, retryCount + 1);
                }, 1000);
            } else {
                showImageErrorSafari(slideId, 'Video not ready for capture');
            }
            return;
        }

        // Create canvas with Safari-compatible settings
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', {
            alpha: false, // Better performance on Safari
            willReadFrequently: false
        });

        // Set canvas size
        const videoWidth = masterVideoElement.videoWidth;
        const videoHeight = masterVideoElement.videoHeight;
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        console.log(`Safari: Capturing frame at ${videoWidth}x${videoHeight} for time ${segment.time}s`);

        try {
            // Draw current video frame to canvas
            ctx.drawImage(masterVideoElement, 0, 0, videoWidth, videoHeight);

            // Safari-specific: Check if canvas has valid content
            const imageData = ctx.getImageData(0, 0, Math.min(100, videoWidth), Math.min(100, videoHeight));
            const pixels = imageData.data;
            let hasContent = false;

            // Check first 100x100 pixels for any non-black content
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i] > 20 || pixels[i + 1] > 20 || pixels[i + 2] > 20) {
                    hasContent = true;
                    break;
                }
            }

            if (!hasContent) {
                console.warn('Safari: Captured frame appears empty, retrying...');
                if (retryCount < 3) {
                    setTimeout(() => {
                        captureVideoFrameSafari(slideId, segment, retryCount + 1);
                    }, 800);
                    return;
                }
                // Continue anyway if max retries reached
                console.warn('Safari: Using potentially empty frame after max retries');
            }

        } catch (drawError) {
            console.error('Safari: Error drawing to canvas:', drawError);
            if (retryCount < 3) {
                setTimeout(() => {
                    captureVideoFrameSafari(slideId, segment, retryCount + 1);
                }, 1000);
                return;
            }
            showImageErrorSafari(slideId, 'Canvas drawing failed');
            return;
        }

        // Create image frame container
        const frameContainer = document.createElement('div');
        frameContainer.className = 'image-frame';

        // Safari-compatible canvas styling
        const displayCanvas = document.createElement('canvas');
        displayCanvas.width = videoWidth;
        displayCanvas.height = videoHeight;
        displayCanvas.style.cssText = `
            max-width: 100%; 
            max-height: 100%; 
            border-radius: 12px;
            display: block;
            margin: 0 auto;
        `;

        // Copy canvas content
        const displayCtx = displayCanvas.getContext('2d', { alpha: false });
        displayCtx.drawImage(canvas, 0, 0);

        frameContainer.appendChild(displayCanvas);

        // Replace placeholder with image frame
        placeholder.parentNode.replaceChild(frameContainer, placeholder);

        console.log(`✅ Safari: Video frame captured successfully for ${segment.title} at ${segment.time}s`);
        // Clean up canvas memory for iPad Safari
        canvas.width = 0;
        canvas.height = 0;
        canvas = null;

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Safari: Error in performSafariFrameCapture:', error);
        if (retryCount < 3) {
            setTimeout(() => {
                captureVideoFrameSafari(slideId, segment, retryCount + 1);
            }, 1000);
        } else {
            showImageErrorSafari(slideId, 'Frame processing failed');
        }
    }
}

function showImageErrorSafari(slideId, errorMessage) {
    try {
        const slideElement = document.getElementById(slideId);
        const placeholder = slideElement?.querySelector('.image-placeholder');

        if (!slideElement || !placeholder) return;

        // Safari-friendly error display
        placeholder.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">❌</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Image Error</div>
                <div style="font-size: 14px; color: #666; margin-bottom: 20px;">${errorMessage}</div>
                <button onclick="retrySafariImageCapture('${slideId}')" 
                        style="padding: 12px 24px; border: none; border-radius: 8px; 
                               background: #667eea; color: white; cursor: pointer; font-size: 16px;
                               -webkit-appearance: none; -webkit-tap-highlight-color: transparent;">
                    🔄 Try Again
                </button>
            </div>
        `;

        console.error(`Safari: Image capture failed for slide ${slideId}: ${errorMessage}`);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Safari: Error showing image error:', error);
    }
}

// Safari-compatible retry function
function retrySafariImageCapture(slideId) {
    try {
        const slide = slides.find(s => s.id === slideId);
        if (!slide || !slide.videoSegment) return;

        console.log('Safari: Retrying image capture for:', slide.videoSegment.title);

        // Reset the placeholder with loading state
        const slideElement = document.getElementById(slideId);
        const container = slideElement?.querySelector('.image-frame') || slideElement?.querySelector('.image-placeholder');

        if (container) {
            const newPlaceholder = document.createElement('div');
            newPlaceholder.className = 'image-placeholder';
            newPlaceholder.innerHTML = `
                🖼️ Retrying...
                <div class="image-details">Loading frame...</div>
            `;
            container.parentNode.replaceChild(newPlaceholder, container);
        }

        // Retry capture with delay
        setTimeout(() => {
            captureVideoFrameSafari(slideId, slide.videoSegment, 0);
        }, 1000);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Safari: Error retrying image capture:', error);
    }
}

// Clear all existing slides (utility function)
function clearAllSlides() {
    try {
        console.log('🧹 Clearing all existing slides...');
        
        // Dispose chart instance to prevent memory leaks
        if (chartInstance) {
            chartInstance.clear();
            chartInstance.dispose();
            chartInstance = null;
        }
        
        // Clear slides array
        slides.length = 0;
        currentSlideIndex = 0;

        // Clear slide container
        const slideContainer = document.getElementById('slideContainer');
        if (slideContainer) {
            slideContainer.innerHTML = '';
        }

        console.log('✅ All slides cleared successfully');

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('❌ Error clearing slides:', error);
    }
}

// Integration hook: Extend the existing showSlide function
function extendShowSlide() {
    // Store original showSlide function
    if (typeof window.originalShowSlide === 'undefined') {
        window.originalShowSlide = showSlide;

        // Override showSlide to handle video slides
        showSlide = function (index) {
            try {

                const slide = slides[index];

                // Handle cover slides
                if (slide && slide.isCoverSlide) {
                    // Just show the slide, no special handling needed
                    currentSlideIndex = index;

                    // Hide all slides
                    document.querySelectorAll('.slide').forEach(slide => {
                        slide.classList.remove('active');
                    });

                    // Show current slide
                    const slideElement = document.getElementById(slide.id);
                    if (slideElement) {
                        slideElement.classList.add('active');
                    }

                    // Make customize button invisible for cover slides
                    const customizeBtn = document.getElementById('customizeBtn');
                    if (customizeBtn) {
                        customizeBtn.style.visibility = 'hidden';
                    }

                    // Update UI elements
                    const currentSlideSpan = document.getElementById('currentSlide');
                    const totalSlidesSpan = document.getElementById('totalSlides');
                    if (currentSlideSpan) {
                        currentSlideSpan.textContent = index + 1;
                    }
                    if (totalSlidesSpan) {
                        totalSlidesSpan.textContent = slides.length;
                    }

                    // Hide tabs for cover slides
                    const chartTab = document.getElementById('chartTab');
                    const videoTab = document.getElementById('videoTab');
                    if (chartTab) chartTab.style.display = 'none';
                    if (videoTab) videoTab.style.display = 'none';

                    return;
                }

                // Make customize button visible for non-cover slides
                const customizeBtn = document.getElementById('customizeBtn');
                if (customizeBtn) {
                    customizeBtn.style.visibility = 'visible';
                }

                // Try to handle as video slide first
                const handled = showVideoSlide(index);

                // If not a video slide, use original function
                if (!handled) {
                    window.originalShowSlide(index);
                } else {
                    // Still need to do basic slide switching for video slides
                    currentSlideIndex = index;

                    // Hide all slides
                    document.querySelectorAll('.slide').forEach(slide => {
                        slide.classList.remove('active');
                    });

                    // Show current slide
                    const currentSlide = slides[index];
                    if (currentSlide) {
                        const slideElement = document.getElementById(currentSlide.id);
                        if (slideElement) {
                            slideElement.classList.add('active');
                        }
                    }

                    // Update UI elements
                    const currentSlideSpan = document.getElementById('currentSlide');
                    const totalSlidesSpan = document.getElementById('totalSlides');
                    if (currentSlideSpan) {
                        currentSlideSpan.textContent = index + 1;
                    }
                    if (totalSlidesSpan) {
                        totalSlidesSpan.textContent = slides.length;
                    }

                    // Update tabs for current slide
                    updateTabsForCurrentSlide();
                }

            } catch (error) {
                sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
                console.error('Error in extended showSlide:', error);
                // Fallback to original
                window.originalShowSlide(index);
            }
        };
    }
}

// Initialize video slides when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Wait a bit for main script to initialize
    setTimeout(() => {
        initVideoSlides();
        extendShowSlide();
        initVideoControls();
        initTabSystem();
    }, 500);
});

// Initialize tab system
function initTabSystem() {
    console.log('Initializing tab system...');

    // Set default tab based on current slide
    updateTabsForCurrentSlide();
}

// Switch between tabs
function switchTab(tabName) {
    try {
        console.log('Switching to tab:', tabName);

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        const tabContent = document.getElementById(`${tabName}TabContent`);
        const tabBtn = document.getElementById(`${tabName}Tab`);

        if (tabContent) {
            tabContent.classList.add('active');
        }

        if (tabBtn) {
            tabBtn.classList.add('active');
        }

        // Refresh content based on tab
        if (tabName === 'chart') {
            updateChart();
            generateDataSliders();
        } else if (tabName === 'video') {
            // Refresh video timeline if needed
            if (currentVideoUrl) {
                setupTimelinePreview();
            }
        }

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error switching tabs:', error);
    }
}

// Update tabs based on current slide type
function updateTabsForCurrentSlide() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;

        const chartTab = document.getElementById('chartTab');
        const videoTab = document.getElementById('videoTab');
        const commonTab = document.getElementById('commonTab');
        const editCurrentSection = document.getElementById('editCurrentSection');

        if (!chartTab || !videoTab || !commonTab) return;

        console.log('Updating tabs for slide type:', currentSlide.chartType);

        if (currentSlide.isVideoSlide) {
            // Video or Image slide
            chartTab.style.display = 'none';
            videoTab.style.display = 'block';
            commonTab.style.display = 'block';

            // Show edit section only for video slides (not image slides)
            if (editCurrentSection && currentSlide.videoSegment && currentSlide.videoSegment.type === 'video') {
                editCurrentSection.style.display = 'block';
                setupEditSection(currentSlide);
            } else if (editCurrentSection) {
                editCurrentSection.style.display = 'none';
            }

            // Auto-switch to video tab
            switchTab('video');

        } else {
            // Chart slide
            chartTab.style.display = 'block';
            videoTab.style.display = 'none';
            commonTab.style.display = 'block';

            // Hide edit section
            if (editCurrentSection) {
                editCurrentSection.style.display = 'none';
            }

            // Auto-switch to chart tab
            switchTab('chart');
        }

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error updating tabs:', error);
    }
}

// Toggle accordion sections - Fixed version
function toggleAccordion(accordionId) {
    try {
        const accordion = document.getElementById(accordionId);
        const arrow = document.getElementById(accordionId + 'Arrow');

        if (!accordion || !arrow) {
            console.error('Accordion elements not found:', accordionId);
            return;
        }

        const isExpanded = accordion.classList.contains('expanded');

        if (isExpanded) {
            // Collapse
            accordion.classList.remove('expanded');
            arrow.classList.remove('expanded');
            arrow.textContent = '▼';
            console.log('Accordion collapsed:', accordionId);
        } else {
            // Expand
            accordion.classList.add('expanded');
            arrow.classList.add('expanded');
            arrow.textContent = '▲';
            console.log('Accordion expanded:', accordionId);
        }

        console.log('Accordion toggled:', accordionId, isExpanded ? 'collapsed' : 'expanded');

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error toggling accordion:', error);
    }
}

// Update tabs based on current slide type
function updateTabsForCurrentSlide() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;

        const chartTab = document.getElementById('chartTab');
        const videoTab = document.getElementById('videoTab');
        const commonTab = document.getElementById('commonTab');
        const editCurrentVideoSection = document.getElementById('editCurrentVideoSection');
        const editCurrentImageSection = document.getElementById('editCurrentImageSection');
        const noSlideSelected = document.getElementById('noSlideSelected');

        if (!chartTab || !videoTab || !commonTab) return;

        console.log('Updating tabs for slide type:', currentSlide.chartType);

        if (currentSlide.isVideoSlide) {
            // Video or Image slide
            chartTab.style.display = 'none';
            videoTab.style.display = 'block';
            commonTab.style.display = 'block';

            // Show appropriate edit section based on slide type
            if (currentSlide.videoSegment && currentSlide.videoSegment.type === 'video') {
                // Video slide - show video edit section
                if (editCurrentVideoSection) {
                    editCurrentVideoSection.style.display = 'block';
                    setupEditVideoSection(currentSlide);
                }
                if (editCurrentImageSection) {
                    editCurrentImageSection.style.display = 'none';
                }
                if (noSlideSelected) {
                    noSlideSelected.style.display = 'none';
                }
            } else if (currentSlide.videoSegment && currentSlide.videoSegment.type === 'image') {
                // Image slide - show image edit section
                if (editCurrentImageSection) {
                    editCurrentImageSection.style.display = 'block';
                    setupEditImageSection(currentSlide);
                }
                if (editCurrentVideoSection) {
                    editCurrentVideoSection.style.display = 'none';
                }
                if (noSlideSelected) {
                    noSlideSelected.style.display = 'none';
                }
            } else {
                // Hide both edit sections, show message
                if (editCurrentVideoSection) {
                    editCurrentVideoSection.style.display = 'none';
                }
                if (editCurrentImageSection) {
                    editCurrentImageSection.style.display = 'none';
                }
                if (noSlideSelected) {
                    noSlideSelected.style.display = 'block';
                }
            }

            // Auto-switch to video tab
            switchTab('video');

        } else {
            // Chart slide
            chartTab.style.display = 'block';
            videoTab.style.display = 'none';
            commonTab.style.display = 'block';

            // Hide edit sections, show message
            if (editCurrentVideoSection) {
                editCurrentVideoSection.style.display = 'none';
            }
            if (editCurrentImageSection) {
                editCurrentImageSection.style.display = 'none';
            }
            if (noSlideSelected) {
                noSlideSelected.style.display = 'block';
            }

            // Auto-switch to chart tab
            switchTab('chart');
        }

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error updating tabs:', error);
    }
}

// Setup edit section with current video slide data
function setupEditVideoSection(slide) {
    try {
        if (!slide.videoSegment || slide.videoSegment.type !== 'video') return;

        const segment = slide.videoSegment;

        // Setup edit timeline preview
        const editTimelinePreview = document.getElementById('editTimelinePreview');
        if (editTimelinePreview && currentVideoUrl) {
            editTimelinePreview.src = currentVideoUrl;

            // Setup edit timeline scrubber
            const editTimelineScrubber = document.getElementById('editTimelineScrubber');
            if (editTimelineScrubber && masterVideoElement && masterVideoElement.duration) {
                editTimelineScrubber.max = Math.floor(masterVideoElement.duration);
                editTimelineScrubber.value = segment.startTime;

                // Add event listener for edit scrubber
                editTimelineScrubber.removeEventListener('input', handleEditTimelineChange);
                editTimelineScrubber.addEventListener('input', handleEditTimelineChange);
            }
        }

        // Pre-fill with current slide's times
        editStartTime = segment.startTime;
        editEndTime = segment.endTime;

        updateTimeDisplay('editStartTimeDisplay', editStartTime);
        updateTimeDisplay('editEndTimeDisplay', editEndTime);
        updateEditSegmentDuration();

        // Update total time display
        if (masterVideoElement && masterVideoElement.duration) {
            updateTimeDisplay('editTotalTimeDisplay', masterVideoElement.duration);
        }

        console.log('Edit video section setup complete for:', segment.title);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error setting up edit video section:', error);
    }
}

// Setup edit section with current image slide data
function setupEditImageSection(slide) {
    try {
        if (!slide.videoSegment || slide.videoSegment.type !== 'image') return;

        const segment = slide.videoSegment;

        // Setup edit image timeline preview
        const editImageTimelinePreview = document.getElementById('editImageTimelinePreview');
        if (editImageTimelinePreview && currentVideoUrl) {
            editImageTimelinePreview.src = currentVideoUrl;

            // Setup edit image timeline scrubber
            const editImageTimelineScrubber = document.getElementById('editImageTimelineScrubber');
            if (editImageTimelineScrubber && masterVideoElement && masterVideoElement.duration) {
                editImageTimelineScrubber.max = Math.floor(masterVideoElement.duration);
                editImageTimelineScrubber.value = segment.time;

                // Add event listener for edit image scrubber
                editImageTimelineScrubber.removeEventListener('input', handleEditImageTimelineChange);
                editImageTimelineScrubber.addEventListener('input', handleEditImageTimelineChange);

                console.log('Image timeline scrubber setup with max:', Math.floor(masterVideoElement.duration), 'current:', segment.time);
            }
        }

        // IMPORTANT FIX: Initialize editImageFrameTime with current slide's time
        editImageFrameTime = segment.time;
        updateTimeDisplay('editImageFrameTimeDisplay', editImageFrameTime);

        // Update total time display
        if (masterVideoElement && masterVideoElement.duration) {
            updateTimeDisplay('editImageTotalTimeDisplay', masterVideoElement.duration);
        }

        console.log('Edit image section setup complete for:', segment.title, 'at time:', editImageFrameTime);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error setting up edit image section:', error);
    }
}

// Edit image timeline variables
let editImageFrameTime = 0;

// Handle edit image timeline scrubber changes
function handleEditImageTimelineChange(event) {
    try {
        const timelinePreview = document.getElementById('editImageTimelinePreview');
        if (!timelinePreview) return;

        const time = parseFloat(event.target.value);
        timelinePreview.currentTime = time;

        // Update current time display
        updateTimeDisplay('editImageCurrentTimeDisplay', time);

        // IMPORTANT FIX: Auto-update the frame time as user drags slider
        editImageFrameTime = time;
        updateTimeDisplay('editImageFrameTimeDisplay', editImageFrameTime);

        console.log('Edit image timeline changed to:', time, 'editImageFrameTime updated to:', editImageFrameTime);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error handling edit image timeline change:', error);
    }
}

// Set edit image frame time
function setEditImageFrameTime() {
    const editImageTimelineScrubber = document.getElementById('editImageTimelineScrubber');
    if (!editImageTimelineScrubber) return;

    // Get the current slider value
    const newFrameTime = parseFloat(editImageTimelineScrubber.value);

    // Update the global variable
    editImageFrameTime = newFrameTime;

    // Update the display
    updateTimeDisplay('editImageFrameTimeDisplay', editImageFrameTime);

    console.log('Set frame time button clicked - editImageFrameTime set to:', editImageFrameTime);
}


// Update current image slide
function updateImageSlide() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide || !currentSlide.isVideoSlide || !currentSlide.videoSegment) {
            showAlert('Please select an image slide to update.');
            return;
        }

        if (currentSlide.videoSegment.type !== 'image') {
            showAlert('Please select an image slide to update.');
            return;
        }

        // IMPORTANT FIX: Use the current editImageFrameTime value
        console.log('Updating image slide with time:', editImageFrameTime);

        // Update the segment
        const segment = currentSlide.videoSegment;
        segment.time = editImageFrameTime;

        console.log('Updated image slide:', segment.title, 'to time:', segment.time);

        // Force refresh the slide by removing existing image frame
        const slideElement = document.getElementById(currentSlide.id);
        if (slideElement) {
            const existingFrame = slideElement.querySelector('.image-frame');
            if (existingFrame) {
                // Replace with placeholder to force recapture
                const newPlaceholder = document.createElement('div');
                newPlaceholder.className = 'image-placeholder';
                newPlaceholder.innerHTML = `
                    🖼️ Campaign Image
                    <div class="image-details">Video frame capture</div>
                `;
                existingFrame.parentNode.replaceChild(newPlaceholder, existingFrame);
                console.log('Removed existing frame to force recapture');
            }
        }

        // Refresh the slide to capture new frame
        showSlide(currentSlideIndex);

        showAlert(`Image slide updated successfully! New frame time: ${editImageFrameTime}s`);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error updating image slide:', error);
        showAlert('Error updating image slide. Please try again.');
    }
}

// Edit timeline variables
let editStartTime = 0;
let editEndTime = 0;

// Handle edit timeline scrubber changes
function handleEditTimelineChange(event) {
    try {
        const timelinePreview = document.getElementById('editTimelinePreview');
        if (!timelinePreview) return;

        const time = parseFloat(event.target.value);
        timelinePreview.currentTime = time;

        // Update current time display
        updateTimeDisplay('editCurrentTimeDisplay', time);

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error handling edit timeline change:', error);
    }
}

// Set start time for editing
function setEditStartTime() {
    const editTimelineScrubber = document.getElementById('editTimelineScrubber');
    if (!editTimelineScrubber) return;

    editStartTime = parseFloat(editTimelineScrubber.value);
    updateTimeDisplay('editStartTimeDisplay', editStartTime);
    updateEditSegmentDuration();

    console.log('Edit start time set to:', editStartTime);
}

// Set end time for editing
function setEditEndTime() {
    const editTimelineScrubber = document.getElementById('editTimelineScrubber');
    if (!editTimelineScrubber) return;

    editEndTime = parseFloat(editTimelineScrubber.value);

    // Ensure end time is after start time
    if (editEndTime <= editStartTime) {
        editEndTime = editStartTime + 5; // Default 5 second segment
    }

    updateTimeDisplay('editEndTimeDisplay', editEndTime);
    updateEditSegmentDuration();

    console.log('Edit end time set to:', editEndTime);
}

// Update edit segment duration display
function updateEditSegmentDuration() {
    const durationElement = document.getElementById('editSegmentDuration');
    if (!durationElement) return;

    const duration = Math.max(0, editEndTime - editStartTime);
    durationElement.textContent = `${duration.toFixed(1)}s`;
}

// Update current video slide
function updateVideoSlide() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide || !currentSlide.isVideoSlide || !currentSlide.videoSegment) {
            showAlert('Please select a video slide to update.');
            return;
        }

        if (editEndTime <= editStartTime) {
            showAlert('Please set both start and end times, with end time after start time.');
            return;
        }

        if (editEndTime - editStartTime < 1) {
            showAlert('Video segment must be at least 1 second long.');
            return;
        }

        // Update the segment
        const segment = currentSlide.videoSegment;
        segment.startTime = editStartTime;
        segment.endTime = editEndTime;
        segment.duration = editEndTime - editStartTime;

        console.log('Updated video slide:', segment.title);

        // Refresh the slide
        showSlide(currentSlideIndex);

        showAlert('Video slide updated successfully!');

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error updating video slide:', error);
        showAlert('Error updating video slide. Please try again.');
    }
}

// Initialize video controls (updated)
function initVideoControls() {
    console.log('Initializing video timeline controls...');

    // Setup main timeline scrubber (Create Video)
    const timelineScrubber = document.getElementById('timelineScrubber');
    const timelinePreview = document.getElementById('timelinePreview');

    if (timelineScrubber && timelinePreview) {
        timelineScrubber.addEventListener('input', function () {
            updateTimelinePreview(this.value);
        });

        if (currentVideoUrl) {
            timelinePreview.src = currentVideoUrl;
            setupTimelinePreview();
        }
    }

    // Setup image timeline scrubber (Create Image) - FIX THIS
    const imageTimelineScrubber = document.getElementById('imageTimelineScrubber');
    const imageTimelinePreview = document.getElementById('imageTimelinePreview');

    if (imageTimelineScrubber && imageTimelinePreview) {
        console.log('Setting up image timeline scrubber...');

        // Remove any existing listeners
        imageTimelineScrubber.removeEventListener('input', updateImageTimelinePreview);

        // Add new listener
        imageTimelineScrubber.addEventListener('input', function () {
            console.log('Image slider moved to:', this.value);
            updateImageTimelinePreview(this.value);
        });

        if (currentVideoUrl) {
            imageTimelinePreview.src = currentVideoUrl;
            setupImageTimelinePreview();
        }
    } else {
        console.error('Image timeline elements not found:', {
            scrubber: !!imageTimelineScrubber,
            preview: !!imageTimelinePreview
        });
    }
}

// Setup image timeline preview - Enhanced
function setupImageTimelinePreview() {
    const imageTimelinePreview = document.getElementById('imageTimelinePreview');
    const imageTimelineScrubber = document.getElementById('imageTimelineScrubber');

    if (!imageTimelinePreview) {
        console.error('Image timeline preview element not found');
        return;
    }

    console.log('Setting up image timeline preview...');

    imageTimelinePreview.addEventListener('loadedmetadata', function () {
        const duration = this.duration;
        console.log('Image timeline preview loaded, duration:', duration);

        if (imageTimelineScrubber) {
            imageTimelineScrubber.max = Math.floor(duration);
            console.log('Image timeline scrubber max set to:', Math.floor(duration));
        }

        updateTimeDisplay('imageTotalTimeDisplay', duration);

        // Test the slider immediately
        if (imageTimelineScrubber) {
            console.log('Testing image timeline scrubber...');
            // Set to middle of video to test
            const testTime = Math.floor(duration / 2);
            imageTimelineScrubber.value = testTime;
            updateImageTimelinePreview(testTime);
        }
    });

    imageTimelinePreview.addEventListener('timeupdate', function () {
        updateTimeDisplay('imageCurrentTimeDisplay', this.currentTime);
    });

    imageTimelinePreview.addEventListener('error', function (e) {
        console.error('Image timeline preview error:', e);
    });

    // Force load
    if (currentVideoUrl && imageTimelinePreview.src !== currentVideoUrl) {
        console.log('Setting image timeline preview src:', currentVideoUrl);
        imageTimelinePreview.src = currentVideoUrl;
        imageTimelinePreview.load();
    }
}

// Update image timeline preview - Fixed
function updateImageTimelinePreview(sliderValue) {
    try {
        console.log('updateImageTimelinePreview called with:', sliderValue);

        const imageTimelinePreview = document.getElementById('imageTimelinePreview');
        if (!imageTimelinePreview) {
            console.error('Image timeline preview not found');
            return;
        }

        if (!imageTimelinePreview.duration) {
            console.warn('Image timeline preview duration not ready:', imageTimelinePreview.readyState);
            return;
        }

        const time = parseFloat(sliderValue);
        console.log('Setting image timeline to time:', time);

        imageTimelinePreview.currentTime = time;

        // Update displays
        updateTimeDisplay('imageCurrentTimeDisplay', time);
        updateTimeDisplay('imageFrameTimeDisplay', time);

        console.log('Image timeline updated successfully');

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error updating image timeline preview:', error);
    }
}

// Set image frame time
function setImageFrameTime() {
    const imageTimelineScrubber = document.getElementById('imageTimelineScrubber');
    if (!imageTimelineScrubber) return;

    const frameTime = parseFloat(imageTimelineScrubber.value);
    updateTimeDisplay('imageFrameTimeDisplay', frameTime);

    console.log('Image frame time set to:', frameTime);
}

// Create image slide (updated to use image timeline)
function createImageSlide() {
    try {
        const imageTimelineScrubber = document.getElementById('imageTimelineScrubber');
        if (!imageTimelineScrubber) return;

        const currentTime = parseFloat(imageTimelineScrubber.value);

        // Create image segment object
        const customSegment = {
            type: 'image',
            time: currentTime,
            title: `Custom Image ${slides.length + 1}`,
            originalSegment: `custom-img-${currentTime}s`,
            campaignName: 'Custom'
        };

        console.log('Creating custom image slide:', customSegment);

        // Create slide
        const slideIndex = slides.length;
        createSlideFromSegment(customSegment, slideIndex);

        // Update UI
        updateSlideList();
        updateNavigation();

        // Switch to new slide
        currentSlideIndex = slides.length - 1;
        showSlide(currentSlideIndex);

        showAlert('Image slide created successfully!');

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error creating image slide:', error);
        showAlert('Error creating image slide. Please try again.');
    }
}

// Update current slide info display
function updateCurrentSlideInfo(slide) {
    try {
        const slideTypeDisplay = document.getElementById('slideTypeDisplay');
        const currentTimingDisplay = document.getElementById('currentTimingDisplay');
        const editActions = document.getElementById('editActions');

        if (!slideTypeDisplay) return;

        if (slide.isVideoSlide && slide.videoSegment) {
            const segment = slide.videoSegment;

            // Show slide type and title
            slideTypeDisplay.textContent = `${segment.title} (${segment.type === 'video' ? 'Video' : 'Image'})`;

            if (segment.type === 'video') {
                // Show timing for video slides
                updateTimeDisplay('currentStartTime', segment.startTime);
                updateTimeDisplay('currentEndTime', segment.endTime);

                const currentDuration = document.getElementById('currentDuration');
                if (currentDuration) {
                    currentDuration.textContent = `${segment.duration.toFixed(1)}s`;
                }

                if (currentTimingDisplay) {
                    currentTimingDisplay.style.display = 'block';
                }
            } else {
                // Hide timing for image slides, show frame time instead
                if (currentTimingDisplay) {
                    currentTimingDisplay.style.display = 'none';
                }
                slideTypeDisplay.textContent += ` (Frame at ${segment.time}s)`;
            }

            // Show edit actions
            if (editActions) {
                editActions.style.display = 'flex';
            }

        } else {
            // Not a video slide
            slideTypeDisplay.textContent = 'No video slide selected';

            if (currentTimingDisplay) {
                currentTimingDisplay.style.display = 'none';
            }
            if (editActions) {
                editActions.style.display = 'none';
            }
        }

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error updating current slide info:', error);
    }
}

// Edit current slide timing
function editCurrentSlide() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide || !currentSlide.isVideoSlide || !currentSlide.videoSegment) {
            showAlert('Please select a video slide to edit.');
            return;
        }

        const segment = currentSlide.videoSegment;

        if (segment.type === 'video') {
            // For video slides, allow editing start/end times
            const newStartTime = prompt(`Edit start time (current: ${segment.startTime}s):`, segment.startTime);
            const newEndTime = prompt(`Edit end time (current: ${segment.endTime}s):`, segment.endTime);

            if (newStartTime !== null && newEndTime !== null) {
                const startTime = parseFloat(newStartTime);
                const endTime = parseFloat(newEndTime);

                if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) {
                    showAlert('Invalid times. End time must be greater than start time.');
                    return;
                }

                // Update segment
                segment.startTime = startTime;
                segment.endTime = endTime;
                segment.duration = endTime - startTime;

                // Update display
                updateCurrentSlideInfo(currentSlide);

                // Refresh slide if it's currently active
                if (currentSlideIndex < slides.length) {
                    showSlide(currentSlideIndex);
                }

                showAlert('Slide timing updated successfully!');
            }
        } else {
            // For image slides, allow editing the frame time
            const newTime = prompt(`Edit frame time (current: ${segment.time}s):`, segment.time);

            if (newTime !== null) {
                const frameTime = parseFloat(newTime);

                if (isNaN(frameTime) || frameTime < 0) {
                    showAlert('Invalid time. Please enter a valid number.');
                    return;
                }

                // Update segment
                segment.time = frameTime;

                // Update display
                updateCurrentSlideInfo(currentSlide);

                // Refresh slide if it's currently active
                if (currentSlideIndex < slides.length) {
                    showSlide(currentSlideIndex);
                }

                showAlert('Image frame time updated successfully!');
            }
        }

    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('Error editing current slide:', error);
        showAlert('Error editing slide. Please try again.');
    }
}

// Delete current slide
function deleteCurrentSlide() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) {
            showshowAlert('No slide selected to delete.');
            return;
        }

        // Prevent deleting cover slides
        if (currentSlide.isCoverSlide) {
            showshowAlert('Cannot delete cover slides.');
            return;
        }

        // Check if it's the last remaining non-cover slide
        const nonCoverSlides = slides.filter(slide => !slide.isCoverSlide);
        if (nonCoverSlides.length <= 1) {
            showshowAlert('Cannot delete the last slide! At least one slide is required.');
            return;
        }

        // Confirm deletion
        showConfirm(`Are you sure you want to delete "${currentSlide.title}"?`, (confirmed) => {
            if (!confirmed) return;

            console.log('🗑️ Deleting current slide:', currentSlide.title);

            // Remove slide element from DOM
            const slideToRemove = document.getElementById(currentSlide.id);
            if (slideToRemove) {
                slideToRemove.remove();
                console.log('🗑️ Slide element removed from DOM');
            }

            // Remove from slides array
            slides.splice(currentSlideIndex, 1);
            console.log('🗑️ Slide removed from array');

            // FIXED: Simple logic - show whatever slide is now at the current position
            if (currentSlideIndex >= slides.length) {
                // If we deleted the last slide, go to the previous one
                currentSlideIndex = slides.length - 1;
                console.log('📍 Deleted last slide, showing previous slide');
            } else {
                // Show the slide that moved into the deleted position
                console.log('📍 Showing slide that moved to current position');
            }

            console.log('🗑️ New current slide index:', currentSlideIndex);

            // Update UI
            showSlide(currentSlideIndex);
            updateSlideList();
            updateNavigation();

            // Close customize mode if we're now on a cover slide
            if (slides[currentSlideIndex] && slides[currentSlideIndex].isCoverSlide && isCustomizeMode) {
                toggleCustomizeMode();
            }

            console.log('✅ Slide deleted successfully');
        });
    } catch (error) {
        sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
        console.error('❌ Error in deleteCurrentSlide:', error);
        showAlert('Error deleting slide. Please try again.');
    }
}

// Update the existing deleteSlide function to use the new logic
function deleteSlide() {
    // Just call the new function for consistency
    deleteCurrentSlide();
}

// Initialize video timeline controls
function initVideoControls() {
    console.log('Initializing video timeline controls...');

    // Setup timeline scrubber
    const timelineScrubber = document.getElementById('timelineScrubber');
    const timelinePreview = document.getElementById('timelinePreview');

    if (timelineScrubber && timelinePreview) {
        // Timeline scrubber change event
        timelineScrubber.addEventListener('input', function () {
            updateTimelinePreview(this.value);
        });

        // Preview video setup
        if (currentVideoUrl) {
            timelinePreview.src = currentVideoUrl;
            setupTimelinePreview();
        }
    }
}

// Setup timeline preview video
function setupTimelinePreview() {
    const timelinePreview = document.getElementById('timelinePreview');
    const timelineScrubber = document.getElementById('timelineScrubber');

    if (!timelinePreview) return;

    timelinePreview.addEventListener('loadedmetadata', function () {
        const duration = this.duration;
        console.log('Timeline preview loaded, duration:', duration);

        // Update timeline scrubber max value
        if (timelineScrubber) {
            timelineScrubber.max = Math.floor(duration);
        }

        // Update total time display
        updateTimeDisplay('totalTimeDisplay', duration);

        // Show video controls if we have a video loaded
        const videoControls = document.getElementById('videoSlideControls');
        if (videoControls && currentVideoUrl) {
            videoControls.style.display = 'block';
        }

        // Create timeline markers
        createTimelineMarkers(duration);
    });

    timelinePreview.addEventListener('timeupdate', function () {
        updateTimeDisplay('currentTimeDisplay', this.currentTime);
    });
}

// Update timeline preview based on scrubber position
function updateTimelinePreview(sliderValue) {
    const timelinePreview = document.getElementById('timelinePreview');
    if (!timelinePreview || !timelinePreview.duration) return;

    const time = parseFloat(sliderValue);
    timelinePreview.currentTime = time;

    // Update current time display
    updateTimeDisplay('currentTimeDisplay', time);
}

// Update time display (convert seconds to MM:SS format)
function updateTimeDisplay(elementId, timeInSeconds) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    element.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Create timeline markers for existing segments
function createTimelineMarkers(videoDuration) {
    const markersContainer = document.getElementById('timelineMarkers');
    if (!markersContainer) return;

    markersContainer.innerHTML = '';

    // Add markers for existing video segments
    videoSegments.forEach((segment, index) => {
        if (segment.type === 'video') {
            const startPercent = (segment.startTime / videoDuration) * 100;
            const endPercent = (segment.endTime / videoDuration) * 100;

            const marker = document.createElement('div');
            marker.className = 'timeline-marker video-marker';
            marker.style.left = `${startPercent}%`;
            marker.style.width = `${endPercent - startPercent}%`;
            marker.title = `Video: ${segment.startTime}s - ${segment.endTime}s`;
            markersContainer.appendChild(marker);
        } else if (segment.type === 'image') {
            const timePercent = (segment.time / videoDuration) * 100;

            const marker = document.createElement('div');
            marker.className = 'timeline-marker image-marker';
            marker.style.left = `${timePercent}%`;
            marker.title = `Image: ${segment.time}s`;
            markersContainer.appendChild(marker);
        }
    });
}

// Video slide creation variables
// let customStartTime = 0;
// let customEndTime = 0;

// Set start time for custom video segment
// function setStartTime() {
//     const timelineScrubber = document.getElementById('timelineScrubber');
//     if (!timelineScrubber) return;

//     customStartTime = parseFloat(timelineScrubber.value);
//     updateTimeDisplay('startTimeDisplay', customStartTime);
//     updateSegmentDuration();

//     console.log('Start time set to:', customStartTime);
// }

// Set end time for custom video segment
// function setEndTime() {
//     const timelineScrubber = document.getElementById('timelineScrubber');
//     if (!timelineScrubber) return;

//     customEndTime = parseFloat(timelineScrubber.value);

//     // Ensure end time is after start time
//     if (customEndTime <= customStartTime) {
//         customEndTime = customStartTime + 5; // Default 5 second segment
//     }

//     updateTimeDisplay('endTimeDisplay', customEndTime);
//     updateSegmentDuration();

//     console.log('End time set to:', customEndTime);
// }

// Update segment duration display
// function updateSegmentDuration() {
//     const durationElement = document.getElementById('segmentDuration');
//     if (!durationElement) return;

//     const duration = Math.max(0, customEndTime - customStartTime);
//     durationElement.textContent = `${duration.toFixed(1)}s`;
// }

// Create custom video slide
// function createVideoSlide() {
//     try {
//         if (customEndTime <= customStartTime) {
//             showAlert('Please set both start and end times, with end time after start time.');
//             return;
//         }

//         if (customEndTime - customStartTime < 1) {
//             showAlert('Video segment must be at least 1 second long.');
//             return;
//         }

//         // Create video segment object
//         const customSegment = {
//             type: 'video',
//             startTime: customStartTime,
//             endTime: customEndTime,
//             duration: customEndTime - customStartTime,
//             title: `Custom Video ${slides.length + 1}`,
//             originalSegment: `custom-${customStartTime}s-${customEndTime}s`,
//             campaignName: 'Custom'
//         };

//         console.log('Creating custom video slide:', customSegment);

//         // Create slide
//         const slideIndex = slides.length;
//         createSlideFromSegment(customSegment, slideIndex);

//         // Update UI
//         updateSlideList();
//         updateNavigation();

//         // Switch to new slide
//         currentSlideIndex = slides.length - 1;
//         showSlide(currentSlideIndex);

//         // Reset times for next creation
//         customStartTime = 0;
//         customEndTime = 0;
//         updateTimeDisplay('startTimeDisplay', 0);
//         updateTimeDisplay('endTimeDisplay', 0);
//         updateSegmentDuration();

//         showAlert('Video slide created successfully!');

//     } catch (error) { sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
//         console.error('Error creating video slide:', error);
//         showAlert('Error creating video slide. Please try again.');
//     }
// }

// Create custom image slide
// function createImageSlide() {
//     try {
//         const timelineScrubber = document.getElementById('timelineScrubber');
//         if (!timelineScrubber) return;

//         const currentTime = parseFloat(timelineScrubber.value);

//         // Create image segment object
//         const customSegment = {
//             type: 'image',
//             time: currentTime,
//             title: `Custom Image ${slides.length + 1}`,
//             originalSegment: `custom-img-${currentTime}s`,
//             campaignName: 'Custom'
//         };

//         console.log('Creating custom image slide:', customSegment);

//         // Create slide
//         const slideIndex = slides.length;
//         createSlideFromSegment(customSegment, slideIndex);

//         // Update UI
//         updateSlideList();
//         updateNavigation();

//         // Switch to new slide
//         currentSlideIndex = slides.length - 1;
//         showSlide(currentSlideIndex);

//         showAlert('Image slide created successfully!');

//     } catch (error) { sendErrorToiOS(error, 'from-video-slides.js', 0, 0, error.stack);
//         console.error('Error creating image slide:', error);
//         showAlert('Error creating image slide. Please try again.');
//     }
// }
// Make retry function globally accessible so HTML onclick can find it
window.retrySafariImageCapture = retrySafariImageCapture;