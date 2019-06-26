let processProducts = function() {
    let index = 0;
    app.products.map((theproduct) => {
        Vue.set(theproduct, 'index', index++);
        Vue.set(theproduct, 'showReviews', false);
        Vue.set(theproduct, 'otherReviews', []);
        Vue.set(theproduct, 'yourReview', { rating: 0, numStars: 0 });
    });
};

// let processReviews = function(productIndex) {
//     let theproduct = app.products[productIndex];
//     let index = 0;
//     theproduct.otherReviews.map((review) => {
//         Vue.set(review, 'index', index++);
//         Vue.set(review, 'numStars', review.rating);
//     });
// };

let getAllProducts = function() {
    $.getJSON(getAllProductsUrl, function(response) {
        app.products = response.products;
        processProducts();
        console.log(app.products)
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

    let theproduct = app.products[productIndex];

    $.getJSON(getYourReviewUrl, { product_id: theproduct.id, email: app.loggedInUser }, function(response) {
        if (response.review != null) {
            theproduct.yourReview.rating = response.review.rating;
            theproduct.yourReview.numStars = response.review.rating;
        }
    });
};

let getOtherReviews = function(productIndex) {
    let theproduct = app.products[productIndex];
    $.getJSON(getOtherReviewsUrl, { product_id: theproduct.id }, function(response) {
        theproduct.otherReviews = response.other_reviews;
        // processReviews(productIndex);
    });
};

let toggleReviewsSection = function(productIndex) {
    let theproduct = app.products[productIndex];
    theproduct.showReviews = !theproduct.showReviews;
};

let hoverStar = function(productIndex, starNum) {
    let theproduct = app.products[productIndex];
    theproduct.yourReview.numStars = starNum;
};

let leaveStarRow = function(productIndex) {
    let theproduct = app.products[productIndex];
    theproduct.yourReview.numStars = theproduct.yourReview.rating;
};

let clickStar = function(productIndex, starNum) {
    let theproduct = app.products[productIndex];
    theproduct.yourReview.rating = starNum;
    $.post(updateStarUrl, {
        product_id: theproduct.id,
        email: app.loggedInUser,
        rating: starNum
    }, function() {

    });

    let sum = 0;
    let numRecords = theproduct.otherReviews.length + 1; // +1 to account for user's rating
    for(let i=0; i<theproduct.otherReviews.length; i++) {
        sum += theproduct.otherReviews[i].rating;
        if (theproduct.otherReviews[i].rating == 0) {
          numRecords--; // if theres a rating with a value of 0. We shouldnt count that
        }
    }
    if (theproduct.yourReview.rating == 0) {
      numRecords --; // if user has rating 0.
    }

    sum += theproduct.yourReview.rating;
    theproduct.avg_rating = sum / numRecords;
};

let app = new Vue({
    el: "#app",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {
        products: [],
        starIndices: [1, 2, 3, 4, 5],
        loggedInUser: undefined,
    },
    methods: {
        getYourReview: getYourReview,
        toggleReviewsSection: toggleReviewsSection,
        hoverStar: hoverStar,
        leaveStarRow: leaveStarRow,
        clickStar: clickStar
    }
});

onPageLoad();
