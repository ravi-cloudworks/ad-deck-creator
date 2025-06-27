// Text Import Module
// Standalone module that integrates with existing slide system

// Global variables for text import
let parsedTextContent = [];
let textImportModal = null;
let customTitleColor = null;

// Make functions globally available immediately
window.setBrandTitleColor = function(color) { 
    console.log('🎨 Setting brand title color (early):', color);
    customTitleColor = color;
    if (typeof updateAllTitleColors === 'function') {
        updateAllTitleColors();
    }
};

window.openTitleColorPicker = function() {
    console.log('🎨 Opening title color picker...');
    // Simple fallback until full function loads
    if (typeof openTextColorPicker === 'function') {
        openTextColorPicker();
    }
};

window.updateAllTitleColors = function() {
    console.log('🎨 Updating all title colors...');
    const color = customTitleColor || '#333333';
    document.querySelectorAll('.slide-title').forEach(titleElement => {
        titleElement.style.color = color;
    });
};

// Initialize text import system
function initTextImport() {
    console.log('🔤 Initializing Text Import Module');
    
    // Add modal HTML to page if not exists
    if (!document.getElementById('textImportModal')) {
        console.error('Text Import Modal HTML not found. Please add the modal HTML to your page.');
        return;
    }
    
    // Get modal reference
    textImportModal = document.getElementById('textImportModal');
    
    // Setup textarea listeners
    setupTextAreaListeners();
    
    console.log('✅ Text Import Module initialized');
}

// Open text import modal
function openTextImportModal() {
    try {
        console.log('📝 Opening Text Import Modal');
        
        if (!textImportModal) {
            console.error('Text Import Modal not initialized');
            return;
        }
        
        // Show modal
        textImportModal.style.display = 'flex';
        
        // Focus textarea after animation
        setTimeout(() => {
            const textarea = document.getElementById('textImportArea');
            if (textarea) {
                textarea.focus();
                
                // Load current slide titles if any
                loadCurrentSlideContent();
            }
        }, 100);
        
        console.log('✅ Text Import Modal opened');
        
    } catch (error) {
        console.error('❌ Error opening text import modal:', error);
    }
}

// Close text import modal
function closeTextImportModal() {
    try {
        if (textImportModal) {
            textImportModal.style.display = 'none';
            
            // Clear content
            const textarea = document.getElementById('textImportArea');
            const previewContainer = document.getElementById('previewContainer');
            const applyBtn = document.getElementById('applyTextBtn');
            
            if (textarea) textarea.value = '';
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <div class="preview-placeholder">
                        <i class="ph ph-arrow-left"></i>
                        Paste content to see preview
                    </div>
                `;
            }
            if (applyBtn) applyBtn.disabled = true;
        }
        
        console.log('✅ Text Import Modal closed');
        
    } catch (error) {
        console.error('❌ Error closing text import modal:', error);
    }
}

// Setup textarea event listeners
function setupTextAreaListeners() {
    const textarea = document.getElementById('textImportArea');
    const textareaContainer = textarea?.parentElement;
    
    if (!textarea) return;
    
    // Auto-resize and parse on input
    textarea.addEventListener('input', function() {
        handleTextInput(this.value);
        updateTextareaState(this);
    });
    
    // Paste detection for Safari
    textarea.addEventListener('paste', function(e) {
        console.log('📋 Paste detected');
        
        // Small delay to let paste content appear
        setTimeout(() => {
            handleTextInput(this.value);
            updateTextareaState(this);
        }, 50);
    });
    
    // Focus events
    textarea.addEventListener('focus', function() {
        updateTextareaState(this);
    });
    
    textarea.addEventListener('blur', function() {
        updateTextareaState(this);
    });
}

// Update textarea visual state
function updateTextareaState(textarea) {
    const container = textarea.parentElement;
    
    if (textarea.value.trim()) {
        container.classList.add('has-content');
    } else {
        container.classList.remove('has-content');
    }
}

// Handle text input and parsing
function handleTextInput(content) {
    try {
        if (!content.trim()) {
            clearPreview();
            return;
        }
        
        console.log('🔍 Parsing text content...');
        
        // Parse the content
        parsedTextContent = parseTextContent(content);
        
        console.log('📋 Parsed content:', parsedTextContent);
        
        // Update preview
        updatePreview(parsedTextContent);
        
        // Enable/disable apply button
        const applyBtn = document.getElementById('applyTextBtn');
        if (applyBtn) {
            applyBtn.disabled = parsedTextContent.length === 0;
        }
        
    } catch (error) {
        console.error('❌ Error handling text input:', error);
        showErrorPreview('Error parsing content. Please check format.');
    }
}

// Parse text content with -- separators
function parseTextContent(content) {
    try {
        // Split by -- separator
        const sections = content.split('--').map(section => section.trim()).filter(section => section);
        
        const parsed = [];
        
        sections.forEach((section, index) => {
            if (!section) return;
            
            const lines = section.split('\n').map(line => line.trim()).filter(line => line);
            
            if (lines.length === 0) return;
            
            const slideData = {
                index: index,
                title: '',
                bullets: [],
                overlay: ''
            };
            
            // Process each line
            lines.forEach(line => {
                if (line.startsWith('•') || line.startsWith('*') || line.startsWith('-')) {
                    // Bullet point
                    const bulletText = line.replace(/^[•*-]\s*/, '').trim();
                    if (bulletText) {
                        slideData.bullets.push(bulletText);
                    }
                } else if (line.toUpperCase().startsWith('TEXT_OVERLAY:')) {
                    // Text overlay
                    slideData.overlay = line.replace(/^TEXT_OVERLAY:\s*/i, '').trim();
                } else if (!slideData.title && line) {
                    // First non-bullet, non-overlay line is the title
                    slideData.title = line;
                }
            });
            
            // Only add if we have at least a title
            if (slideData.title || slideData.bullets.length > 0 || slideData.overlay) {
                parsed.push(slideData);
            }
        });
        
        return parsed;
        
    } catch (error) {
        console.error('Error parsing text content:', error);
        return [];
    }
}

// Update preview display
function updatePreview(parsedData) {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return;
    
    if (parsedData.length === 0) {
        clearPreview();
        return;
    }
    
    let previewHTML = '';
    
    parsedData.forEach((slideData, index) => {
        previewHTML += `
            <div class="preview-item">
                <div class="preview-slide-number">
                    <i class="ph ph-presentation"></i>
                    Slide ${index + 1}
                </div>
                
                ${slideData.title ? `
                    <div class="preview-title">${escapeHtml(slideData.title)}</div>
                ` : ''}
                
                ${slideData.bullets.length > 0 ? `
                    <ul class="preview-bullets">
                        ${slideData.bullets.map(bullet => `
                            <li>${escapeHtml(bullet)}</li>
                        `).join('')}
                    </ul>
                ` : ''}
                
                ${slideData.overlay ? `
                    <div class="preview-overlay">${escapeHtml(slideData.overlay)}</div>
                ` : ''}
            </div>
        `;
    });
    
    previewContainer.innerHTML = previewHTML;
}

// Clear preview
function clearPreview() {
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) {
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <i class="ph ph-arrow-left"></i>
                Paste content to see preview
            </div>
        `;
    }
}

// Show error in preview
function showErrorPreview(message) {
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) {
        previewContainer.innerHTML = `
            <div class="preview-placeholder" style="color: #dc3545;">
                <i class="ph ph-warning"></i>
                ${escapeHtml(message)}
            </div>
        `;
    }
}

// Load current slide content into textarea
function loadCurrentSlideContent() {
    try {
        if (typeof slides === 'undefined' || !slides.length) {
            console.log('No slides to load content from');
            return;
        }
        
        const textarea = document.getElementById('textImportArea');
        if (!textarea || textarea.value.trim()) {
            // Don't overwrite if user already has content
            return;
        }
        
        let content = '';
        
        slides.forEach((slide, index) => {
            // Skip cover slides
            if (slide.isCoverSlide) return;
            
            // Add slide title
            content += slide.title || `Slide ${index + 1}`;
            
            // Add any existing text content
            if (slide.textContent) {
                content += '\n' + slide.textContent;
            }
            
            // Add separator for next slide
            if (index < slides.length - 1) {
                content += '\n--\n';
            }
        });
        
        if (content.trim()) {
            textarea.value = content;
            handleTextInput(content);
            updateTextareaState(textarea);
        }
        
    } catch (error) {
        console.error('Error loading current slide content:', error);
    }
}

// Apply parsed text to slides
function applyTextToSlides() {
    try {
        console.log('✅ Applying text to slides...');
        
        if (!parsedTextContent.length) {
            console.warn('No parsed content to apply');
            return;
        }
        
        if (typeof slides === 'undefined') {
            console.error('Slides array not available');
            return;
        }
        
        // Filter out cover slides for text application
        const editableSlides = slides.filter(slide => !slide.isCoverSlide);
        
        // Apply text content to slides
        parsedTextContent.forEach((textData, index) => {
            if (index < editableSlides.length) {
                const slide = editableSlides[index];
                
                // Apply title
                if (textData.title) {
                    slide.title = textData.title;
                    console.log(`Updated slide ${index + 1} title to:`, textData.title);
                    
                    // Update chart title if it's a chart slide
                    if (!slide.isVideoSlide && slide.chartType && typeof sampleData !== 'undefined') {
                        const chartType = slide.chartType;
                        if (sampleData[chartType]) {
                            sampleData[chartType].title = textData.title;
                            console.log(`Updated chart data title for ${chartType} to:`, textData.title);
                        }
                    }
                    
                    // Update slide title in DOM for video/image slides
                    const slideElement = document.getElementById(slide.id);
                    if (slideElement) {
                        const titleElement = slideElement.querySelector('.slide-title');
                        if (titleElement) {
                            titleElement.textContent = textData.title;
                            titleElement.style.display = 'block'; // Make sure title is visible
                            
                            // Apply dynamic title color
                            if (typeof getCurrentTextColor === 'function') {
                                const autoTitleColor = document.getElementById('autoTitleColor');
                                const isAutoMode = autoTitleColor && autoTitleColor.checked;
                                
                                let titleColor;
                                if (isAutoMode) {
                                    titleColor = getCurrentTextColor();
                                } else {
                                    titleColor = customTitleColor || '#333333';
                                }
                                
                                titleElement.style.color = titleColor;
                                console.log(`Applied title color ${titleColor} to slide title`);
                            }
                            
                            console.log(`Updated DOM title element for slide ${slide.id}`);
                        }
                    }
                }
                
                // Store bullet points and overlay for future use
                if (textData.bullets.length > 0) {
                    slide.bulletPoints = textData.bullets;
                    console.log(`Added ${textData.bullets.length} bullet points to slide ${index + 1}`);
                }
                
                if (textData.overlay) {
                    slide.textOverlay = textData.overlay;
                    console.log(`Added text overlay to slide ${index + 1}:`, textData.overlay);
                }
            }
        });
        
        // Force refresh current slide display
        if (typeof showSlide === 'function' && typeof currentSlideIndex !== 'undefined') {
            console.log('Refreshing current slide display...');
            showSlide(currentSlideIndex);
        }
        
        // Refresh UI components
        if (typeof updateSlideList === 'function') {
            updateSlideList();
            console.log('Updated slide list');
        }
        
        if (typeof updateChart === 'function') {
            updateChart();
            console.log('Updated chart');
        }
        
        // Close modal
        closeTextImportModal();
        
        // Show success message
        const appliedCount = Math.min(parsedTextContent.length, editableSlides.length);
        showSuccessMessage(`Applied content to ${appliedCount} slides`);
        
        console.log('✅ Text applied to slides successfully');
        
    } catch (error) {
        console.error('❌ Error applying text to slides:', error);
        showErrorMessage('Error applying content to slides. Please try again.');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show success message
function showSuccessMessage(message) {
    // Reuse existing alert system if available
    if (typeof showshowAlert === 'function') {
        showshowAlert(message);
    } else {
        console.log('✅ Success:', message);
    }
}

// Show error message
function showErrorMessage(message) {
    // Reuse existing alert system if available
    if (typeof showshowAlert === 'function') {
        showshowAlert(message);
    } else {
        console.error('❌ Error:', message);
    }
}

// Override existing applySelectedColor to handle title colors
if (typeof window.originalApplySelectedColor === 'undefined') {
    window.originalApplySelectedColor = window.applySelectedColor;
    
    window.applySelectedColor = function() {
        try {
            const colorPicker = document.getElementById('touchColorPicker');
            if (!colorPicker) return;

            const color = colorPicker.value;
            
            if (currentColorPickerIndex === -2) {
                // This is for title color
                setBrandTitleColor(color);
                closeColorPicker();
            } else {
                // Use original function for other colors
                window.originalApplySelectedColor();
            }
            
        } catch (error) {
            console.error('❌ Error in extended applySelectedColor:', error);
            // Fallback to original
            if (window.originalApplySelectedColor) {
                window.originalApplySelectedColor();
            }
        }
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for other modules to initialize first
    setTimeout(initTextImport, 1000);
});