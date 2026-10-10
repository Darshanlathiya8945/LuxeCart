const CART_STORAGE_KEY = "luxecart-cart";

function getCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    const cleanCart = [];

    for (let index = 0; index < parsedCart.length; index++) {
      const item = parsedCart[index];

      if (!item) {
        continue;
      }

      const id = Number(item.id);
      const quantity = Number(item.quantity);

      if (!id || quantity < 1) {
        continue;
      }

      cleanCart.push({
        id: id,
        quantity: quantity
      });
    }

    return cleanCart;
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  const cartAsText = JSON.stringify(cart);

  try {
    localStorage.setItem(CART_STORAGE_KEY, cartAsText);
  } catch (error) {
  }
}

function addToCart(productId, quantity) {
  const product = getProductById(productId);

  if (!product) {
    return;
  }

  quantity = Math.round(Number(quantity));

  if (!quantity || quantity < 1) {
    quantity = 1;
  }

  const cart = getCart();
  let productAlreadyInCart = false;

  for (let index = 0; index < cart.length; index++) {
    if (cart[index].id === product.id) {
      cart[index].quantity += quantity;
      productAlreadyInCart = true;
      break;
    }
  }

  if (!productAlreadyInCart) {
    cart.push({
      id: product.id,
      quantity: quantity
    });
  }

  saveCart(cart);
}

function increaseQuantity(productId) {
  const cart = getCart();
  const numericId = Number(productId);

  for (let index = 0; index < cart.length; index++) {
    if (cart[index].id === numericId) {
      cart[index].quantity += 1;
      break;
    }
  }

  saveCart(cart);
}

function decreaseQuantity(productId) {
  const cart = getCart();
  const numericId = Number(productId);
  const updatedCart = [];

  for (let index = 0; index < cart.length; index++) {
    const item = cart[index];

    if (item.id === numericId) {
      if (item.quantity - 1 >= 1) {
        updatedCart.push({
          id: item.id,
          quantity: item.quantity - 1
        });
      }
    } else {
      updatedCart.push(item);
    }
  }

  saveCart(updatedCart);
}

function removeFromCart(productId) {
  const cart = getCart();
  const numericId = Number(productId);
  const updatedCart = [];

  for (let index = 0; index < cart.length; index++) {
    if (cart[index].id !== numericId) {
      updatedCart.push(cart[index]);
    }
  }

  saveCart(updatedCart);
}

function getCartCount() {
  const cart = getCart();
  let totalItems = 0;

  for (let index = 0; index < cart.length; index++) {
    totalItems += cart[index].quantity;
  }

  return totalItems;
}

function getCartTotal() {
  const cart = getCart();
  let total = 0;

  for (let index = 0; index < cart.length; index++) {
    const product = getProductById(cart[index].id);

    if (product) {
      total += product.price * cart[index].quantity;
    }
  }

  return total;
}

function clearCart() {
  saveCart([]);
}
  