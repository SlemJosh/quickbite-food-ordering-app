let cart = [];

function addToCart(foodId) {
  console.log("Food item added to cart:", foodId);
  cart.push(foodId);
  document.getElementById("cartCount").innerText = cart.length;
}

function loadFoodDetails() {
  fetch("https://dummyjson.com/recipes")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("menuContainer");
      data.recipes.forEach(item => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-3";
        card.innerHTML = `
          <div class="card food-item">
            <img src="${item.image}" class="card-img-top" alt="${item.name}">
            <div class="card-body">
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text">Rating: ${item.rating}</p>
              <button class="btn btn-outline-primary" onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
          </div>`;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Error fetching food:", err));
}
