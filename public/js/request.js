document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_CONFIG === 'undefined') {
        console.error("APP_CONFIG is not loaded.");
        return;
    }

    const requestForm = document.getElementById('requestForm');
    if (!requestForm) return;

    const documentTypeSelect = document.getElementById('documentType');
    const quantityInput = document.getElementById('quantity');
    const deliveryMethodRadios = document.querySelectorAll('input[name="deliveryMethod"]');
    const selfPickupOptionsDiv = document.getElementById('selfPickupOptions');
    const pickupTypeRadios = document.querySelectorAll('input[name="pickupType"]');
    const postalAddressSectionDiv = document.getElementById('postalAddressSection');
    const postalAddressInput = document.getElementById('postalAddress');
    const calculateCostBtn = document.getElementById('calculateCostBtn');
    const costSummaryDiv = document.getElementById('costSummary');
    const documentCostSpan = document.getElementById('documentCost');
    const shippingCostSpan = document.getElementById('shippingCost');
    const totalCostSpan = document.getElementById('totalCost');
    const proceedToPaymentBtn = requestForm.querySelector('button[type="submit"]');
    const requestMessageDiv = document.getElementById('requestMessage');

    // Update labels for pickup options with dynamic prices
    function updatePickupOptionLabels() {
        const normalLabel = document.querySelector('label[for="pickupNormal"]');
        const expressLabel = document.querySelector('label[for="pickupExpress"]');
        if (normalLabel && window.translations) {
            normalLabel.textContent = (window.translations['pickup_normal'] || 'แบบธรรมดา (ฉบับละ {price} บาท)')
                .replace('{price}', APP_CONFIG.DELIVERY_OPTIONS.SELF_PICKUP_NORMAL_PRICE_PER_DOC);
        }
        if (expressLabel && window.translations) {
            expressLabel.textContent = (window.translations['pickup_express'] || 'แบบเร่งด่วน (ฉบับละ {price} บาท)')
                .replace('{price}', APP_CONFIG.DELIVERY_OPTIONS.SELF_PICKUP_EXPRESS_PRICE_PER_DOC);
        }
    }
    // Call it once translations are potentially loaded
    setTimeout(updatePickupOptionLabels, 500); // Small delay to ensure translations are loaded by main.js

    deliveryMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'self_pickup') {
                selfPickupOptionsDiv.style.display = 'block';
                postalAddressSectionDiv.style.display = 'none';
                postalAddressInput.required = false;
            } else { // postal
                selfPickupOptionsDiv.style.display = 'none';
                postalAddressSectionDiv.style.display = 'block';
                postalAddressInput.required = true;
            }
            // Reset and hide cost summary when delivery method changes
            costSummaryDiv.style.display = 'none';
            proceedToPaymentBtn.style.display = 'none';
        });
    });

    // Also hide cost summary if document type or quantity changes
    if (documentTypeSelect) documentTypeSelect.addEventListener('change', () => {
        costSummaryDiv.style.display = 'none';
        proceedToPaymentBtn.style.display = 'none';
    });
    if (quantityInput) quantityInput.addEventListener('change', () => {
        costSummaryDiv.style.display = 'none';
        proceedToPaymentBtn.style.display = 'none';
    });
    pickupTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            costSummaryDiv.style.display = 'none';
            proceedToPaymentBtn.style.display = 'none';
        });
    });


    if (calculateCostBtn) {
        calculateCostBtn.addEventListener('click', function() {
            const selectedDocType = documentTypeSelect.value;
            const quantity = parseInt(quantityInput.value) || 0;
            const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;

            if (!selectedDocType || quantity <= 0) {
                alert(window.translations?.['select_doc_and_quantity'] || 'กรุณาเลือกประเภทเอกสารและจำนวน');
                return;
            }

            let docBasePrice = 0;
            const selectedOption = documentTypeSelect.options[documentTypeSelect.selectedIndex];
            if (selectedOption && selectedOption.dataset.price) {
                docBasePrice = parseFloat(selectedOption.dataset.price);
            } else {
                // Fallback or error if price not found
                const docConfig = APP_CONFIG.DOCUMENT_TYPES.find(d => d.id === selectedDocType);
                if (docConfig) docBasePrice = docConfig.price;
            }


            let pricePerDocument = docBasePrice; // Base price from config
            let totalDocumentCost = 0;
            let shippingFee = 0;

            if (deliveryMethod === 'self_pickup') {
                const pickupType = document.querySelector('input[name="pickupType"]:checked').value;
                if (pickupType === 'normal') {
                    pricePerDocument = APP_CONFIG.DELIVERY_OPTIONS.SELF_PICKUP_NORMAL_PRICE_PER_DOC;
                } else { // express
                    pricePerDocument = APP_CONFIG.DELIVERY_OPTIONS.SELF_PICKUP_EXPRESS_PRICE_PER_DOC;
                }
                totalDocumentCost = pricePerDocument * quantity;
            } else { // postal
                pricePerDocument = APP_CONFIG.DELIVERY_OPTIONS.POSTAL_PRICE_PER_DOC;
                totalDocumentCost = pricePerDocument * quantity;
                shippingFee = APP_CONFIG.DELIVERY_OPTIONS.POSTAL_SHIPPING_FEE;
            }

            const totalAmount = totalDocumentCost + shippingFee;

            documentCostSpan.textContent = totalDocumentCost.toFixed(2);
            shippingCostSpan.textContent = shippingFee.toFixed(2);
            totalCostSpan.textContent = totalAmount.toFixed(2);

            costSummaryDiv.style.display = 'block';
            proceedToPaymentBtn.style.display = 'inline-block';
        });
    }

    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (costSummaryDiv.style.display === 'none') {
             alert(window.translations?.['calculate_cost_first'] || 'กรุณาคำนวณค่าบริการก่อน');
            return;
        }

        const formData = {
            documentType: documentTypeSelect.value,
            documentTypeName: documentTypeSelect.options[documentTypeSelect.selectedIndex].text,
            quantity: parseInt(quantityInput.value),
            deliveryMethod: document.querySelector('input[name="deliveryMethod"]:checked').value,
            pickupType: (document.querySelector('input[name="deliveryMethod"]:checked').value === 'self_pickup') ? document.querySelector('input[name="pickupType"]:checked').value : null,
            postalAddress: (document.querySelector('input[name="deliveryMethod"]:checked').value === 'postal') ? postalAddressInput.value : null,
            totalCost: parseFloat(totalCostSpan.textContent),
            documentCost: parseFloat(documentCostSpan.textContent),
            shippingCost: parseFloat(shippingCostSpan.textContent),
            status: 'pending_payment', // Initial status
            requestDate: new Date().toISOString()
        };

        // SIMULATE saving request and redirecting to payment
        // In a real app, send this to the backend, get a request ID, then proceed.
        const requestId = `NBU-${Date.now()}`;
        formData.id = requestId;

        // Store this temporary request in localStorage to pass to payment page
        localStorage.setItem('currentDocumentRequest', JSON.stringify(formData));

        // Redirect to payment page
        window.location.href = 'payment.html';
    });

    // Initial state for delivery options
    if (document.querySelector('input[name="deliveryMethod"]:checked').value === 'self_pickup') {
        selfPickupOptionsDiv.style.display = 'block';
        postalAddressSectionDiv.style.display = 'none';
        postalAddressInput.required = false;
    } else {
        selfPickupOptionsDiv.style.display = 'none';
        postalAddressSectionDiv.style.display = 'block';
        postalAddressInput.required = true;
    }
});
