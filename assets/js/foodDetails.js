// assets/js/foodDetails.js

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
  cart.push({ name, image, price });
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update cart count in navbar if it exists
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.innerText = cart.length;
  }

  alert(`${name} added to cart!`);
}

function loadFoodDetails() {
  fetch("https://dummyjson.com/recipes")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("menuContainer");
      container.innerHTML = ""; // clear in case of refresh

      data.recipes.forEach(item => {
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
    })
    .catch(err => console.error("Error fetching food:", err));
}
