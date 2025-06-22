// ==== Price Handling ====
function getStickyPrice(title) {
  const storedPrices = JSON.parse(localStorage.getItem("foodPrices")) || {};
  if (storedPrices[title]) return storedPrices[title];
  const newPrice = (Math.random() * (20 - 5) + 5).toFixed(2);
  storedPrices[title] = newPrice;
  localStorage.setItem("foodPrices", JSON.stringify(storedPrices));
  return newPrice;
}

// ==== Toast Notifications ====
function showToast(message = "Item added to cart!") {
  const toastEl = document.getElementById("toastNotification");
  if (toastEl) {
    toastEl.querySelector(".toast-body").textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// ==== Cart Management ====
function addToCart(name, image, price) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ name, image, price, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  updateButtons(name);
  showToast(`${name} added to cart!`);
}

function removeFromCart(name) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(item => item.name !== name);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  updateButtons(name);
  showToast(`${name} removed from cart.`);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.innerText = total;
}

// ==== Button State ====
function updateButtons(name) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find(i => i.name === name);

  document.querySelectorAll(`[data-food-name="${name}"]`).forEach(button => {
    button.textContent = item
      ? `Added${item.quantity > 1 ? ' x' + item.quantity : ''}`
      : "Add to Cart";
    button.classList.toggle("btn-success", !!item);
    button.classList.toggle("btn-outline-success", !item);
  });

  document.querySelectorAll(`[data-remove-name="${name}"]`).forEach(removeBtn => {
    removeBtn.style.display = item ? "inline-block" : "none";
  });
}

// ==== Pagination and Filtering ====
const itemsPerPage = 9;
let currentPage = 1;
let allRecipes = [];
let filteredRecipes = [];

function renderPage(page) {
  const container = document.getElementById("menuContainer");
  container.innerHTML = "";
  const list = filteredRecipes.length > 0 ? filteredRecipes : allRecipes;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = list.slice(start, end);

  pageItems.forEach(item => {
    const price = Number(getStickyPrice(item.name)); // Fixed: ensure price is a number
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const inCart = cart.find(i => i.name === item.name);

    const card = document.createElement("div");
    card.className = "col-md-4 mb-3";
    card.innerHTML = `
      <div class="card food-item">
        <div onclick='showModal(${JSON.stringify(item)})'>
          <img src="${item.image}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">Rating: ${item.rating}</p>
            <p class="card-text"><strong>Price:</strong> $${price.toFixed(2)}</p>
          </div>
        </div>
        <div class="card-footer bg-transparent border-top-0 d-flex gap-2">
          <button 
            class="btn ${inCart ? 'btn-success' : 'btn-outline-success'} w-100" 
            data-food-name="${item.name}" 
            onclick="addToCart('${item.name}', '${item.image}', ${price})">
            ${inCart ? `Added${inCart.quantity > 1 ? ' x' + inCart.quantity : ''}` : "Add to Cart"}
          </button>
          <button 
            class="btn btn-outline-danger"
            data-remove-name="${item.name}"
            style="${inCart ? 'display:inline-block;' : 'display:none;'}"
            onclick="removeFromCart('${item.name}')">
            Remove
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  updateCartCount();
}

function updatePagination(list) {
  const pagination = document.getElementById("paginationContainer");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(list.length / itemsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${i === currentPage ? 'btn-success' : 'btn-outline-success'} mx-1`;
    btn.innerText = i;
    btn.onclick = () => {
      currentPage = i;
      renderPage(currentPage);
      updatePagination(list);
    };
    pagination.appendChild(btn);
  }
}

function filterByMealType(type) {
  filteredRecipes = allRecipes.filter(recipe =>
    recipe.mealType && recipe.mealType.includes(type)
  );
  currentPage = 1;
  renderPage(currentPage);
  updatePagination(filteredRecipes);
}

function clearMealFilter() {
  filteredRecipes = [];
  currentPage = 1;
  renderPage(currentPage);
  updatePagination(allRecipes);
}

// ==== Modal Rendering ====
function showModal(item) {
  const modal = new bootstrap.Modal(document.getElementById("foodModal"));

  document.getElementById("modalImage").src = item.image;
  document.getElementById("modalName").innerText = item.name;
  document.getElementById("modalServings").innerText = item.servings;
  document.getElementById("modalRating").innerText = item.rating;
  document.getElementById("modalPrice").innerText = getStickyPrice(item.name);

  const ingredientsList = document.getElementById("modalIngredients");
  ingredientsList.innerHTML = "";
  item.ingredients.forEach(ingredient => {
    const li = document.createElement("li");
    li.textContent = ingredient;
    ingredientsList.appendChild(li);
  });

  modal.show();

  // Modal Add to Cart Button (safe with delay)
  setTimeout(() => {
    const modalBtn = document.getElementById("modalAddButton");
    if (modalBtn) {
      modalBtn.onclick = () => {
        const name = item.name;
        const image = item.image;
        const price = Number(getStickyPrice(name)); // Fixed: ensure price is a number
        addToCart(name, image, price);

        const modalElement = document.getElementById("foodModal");
        const bsModal = bootstrap.Modal.getInstance(modalElement);
        bsModal.hide();
      };
    }
  }, 100);
}

// ==== Fetch and Init ====
function loadFoodDetails() {
  fetch("https://dummyjson.com/recipes")
    .then(res => res.json())
    .then(data => {
      allRecipes = data.recipes;
      renderPage(currentPage);
      updatePagination(allRecipes);
    })
    .catch(err => console.error("Error fetching food:", err));
}

// ==== Utility ====
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==== Global Exports ====
window.scrollToTop = scrollToTop;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.filterByMealType = filterByMealType;
window.clearMealFilter = clearMealFilter;
window.loadFoodDetails = loadFoodDetails;
window.showModal = showModal;
