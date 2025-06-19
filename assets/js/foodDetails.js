function getStickyPrice(title) {
  const storedPrices = JSON.parse(localStorage.getItem("foodPrices")) || {};
  if (storedPrices[title]) return storedPrices[title];
  const newPrice = (Math.random() * (20 - 5) + 5).toFixed(2);
  storedPrices[title] = newPrice;
  localStorage.setItem("foodPrices", JSON.stringify(storedPrices));
  return newPrice;
}

function showToast(message = "Item added to cart!") {
  const toastEl = document.getElementById("toastNotification");
  if (toastEl) {
    toastEl.querySelector(".toast-body").textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

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
  updateAddButtonText(name);
  showToast(`${name} added to cart!`);
}

function updateAddButtonText(name) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find(i => i.name === name);
  if (!item) return;

  document.querySelectorAll(`[data-food-name="${name}"]`).forEach(button => {
    button.textContent = `Added${item.quantity > 1 ? ' x' + item.quantity : ''}`;
    button.classList.remove("btn-outline-success");
    button.classList.add("btn-success");
  });
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.innerText = total;
}

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
    const price = getStickyPrice(item.name);
    const card = document.createElement("div");
    card.className = "col-md-4 mb-3";

    card.innerHTML = `
      <div class="card food-item">
        <div onclick='showModal(${JSON.stringify(item)})'>
          <img src="${item.image}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">Rating: ${item.rating}</p>
            <p class="card-text"><strong>Price:</strong> $${price}</p>
          </div>
        </div>
        <div class="card-footer bg-transparent border-top-0">
          <button 
            class="btn btn-outline-success w-100" 
            data-food-name="${item.name}" 
            onclick="addToCart('${item.name}', '${item.image}', ${price})">
            Add to Cart
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
    updateAddButtonText(item.name);
  });

  updatePagination(list);
  updateCartCount();
}

function updatePagination(list) {
  const pagination = document.getElementById("paginationContainer");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(list.length / itemsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${i === currentPage ? 'btn-success' : 'btn-outline-secondary'} mx-1`;
    btn.innerText = i;
    btn.onclick = () => {
      currentPage = i;
      renderPage(currentPage);
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
}

function clearMealFilter() {
  filteredRecipes = [];
  currentPage = 1;
  renderPage(currentPage);
}

function loadFoodDetails() {
  fetch("https://dummyjson.com/recipes")
    .then(res => res.json())
    .then(data => {
      allRecipes = data.recipes;
      renderPage(currentPage);
    })
    .catch(err => console.error("Error fetching food:", err));
}

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
}

window.addToCart = addToCart;
