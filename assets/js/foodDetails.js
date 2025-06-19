function getStickyPrice(title) {
  const storedPrices = JSON.parse(localStorage.getItem("foodPrices")) || {};

  if (storedPrices[title]) {
    return storedPrices[title];
  }

  const newPrice = (Math.random() * (20 - 5) + 5).toFixed(2);
  storedPrices[title] = newPrice;
  localStorage.setItem("foodPrices", JSON.stringify(storedPrices));
  return newPrice;
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
  alert(`${name} added to cart!`);
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
        <img src="${item.image}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${item.name}</h5>
          <p class="card-text">Rating: ${item.rating}</p>
          <p class="card-text"><strong>Price:</strong> $${price}</p>
          <button class="btn btn-outline-primary mt-auto" onclick="addToCart('${item.name}', '${item.image}', ${price})">Add to Cart</button>
        </div>
      </div>
    `;

    container.appendChild(card);
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
    btn.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'} mx-1`;
    btn.innerText = i;
    btn.onclick = () => {
      currentPage = i;
      renderPage(currentPage);
    };
    pagination.appendChild(btn);
  }
}

// ✅ Filter Logic
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

window.addToCart = addToCart;
