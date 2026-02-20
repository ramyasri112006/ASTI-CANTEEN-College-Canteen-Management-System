// Total amount variable
let total = 0;

// Function to show selected section
function showSection(id) {
    let sections = document.querySelectorAll("section");

    sections.forEach(function(section) {
        section.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");
}

// Function to add items to cart
function addToCart(item, price) {
    let cart = document.getElementById("cart");

    let li = document.createElement("li");
    li.textContent = item + " - ₹" + price;

    cart.appendChild(li);

    total += price;

    document.getElementById("total").textContent = "Total: ₹" + total;

    // If payment section is visible, update button labels
    const paymentSection = document.getElementById('paymentSection');
    if (paymentSection && !paymentSection.classList.contains('hidden')) {
        updatePaymentFields();
    }
}

// Function to place order
function placeOrder() {
    if (total === 0) {
        alert("Please add items before placing your order!");
    } else {
        // Show payment section so user can choose payment method
        const paymentSection = document.getElementById('paymentSection');
        if (paymentSection) {
            paymentSection.classList.remove('hidden');
        }

        // Populate payment button text and show relevant fields
        updatePaymentFields();
        // Scroll payment into view for convenience
        setTimeout(() => {
            paymentSection && paymentSection.scrollIntoView({ behavior: 'smooth' });
        }, 150);
    }
}

// Update which payment fields are visible based on selected method
function updatePaymentFields() {
    const methodEl = document.querySelector('input[name="payment"]:checked');
    const method = methodEl ? methodEl.value : 'upi';

    const upiFields = document.getElementById('upiFields');
    const cardFields = document.getElementById('cardFields');
    const cashFields = document.getElementById('cashFields');

    if (upiFields) upiFields.classList.toggle('hidden', method !== 'upi');
    if (cardFields) cardFields.classList.toggle('hidden', method !== 'card');
    if (cashFields) cashFields.classList.toggle('hidden', method !== 'cash');

    // Update pay/confirm button labels with current total
    const upiBtn = document.getElementById('upiPayBtn');
    const cardBtn = document.getElementById('cardPayBtn');
    const cashBtn = document.getElementById('cashConfirmBtn');
    if (upiBtn) upiBtn.textContent = `Pay ₹${total}`;
    if (cardBtn) cardBtn.textContent = `Pay ₹${total}`;
    if (cashBtn) cashBtn.textContent = `Confirm Cash Order (₹${total})`;
}

// Complete payment based on selected method and validate inputs
function completePayment() {
    const methodEl = document.querySelector('input[name="payment"]:checked');
    const method = methodEl ? methodEl.value : 'upi';

    if (total === 0) {
        alert('Cart is empty. Add items before paying.');
        return;
    }

    if (method === 'upi') {
        const upiId = document.getElementById('upiId').value.trim();
        if (!upiId) {
            alert('Please enter a valid UPI ID.');
            return;
        }
        alert(`Payment of ₹${total} successful via UPI (${upiId}). Thank you!`);
        var paymentDetailStr = `UPI: ${upiId}`;
    } else if (method === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, '');
        const cardName = document.getElementById('cardName').value.trim();
        const cardExpiry = document.getElementById('cardExpiry').value.trim();
        const cardCVV = document.getElementById('cardCVV').value.trim();

        if (!cardNumber || cardNumber.length < 12 || !/^[0-9]+$/.test(cardNumber)) {
            alert('Please enter a valid card number (minimum 12 digits).');
            return;
        }
        if (!cardName) {
            alert('Please enter the name on card.');
            return;
        }
        if (!cardExpiry) {
            alert('Please enter card expiry (MM/YY).');
            return;
        }
        if (!cardCVV || cardCVV.length < 3) {
            alert('Please enter a valid CVV.');
            return;
        }

        // Simulate card payment success
        const masked = cardNumber.slice(-4).padStart(cardNumber.length, '*');
        alert(`Payment of ₹${total} successful via Card (****${cardNumber.slice(-4)}). Thank you!`);
        var paymentDetailStr = `Card ending ****${cardNumber.slice(-4)}`;
    } else if (method === 'cash') {
        alert(`Order confirmed. Please pay ₹${total} in cash at pickup. Thank you!`);
        var paymentDetailStr = 'Cash on pickup';
    } else {
        alert('Unknown payment method.');
        return;
    }

    // Clear cart and reset
    // Before clearing, collect items to print a receipt
    const cartItems = Array.from(document.querySelectorAll('#cart li')).map(li => li.textContent);

    // Print receipt (opens print dialog)
    try {
        printReceipt(cartItems, total, method, paymentDetailStr);
    } catch (e) {
        console.error('Print failed', e);
    }

    document.getElementById('cart').innerHTML = '';
    total = 0;
    document.getElementById('total').textContent = 'Total: ₹0';

    // Hide payment section and clear inputs
    const paymentSection = document.getElementById('paymentSection');
    if (paymentSection) paymentSection.classList.add('hidden');

    // Clear payment inputs
    ['upiId','cardNumber','cardName','cardExpiry','cardCVV'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

// Generate a simple printable receipt and open print dialog
function printReceipt(items, totalAmount, method, paymentDetail) {
    const now = new Date().toLocaleString();
    const title = 'ASTI CANTEEN - Receipt';
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>`;
    html += `<style>body{font-family:Arial,Helvetica,sans-serif;color:#222;padding:24px}h1{color:#2c3e50} .items{margin-top:12px} .item{margin-bottom:6px} .total{font-weight:700;margin-top:12px;font-size:18px} .meta{margin-top:8px;color:#555}</style>`;
    html += `</head><body>`;
    html += `<h1>ASTI CANTEEN</h1><div class="meta">${now}</div>`;
    html += `<div class="items">`;
    if (items && items.length) {
        items.forEach(i => { html += `<div class="item">${i}</div>`; });
    } else {
        html += `<div class="item">(no items)</div>`;
    }
    html += `</div>`;
    html += `<div class="total">Total: ₹${totalAmount}</div>`;
    html += `<div class="meta">Payment: ${method.toUpperCase()}${paymentDetail ? ' - ' + paymentDetail : ''}</div>`;
    html += `<p style="margin-top:18px">Thank you for your order!</p>`;
    html += `</body></html>`;

    const w = window.open('', '_blank');
    if (!w) return; // popup blocked
    w.document.write(html);
    w.document.close();
    w.focus();
    // Give the browser a moment to render then call print
    setTimeout(() => {
        w.print();
        // Optionally close the print window after printing
        // setTimeout(() => w.close(), 500);
    }, 300);
}