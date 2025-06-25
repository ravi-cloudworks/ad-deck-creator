// Video Slides Module for Brand Strategy Presentation Tool
// Handles video URL parsing, video/image slide creation and management

// Global video-related variables
let masterVideoElement = null;
let videoSegments = [];
let videoLoaded = false;
let currentVideoUrl = null;
let frontCoverUrl = null;
let backCoverUrl = null;

// Initialize video functionality
function initVideoSlides() {
    console.log('Initializing video slides module...');
    
    // Get master video element
    masterVideoElement = document.getElementById('masterVideo');
    if (!masterVideoElement) {
        console.error('Master video element not found');
        return;
    }
    
    // Check for video URL parameter
    checkVideoUrlParameter();
    
    // Setup video event listeners
    setupVideoEventListeners();
    
    console.log('Video slides module initialized');
}

// Check URL parameters for video_url
function checkVideoUrlParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoUrl = urlParams.get('video_url');
    frontCoverUrl = urlParams.get('front_cover');
    backCoverUrl = urlParams.get('back_cover');
    
    if (videoUrl) {
        console.log('Video URL found:', videoUrl);
        loadVideoFromUrl(videoUrl);
    } else {
        console.log('No video URL parameter found');
    }
}

// Load video from URL and parse filename for segments
function loadVideoFromUrl(videoUrl) {
    try {
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
            createSlidesFromSegments();
        }
        
    } catch (error) {
        console.error('Error loading video from URL:', error);
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
        console.error('Error parsing time string:', timeString, error);
        return 0;
    }
}

// Setup video event listeners
function setupVideoEventListeners() {
    if (!masterVideoElement) return;
    
    masterVideoElement.addEventListener('loadedmetadata', function() {
        console.log('Video metadata loaded, duration:', this.duration);
        videoLoaded = true;
        
        // Validate segments against video duration
        validateSegments();
        
        // Add preload for Safari
        preloadVideoForSafari();
    });
    
    masterVideoElement.addEventListener('error', function(e) {
        console.error('Video loading error:', e);
        alert('Error loading video. Please check the URL and try again.');
    });
    
    masterVideoElement.addEventListener('canplay', function() {
        console.log('Video can play');
    });
    
    // Safari-specific events
    masterVideoElement.addEventListener('canplaythrough', function() {
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
    if (videoSegments.length === 0) {
        console.log('No video segments to create slides from');
        return;
    }
    
    console.log('Creating slides from segments...');
    
    // Clear existing slides first (optional - for clean start)
    // clearAllSlides();
    
    // Add front cover if present
    if (frontCoverUrl) {
        createCoverSlide(frontCoverUrl, true);
    }
    
    // Create slides for each segment
    videoSegments.forEach((segment, index) => {
        createSlideFromSegment(segment, index);
    });
    
    // Add back cover if present
    if (backCoverUrl) {
        createCoverSlide(backCoverUrl, false);
    }
    
    // Update UI
    updateSlideList();
    updateNavigation();
    
    console.log(`Created ${videoSegments.length} slides from video segments`);
}

// Create a single slide from a segment
function createSlideFromSegment(segment, index) {
    try {
        const slideId = `video-slide-${Date.now()}-${index}`;
        
        const slide = {
            id: slideId,
            chartType: segment.type === 'video' ? 'video' : 'image',
            theme: 'custom',
            backgroundImage: globalBackgroundImage,
            title: segment.title,
            customTextColor: null,
            // Video-specific properties
            videoSegment: segment,
            isVideoSlide: true
        };
        
        // Add to slides array (from main script.js)
        slides.push(slide);
        
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
        
        // Add to slide container
        const slideContainer = document.getElementById('slideContainer');
        if (slideContainer) {
            slideContainer.appendChild(slideElement);
        }
        
        console.log('Created slide for segment:', segment.title);
        
    } catch (error) {
        console.error('Error creating slide from segment:', error);
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
                // Create new image frame
                seekVideoToTime(segment.time);
                setTimeout(() => {
                    captureVideoFrame(slide.id, segment);
                }, 100); // Small delay to ensure seeking completes
            }
        }
        
        return true; // Successfully handled video slide
        
    } catch (error) {
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
        console.error('Error playing video segment:', error);
    }
}

// Capture video frame for image slides
function captureVideoFrame(slideId, segment) {
    try {
        const slideElement = document.getElementById(slideId);
        if (!slideElement) return;
        
        const placeholder = slideElement.querySelector('.image-placeholder');
        if (!placeholder) return;
        
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match video
        canvas.width = masterVideoElement.videoWidth || 1920;
        canvas.height = masterVideoElement.videoHeight || 1080;
        
        // Draw current video frame to canvas
        ctx.drawImage(masterVideoElement, 0, 0, canvas.width, canvas.height);
        
        // Create image frame container
        const frameContainer = document.createElement('div');
        frameContainer.className = 'image-frame';
        frameContainer.innerHTML = `
            <canvas width="${canvas.width}" height="${canvas.height}" style="max-width: 100%; max-height: 100%; border-radius: 12px;"></canvas>
        `;
        
        // Copy canvas content to display canvas
        const displayCanvas = frameContainer.querySelector('canvas');
        const displayCtx = displayCanvas.getContext('2d');
        displayCtx.drawImage(canvas, 0, 0);
        
        // Replace placeholder with image frame
        placeholder.parentNode.replaceChild(frameContainer, placeholder);
        
        console.log('Video frame captured for:', segment.title, 'at', segment.time, 'seconds');
        
    } catch (error) {
        console.error('Error capturing video frame:', error);
    }
}

// Clear all existing slides (utility function)
function clearAllSlides() {
    try {
        // Clear slides array
        slides.length = 0;
        currentSlideIndex = 0;
        
        // Clear slide container
        const slideContainer = document.getElementById('slideContainer');
        if (slideContainer) {
            slideContainer.innerHTML = '';
        }
        
        console.log('Cleared all slides');
        
    } catch (error) {
        console.error('Error clearing slides:', error);
    }
}

// Integration hook: Extend the existing showSlide function
function extendShowSlide() {
    // Store original showSlide function
    if (typeof window.originalShowSlide === 'undefined') {
        window.originalShowSlide = showSlide;
        
        // Override showSlide to handle video slides
        showSlide = function(index) {
            try {
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
                console.error('Error in extended showSlide:', error);
                // Fallback to original
                window.originalShowSlide(index);
            }
        };
    }
}

// Initialize video slides when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
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
            }
        }
        
        // Pre-fill with current slide's time
        editImageFrameTime = segment.time;
        updateTimeDisplay('editImageFrameTimeDisplay', editImageFrameTime);
        
        // Update total time display
        if (masterVideoElement && masterVideoElement.duration) {
            updateTimeDisplay('editImageTotalTimeDisplay', masterVideoElement.duration);
        }
        
        console.log('Edit image section setup complete for:', segment.title);
        
    } catch (error) {
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
        
    } catch (error) {
        console.error('Error handling edit image timeline change:', error);
    }
}

// Set edit image frame time
function setEditImageFrameTime() {
    const editImageTimelineScrubber = document.getElementById('editImageTimelineScrubber');
    if (!editImageTimelineScrubber) return;
    
    editImageFrameTime = parseFloat(editImageTimelineScrubber.value);
    updateTimeDisplay('editImageFrameTimeDisplay', editImageFrameTime);
    
    console.log('Edit image frame time set to:', editImageFrameTime);
}

// Update current image slide
function updateImageSlide() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide || !currentSlide.isVideoSlide || !currentSlide.videoSegment) {
            alert('Please select an image slide to update.');
            return;
        }
        
        if (currentSlide.videoSegment.type !== 'image') {
            alert('Please select an image slide to update.');
            return;
        }
        
        // Update the segment
        const segment = currentSlide.videoSegment;
        segment.time = editImageFrameTime;
        
        console.log('Updated image slide:', segment.title);
        
        // Refresh the slide
        showSlide(currentSlideIndex);
        
        alert('Image slide updated successfully!');
        
    } catch (error) {
        console.error('Error updating image slide:', error);
        alert('Error updating image slide. Please try again.');
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
            alert('Please select a video slide to update.');
            return;
        }
        
        if (editEndTime <= editStartTime) {
            alert('Please set both start and end times, with end time after start time.');
            return;
        }
        
        if (editEndTime - editStartTime < 1) {
            alert('Video segment must be at least 1 second long.');
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
        
        alert('Video slide updated successfully!');
        
    } catch (error) {
        console.error('Error updating video slide:', error);
        alert('Error updating video slide. Please try again.');
    }
}

// Initialize video controls (updated)
function initVideoControls() {
    console.log('Initializing video timeline controls...');
    
    // Setup main timeline scrubber (Create Video)
    const timelineScrubber = document.getElementById('timelineScrubber');
    const timelinePreview = document.getElementById('timelinePreview');
    
    if (timelineScrubber && timelinePreview) {
        timelineScrubber.addEventListener('input', function() {
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
        imageTimelineScrubber.addEventListener('input', function() {
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
    
    imageTimelinePreview.addEventListener('loadedmetadata', function() {
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
    
    imageTimelinePreview.addEventListener('timeupdate', function() {
        updateTimeDisplay('imageCurrentTimeDisplay', this.currentTime);
    });
    
    imageTimelinePreview.addEventListener('error', function(e) {
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
        
        alert('Image slide created successfully!');
        
    } catch (error) {
        console.error('Error creating image slide:', error);
        alert('Error creating image slide. Please try again.');
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
        console.error('Error updating current slide info:', error);
    }
}

// Edit current slide timing
function editCurrentSlide() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide || !currentSlide.isVideoSlide || !currentSlide.videoSegment) {
            alert('Please select a video slide to edit.');
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
                    alert('Invalid times. End time must be greater than start time.');
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
                
                alert('Slide timing updated successfully!');
            }
        } else {
            // For image slides, allow editing the frame time
            const newTime = prompt(`Edit frame time (current: ${segment.time}s):`, segment.time);
            
            if (newTime !== null) {
                const frameTime = parseFloat(newTime);
                
                if (isNaN(frameTime) || frameTime < 0) {
                    alert('Invalid time. Please enter a valid number.');
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
                
                alert('Image frame time updated successfully!');
            }
        }
        
    } catch (error) {
        console.error('Error editing current slide:', error);
        alert('Error editing slide. Please try again.');
    }
}

// Delete current slide
function deleteCurrentSlide() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide || !currentSlide.isVideoSlide) {
            alert('Please select a video slide to delete.');
            return;
        }
        
        const confirmDelete = confirm(`Are you sure you want to delete "${currentSlide.title}"?`);
        
        if (confirmDelete) {
            // Use existing delete function
            deleteSlide();
        }
        
    } catch (error) {
        console.error('Error deleting current slide:', error);
        alert('Error deleting slide. Please try again.');
    }
}

// Initialize video timeline controls
function initVideoControls() {
    console.log('Initializing video timeline controls...');
    
    // Setup timeline scrubber
    const timelineScrubber = document.getElementById('timelineScrubber');
    const timelinePreview = document.getElementById('timelinePreview');
    
    if (timelineScrubber && timelinePreview) {
        // Timeline scrubber change event
        timelineScrubber.addEventListener('input', function() {
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
    
    timelinePreview.addEventListener('loadedmetadata', function() {
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
    
    timelinePreview.addEventListener('timeupdate', function() {
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
let customStartTime = 0;
let customEndTime = 0;

// Set start time for custom video segment
function setStartTime() {
    const timelineScrubber = document.getElementById('timelineScrubber');
    if (!timelineScrubber) return;
    
    customStartTime = parseFloat(timelineScrubber.value);
    updateTimeDisplay('startTimeDisplay', customStartTime);
    updateSegmentDuration();
    
    console.log('Start time set to:', customStartTime);
}

// Set end time for custom video segment
function setEndTime() {
    const timelineScrubber = document.getElementById('timelineScrubber');
    if (!timelineScrubber) return;
    
    customEndTime = parseFloat(timelineScrubber.value);
    
    // Ensure end time is after start time
    if (customEndTime <= customStartTime) {
        customEndTime = customStartTime + 5; // Default 5 second segment
    }
    
    updateTimeDisplay('endTimeDisplay', customEndTime);
    updateSegmentDuration();
    
    console.log('End time set to:', customEndTime);
}

// Update segment duration display
function updateSegmentDuration() {
    const durationElement = document.getElementById('segmentDuration');
    if (!durationElement) return;
    
    const duration = Math.max(0, customEndTime - customStartTime);
    durationElement.textContent = `${duration.toFixed(1)}s`;
}

// Create custom video slide
function createVideoSlide() {
    try {
        if (customEndTime <= customStartTime) {
            alert('Please set both start and end times, with end time after start time.');
            return;
        }
        
        if (customEndTime - customStartTime < 1) {
            alert('Video segment must be at least 1 second long.');
            return;
        }
        
        // Create video segment object
        const customSegment = {
            type: 'video',
            startTime: customStartTime,
            endTime: customEndTime,
            duration: customEndTime - customStartTime,
            title: `Custom Video ${slides.length + 1}`,
            originalSegment: `custom-${customStartTime}s-${customEndTime}s`,
            campaignName: 'Custom'
        };
        
        console.log('Creating custom video slide:', customSegment);
        
        // Create slide
        const slideIndex = slides.length;
        createSlideFromSegment(customSegment, slideIndex);
        
        // Update UI
        updateSlideList();
        updateNavigation();
        
        // Switch to new slide
        currentSlideIndex = slides.length - 1;
        showSlide(currentSlideIndex);
        
        // Reset times for next creation
        customStartTime = 0;
        customEndTime = 0;
        updateTimeDisplay('startTimeDisplay', 0);
        updateTimeDisplay('endTimeDisplay', 0);
        updateSegmentDuration();
        
        alert('Video slide created successfully!');
        
    } catch (error) {
        console.error('Error creating video slide:', error);
        alert('Error creating video slide. Please try again.');
    }
}

// Create custom image slide
function createImageSlide() {
    try {
        const timelineScrubber = document.getElementById('timelineScrubber');
        if (!timelineScrubber) return;
        
        const currentTime = parseFloat(timelineScrubber.value);
        
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
        
        alert('Image slide created successfully!');
        
    } catch (error) {
        console.error('Error creating image slide:', error);
        alert('Error creating image slide. Please try again.');
    }
}

// New helper function:
function createCoverSlide(imageUrl, isFront) {
    const slideId = `cover-slide-${isFront ? 'front' : 'back'}-${Date.now()}`;
    const slide = {
        id: slideId,
        chartType: 'cover',
        theme: 'custom',
        backgroundImage: null,
        title: isFront ? 'Front Cover' : 'Back Cover',
        customTextColor: null,
        isVideoSlide: false,
        isFrontCover: isFront,
        isBackCover: !isFront,
        imageUrl: imageUrl
    };

    slides.push(slide);

    // Create slide element
    const slideElement = document.createElement('div');
    slideElement.className = 'slide cover-slide';
    slideElement.id = slideId;
    slideElement.innerHTML = `
        <div class="slide-content">
            <h2 class="slide-title">${slide.title}</h2>
            <div class="cover-image-container">
                <img src="${imageUrl}" alt="${slide.title}" style="max-width: 100%; max-height: 80vh; border-radius: 12px;"/>
            </div>
        </div>
    `;

    // Add to slide container
    const slideContainer = document.getElementById('slideContainer');
    if (slideContainer) {
        slideContainer.appendChild(slideElement);
    }
}

function getDeckSlideCountWithoutCovers() {
    return slides.filter(slide => !slide.isFrontCover && !slide.isBackCover).length;
}

const count = getDeckSlideCountWithoutCovers();
console.log('Slides (excluding covers):', count);