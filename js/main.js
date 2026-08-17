/* =========================================================
   NOVA FASHION STORE
   JavaScript E-Commerce Project
========================================================= */


/* ================= API ================= */

const API_URL =
    "https://dummyjson.com/products?limit=0";


/* ================= STATE ================= */

let products = [];

let displayedProducts = [];

let cart =
    JSON.parse(localStorage.getItem("novaCart")) || [];

let favorites =
    JSON.parse(localStorage.getItem("novaFavorites")) || [];

let currentCategory = "all";

let searchTerm = "";

let currentPage = 1;

const productsPerPage = 8;


/* ================= DOM ================= */

const productsGrid =
    document.getElementById("productsGrid");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

const categoryButtons =
    document.getElementById("categoryButtons");

const cartBtn =
    document.getElementById("cartBtn");

const cartSidebar =
    document.getElementById("cartSidebar");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const favoriteCount =
    document.getElementById("favoriteCount");

const subtotalElement =
    document.getElementById("subtotal");

const shippingElement =
    document.getElementById("shipping");

const discountElement =
    document.getElementById("discount");

const totalElement =
    document.getElementById("total");

const productModal =
    document.getElementById("productModal");

const modalContent =
    document.getElementById("modalContent");

const closeModal =
    document.getElementById("closeModal");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const loading =
    document.getElementById("loading");

const themeBtn =
    document.getElementById("themeBtn");


/* =========================================================
   FETCH PRODUCTS
========================================================= */

async function getProducts() {

    try {

        showLoading();

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "Failed to fetch products"
            );

        }

        const data =
            await response.json();

        products =
            data.products;

        displayedProducts =
            [...products];

        renderProducts();

        updateCartUI();

    } catch (error) {

        console.error(error);

        productsGrid.innerHTML = `

            <div class="error">

                <h2>
                    Something went wrong.
                </h2>

                <p>
                    Could not load products.
                </p>

                <button
                    onclick="getProducts()"
                    class="primary-btn"
                >
                    Try Again
                </button>

            </div>

        `;

    } finally {

        hideLoading();

    }

}


/* =========================================================
   FILTER PRODUCTS
========================================================= */

function filterProducts() {

    let result =
        [...products];


    /* SEARCH */

    if (searchTerm) {

        result =
            result.filter(product =>

                product.title
                    .toLowerCase()
                    .includes(
                        searchTerm.toLowerCase()
                    )

            );

    }


    /* CATEGORY */

    if (currentCategory !== "all") {

        result =
            result.filter(product =>

                product.category ===
                currentCategory

            );

    }


    /* SORT */

    const sort =
        sortSelect.value;

    if (sort === "low") {

        result.sort(
            (a, b) =>
                a.price - b.price
        );

    }

    if (sort === "high") {

        result.sort(
            (a, b) =>
                b.price - a.price
        );

    }

    if (sort === "rating") {

        result.sort(
            (a, b) =>
                b.rating - a.rating
        );

    }


    displayedProducts =
        result;

    currentPage = 1;

    renderProducts();

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const end =
        currentPage *
        productsPerPage;

    const visibleProducts =
        displayedProducts.slice(
            0,
            end
        );


    if (!visibleProducts.length) {

        productsGrid.innerHTML = `

            <div class="empty-products">

                <h2>
                    No products found.
                </h2>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    productsGrid.innerHTML =
        visibleProducts
            .map(product =>

                createProductCard(product)

            )
            .join("");


    const loadMoreBtn =
        document.getElementById(
            "loadMoreBtn"
        );

    if (
        visibleProducts.length >=
        displayedProducts.length
    ) {

        loadMoreBtn.style.display =
            "none";

    } else {

        loadMoreBtn.style.display =
            "inline-block";

    }


    document.getElementById(
        "productResult"
    ).textContent =

        `${displayedProducts.length} products found`;

}


/* =========================================================
   PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const isFavorite =
        favorites.includes(product.id);


    return `

        <article
            class="product-card"
            data-id="${product.id}"
        >

            <div class="product-image">

                <img
                    src="${product.thumbnail}"
                    alt="${product.title}"
                    loading="lazy"
                >

                <button
                    class="favorite
                    ${isFavorite ? "active" : ""}"
                    onclick="
                        toggleFavorite(${product.id})
                    "
                >

                    <i class="
                        fa-${
                            isFavorite
                            ? "solid"
                            : "regular"
                        }
                        fa-heart
                    "></i>

                </button>


                ${
                    product.discountPercentage > 0

                    ? `

                    <span class="discount">

                        -${Math.round(
                            product.discountPercentage
                        )}%

                    </span>

                    `

                    : ""
                }

            </div>


            <div class="product-info">

                <span class="product-category">

                    ${product.category}

                </span>


                <h3 class="product-title">

                    ${product.title}

                </h3>


                <div class="rating">

                    ${createStars(product.rating)}

                    <span>
                        ${product.rating}
                    </span>

                </div>


                <div class="product-bottom">

                    <span class="price">

                        $${product.price.toFixed(2)}

                    </span>


                    <button
                        class="add-btn"
                        onclick="
                            addToCart(${product.id})
                        "
                    >

                        <i class="
                            fa-solid
                            fa-plus
                        "></i>

                    </button>

                </div>


                <button
                    class="view-btn"
                    onclick="
                        openProduct(${product.id})
                    "
                >

                    View Details

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   STARS
========================================================= */

function createStars(rating) {

    const fullStars =
        Math.round(rating);

    return Array.from(
        { length: 5 },
        (_, index) =>

            index < fullStars

                ? `<i class="fa-solid fa-star"></i>`

                : `<i class="fa-regular fa-star"></i>`

    ).join("");

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(productId) {

    const product =
        products.find(
            item => item.id === productId
        );

    if (!product) return;


    const existing =
        cart.find(
            item => item.id === productId
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            id: product.id,

            title: product.title,

            price: product.price,

            thumbnail: product.thumbnail,

            quantity: 1

        });

    }


    saveCart();

    updateCartUI();

    showToast(
        `${product.title} added to cart`
    );

}


/* =========================================================
   UPDATE QUANTITY
========================================================= */

function changeQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            product =>
                product.id === productId
        );

    if (!item) return;


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                product =>
                    product.id !== productId
            );

    }


    saveCart();

    updateCartUI();

}


/* =========================================================
   REMOVE FROM CART
========================================================= */

function removeFromCart(productId) {

    cart =
        cart.filter(
            item =>
                item.id !== productId
        );

    saveCart();

    updateCartUI();

    showToast(
        "Product removed from cart"
    );

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        "novaCart",
        JSON.stringify(cart)
    );

}


/* =========================================================
   CART UI
========================================================= */

function updateCartUI() {

    const quantity =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    cartCount.textContent =
        quantity;


    if (!cart.length) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div>

                    <i class="
                        fa-solid
                        fa-bag-shopping
                    "></i>

                    <h3>
                        Your bag is empty
                    </h3>

                    <p>
                        Add something you love.
                    </p>

                </div>

            </div>

        `;

    } else {

        cartItems.innerHTML =
            cart
                .map(item =>
                    createCartItem(item)
                )
                .join("");

    }


    calculateTotals();

}


/* =========================================================
   CART ITEM
========================================================= */

function createCartItem(item) {

    return `

        <div class="cart-item">

            <img
                src="${item.thumbnail}"
                alt="${item.title}"
            >


            <div>

                <h4>
                    ${item.title}
                </h4>

                <span class="cart-price">

                    $${item.price.toFixed(2)}

                </span>


                <div class="quantity">

                    <button
                        onclick="
                            changeQuantity(
                                ${item.id},
                                -1
                            )
                        "
                    >
                        −
                    </button>

                    <strong>
                        ${item.quantity}
                    </strong>

                    <button
                        onclick="
                            changeQuantity(
                                ${item.id},
                                1
                            )
                        "
                    >
                        +
                    </button>

                </div>

            </div>


            <button
                class="remove-item"
                onclick="
                    removeFromCart(${item.id})
                "
            >

                <i class="
                    fa-solid
                    fa-trash
                "></i>

            </button>

        </div>

    `;

}


/* =========================================================
   CALCULATE TOTALS
========================================================= */

function calculateTotals() {

    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                item.price *
                item.quantity,
            0
        );


    const shipping =
        subtotal === 0
            ? 0
            : subtotal >= 100
                ? 0
                : 10;


    const discount =
        subtotal >= 200
            ? subtotal * 0.10
            : 0;


    const total =
        subtotal +
        shipping -
        discount;


    subtotalElement.textContent =
        `$${subtotal.toFixed(2)}`;

    shippingElement.textContent =
        shipping === 0
            ? "FREE"
            : `$${shipping.toFixed(2)}`;

    discountElement.textContent =
        `-$${discount.toFixed(2)}`;

    totalElement.textContent =
        `$${total.toFixed(2)}`;

}


/* =========================================================
   FAVORITES
========================================================= */

function toggleFavorite(productId) {

    if (favorites.includes(productId)) {

        favorites =
            favorites.filter(
                id => id !== productId
            );

        showToast(
            "Removed from favorites"
        );

    } else {

        favorites.push(productId);

        showToast(
            "Added to favorites ❤️"
        );

    }


    localStorage.setItem(
        "novaFavorites",
        JSON.stringify(favorites)
    );


    favoriteCount.textContent =
        favorites.length;


    renderProducts();

}


favoriteCount.textContent =
    favorites.length;


/* =========================================================
   OPEN PRODUCT MODAL
========================================================= */

function openProduct(productId) {

    const product =
        products.find(
            item => item.id === productId
        );

    if (!product) return;


    modalContent.innerHTML = `

        <div class="modal-product">

            <img
                src="${product.images?.[0] || product.thumbnail}"
                alt="${product.title}"
            >


            <div class="modal-info">

                <span class="product-category">

                    ${product.category}

                </span>


                <h2>
                    ${product.title}
                </h2>


                <div class="rating">

                    ${createStars(product.rating)}

                    <span>
                        ${product.rating}
                    </span>

                </div>


                <div class="modal-price">

                    $${product.price.toFixed(2)}

                </div>


                <p>

                    ${product.description}

                </p>


                <p>

                    <strong>
                        Stock:
                    </strong>

                    ${product.stock}

                </p>


                <button
                    class="primary-btn"
                    onclick="
                        addToCart(${product.id});
                        closeProductModal();
                    "
                >

                    Add To Cart

                    <i class="
                        fa-solid
                        fa-bag-shopping
                    "></i>

                </button>

            </div>

        </div>

    `;


    productModal.classList.add("show");

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeProductModal() {

    productModal.classList.remove("show");

}


/* =========================================================
   CART OPEN / CLOSE
========================================================= */

function openCart() {

    cartSidebar.classList.add("open");

    cartOverlay.classList.add("show");

}

function closeCartSidebar() {

    cartSidebar.classList.remove("open");

    cartOverlay.classList.remove("show");

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message) {

    toastMessage.textContent =
        message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    loading.classList.remove("hide");

}

function hideLoading() {

    loading.classList.add("hide");

}


/* =========================================================
   HERO SLIDER
========================================================= */

const heroSlides =
    document.querySelectorAll(
        ".hero-slide"
    );

const sliderDots =
    document.getElementById(
        "sliderDots"
    );

let currentSlide = 0;


/* CREATE DOTS */

heroSlides.forEach(
    (_, index) => {

        const dot =
            document.createElement(
                "span"
            );

        dot.className =
            "dot";

        if (index === 0) {

            dot.classList.add(
                "active"
            );

        }


        dot.addEventListener(
            "click",
            () => {

                currentSlide =
                    index;

                updateSlider();

            }
        );


        sliderDots.appendChild(
            dot
        );

    }
);


function updateSlider() {

    heroSlides.forEach(
        (slide, index) => {

            slide.classList.toggle(
                "active",
                index === currentSlide
            );

        }
    );


    document
        .querySelectorAll(".dot")
        .forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === currentSlide
                );

            }
        );

}


function nextSlide() {

    currentSlide++;

    if (
        currentSlide >=
        heroSlides.length
    ) {

        currentSlide = 0;

    }

    updateSlider();

}


function previousSlide() {

    currentSlide--;

    if (currentSlide < 0) {

        currentSlide =
            heroSlides.length - 1;

    }

    updateSlider();

}


document
    .getElementById("nextSlide")
    .addEventListener(
        "click",
        nextSlide
    );


document
    .getElementById("prevSlide")
    .addEventListener(
        "click",
        previousSlide
    );


/* AUTO SLIDER */

setInterval(
    nextSlide,
    5000
);


/* =========================================================
   EVENTS
========================================================= */


/* SEARCH */

searchInput.addEventListener(
    "input",
    event => {

        searchTerm =
            event.target.value;

        filterProducts();

    }
);


/* SORT */

sortSelect.addEventListener(
    "change",
    filterProducts
);


/* CATEGORY */

categoryButtons.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".filter-btn"
            );

        if (!button) return;


        document
            .querySelectorAll(
                ".filter-btn"
            )
            .forEach(btn =>
                btn.classList.remove(
                    "active"
                )
            );


        button.classList.add(
            "active"
        );


        currentCategory =
            button.dataset.category;


        filterProducts();

    }
);


/* LOAD MORE */

document
    .getElementById("loadMoreBtn")
    .addEventListener(
        "click",
        () => {

            currentPage++;

            renderProducts();

        }
    );


/* CART */

cartBtn.addEventListener(
    "click",
    openCart
);


closeCart.addEventListener(
    "click",
    closeCartSidebar
);


cartOverlay.addEventListener(
    "click",
    closeCartSidebar
);


/* MODAL */

closeModal.addEventListener(
    "click",
    closeProductModal
);


productModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            productModal
        ) {

            closeProductModal();

        }

    }
);


/* ESC KEY */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeCartSidebar();

            closeProductModal();

        }

    }
);


/* SHOP NOW */

document
    .getElementById("shopNowBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("products")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


/* NEWSLETTER */

document
    .getElementById("newsletterForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const email =
                document
                    .getElementById(
                        "emailInput"
                    )
                    .value.trim();


            if (!email) return;


            showToast(
                "You're on the list! 🎉"
            );


            event.target.reset();

        }
    );


/* =========================================================
   DARK MODE
========================================================= */

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "novaTheme",
            dark
                ? "dark"
                : "light"
        );


        themeBtn.innerHTML = dark

            ? `
                <i class="
                    fa-solid
                    fa-sun
                "></i>
              `

            : `
                <i class="
                    fa-solid
                    fa-moon
                "></i>
              `;

    }
);


/* RESTORE THEME */

if (
    localStorage.getItem(
        "novaTheme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );

    themeBtn.innerHTML = `
        <i class="
            fa-solid
            fa-sun
        "></i>
    `;

}


/* =========================================================
   START APP
========================================================= */

getProducts();