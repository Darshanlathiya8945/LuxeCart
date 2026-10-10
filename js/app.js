let selectedCategory = "All";
let searchText = "";

let modalQuantity = 1;
let currentModalProductId = null;

const TAX_RATE = 0.08;
const EXPRESS_SHIPPING = 28;
const PAYMENT_LABELS = {
  card: "Card",
  paypal: "PayPal",
  applepay: "Apple Pay"
};

let selectedDelivery = "standard";
let selectedPayment = "card";
let lastOrder = null;

function formatPrice(price) {
  return "$" + price.toFixed(2);
}

function formatItemCount(count) {
  if (count === 1) {
    return "1 item";
  }

  return count + " items";
}

function announceCart(message) {
  document.getElementById("cart-status").textContent = message;
}

function getVisibleProducts() {
  const visibleProducts = [];
  const normalizedSearch = searchText.trim().toLowerCase();

  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;

    const searchableText = (product.name + " " + product.category + " " + product.description).toLowerCase();
    const matchesSearch = searchableText.includes(normalizedSearch);

    if (matchesCategory && matchesSearch) {
      visibleProducts.push(product);
    }
  }

  return visibleProducts;
}

function updateActiveChip() {
  const chips = document.querySelectorAll(".chip");

  for (let index = 0; index < chips.length; index++) {
    const chip = chips[index];
    const isSelected = chip.dataset.category === selectedCategory;

    if (isSelected) {
      chip.classList.add("is-active");
    } else {
      chip.classList.remove("is-active");
    }

    chip.setAttribute("aria-pressed", isSelected ? "true" : "false");
  }

  updateActiveNav();
}

function updateActiveNav() {
  const links = document.querySelectorAll(".main-nav a, .footer-links a");

  for (let index = 0; index < links.length; index++) {
    const link = links[index];

    if (link.dataset.category === selectedCategory) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  card.innerHTML = `
    <div class="product-image">
      <a class="product-open" href="#products" data-product-id="${product.id}" aria-label="View ${product.name}">
        <img src="${product.image}" alt="" width="900" height="1200" loading="lazy">
      </a>
      <p class="product-category">${product.category}</p>
    </div>
    <div class="product-body">
      <h3 class="product-name">
        <a class="product-title" href="#products" data-product-id="${product.id}">${product.name}</a>
      </h3>
      <div class="product-foot">
        <p class="product-price">${formatPrice(product.price)}</p>
        <button type="button" class="add-button" data-product-id="${product.id}">Add to Cart</button>
      </div>
    </div>
  `;

  const image = card.querySelector("img");

  image.addEventListener("load", function () {
    image.parentElement.classList.add("is-loaded");
  });

  image.addEventListener("error", function () {
    image.parentElement.classList.add("is-loaded");
  });

  if (image.complete && image.naturalWidth > 0) {
    image.parentElement.classList.add("is-loaded");
  }

  const openLinks = card.querySelectorAll(".product-open, .product-title");

  for (let linkIndex = 0; linkIndex < openLinks.length; linkIndex++) {
    openLinks[linkIndex].addEventListener("click", handleProductOpenClick);
  }

  card.querySelector(".add-button").addEventListener("click", handleAddButtonClick);

  return card;
}

function renderProducts(productList) {
  const grid = document.getElementById("product-grid");
  const emptyMessage = document.getElementById("empty-results");
  const count = document.getElementById("product-count");

  grid.innerHTML = "";
  grid.setAttribute("aria-busy", "false");

  if (productList.length === 1) {
    count.textContent = "1 piece";
  } else {
    count.textContent = productList.length + " pieces";
  }

  if (productList.length === 0) {
    emptyMessage.hidden = false;
    return;
  }

  emptyMessage.hidden = true;

  for (let index = 0; index < productList.length; index++) {
    const card = createProductCard(productList[index]);
    grid.appendChild(card);
  }
}

function handleProductOpenClick(event) {
  event.preventDefault();
  const productId = Number(event.currentTarget.dataset.productId);
  openProductModal(productId);
}

function handleAddButtonClick(event) {
  const button = event.currentTarget;
  const productId = Number(button.dataset.productId);
  const product = getProductById(productId);

  addToCart(productId, 1);
  refreshCartView(true);
  showAddedFeedback(button);

  if (product) {
    announceCart("Added " + product.name + " to your cart.");
  }
}

function showAddedFeedback(button) {
  const originalText = button.getAttribute("data-label") || button.textContent;
  button.setAttribute("data-label", originalText);
  button.textContent = "Added";
  button.classList.add("is-added");

  window.setTimeout(function () {
    button.textContent = originalText;
    button.classList.remove("is-added");
  }, 900);
}

function openProductModal(productId) {
  const product = getProductById(productId);

  if (!product) {
    return;
  }

  closeCart();

  currentModalProductId = product.id;
  modalQuantity = 1;

  const modal = document.getElementById("product-modal");
  const modalImage = document.getElementById("modal-image");
  const modalPhoto = document.getElementById("modal-photo");

  modalPhoto.classList.remove("is-loaded");
  modalImage.src = product.image;
  modalImage.alt = product.name;

  if (modalImage.complete && modalImage.naturalWidth > 0) {
    modalPhoto.classList.add("is-loaded");
  }

  document.getElementById("modal-category").textContent = product.category;
  document.getElementById("modal-name").textContent = product.name;
  document.getElementById("modal-price").textContent = formatPrice(product.price);
  document.getElementById("modal-description").textContent = product.description;
  document.getElementById("modal-quantity").textContent = "1";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  document.getElementById("modal-close").focus();
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  if (!document.getElementById("cart-drawer").classList.contains("is-open") &&
      !document.getElementById("checkout").classList.contains("is-open")) {
    document.body.classList.remove("no-scroll");
  }
}

function changeModalQuantity(amount) {
  const nextQuantity = modalQuantity + amount;

  if (nextQuantity < 1) {
    return;
  }

  modalQuantity = nextQuantity;
  document.getElementById("modal-quantity").textContent = String(modalQuantity);
}

function handleModalAddClick() {
  if (!currentModalProductId) {
    return;
  }

  const product = getProductById(currentModalProductId);

  addToCart(currentModalProductId, modalQuantity);
  refreshCartView(true);
  closeProductModal();
  openCart();

  if (product) {
    announceCart("Added " + product.name + " to your cart.");
  }
}

function refreshCartView(shouldAnimateBadge) {
  renderCart();
  updateCartBadge(shouldAnimateBadge);
}

function updateCartBadge(shouldAnimate) {
  const badge = document.getElementById("cart-badge");
  const count = getCartCount();

  badge.textContent = String(count);
  document.getElementById("cart-button").setAttribute("aria-label", "Open cart, " + formatItemCount(count));

  if (!shouldAnimate) {
    return;
  }

  badge.classList.remove("is-bump");

  window.setTimeout(function () {
    badge.classList.add("is-bump");
  }, 20);
}

function renderCart() {
  const cart = getCart();
  const itemsContainer = document.getElementById("cart-items");
  const emptyState = document.getElementById("cart-empty");
  const summary = document.getElementById("cart-summary");

  itemsContainer.innerHTML = "";
  document.getElementById("cart-count-label").textContent = formatItemCount(getCartCount());

  if (cart.length === 0) {
    emptyState.hidden = false;
    summary.hidden = true;
    return;
  }

  emptyState.hidden = true;
  summary.hidden = false;

  for (let index = 0; index < cart.length; index++) {
    const cartItem = cart[index];
    const product = getProductById(cartItem.id);

    if (!product) {
      continue;
    }

    const lineTotal = product.price * cartItem.quantity;
    let priceText = formatPrice(product.price);

    if (cartItem.quantity > 1) {
      priceText = formatPrice(product.price) + " each · " + formatPrice(lineTotal) + " total";
    }

    const item = document.createElement("article");
    item.className = "cart-item";
    item.innerHTML = `
      <img src="${product.image}" alt="">
      <div>
        <h3>${product.name}</h3>
        <p class="cart-item-price">${priceText}</p>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button type="button" data-action="decrease" data-product-id="${product.id}" aria-label="Decrease quantity of ${product.name}">−</button>
            <span>${cartItem.quantity}</span>
            <button type="button" data-action="increase" data-product-id="${product.id}" aria-label="Increase quantity of ${product.name}">+</button>
          </div>
          <button type="button" class="remove-button" data-action="remove" data-product-id="${product.id}">Remove</button>
        </div>
      </div>
    `;

    const buttons = item.querySelectorAll("button");

    for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
      buttons[buttonIndex].addEventListener("click", handleCartButtonClick);
    }

    itemsContainer.appendChild(item);
  }

  document.getElementById("cart-total").textContent = formatPrice(getCartTotal());
}

function handleCartButtonClick(event) {
  const button = event.currentTarget;
  const productId = Number(button.dataset.productId);
  const action = button.dataset.action;
  const product = getProductById(productId);

  if (action === "increase") {
    increaseQuantity(productId);
  } else if (action === "decrease") {
    decreaseQuantity(productId);
  } else if (action === "remove") {
    removeFromCart(productId);

    if (product) {
      announceCart("Removed " + product.name + " from your cart.");
    }
  }

  refreshCartView(true);
}

function openCart() {
  const drawer = document.getElementById("cart-drawer");

  closeProductModal();
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.getElementById("cart-button").setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
  document.getElementById("cart-close").focus();
}

function closeCart() {
  const drawer = document.getElementById("cart-drawer");
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.getElementById("cart-button").setAttribute("aria-expanded", "false");

  if (!document.getElementById("product-modal").classList.contains("is-open") &&
      !document.getElementById("checkout").classList.contains("is-open")) {
    document.body.classList.remove("no-scroll");
  }
}

function getShippingCost() {
  if (selectedDelivery === "express") {
    return EXPRESS_SHIPPING;
  }

  return 0;
}

function getTaxAmount(subtotal) {
  return subtotal * TAX_RATE;
}

function getOrderTotal() {
  const subtotal = getCartTotal();
  return subtotal + getShippingCost() + getTaxAmount(subtotal);
}

function getCheckoutItems() {
  const cart = getCart();
  const items = [];

  for (let index = 0; index < cart.length; index++) {
    const product = getProductById(cart[index].id);

    if (!product) {
      continue;
    }

    items.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: cart[index].quantity
    });
  }

  return items;
}

function createCheckoutItem(item) {
  const line = document.createElement("article");
  line.className = "checkout-item";
  line.innerHTML = `
    <img src="${item.image}" alt="">
    <div>
      <h4>${item.name}</h4>
      <p>Qty ${item.quantity}</p>
    </div>
    <span class="checkout-item-total">${formatPrice(item.price * item.quantity)}</span>
  `;
  return line;
}

function renderItemList(container, items) {
  container.innerHTML = "";

  for (let index = 0; index < items.length; index++) {
    container.appendChild(createCheckoutItem(items[index]));
  }
}

function renderCheckoutSummary() {
  const subtotal = getCartTotal();
  const shipping = getShippingCost();

  renderItemList(document.getElementById("checkout-items"), getCheckoutItems());
  document.getElementById("checkout-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("checkout-shipping").textContent = shipping === 0 ? "Complimentary" : formatPrice(shipping);
  document.getElementById("checkout-tax").textContent = formatPrice(getTaxAmount(subtotal));
  document.getElementById("checkout-grand-total").textContent = formatPrice(getOrderTotal());
  document.getElementById("checkout-pay-total").textContent = formatPrice(getOrderTotal());
}

function updatePlaceOrderLabel() {
  const button = document.getElementById("place-order");

  if (button.disabled) {
    return;
  }

  if (selectedPayment === "paypal") {
    button.textContent = "Pay with PayPal";
  } else if (selectedPayment === "applepay") {
    button.textContent = "Pay with Apple Pay";
  } else {
    button.textContent = "Place order";
  }
}

function updatePaymentFields() {
  const cardFields = document.getElementById("card-fields");
  const note = document.getElementById("alt-payment-note");

  if (selectedPayment === "card") {
    cardFields.hidden = false;
    note.hidden = true;
    note.textContent = "";
  } else {
    cardFields.hidden = true;
    note.hidden = false;

    if (selectedPayment === "paypal") {
      note.textContent = "You will complete this demonstration payment with PayPal.";
    } else {
      note.textContent = "You will complete this demonstration payment with Apple Pay.";
    }
  }

  updatePlaceOrderLabel();
}

function setFieldError(input, message) {
  const field = input.closest(".field");
  const error = document.getElementById(input.id + "-error");

  input.setAttribute("aria-invalid", message ? "true" : "false");

  if (field) {
    if (message) {
      field.classList.add("is-invalid");
    } else {
      field.classList.remove("is-invalid");
    }
  }

  if (error) {
    error.textContent = message || "";
  }
}

function clearCheckoutErrors() {
  const inputs = document.querySelectorAll("#checkout-form input");

  for (let index = 0; index < inputs.length; index++) {
    setFieldError(inputs[index], "");
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getDigits(value) {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value) {
  const digits = getDigits(value).slice(0, 16);
  const groups = [];

  for (let index = 0; index < digits.length; index += 4) {
    groups.push(digits.slice(index, index + 4));
  }

  return groups.join(" ");
}

function formatExpiry(value) {
  const digits = getDigits(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return digits.slice(0, 2) + "/" + digits.slice(2);
}

function isValidExpiry(value) {
  const parts = value.split("/");

  if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
    return false;
  }

  const month = Number(parts[0]);
  const year = Number("20" + parts[1]);

  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}

function validateRequiredField(input, message) {
  if (!input.value.trim()) {
    setFieldError(input, message);
    return false;
  }

  setFieldError(input, "");
  return true;
}

function validateCheckoutForm() {
  let isValid = true;
  let firstInvalid = null;

  const requiredFields = [
    { id: "checkout-email", message: "Enter your email address." },
    { id: "checkout-first-name", message: "Enter your first name." },
    { id: "checkout-last-name", message: "Enter your last name." },
    { id: "checkout-address", message: "Enter your street address." },
    { id: "checkout-city", message: "Enter your city." },
    { id: "checkout-region", message: "Enter your state or region." },
    { id: "checkout-postal", message: "Enter your postal code." }
  ];

  for (let index = 0; index < requiredFields.length; index++) {
    const input = document.getElementById(requiredFields[index].id);
    const fieldIsValid = validateRequiredField(input, requiredFields[index].message);

    if (!fieldIsValid) {
      isValid = false;

      if (!firstInvalid) {
        firstInvalid = input;
      }
    }
  }

  const emailInput = document.getElementById("checkout-email");

  if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
    setFieldError(emailInput, "Enter a valid email address.");
    isValid = false;

    if (!firstInvalid) {
      firstInvalid = emailInput;
    }
  }

  if (selectedPayment === "card") {
    const cardName = document.getElementById("checkout-card-name");
    const cardNumber = document.getElementById("checkout-card-number");
    const cardExpiry = document.getElementById("checkout-card-expiry");
    const cardCvc = document.getElementById("checkout-card-cvc");

    if (!validateRequiredField(cardName, "Enter the name on the card.")) {
      isValid = false;

      if (!firstInvalid) {
        firstInvalid = cardName;
      }
    }

    const cardDigits = getDigits(cardNumber.value);

    if (cardDigits.length < 13 || cardDigits.length > 16) {
      setFieldError(cardNumber, "Enter a valid card number.");
      isValid = false;

      if (!firstInvalid) {
        firstInvalid = cardNumber;
      }
    } else {
      setFieldError(cardNumber, "");
    }

    if (!isValidExpiry(cardExpiry.value)) {
      setFieldError(cardExpiry, "Enter a valid expiry date.");
      isValid = false;

      if (!firstInvalid) {
        firstInvalid = cardExpiry;
      }
    } else {
      setFieldError(cardExpiry, "");
    }

    const cvcDigits = getDigits(cardCvc.value);

    if (cvcDigits.length < 3 || cvcDigits.length > 4) {
      setFieldError(cardCvc, "Enter a valid security code.");
      isValid = false;

      if (!firstInvalid) {
        firstInvalid = cardCvc;
      }
    } else {
      setFieldError(cardCvc, "");
    }
  }

  if (firstInvalid) {
    firstInvalid.focus();
  }

  return isValid;
}

function createOrderNumber() {
  return "LC-" + String(Math.floor(10000 + Math.random() * 90000));
}

function getPaymentLabel(method) {
  return PAYMENT_LABELS[method] || "Card";
}

function resetCheckoutForm() {
  document.getElementById("checkout-form").reset();
  selectedDelivery = "standard";
  selectedPayment = "card";
  clearCheckoutErrors();
  updatePaymentFields();

  const button = document.getElementById("place-order");
  button.disabled = false;
  updatePlaceOrderLabel();
}

function showCheckoutForm() {
  document.getElementById("checkout-form-view").hidden = false;
  document.getElementById("checkout-success").hidden = true;
}

function showCheckoutSuccess() {
  document.getElementById("checkout-form-view").hidden = true;
  document.getElementById("checkout-success").hidden = false;
}

function renderCheckoutSuccess() {
  if (!lastOrder) {
    return;
  }

  document.getElementById("success-title").textContent = "Thank you, " + lastOrder.firstName + ".";
  document.getElementById("success-lead").textContent =
    "A confirmation is ready for " + lastOrder.email + ". This demonstration order was not charged.";
  document.getElementById("success-order").textContent = "Order " + lastOrder.number;
  document.getElementById("success-payment").textContent = lastOrder.paymentLabel;
  document.getElementById("success-total").textContent = formatPrice(lastOrder.total);
  document.getElementById("success-address").textContent = lastOrder.addressText;
  renderItemList(document.getElementById("success-items"), lastOrder.items);
}

function completeOrder() {
  const firstName = document.getElementById("checkout-first-name").value.trim();
  const lastName = document.getElementById("checkout-last-name").value.trim();
  const address2 = document.getElementById("checkout-address2").value.trim();
  const addressLines = [
    firstName + " " + lastName,
    document.getElementById("checkout-address").value.trim()
  ];

  if (address2) {
    addressLines.push(address2);
  }

  addressLines.push(
    document.getElementById("checkout-city").value.trim() + ", " +
    document.getElementById("checkout-region").value.trim() + " " +
    document.getElementById("checkout-postal").value.trim()
  );
  addressLines.push(document.getElementById("checkout-country").value);

  lastOrder = {
    number: createOrderNumber(),
    firstName: firstName,
    email: document.getElementById("checkout-email").value.trim(),
    paymentLabel: getPaymentLabel(selectedPayment),
    items: getCheckoutItems(),
    total: getOrderTotal(),
    addressText: addressLines.join("\n")
  };

  clearCart();
  refreshCartView(true);
  renderCheckoutSuccess();
  showCheckoutSuccess();
  document.querySelector(".checkout-panel").scrollTo(0, 0);
  document.getElementById("success-close").focus();
  announceCart("Order " + lastOrder.number + " confirmed.");
}

function openCheckout() {
  if (getCart().length === 0) {
    return;
  }

  closeCart();
  closeProductModal();

  const deliveryInput = document.querySelector('input[name="delivery"]:checked');
  const paymentInput = document.querySelector('input[name="payment"]:checked');

  if (deliveryInput) {
    selectedDelivery = deliveryInput.value;
  }

  if (paymentInput) {
    selectedPayment = paymentInput.value;
  }

  showCheckoutForm();
  renderCheckoutSummary();
  updatePaymentFields();

  const checkout = document.getElementById("checkout");
  checkout.classList.add("is-open");
  checkout.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  document.getElementById("checkout-close").focus();
}

function closeCheckout() {
  const checkout = document.getElementById("checkout");
  checkout.classList.remove("is-open");
  checkout.setAttribute("aria-hidden", "true");

  if (!document.getElementById("product-modal").classList.contains("is-open") &&
      !document.getElementById("cart-drawer").classList.contains("is-open")) {
    document.body.classList.remove("no-scroll");
  }

  if (!document.getElementById("checkout-success").hidden) {
    resetCheckoutForm();
    showCheckoutForm();
  }
}

function returnToCart() {
  closeCheckout();
  openCart();
}

function handleCheckoutSubmit(event) {
  event.preventDefault();

  if (getCart().length === 0) {
    closeCheckout();
    return;
  }

  if (!validateCheckoutForm()) {
    return;
  }

  const button = document.getElementById("place-order");
  button.disabled = true;
  button.textContent = "Placing order…";

  window.setTimeout(function () {
    completeOrder();
  }, 800);
}

function handleDeliveryChange(event) {
  if (event.target.name !== "delivery") {
    return;
  }

  selectedDelivery = event.target.value;
  renderCheckoutSummary();
}

function handlePaymentChange(event) {
  if (event.target.name !== "payment") {
    return;
  }

  selectedPayment = event.target.value;
  updatePaymentFields();
}

function openMobileMenu() {
  document.getElementById("main-nav").classList.add("is-open");
  document.getElementById("menu-toggle").classList.add("is-open");
  document.getElementById("menu-toggle").setAttribute("aria-expanded", "true");
  document.getElementById("menu-toggle").setAttribute("aria-label", "Close menu");
}

function closeMobileMenu() {
  document.getElementById("main-nav").classList.remove("is-open");
  document.getElementById("menu-toggle").classList.remove("is-open");
  document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
  document.getElementById("menu-toggle").setAttribute("aria-label", "Open menu");
}

function setupEvents() {
  document.getElementById("category-list").addEventListener("click", function (event) {
    const category = event.target.dataset.category;

    if (!category) {
      return;
    }

    selectedCategory = category;
    updateActiveChip();
    renderProducts(getVisibleProducts());
  });

  document.getElementById("main-nav").addEventListener("click", function (event) {
    const category = event.target.dataset.category;

    if (!category) {
      return;
    }

    selectedCategory = category;
    updateActiveChip();
    renderProducts(getVisibleProducts());
    closeMobileMenu();
  });

  document.getElementById("footer-nav").addEventListener("click", function (event) {
    const category = event.target.dataset.category;

    if (!category) {
      return;
    }

    selectedCategory = category;
    updateActiveChip();
    renderProducts(getVisibleProducts());
  });

  document.getElementById("search-input").addEventListener("input", function (event) {
    searchText = event.target.value;
    renderProducts(getVisibleProducts());
  });

  document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("menu-toggle").addEventListener("click", function () {
    const menuIsOpen = document.getElementById("main-nav").classList.contains("is-open");

    if (menuIsOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  document.getElementById("cart-button").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document.getElementById("drawer-backdrop").addEventListener("click", closeCart);

  document.getElementById("continue-shopping").addEventListener("click", function () {
    closeCart();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("checkout-button").addEventListener("click", openCheckout);
  document.getElementById("checkout-close").addEventListener("click", closeCheckout);
  document.getElementById("checkout-backdrop").addEventListener("click", closeCheckout);
  document.getElementById("return-to-cart").addEventListener("click", returnToCart);
  document.getElementById("checkout-form").addEventListener("submit", handleCheckoutSubmit);
  document.getElementById("checkout-form").addEventListener("input", function (event) {
    if (event.target.matches("input")) {
      setFieldError(event.target, "");
    }
  });
  document.getElementById("checkout-form").addEventListener("change", function (event) {
    handleDeliveryChange(event);
    handlePaymentChange(event);
  });
  document.getElementById("checkout-card-number").addEventListener("input", function (event) {
    event.target.value = formatCardNumber(event.target.value);
  });
  document.getElementById("checkout-card-expiry").addEventListener("input", function (event) {
    event.target.value = formatExpiry(event.target.value);
  });
  document.getElementById("checkout-card-cvc").addEventListener("input", function (event) {
    event.target.value = getDigits(event.target.value).slice(0, 4);
  });
  document.getElementById("success-close").addEventListener("click", closeCheckout);
  document.getElementById("success-continue").addEventListener("click", function () {
    closeCheckout();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("modal-close").addEventListener("click", closeProductModal);
  document.getElementById("modal-backdrop").addEventListener("click", closeProductModal);
  document.getElementById("modal-decrease").addEventListener("click", function () {
    changeModalQuantity(-1);
  });
  document.getElementById("modal-increase").addEventListener("click", function () {
    changeModalQuantity(1);
  });
  document.getElementById("modal-add").addEventListener("click", handleModalAddClick);

  document.getElementById("modal-image").addEventListener("load", function () {
    document.getElementById("modal-photo").classList.add("is-loaded");
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    if (document.getElementById("checkout").classList.contains("is-open")) {
      closeCheckout();
    } else if (document.getElementById("product-modal").classList.contains("is-open")) {
      closeProductModal();
    } else if (document.getElementById("cart-drawer").classList.contains("is-open")) {
      closeCart();
    } else if (document.getElementById("main-nav").classList.contains("is-open")) {
      closeMobileMenu();
    }
  });

  window.addEventListener("scroll", function () {
    const header = document.querySelector(".site-header");

    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 960) {
      closeMobileMenu();
    }
  });
}

function startApp() {
  renderProducts(getVisibleProducts());
  refreshCartView(false);
  updateActiveNav();
  setupEvents();
}

startApp();
