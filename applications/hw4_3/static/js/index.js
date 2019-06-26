let processProducts = function() {
    let index = 0;
    app.products.map((product) => {
        Vue.set(product, 'index', index++);
        Vue.set(product, 'showReviews', false);
        Vue.set(product, 'yourReview', { body: '' });
        Vue.set(product, 'yourStar', {rating: ''});
        Vue.set(product, 'otherReviews', []);
        Vue.set(product, 'otherStars', []);
        Vue.set(product, 'isHidden', false);
        Vue.set(product, '_num_stars_display', product.rating);
    });
};

let getAllProducts = function() {
    $.getJSON(getAllProductsUrl, function(response) {
        app.products = response.products;
        processProducts();
    });
};

let getLoggedInUser = function(callback) {
    $.getJSON(getLoggedInUserUrl, function(response) {
        app.loggedInUser = response.user;
        callback();
    });
};

let onPageLoad = function() {
    getLoggedInUser(function() {
        getAllProducts();
    });
};

let getYourReview = function(productIndex) {
    // exit the function if the user is not logged in
    if (app.loggedInUser == undefined) {
        return;
    }

    let product = app.products[productIndex];

    $.getJSON(getYourReviewUrl, { product_id: product.id, email: app.loggedInUser }, function(response) {
        if (response.review != null) {
            product.yourReview = response.review;
        }
        Vue.set(product.yourReview, 'hasBeenSaved', false);
    });
};

let getYourStar = function(productIndex) {
    // exit the function if the user is not logged in
    if (app.loggedInUser == undefined) {
        return;
    }

    let product = app.products[productIndex];

    $.getJSON(getYourStarUrl, { product_id: product.id, email: app.loggedInUser }, function(response) {
        if (response.user_star != null) {
            product.yourStar = response.user_star;
        }
        Vue.set(product.yourStar, 'hasBeenSaved', false);
    });
};

let getOtherReviews = function(productIndex) {
    let product = app.products[productIndex];
    $.getJSON(getOtherReviewsUrl, { product_id: product.id }, function(response) {
        product.otherReviews = response.other_reviews;
    });
};
let getOtherStars = function(productIndex) {
    let product = app.products[productIndex];
    $.getJSON(getOtherStarsUrl, { product_id: product.id }, function(response) {
        product.otherStars = response.other_stars;
    });
};

let toggleReviewsSection = function(productIndex) {
    let product = app.products[productIndex];
    product.showReviews = !product.showReviews;
};

let saveReview = function(productIndex) {
    // exit the function if the user is not logged in
    if (app.loggedInUser == undefined) {
        return;
    }

    let product = app.products[productIndex];
    let yourReview = product.yourReview;
    yourReview.hasBeenSaved = false;

    $.post(saveReviewUrl, {
        product_id: product.id,
        email: app.loggedInUser,
        body: yourReview.body
    }, function(response) {
        yourReview.hasBeenSaved = true;
        setTimeout(function() {
            yourReview.hasBeenSaved = false;
        }, 1000);
    });
};

let saveStar = function(productIndex) {
    // exit the function if the user is not logged in
    if (app.loggedInUser == undefined) {
        return;
    }

    let product = app.products[productIndex];
    let yourStar = product.yourStar;
    yourStar.hasBeenSaved = false;

    $.post(saveStarUrl, {
        product_id: product.id,
        email: app.loggedInUser,
        rating: yourStar.rating
    }, function(response) {
        yourStar.hasBeenSaved = true;
        setTimeout(function() {
            yourStar.hasBeenSaved = false;
        }, 1000);
    });
};

// Code for star ratings.
let stars_init = function (productIndex) {
      let product = app.products[productIndex];
    product._num_stars_display = 0;
};

let stars_out = function (productIndex) {
    // Out of the star rating; set number of visible back to rating.
      let product = app.products[productIndex];
    product._num_stars_display = product.rating;
};

let stars_over = function(productIndex, starIndex) {
    // Hovering over a star; we show that as the number of active stars.
    let product = app.products[productIndex];
    product._num_stars_display = starIndex;
};

let set_stars = function(productIndex, starIndex) {
    // The user has set this as the number of stars for the post.
    let product = app.products[productIndex];
    product.rating = starIndex;
    // Sends the rating to the server.
    $.post(set_stars_url, {
      product_id: product.id,
      rating: starIndex
    });
};

let app = new Vue({
    el: "#app",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {
        products: [],
        star_indices: [1, 2, 3, 4, 5],
        loggedInUser: undefined
    },
    methods: {
        getYourReview: getYourReview,
        getYourStar: getYourStar,
        toggleReviewsSection: toggleReviewsSection,
        saveReview: saveReview,
        saveStar: saveStar,
        stars_init: stars_init,
        stars_out: stars_out,
        stars_over: stars_over,
        set_stars: set_stars
    }
});

onPageLoad();
