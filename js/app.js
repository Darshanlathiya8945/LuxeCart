let selectedCategory = "All";
let searchText = "";

let modalQuantity = 1;
let currentModalProductId = null;

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
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  card.innerHTML = `
    <a class="product-open" href="#products" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.image}" alt="" width="900" height="1200" loading="lazy">
      </div>
      <div class="product-copy">
        <p class="eyebrow">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatPrice(product.price)}</p>
      </div>
    </a>
    <div class="product-actions">
      <button type="button" class="add-button" data-product-id="${product.id}">Add to Cart</button>
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

  card.querySelector(".product-open").addEventListener("click", handleProductOpenClick);
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

  if (!document.getElementById("cart-drawer").classList.contains("is-open")) {
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

  if (!document.getElementById("product-modal").classList.contains("is-open")) {
    document.body.classList.remove("no-scroll");
  }
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

    if (document.getElementById("product-modal").classList.contains("is-open")) {
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
  setupEvents();
}

startApp();
