// Global Variables
let slides = [];
let currentSlideIndex = 0;
let chartInstance = null;
let globalBackgroundImage = null;
let currentColorPickerIndex = -1;
let isCustomizeMode = false;

// ECharts theme color palettes (simplified to just custom)
const themeColors = {
    custom: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
};
// Sample data for different chart types
const sampleData = {
    bar: {
        title: 'Monthly Sales Data',
        xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
            { name: 'Sales', data: [120, 200, 150, 80, 70, 110] }
        ]
    },
    line: {
        title: 'Website Traffic Trends',
        xAxis: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        series: [
            { name: 'Visitors', data: [820, 932, 901, 934, 1290, 1330] },
            { name: 'Page Views', data: [1200, 1500, 1800, 1600, 2100, 2200] }
        ]
    },
    stack: {
        title: 'Product Categories Performance',
        xAxis: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [
            { name: 'Electronics', data: [320, 332, 301, 334], stack: 'total' },
            { name: 'Clothing', data: [120, 132, 101, 134], stack: 'total' },
            { name: 'Books', data: [220, 182, 191, 234], stack: 'total' },
            { name: 'Home', data: [150, 212, 201, 154], stack: 'total' }
        ]
    }
};

// Initialize the presentation
function init() {
    console.log('\n🏁 STARTING main init()');
    
    // Wait for DOM to be fully ready
    setTimeout(() => {
        console.log('🔧 Starting main initialization');
        try {
            // Check if we have a video_url parameter
            const urlParams = new URLSearchParams(window.location.search);
            const hasVideoUrl = urlParams.get('video_url');
            
            console.log('URL check in main init:', {
                hasVideoUrl: !!hasVideoUrl,
                videoUrl: hasVideoUrl
            });
            
            // ALWAYS create the default chart slide first
            console.log('📊 Creating default chart slide (always)');
            addSlide();
            updateSlideList();
            updateNavigation();
            console.log('✅ Default chart slide created');
            
            if (hasVideoUrl) {
                console.log('🎬 Video URL found, video slides will be added to existing chart slide');
            } else {
                console.log('📊 No video URL found, only chart slide will be available');
            }
            
            // Add event listeners for iPad interface (with safety checks)
            const bgUpload = document.getElementById('bgUpload');
            if (bgUpload) {
                bgUpload.addEventListener('change', handleBackgroundUpload);
            }
            
            const autoTextColor = document.getElementById('autoTextColor');
            if (autoTextColor) {
                autoTextColor.addEventListener('change', function() {
                    const manualBtn = document.getElementById('manualTextBtn');
                    if (manualBtn) {
                        manualBtn.disabled = this.checked;
                    }
                    updateChart();
                });
            }
            
            // Setup drag and drop for slide container
            setupDragAndDrop();
            console.log('✅ Main initialization complete');
            
            // Debug slide state after main init
            setTimeout(() => {
                debugSlideState('AFTER main init completion');
            }, 50);
            
        } catch (error) {
            console.error('❌ Error during main initialization:', error);
        }
    }, 200);
}

function getCurrentSlideColors() {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) {
        return themeColors.custom;
    }
    
    // If slide doesn't have its own colors, initialize them
    if (!currentSlide.colors) {
        currentSlide.colors = [...themeColors.custom]; // Create a copy
        console.log('Initialized colors for slide:', currentSlide.title);
    }
    
    return currentSlide.colors;
}

// Toggle customize mode
function toggleCustomizeMode() {
    // Check if current slide is a cover slide
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide && currentSlide.isCoverSlide && !isCustomizeMode) {
        console.log('Customize disabled for cover slides');
        return; // Don't allow customize mode for cover slides
    }
    
    isCustomizeMode = !isCustomizeMode;
    const slideContainer = document.getElementById('slideContainer');
    const controlPanel = document.getElementById('controlPanel');
    const customizeBtn = document.getElementById('customizeBtn');
    
    if (slideContainer && controlPanel && customizeBtn) {
        if (isCustomizeMode) {
            slideContainer.classList.add('customize-mode');
            controlPanel.classList.add('open');
            customizeBtn.innerHTML = '← Back';
        } else {
            slideContainer.classList.remove('customize-mode');
            controlPanel.classList.remove('open');
            customizeBtn.innerHTML = '⚙️ Customize';
        }
        
        // Trigger chart resize after animation
        setTimeout(() => {
            if (chartInstance) {
                chartInstance.resize();
            }
        }, 400);
    }
}

// Chart type selection for touch interface
function selectChartType(type) {
    try {
        // Update active button
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-type="${type}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update slide data and chart
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].chartType = type;
            updateChart();
            generateDataSliders(); // Generate sliders for new chart type
        }
    } catch (error) {
        console.error('Error in selectChartType:', error);
    }
}

// Function to calculate optimal text color
function getOptimalTextColor(backgroundImage) {
    if (!backgroundImage) {
        return '#333333';
    }
    return '#ffffff';
}

// Function to get current text color based on settings
function getCurrentTextColor() {
    try {
        const autoDetect = document.getElementById('autoTextColor');
        if (autoDetect && autoDetect.checked) {
            return getOptimalTextColor(globalBackgroundImage);
        } else {
            return slides[currentSlideIndex]?.customTextColor || '#333333';
        }
    } catch (error) {
        console.error('Error getting text color:', error);
        return '#333333';
    }
}

// Touch-friendly color picker
function openTouchColorPicker(colorIndex) {
    try {
        currentColorPickerIndex = colorIndex;
        const modal = document.getElementById('colorPickerModal');
        const colorPicker = document.getElementById('touchColorPicker');
        
        if (modal && colorPicker) {
            colorPicker.value = themeColors.custom[colorIndex];
            modal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error opening color picker:', error);
    }
}

function selectPresetColor(color) {
    try {
        const colorPicker = document.getElementById('touchColorPicker');
        if (colorPicker) {
            colorPicker.value = color;
        }
    } catch (error) {
        console.error('Error selecting preset color:', error);
    }
}

function applySelectedColor() {
    try {
        const colorPicker = document.getElementById('touchColorPicker');
        if (!colorPicker) return;
        
        const color = colorPicker.value;
        const currentSlide = slides[currentSlideIndex];
        
        if (!currentSlide) {
            console.warn('No current slide found for color application');
            return;
        }
        
        if (currentColorPickerIndex === -1) {
            // This is for text color
            currentSlide.customTextColor = color;
            updateChart();
        } else if (currentColorPickerIndex >= 0) {
            // This is for theme colors
            const slideColors = getCurrentSlideColors(); // This will initialize if needed
            
            // Update the specific color for this slide only
            slideColors[currentColorPickerIndex] = color;
            
            // Update the color dot display
            const colorDot = document.getElementById(`custom-color-${currentColorPickerIndex + 1}`);
            if (colorDot) {
                colorDot.style.background = color;
            }
            
            // Update the chart with the new colors
            updateChart();
            
            console.log(`Updated color ${currentColorPickerIndex} to ${color} for slide:`, currentSlide.title);
        }
        
        closeColorPicker();
    } catch (error) {
        console.error('Error applying color:', error);
    }
}

function closeColorPicker() {
    try {
        const modal = document.getElementById('colorPickerModal');
        if (modal) {
            modal.style.display = 'none';
            
            // Reset modal title back to default
            const modalTitle = modal.querySelector('h3');
            if (modalTitle) {
                modalTitle.textContent = 'Choose Color';
            }
            
            // Reset color picker index
            currentColorPickerIndex = -1;
        }
    } catch (error) {
        console.error('Error closing color picker:', error);
    }
}

function openTextColorPicker() {
    try {
        // Use the same touch-friendly modal approach as the theme colors
        currentColorPickerIndex = -1; // Special flag for text color
        const modal = document.getElementById('colorPickerModal');
        const colorPicker = document.getElementById('touchColorPicker');
        
        if (modal && colorPicker) {
            // Set current text color or default
            const currentTextColor = slides[currentSlideIndex]?.customTextColor || '#333333';
            colorPicker.value = currentTextColor;
            modal.style.display = 'flex';
            
            // Update the modal title for text color
            const modalTitle = modal.querySelector('h3');
            if (modalTitle) {
                modalTitle.textContent = 'Choose Text Color';
            }
        }
    } catch (error) {
        console.error('Error opening text color picker:', error);
    }
}

function addChartSlide() {
    try {
        console.log('\n➕ STARTING addChartSlide()');
        debugSlideState('BEFORE adding chart slide');
        
        const slideId = `slide-${Date.now()}`;
        const slide = {
            id: slideId,
            chartType: 'bar',
            theme: 'custom',
            backgroundImage: globalBackgroundImage,
            title: `Chart Slide ${slides.length + 1}`,
            customTextColor: null,
            colors: [...themeColors.custom]
        };
        
        // Find if there's a back cover slide
        const backCoverIndex = slides.findIndex(s => s.isCoverSlide && s.coverPosition === 'back');
        
        let insertIndex;
        if (backCoverIndex !== -1) {
            // Insert before back cover
            insertIndex = backCoverIndex;
            slides.splice(backCoverIndex, 0, slide);
            console.log('📊 Chart slide inserted before back cover at index:', insertIndex);
        } else {
            // No back cover, add at end
            insertIndex = slides.length;
            slides.push(slide);
            console.log('📊 Chart slide added at end, index:', insertIndex);
        }
        
        console.log('📊 Chart slide data created:', slide);
        
        // Create slide element
        const slideElement = document.createElement('div');
        slideElement.className = 'slide';
        slideElement.id = slideId;
        slideElement.innerHTML = `
            <div class="slide-content">
                <h2 class="slide-title">${slide.title}</h2>
                <div class="chart-container">
                    <div id="chart-${slideId}" style="width: 100%; height: 100%;"></div>
                </div>
            </div>
        `;
        
        // Apply global background if exists
        if (globalBackgroundImage) {
            slideElement.style.backgroundImage = `url(${globalBackgroundImage})`;
            slideElement.style.backgroundSize = 'cover';
            slideElement.style.backgroundPosition = 'center';
            slideElement.style.backgroundRepeat = 'no-repeat';
        }
        
        const slideContainer = document.getElementById('slideContainer');
        if (slideContainer) {
            // Insert at the correct DOM position
            if (backCoverIndex !== -1) {
                // Insert before back cover slide in DOM
                const backCoverElement = document.getElementById(slides[backCoverIndex + 1].id);
                slideContainer.insertBefore(slideElement, backCoverElement);
            } else {
                // Add at end
                slideContainer.appendChild(slideElement);
            }
            
            console.log('📊 Chart slide element added to DOM at correct position');
            
            // Switch to new slide
            currentSlideIndex = insertIndex;
            console.log('📊 Current slide index set to:', currentSlideIndex);
            
            // Use setTimeout to ensure DOM is updated
            setTimeout(() => {
                console.log('📊 Calling showSlide from addChartSlide');
                showSlide(currentSlideIndex);
                updateSlideList();
                updateNavigation();
                updateChart();
                
                debugSlideState('AFTER adding chart slide');
            }, 100);
        } else {
            console.error('❌ Slide container not found');
            // Remove from slides array if DOM insertion failed
            if (backCoverIndex !== -1) {
                slides.splice(insertIndex, 1);
            } else {
                slides.pop();
            }
        }
        
        console.log('✅ COMPLETED addChartSlide()');
        
    } catch (error) {
        console.error('❌ Error in addChartSlide:', error);
    }
}

function addVideoSlide() {
    try {
        console.log('\n🎬 STARTING addVideoSlide()');
        
        // Check if video is loaded
        if (!masterVideoElement || !masterVideoElement.duration) {
            showshowAlert('Please load a video first to create video slides.');
            return;
        }
        
        // Create default video segment (first 5 seconds)
        const defaultSegment = {
            type: 'video',
            startTime: 0,
            endTime: Math.min(5, masterVideoElement.duration),
            duration: Math.min(5, masterVideoElement.duration),
            title: `Custom Video ${slides.length + 1}`,
            originalSegment: `custom-0s-${Math.min(5, masterVideoElement.duration)}s`,
            campaignName: 'Custom'
        };
        
        console.log('Creating video slide with default segment:', defaultSegment);
        
        // Find insertion position (before back cover if exists)
        const backCoverIndex = slides.findIndex(s => s.isCoverSlide && s.coverPosition === 'back');
        let insertIndex = backCoverIndex !== -1 ? backCoverIndex : slides.length;
        
        // Create the slide using existing function
        createSlideFromSegmentFixed(defaultSegment, insertIndex);
        
        // Update UI
        updateSlideList();
        updateNavigation();
        
        // Switch to new slide
        currentSlideIndex = insertIndex;
        showSlide(currentSlideIndex);
        
        // Switch to customize mode and video tab
        setTimeout(() => {
            toggleCustomizeMode(); // Open customize panel
            switchTab('video'); // Switch to video tab
        }, 200);
        
        console.log('✅ Video slide created and customize panel opened');
        
    } catch (error) {
        console.error('❌ Error in addVideoSlide:', error);
    }
}

function addImageSlide() {
    try {
        console.log('\n🖼️ STARTING addImageSlide()');
        
        // Check if video is loaded
        if (!masterVideoElement || !masterVideoElement.duration) {
            showshowAlert('Please load a video first to create image slides.');
            return;
        }
        
        // Create default image segment (at 0 seconds)
        const defaultSegment = {
            type: 'image',
            time: 0,
            title: `Custom Image ${slides.length + 1}`,
            originalSegment: `custom-img-0s`,
            campaignName: 'Custom'
        };
        
        console.log('Creating image slide with default segment:', defaultSegment);
        
        // Find insertion position (before back cover if exists)
        const backCoverIndex = slides.findIndex(s => s.isCoverSlide && s.coverPosition === 'back');
        let insertIndex = backCoverIndex !== -1 ? backCoverIndex : slides.length;
        
        // Create the slide using existing function
        createSlideFromSegmentFixed(defaultSegment, insertIndex);
        
        // Update UI
        updateSlideList();
        updateNavigation();
        
        // Switch to new slide
        currentSlideIndex = insertIndex;
        showSlide(currentSlideIndex);
        
        // Switch to customize mode and video tab
        setTimeout(() => {
            toggleCustomizeMode(); // Open customize panel
            switchTab('video'); // Switch to video tab
        }, 200);
        
        console.log('✅ Image slide created and customize panel opened');
        
    } catch (error) {
        console.error('❌ Error in addImageSlide:', error);
    }
}

function addSlide() {
    addChartSlide();
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

function deleteSlide() {
    try {
        if (slides.length <= 1) {
            showAlert('Cannot delete the last slide!');
            return;
        }
        
        const slideToRemove = document.getElementById(slides[currentSlideIndex].id);
        if (slideToRemove) {
            slideToRemove.remove();
        }
        
        slides.splice(currentSlideIndex, 1);
        
        if (currentSlideIndex >= slides.length) {
            currentSlideIndex = slides.length - 1;
        }
        
        showSlide(currentSlideIndex);
        updateSlideList();
        updateNavigation();
    } catch (error) {
        console.error('Error in deleteSlide:', error);
    }
}

function showSlide(index) {
    try {
        console.log('showSlide called with index:', index);

        // Handle customize button visibility for cover slides
        const customizeBtn = document.getElementById('customizeBtn');
        const slideToShow = slides[index];
        if (customizeBtn && slideToShow) {
            if (slideToShow.isCoverSlide) {
                // FIXED: Auto-close customize panel if open when navigating to cover slide
                if (isCustomizeMode) {
                    console.log('Auto-closing customize panel for cover slide');
                    toggleCustomizeMode(); // Close the panel
                }
                customizeBtn.style.visibility = 'hidden';
            } else {
                customizeBtn.style.visibility = 'visible';
            }
        }
        
        // Validate index and slides array
        if (index < 0 || index >= slides.length || !slides[index]) {
            console.error('Invalid slide index or slide not found:', index);
            return;
        }
        
        // Hide all slides
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Show current slide
        const currentSlide = slides[index];
        console.log('Current slide:', currentSlide);
        
        const slideElement = document.getElementById(currentSlide.id);
        if (slideElement) {
            slideElement.classList.add('active');
            console.log('Slide element activated');
        } else {
            console.error('Slide element not found:', currentSlide.id);
        }
        
        // Update chart type buttons (only if they exist)
        const typeButtons = document.querySelectorAll('.type-btn');
        if (typeButtons.length > 0) {
            typeButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            const activeTypeBtn = document.querySelector(`[data-type="${currentSlide.chartType}"]`);
            if (activeTypeBtn) {
                activeTypeBtn.classList.add('active');
            }
        }
        
        // SAFER: Update color dots only for chart slides
        try {
            if (currentSlide && !currentSlide.isCoverSlide && !currentSlide.isVideoSlide) {
                const slideColors = getCurrentSlideColors();
                updateColorDots(slideColors);
            }
        } catch (colorError) {
            console.warn('Error updating color dots:', colorError);
            // Don't fail the entire function if color update fails
        }
        
        // Update counter (safely)
        const currentSlideSpan = document.getElementById('currentSlide');
        const totalSlidesSpan = document.getElementById('totalSlides');
        if (currentSlideSpan) {
            currentSlideSpan.textContent = index + 1;
        }
        if (totalSlidesSpan) {
            totalSlidesSpan.textContent = slides.length;
        }
        
        // Update tabs for current slide type (if tab system exists)
        if (typeof updateTabsForCurrentSlide === 'function') {
            updateTabsForCurrentSlide();
        }
        
        console.log('showSlide completed successfully');
        
        // Update chart and generate sliders
        updateChart();
        generateDataSliders();
    } catch (error) {
        console.error('Error in showSlide:', error);
    }
}

function updateColorDots(colors) {
    try {
        if (!colors || !Array.isArray(colors)) {
            console.warn('Invalid colors array, using default');
            colors = themeColors.custom;
        }
        
        for (let i = 0; i < 5; i++) {
            const colorDot = document.getElementById(`custom-color-${i + 1}`);
            if (colorDot && colors[i]) {
                colorDot.style.background = colors[i];
            }
        }
        console.log('Color dots updated successfully');
    } catch (error) {
        console.error('Error updating color dots:', error);
    }
}

function updateChart() {
    try {
        console.log('updateChart called');
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) {
            console.error('No current slide found');
            return;
        }
        
        // Skip chart update for non-chart slides
        if (currentSlide.isCoverSlide || currentSlide.isVideoSlide) {
            console.log('Skipping chart update for non-chart slide');
            return;
        }
        
        const chartType = currentSlide.chartType;
        const chartContainer = document.getElementById(`chart-${currentSlide.id}`);
        if (!chartContainer) {
            console.error('Chart container not found:', `chart-${currentSlide.id}`);
            return;
        }
        
        // Dispose previous chart instance
        if (chartInstance) {
            chartInstance.dispose();
        }
        
        // Create new chart
        chartInstance = echarts.init(chartContainer);
        
        const data = sampleData[chartType];
        const textColor = getCurrentTextColor();
        
        // SAFER: Get colors with fallback
        let slideColors;
        try {
            slideColors = getCurrentSlideColors();
        } catch (colorError) {
            console.warn('Error getting slide colors, using default:', colorError);
            slideColors = themeColors.custom;
        }
        
        let option = {};
        
        if (chartType === 'bar') {
            option = {
                backgroundColor: 'transparent',
                title: { 
                    text: data.title, 
                    left: 'center',
                    textStyle: { 
                        color: textColor,
                        fontWeight: 'bold',
                        fontSize: 24
                    }
                },
                tooltip: { trigger: 'axis' },
                legend: { 
                    top: 'bottom',
                    textStyle: { color: textColor, fontSize: 14 }
                },
                xAxis: {
                    type: 'category',
                    data: data.xAxis,
                    axisLabel: { color: textColor, fontSize: 12 },
                    axisLine: { lineStyle: { color: textColor } }
                },
                yAxis: { 
                    type: 'value',
                    axisLabel: { color: textColor, fontSize: 12 },
                    axisLine: { lineStyle: { color: textColor } },
                    splitLine: {
                        lineStyle: {
                            color: textColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                color: slideColors,
                series: [{
                    name: data.series[0].name,
                    type: 'bar',
                    data: data.series[0].data,
                    itemStyle: { borderRadius: [6, 6, 0, 0] }
                }]
            };
        } else if (chartType === 'line') {
            option = {
                backgroundColor: 'transparent',
                title: { 
                    text: data.title, 
                    left: 'center',
                    textStyle: { 
                        color: textColor,
                        fontWeight: 'bold',
                        fontSize: 24
                    }
                },
                tooltip: { trigger: 'axis' },
                legend: { 
                    top: 'bottom',
                    textStyle: { color: textColor, fontSize: 14 }
                },
                xAxis: {
                    type: 'category',
                    data: data.xAxis,
                    axisLabel: { color: textColor, fontSize: 12 },
                    axisLine: { lineStyle: { color: textColor } }
                },
                yAxis: { 
                    type: 'value',
                    axisLabel: { color: textColor, fontSize: 12 },
                    axisLine: { lineStyle: { color: textColor } },
                    splitLine: {
                        lineStyle: {
                            color: textColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                color: slideColors,
                series: data.series.map(s => ({
                    name: s.name,
                    type: 'line',
                    data: s.data,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: { width: 3 }
                }))
            };
        } else if (chartType === 'stack') {
            option = {
                backgroundColor: 'transparent',
                title: { 
                    text: data.title, 
                    left: 'center',
                    textStyle: { 
                        color: textColor,
                        fontWeight: 'bold',
                        fontSize: 24
                    }
                },
                tooltip: { trigger: 'axis' },
                legend: { 
                    top: 'bottom',
                    textStyle: { color: textColor, fontSize: 14 }
                },
                xAxis: {
                    type: 'category',
                    data: data.xAxis,
                    axisLabel: { color: textColor, fontSize: 12 },
                    axisLine: { lineStyle: { color: textColor } }
                },
                yAxis: { 
                    type: 'value',
                    axisLabel: { color: textColor, fontSize: 12 },
                    axisLine: { lineStyle: { color: textColor } },
                    splitLine: {
                        lineStyle: {
                            color: textColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                color: slideColors,
                series: data.series.map(s => ({
                    name: s.name,
                    type: 'bar',
                    stack: s.stack,
                    data: s.data,
                    itemStyle: { borderRadius: [2, 2, 2, 2] }
                }))
            };
        }
        
        chartInstance.setOption(option);
        console.log('Chart updated successfully with slide colors');
        
        // Handle resize for customize mode
        if (isCustomizeMode) {
            setTimeout(() => chartInstance.resize(), 100);
        }
    } catch (error) {
        console.error('Error in updateChart:', error);
    }
}

function handleBackgroundUpload(event) {
    try {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleBackgroundFile(file);
        }
    } catch (error) {
        console.error('Error handling background upload:', error);
    }
}

function handleBackgroundFile(file) {
    try {
        const reader = new FileReader();
        reader.onload = function(e) {
            globalBackgroundImage = e.target.result;
            
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
            
            updateSlideList();
            updateChart();
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error handling background file:', error);
    }
}

function removeBackground() {
    try {
        globalBackgroundImage = null;
        
        slides.forEach(slide => {
            // Skip cover slides - they keep their own backgrounds
            if (slide.isCoverSlide) {
                console.log('Skipping background removal for cover slide:', slide.title);
                return;
            }
            
            slide.backgroundImage = null;
            const slideElement = document.getElementById(slide.id);
            if (slideElement) {
                slideElement.style.backgroundImage = 'none';
            }
        });
        
        updateSlideList();
        updateChart();
    } catch (error) {
        console.error('Error removing background:', error);
    }
}

function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
        currentSlideIndex++;
        showSlide(currentSlideIndex);
        updateSlideList();
        updateNavigation();
    }
}

function previousSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        showSlide(currentSlideIndex);
        updateSlideList();
        updateNavigation();
    }
}

function updateNavigation() {
    try {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) prevBtn.disabled = currentSlideIndex === 0;
        if (nextBtn) nextBtn.disabled = currentSlideIndex === slides.length - 1;
    } catch (error) {
        console.error('Error updating navigation:', error);
    }
}

function updateSlideList() {
    try {
        const slideList = document.getElementById('slideList');
        if (!slideList) return;
        
        slideList.innerHTML = '';
        
        slides.forEach((slide, index) => {
            const slidePreview = document.createElement('div');
            
            // Add cover-slide class for styling
            const coverClass = slide.isCoverSlide ? ' cover-slide' : '';
            slidePreview.className = `slide-preview${coverClass} ${index === currentSlideIndex ? 'active' : ''}`;
            
            const bgStatus = slide.backgroundImage ? '🖼️' : '';
            
            // Determine slide type for display
            let slideTypeText = 'chart';
            if (slide.isCoverSlide) {
                slideTypeText = 'cover';
            } else if (slide.isVideoSlide) {
                slideTypeText = slide.chartType; // 'video' or 'image'
            }
            
            slidePreview.innerHTML = `
                <strong>${slide.title} ${bgStatus}</strong>
                <br>
                <small>${slideTypeText}</small>
                ${!slide.isCoverSlide ? `
                    <div class="slide-reorder-controls">
                        <button class="reorder-btn" 
                                onclick="moveSlideUp(${index})" 
                                ${!canMoveSlideUp(index) ? 'disabled' : ''}>⬆️</button>
                        <button class="reorder-btn" 
                                onclick="moveSlideDown(${index})" 
                                ${!canMoveSlideDown(index) ? 'disabled' : ''}>⬇️</button>
                    </div>
                ` : ''}
            `;
            
            slidePreview.onclick = (e) => {
                // Only switch slides if user didn't click on reorder buttons
                if (!e.target.classList.contains('reorder-btn')) {
                    currentSlideIndex = index;
                    showSlide(currentSlideIndex);
                    updateSlideList();
                    updateNavigation();
                }
            };
            
            slideList.appendChild(slidePreview);
        });
    } catch (error) {
        console.error('Error updating slide list:', error);
    }
}

function setupDragAndDrop() {
    try {
        const slideContainer = document.getElementById('slideContainer');
        if (!slideContainer) return;
        
        slideContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        slideContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                handleBackgroundFile(files[0]);
            }
        });
    } catch (error) {
        console.error('Error setting up drag and drop:', error);
    }
}

// Touch event handling for swipe gestures
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for a swipe
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe right - go to previous slide
            previousSlide();
        } else {
            // Swipe left - go to next slide
            nextSlide();
        }
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') previousSlide();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'Escape' && isCustomizeMode) toggleCustomizeMode();
});

// Generate data sliders based on current chart type
function generateDataSliders() {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;
    
    const dataContainer = document.getElementById('dataControls');
    if (!dataContainer) return;
    
    const chartType = currentSlide.chartType;
    const data = sampleData[chartType];
    
    dataContainer.innerHTML = '';
    
    // Show/hide series buttons based on chart type
    const seriesButtons = document.getElementById('seriesButtons');
    if (seriesButtons) {
        seriesButtons.style.display = (chartType === 'line' || chartType === 'stack') ? 'flex' : 'none';
    }
    
    if (chartType === 'bar') {
        // Single series bar chart
        data.xAxis.forEach((label, index) => {
            const value = data.series[0].data[index];
            dataContainer.innerHTML += `
                <div class="data-slider-item">
                    <div class="data-label">${label}</div>
                    <input type="range" class="data-slider" min="0" max="500" value="${value}" 
                           onchange="updateDataValue('bar', 0, ${index}, this.value)">
                    <div class="data-value" id="value-bar-0-${index}">${value}</div>
                </div>
            `;
        });
    } else if (chartType === 'line') {
        // Multi-series line chart
        data.series.forEach((series, seriesIndex) => {
            dataContainer.innerHTML += `<div style="margin-bottom: 20px;"><strong>${series.name}:</strong></div>`;
            data.xAxis.forEach((label, index) => {
                const value = series.data[index];
                dataContainer.innerHTML += `
                    <div class="data-slider-item">
                        <div class="data-label">${label}</div>
                        <input type="range" class="data-slider" min="0" max="3000" value="${value}" 
                               onchange="updateDataValue('line', ${seriesIndex}, ${index}, this.value)">
                        <div class="data-value" id="value-line-${seriesIndex}-${index}">${value}</div>
                    </div>
                `;
            });
        });
    } else if (chartType === 'stack') {
        // Stacked bar chart
        data.series.forEach((series, seriesIndex) => {
            dataContainer.innerHTML += `<div style="margin-bottom: 20px;"><strong>${series.name}:</strong></div>`;
            data.xAxis.forEach((label, index) => {
                const value = series.data[index];
                dataContainer.innerHTML += `
                    <div class="data-slider-item">
                        <div class="data-label">${label}</div>
                        <input type="range" class="data-slider" min="0" max="500" value="${value}" 
                               onchange="updateDataValue('stack', ${seriesIndex}, ${index}, this.value)">
                        <div class="data-value" id="value-stack-${seriesIndex}-${index}">${value}</div>
                    </div>
                `;
            });
        });
    }
}

// Add a new data point (time period)
function addDataPoint() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;
        
        const chartType = currentSlide.chartType;
        const data = sampleData[chartType];
        
        // Limit to max 12 data points
        if (data.xAxis.length >= 12) {
            showshowAlert('Maximum 12 time periods allowed');
            return;
        }
        
        // Generate new label based on chart type
        let newLabel;
        if (data.xAxis[0] && data.xAxis[0].includes('Q')) {
            // Quarterly data
            const nextQ = (data.xAxis.length % 4) + 1;
            newLabel = `Q${nextQ}`;
        } else if (data.xAxis[0] && data.xAxis[0].includes('Week')) {
            // Weekly data
            newLabel = `Week ${data.xAxis.length + 1}`;
        } else {
            // Monthly data (default)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            newLabel = months[data.xAxis.length % 12];
        }
        
        // Add new label
        data.xAxis.push(newLabel);
        
        // Add new data point to each series
        data.series.forEach(series => {
            const avgValue = series.data.reduce((a, b) => a + b, 0) / series.data.length;
            series.data.push(Math.round(avgValue));
        });
        
        updateChart();
        generateDataSliders();
    } catch (error) {
        console.error('Error adding data point:', error);
    }
}

// Remove a data point (time period)
function removeDataPoint() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;
        
        const chartType = currentSlide.chartType;
        const data = sampleData[chartType];
        
        // Minimum 2 data points
        if (data.xAxis.length <= 2) {
            showshowAlert('Minimum 2 time periods required');
            return;
        }
        
        // Remove last data point
        data.xAxis.pop();
        data.series.forEach(series => {
            series.data.pop();
        });
        
        updateChart();
        generateDataSliders(); // This already exists - good!
        
        // ADD THIS: Update button states
        updateDataManagementButtons();
    } catch (error) {
        console.error('Error removing data point:', error);
    }
}

// Add a new data series (for line and stack charts)
function addSeries() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;
        
        const chartType = currentSlide.chartType;
        const data = sampleData[chartType];
        
        // Limit to max 6 series
        if (data.series.length >= 6) {
            showshowAlert('Maximum 6 data series allowed');
            return;
        }
        
        // Generate new series name and data
        const seriesNames = {
            line: ['Traffic', 'Conversions', 'Bounces', 'Sessions', 'Users'],
            stack: ['Mobile', 'Desktop', 'Tablet', 'Smart TV', 'Others']
        };
        
        const newName = seriesNames[chartType][data.series.length - 1] || `Series ${data.series.length + 1}`;
        
        // Generate random data based on existing values
        const newData = data.xAxis.map(() => {
            const baseValue = chartType === 'line' ? 1000 : 200;
            return Math.round(baseValue + Math.random() * baseValue);
        });
        
        const newSeries = {
            name: newName,
            data: newData
        };
        
        if (chartType === 'stack') {
            newSeries.stack = 'total';
        }
        
        data.series.push(newSeries);
        
        updateChart();
        generateDataSliders();
        updateDataManagementButtons();
    } catch (error) {
        console.error('Error adding series:', error);
    }
}

// Remove a data series (for line and stack charts)
function removeSeries() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;
        
        const chartType = currentSlide.chartType;
        const data = sampleData[chartType];
        
        // Minimum 1 series
        if (data.series.length <= 1) {
            showshowAlert('Minimum 1 data series required');
            return;
        }
        
        // Remove last series
        data.series.pop();
        
        updateChart();
        generateDataSliders();
        updateDataManagementButtons();
    } catch (error) {
        console.error('Error removing series:', error);
    }
}

function updateDataManagementButtons() {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;
        
        const chartType = currentSlide.chartType;
        const data = sampleData[chartType];
        
        // Update period buttons
        const removeDataBtn = document.querySelector('.data-btn[onclick="removeDataPoint()"]');
        const addDataBtn = document.querySelector('.data-btn[onclick="addDataPoint()"]');
        
        if (removeDataBtn) {
            removeDataBtn.disabled = data.xAxis.length <= 2;
        }
        if (addDataBtn) {
            addDataBtn.disabled = data.xAxis.length >= 12;
        }
        
        // Update series buttons (for line and stack charts)
        if (chartType === 'line' || chartType === 'stack') {
            const removeSeriesBtn = document.querySelector('.data-btn[onclick="removeSeries()"]');
            const addSeriesBtn = document.querySelector('.data-btn[onclick="addSeries()"]');
            
            if (removeSeriesBtn) {
                removeSeriesBtn.disabled = data.series.length <= 1;
            }
            if (addSeriesBtn) {
                addSeriesBtn.disabled = data.series.length >= 6;
            }
        }
        
    } catch (error) {
        console.error('Error updating data management buttons:', error);
    }
}

// Update data value from slider
function updateDataValue(chartType, seriesIndex, dataIndex, newValue) {
    try {
        const value = parseInt(newValue);
        
        // ADD THIS: Validate indices exist
        const data = sampleData[chartType];
        if (!data.series[seriesIndex] || !data.series[seriesIndex].data[dataIndex] === undefined) {
            console.warn('Invalid data indices:', seriesIndex, dataIndex);
            return;
        }
        
        sampleData[chartType].series[seriesIndex].data[dataIndex] = value;
        
        // Update display value
        const valueDisplay = document.getElementById(`value-${chartType}-${seriesIndex}-${dataIndex}`);
        if (valueDisplay) {
            valueDisplay.textContent = value;
        }
        
        // Update chart
        updateChart();
    } catch (error) {
        console.error('Error updating data value:', error);
    }
}

// Set chart title
function setTitle(newTitle) {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;
        
        const chartType = currentSlide.chartType;
        sampleData[chartType].title = newTitle;
        
        // Update button appearance - safely check if event exists
        document.querySelectorAll('.title-templates .template-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Only try to access event.target if we're in a button click context
        try {
            if (window.event && window.event.target && window.event.target.classList) {
                window.event.target.classList.add('selected');
            }
        } catch (e) {
            // Ignore - this just means we're not in a button click context
        }
        
        // Immediately update chart
        updateChart();
    } catch (error) {
        console.error('Error setting title:', error);
    }
}

// Set series labels
function setSeriesLabels(labels) {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;
        
        const chartType = currentSlide.chartType;
        const data = sampleData[chartType];
        
        labels.forEach((label, index) => {
            if (data.series[index]) {
                data.series[index].name = label;
            }
        });
        
        // Update button appearance - safely handle event and capture target
        let targetElement = null;
        try {
            if (window.event && window.event.target && window.event.target.classList) {
                targetElement = window.event.target;
                targetElement.classList.add('selected');
            }
        } catch (e) {
            // Ignore - this just means we're not in a button click context
        }
        
        // Remove selected class after delay, but only if we captured a target
        if (targetElement) {
            setTimeout(() => {
                try {
                    targetElement.classList.remove('selected');
                } catch (e) {
                    // Ignore - element might not exist anymore
                }
            }, 1000);
        }
        
        updateChart();
        generateDataSliders(); // Refresh sliders with new labels
    } catch (error) {
        console.error('Error setting series labels:', error);
    }
}

// Set time period labels
function setTimeLabels(labels) {
    try {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return;
        
        const chartType = currentSlide.chartType;
        sampleData[chartType].xAxis = labels;
        
        // Update button appearance - safely handle event and capture target
        let targetElement = null;
        try {
            if (window.event && window.event.target && window.event.target.classList) {
                targetElement = window.event.target;
                targetElement.classList.add('selected');
            }
        } catch (e) {
            // Ignore - this just means we're not in a button click context
        }
        
        // Remove selected class after delay, but only if we captured a target
        if (targetElement) {
            setTimeout(() => {
                try {
                    targetElement.classList.remove('selected');
                } catch (e) {
                    // Ignore - element might not exist anymore
                }
            }, 1000);
        }
        
        updateChart();
        generateDataSliders(); // Refresh sliders with new labels
    } catch (error) {
        console.error('Error setting time labels:', error);
    }
}

// Voice input for titles (basic implementation)
function startVoiceInput(type) {
    try {
        const statusElement = document.getElementById(`${type}VoiceStatus`);
        
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            if (statusElement) statusElement.textContent = 'Listening...';
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                if (type === 'title') {
                    setTitle(transcript);
                }
                if (statusElement) statusElement.textContent = `Got: "${transcript}"`;
            };
            
            recognition.onerror = function(event) {
                if (statusElement) statusElement.textContent = 'Voice input failed';
            };
            
            recognition.onend = function() {
                setTimeout(() => {
                    if (statusElement) statusElement.textContent = '';
                }, 3000);
            };
            
            recognition.start();
        } else {
            if (statusElement) statusElement.textContent = 'Voice input not supported';
        }
    } catch (error) {
        console.error('Error with voice input:', error);
    }
}

// Slide Reorder Functions
// Add these to the END of script.js

function canMoveSlideUp(index) {
    // Check if there's a non-cover slide above this one
    if (slides[index].isCoverSlide) return false;
    
    for (let i = index - 1; i >= 0; i--) {
        if (!slides[i].isCoverSlide) return true;
    }
    return false;
}

function canMoveSlideDown(index) {
    // Check if there's a non-cover slide below this one
    if (slides[index].isCoverSlide) return false;
    
    for (let i = index + 1; i < slides.length; i++) {
        if (!slides[i].isCoverSlide) return true;
    }
    return false;
}

function moveSlideUp(index) {
    try {
        console.log('🔼 Moving slide up from index:', index);
        
        // Don't move cover slides
        if (slides[index].isCoverSlide) {
            console.log('Cannot move cover slide');
            return;
        }
        
        // Find the previous non-cover slide
        let targetIndex = -1;
        for (let i = index - 1; i >= 0; i--) {
            if (!slides[i].isCoverSlide) {
                targetIndex = i;
                break;
            }
        }
        
        if (targetIndex === -1) {
            console.log('Already at the top of moveable slides');
            return;
        }
        
        // Swap the slides
        swapSlides(index, targetIndex);
        
        console.log('✅ Moved slide up successfully');
        
    } catch (error) {
        console.error('❌ Error moving slide up:', error);
    }
}

function moveSlideDown(index) {
    try {
        console.log('🔽 Moving slide down from index:', index);
        
        // Don't move cover slides
        if (slides[index].isCoverSlide) {
            console.log('Cannot move cover slide');
            return;
        }
        
        // Find the next non-cover slide
        let targetIndex = -1;
        for (let i = index + 1; i < slides.length; i++) {
            if (!slides[i].isCoverSlide) {
                targetIndex = i;
                break;
            }
        }
        
        if (targetIndex === -1) {
            console.log('Already at the bottom of moveable slides');
            return;
        }
        
        // Swap the slides
        swapSlides(index, targetIndex);
        
        console.log('✅ Moved slide down successfully');
        
    } catch (error) {
        console.error('❌ Error moving slide down:', error);
    }
}

function swapSlides(index1, index2) {
    try {
        console.log('🔄 Swapping slides:', index1, '↔️', index2);
        
        // Remember current slide
        const wasCurrentSlide1 = (currentSlideIndex === index1);
        const wasCurrentSlide2 = (currentSlideIndex === index2);
        
        // Swap in slides array
        const temp = slides[index1];
        slides[index1] = slides[index2];
        slides[index2] = temp;
        
        // Update current slide index if needed
        if (wasCurrentSlide1) {
            currentSlideIndex = index2;
        } else if (wasCurrentSlide2) {
            currentSlideIndex = index1;
        }
        
        // Swap DOM elements
        const slideContainer = document.getElementById('slideContainer');
        const element1 = document.getElementById(slides[index1].id);
        const element2 = document.getElementById(slides[index2].id);
        
        if (element1 && element2 && slideContainer) {
            // Create temporary placeholder
            const placeholder = document.createElement('div');
            slideContainer.insertBefore(placeholder, element1);
            slideContainer.insertBefore(element1, element2);
            slideContainer.insertBefore(element2, placeholder);
            slideContainer.removeChild(placeholder);
        }
        
        // Refresh UI
        updateSlideList();
        updateNavigation();
        
        console.log('✅ Slide swap completed');
        
    } catch (error) {
        console.error('❌ Error swapping slides:', error);
    }
}

// Custom alert replacements for iOS WebView compatibility
function showshowAlert(message) {
    // Create simple toast notification
    const toast = document.createElement('div');
    toast.className = 'custom-alert';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showConfirm(message, callback) {
    // Create simple confirm dialog
    const modal = document.createElement('div');
    modal.className = 'custom-confirm';
    modal.innerHTML = `
        <div class="confirm-content">
            <p>${message}</p>
            <button onclick="confirmYes()">Yes</button>
            <button onclick="confirmNo()">No</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    window.confirmCallback = callback;
    window.confirmYes = () => { modal.remove(); callback(true); };
    window.confirmNo = () => { modal.remove(); callback(false); };
}

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', init);