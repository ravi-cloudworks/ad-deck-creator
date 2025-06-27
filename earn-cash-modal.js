// Global variables for pricing
let currentProducts = [];
let selectedProducts = new Set();
let pricingPerPage = 1;
let totalSlides = 0;
let presentationPages = 0;
let shareCodeQuantity = 1; // New variable for strategy codes quantity

// Product icon mapping
const productIcons = {
    'enable_video': 'ph-video',
    'enable_share_code': 'ph-code',
    'enable_mini_deck': 'ph-presentation'
};

// Initialize the modal with data from JSON
function initEarnCashModal(jsonData) {
    try {
        console.log('Initializing earn cash modal with data:', jsonData);

        // Extract data from JSON
        currentProducts = jsonData.products || [];
        pricingPerPage = jsonData.pricing_per_page_in_dollars || 1;

        // Calculate slide counts (assuming global slides array exists)
        if (typeof slides !== 'undefined') {
            totalSlides = slides.length;
            // Exclude cover slides from presentation pages
            presentationPages = slides.filter(slide => !slide.isCoverSlide).length;
        } else {
            totalSlides = 0;
            presentationPages = 0;
        }

        console.log('Slide counts:', { totalSlides, presentationPages });

        // Update slide statistics
        updateSlideStatistics();

        // Generate product cards
        generateProductCards();

        // Update pricing
        updatePricingDisplay();

        console.log('Earn cash modal initialized successfully');

    } catch (error) {
        console.error('Error initializing earn cash modal:', error);
    }
}

// Update slide statistics display
function updateSlideStatistics() {
    const totalSlidesElement = document.getElementById('totalSlidesCount');
    const presentationPagesElement = document.getElementById('presentationPagesCount');
    
    if (totalSlidesElement) {
        totalSlidesElement.textContent = totalSlides;
    }
    if (presentationPagesElement) {
        presentationPagesElement.textContent = presentationPages;
    }
}

// Generate product cards from JSON data
function generateProductCards() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    currentProducts.forEach((product, index) => {
        const isSelected = product.value === true;
        if (isSelected) {
            selectedProducts.add(product.id);
        }

        const icon = productIcons[product.id] || 'ph-package';
        
        const productCard = document.createElement('div');
        productCard.className = `product-card ${isSelected ? 'selected' : ''}`;
        productCard.id = `product-${product.id}`;
        productCard.onclick = () => toggleProduct(product.id);

        // Special handling for strategy codes with quantity slider
        const isStrategyCode = product.id === 'enable_share_code';
        const maxShareCode = product.max_share_code || 10;
        
        let quantitySlider = '';
        if (isStrategyCode) {
            const currentQuantity = product.share_code_count || 1;
            shareCodeQuantity = currentQuantity;
            quantitySlider = `
                <div class="quantity-controls" style="margin-top: 12px;">
                    <label style="font-size: 13px; color: #374151; margin-bottom: 8px; display: block;">
                        Number of Strategy Codes: <span id="quantity-${product.id}" style="font-weight: 600;">${currentQuantity}</span>
                    </label>
                    <input type="range" 
                           id="slider-${product.id}" 
                           min="1" 
                           max="${maxShareCode}" 
                           value="${currentQuantity}"
                           class="quantity-slider"
                           style="width: 100%; margin: 8px 0;"
                           onchange="updateShareCodeQuantity('${product.id}', this.value)"
                           onclick="event.stopPropagation()">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #6b7280;">
                        <span>1</span>
                        <span>${maxShareCode}</span>
                    </div>
                </div>
            `;
        }

        productCard.innerHTML = `
            <div class="product-header">
                <div style="display: flex; align-items: flex-start;">
                    <div class="product-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="product-info">
                        <h4 class="product-name">${product.name}</h4>
                        <span class="product-credits">${product.credits} credit${product.credits > 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="product-toggle">
                    <div class="toggle-switch ${isSelected ? 'active' : ''}" id="toggle-${product.id}"></div>
                </div>
            </div>
            <p class="product-description">${product.description}</p>
            <div class="earning-opportunities">
                <strong style="color: #059669; margin-bottom: 8px; display: block;">💰 Earning Opportunities:</strong>
                <div class="opportunity-list" id="opportunities-${product.id}">
                    <!-- Opportunities will be populated by JavaScript -->
                </div>
            </div>
            ${quantitySlider}
            <div class="product-status" id="status-${product.id}" style="display: none;">
                <!-- Status will be updated dynamically -->
            </div>
        `;

        container.appendChild(productCard);
        
        // Add earning opportunities after the card is added to DOM
        addEarningOpportunities(product.id);
    });
}


// Add earning opportunities for each product
function addEarningOpportunities(productId) {
    const opportunitiesContainer = document.getElementById(`opportunities-${productId}`);
    if (!opportunitiesContainer) return;
    
    const opportunities = {
        'enable_video': [
            { text: 'Brand Strategy Consulting', amount: '$500-2000' },
            { text: 'Strategy Podcast Services', amount: '$300-800' },
            { text: 'Brand Strategy Training', amount: '$200-1500' },
            { text: 'Corporate Strategy Workshops', amount: '$1000-5000' }
        ],
        'enable_share_code': [
            { text: 'Brand Strategy Training', amount: '$200-1500' },
            { text: 'Strategy Implementation Workshops', amount: '$500-3000' },
            { text: 'Advertising Agency Consulting', amount: '$800-4000' },
            { text: 'Personal Branding Coaching', amount: '$300-1200' }
        ],
        'enable_mini_deck': [
            { text: 'Executive Strategy Briefings', amount: '$300-1000' },
            { text: 'Client Pitch Presentations', amount: '$500-2000' },
            { text: 'Social Media Strategy Content', amount: '$100-500' },
            { text: 'Quick Strategy Consultations', amount: '$200-800' }
        ]
    };
    
    const productOpportunities = opportunities[productId] || [];
    
    productOpportunities.forEach(opportunity => {
        const opportunityItem = document.createElement('div');
        opportunityItem.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 6px;
            font-size: 13px;
            color: #374151;
        `;
        opportunityItem.innerHTML = `
            <span style="color: #059669; margin-right: 8px; font-size: 14px;">💵✅</span>
            <span style="flex: 1;">${opportunity.text}</span>
            <span style="font-weight: 600; color: #059669; margin-left: 8px;">${opportunity.amount}</span>
        `;
        opportunitiesContainer.appendChild(opportunityItem);
    });
    };


// Update share code quantity
function updateShareCodeQuantity(productId, quantity) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    shareCodeQuantity = parseInt(quantity);
    product.share_code_count = shareCodeQuantity;
    
    // Update display
    document.getElementById(`quantity-${productId}`).textContent = quantity;
    
    // Update pricing if product is selected
    if (selectedProducts.has(productId)) {
        updatePricingDisplay();
        updateJsonInTextarea();
    }
    
    console.log('Share code quantity updated to:', quantity);
}

// Toggle product selection
function toggleProduct(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;

    const productCard = document.getElementById(`product-${productId}`);
    const toggle = document.getElementById(`toggle-${productId}`);

    if (selectedProducts.has(productId)) {
        // Deselect
        selectedProducts.delete(productId);
        productCard.classList.remove('selected');
        toggle.classList.remove('active');
        product.value = false;
    } else {
        // Select
        selectedProducts.add(productId);
        productCard.classList.add('selected');
        toggle.classList.add('active');
        product.value = true;
    }

    // Update pricing display
    updatePricingDisplay();

    // Update JSON in textarea
    updateJsonInTextarea();

    console.log('Product toggled:', productId, 'Selected:', selectedProducts.has(productId));
}

// Update pricing display
function updatePricingDisplay() {
    const selectedProductsList = document.getElementById('selectedProductsList');
    let totalCredits = 0;

    // Clear selected products list
    selectedProductsList.innerHTML = '';

    if (selectedProducts.size === 0) {
        selectedProductsList.innerHTML = `
            <div class="empty-selection">
                <i class="ph ph-package" style="font-size: 48px; color: #d1d5db; margin-bottom: 16px; display: block;"></i>
                Select services to see pricing
            </div>
        `;
    } else {
        // Header for selected services
        selectedProductsList.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">You have selected the following:</h3>
            </div>
        `;

        selectedProducts.forEach(productId => {
            const product = currentProducts.find(p => p.id === productId);
            if (product) {
                let creditsPerPage = product.credits;
                let quantity = 1;
                let totalProductCredits = 0;
                let subtitle = '';

                if (product.id === 'enable_share_code') {
                    quantity = shareCodeQuantity;
                    totalProductCredits = presentationPages * quantity * creditsPerPage;
                    subtitle = `${presentationPages} pages x ${quantity} code${quantity > 1 ? 's' : ''} x ${creditsPerPage} credit${creditsPerPage > 1 ? 's' : ''}`;
                } else {
                    totalProductCredits = presentationPages * creditsPerPage;
                    subtitle = `${presentationPages} pages x ${creditsPerPage} credit${creditsPerPage > 1 ? 's' : ''}`;
                }

                totalCredits += totalProductCredits;

                const productItem = document.createElement('div');
                productItem.className = 'selected-product-item';
                productItem.style.cssText = `
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                `;
                productItem.innerHTML = `
                    <div style="flex: 1;">
                        <div style="font-size: 14px; color: #374151; font-weight: 500; margin-bottom: 4px;">
                            Generate ${product.name}
                        </div>
                        <div style="font-size: 12px; color: #6b7280; font-style: italic;">
                            ${subtitle}
                        </div>
                    </div>
                    <div style="font-size: 14px; color: #1f2937; font-weight: 700; margin-left: 16px;">
                        ${totalProductCredits} Credits
                    </div>
                `;
                selectedProductsList.appendChild(productItem);
            }
        });

        // Add total credits summary
        const totalSection = document.createElement('div');
        totalSection.style.cssText = `
            border-top: 2px solid #e5e7eb;
            padding-top: 16px;
            margin-top: 16px;
        `;
        totalSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 16px; font-weight: 600; color: #374151;">Total Credits Used</span>
                <span style="font-size: 18px; font-weight: 700; color: #10b981;">${totalCredits} Credits</span>
            </div>
            <div style="font-size: 12px; color: #6b7280; text-align: center; font-style: italic;">
                Price Per Credit = $${pricingPerPage.toFixed(0)}
            </div>
        `;
        selectedProductsList.appendChild(totalSection);
    }

    // Update slide statistics
    document.getElementById('totalSlidesCount').textContent = totalSlides;
    document.getElementById('presentationPagesCount').textContent = presentationPages;

    // Update generate button
    const generateButton = document.getElementById('generateButton');
    const grandTotal = totalCredits * pricingPerPage;
    
    if (selectedProducts.size > 0) {
        generateButton.disabled = false;
        generateButton.innerHTML = `
            <i class="ph ph-magic-wand"></i>
            Generate Now
        `;
    } else {
        generateButton.disabled = true;
        generateButton.innerHTML = `
            <i class="ph ph-magic-wand"></i>
            Select services to continue
        `;
    }
}

// Update JSON in textarea
function updateJsonInTextarea() {
    try {
        const editorTextarea = document.getElementById('editor');
        if (!editorTextarea) return;

        const currentJson = JSON.parse(editorTextarea.value);
        currentJson.products = currentProducts;

        editorTextarea.value = JSON.stringify(currentJson, null, 2);

        console.log('JSON updated in textarea');

    } catch (error) {
        console.error('Error updating JSON:', error);
    }
}

// Generate selected products
function generateSelectedProducts() {
    if (selectedProducts.size === 0) return;

    console.log('Generating selected products:', Array.from(selectedProducts));

    // Show loading overlay
    const loadingOverlay = document.getElementById('modalLoadingOverlay');
    loadingOverlay.classList.add('active');

    // Update product cards to generating state
    selectedProducts.forEach(productId => {
        const productCard = document.getElementById(`product-${productId}`);
        const status = document.getElementById(`status-${productId}`);
        
        productCard.classList.add('generating');
        status.style.display = 'flex';
        status.className = 'product-status status-generating';
        status.innerHTML = `
            <div class="spinner"></div>
            Generating...
        `;
    });

    // Simulate generation process (replace with actual API call)
    setTimeout(() => {
        // Update product cards to completed state
        selectedProducts.forEach(productId => {
            const productCard = document.getElementById(`product-${productId}`);
            const status = document.getElementById(`status-${productId}`);
            
            productCard.classList.remove('generating');
            productCard.classList.add('completed');
            status.className = 'product-status status-completed';
            status.innerHTML = `
                <i class="ph ph-check-circle"></i>
                Generated
            `;
        });

        // Hide loading overlay
        loadingOverlay.classList.remove('active');

        // Show success message
        setTimeout(() => {
            alert('Products generated successfully! Check your account for the new content.');
            closeEarnCashModal();
        }, 1000);

    }, 3000); // 3 second simulation
}

// Open earn cash modal
function openEarnCashModal() {
    try {
        console.log('Opening earn cash modal...');

        // Get JSON data from textarea
        const editorTextarea = document.getElementById('editor');
        if (!editorTextarea || !editorTextarea.value.trim()) {
            alert('Please load JSON data first');
            return;
        }

        const jsonData = JSON.parse(editorTextarea.value);
        
        // Check if products exist
        if (!jsonData.products || !Array.isArray(jsonData.products)) {
            alert('No products found in JSON data');
            return;
        }

        // Initialize modal
        initEarnCashModal(jsonData);

        // Show modal
        const modal = document.getElementById('earnCashModal');
        modal.classList.add('active');

        console.log('Earn cash modal opened successfully');

    } catch (error) {
        console.error('Error opening earn cash modal:', error);
        alert('Error loading product data. Please check your JSON format.');
    }
}

// Close earn cash modal
function closeEarnCashModal() {
    const modal = document.getElementById('earnCashModal');
    modal.classList.remove('active');

    // Reset modal state
    setTimeout(() => {
        selectedProducts.clear();
        currentProducts = [];
        
        // Hide loading overlay
        const loadingOverlay = document.getElementById('modalLoadingOverlay');
        loadingOverlay.classList.remove('active');
        
    }, 300);

    console.log('Earn cash modal closed');
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('earnCashModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEarnCashModal();
            }
        });
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('earnCashModal');
        if (modal && modal.classList.contains('active')) {
            closeEarnCashModal();
        }
    }
});

// Make functions globally available
window.openEarnCashModal = openEarnCashModal;
window.closeEarnCashModal = closeEarnCashModal;
window.generateSelectedProducts = generateSelectedProducts;
window.updateShareCodeQuantity = updateShareCodeQuantity;

console.log('Earn cash modal script loaded successfully');