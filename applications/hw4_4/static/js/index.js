let processProducts = function() {
    let index = 0;
    app.products.map((theproduct) => {
        Vue.set(theproduct, 'index', index++);
        Vue.set(theproduct, 'showReviews', false);
        Vue.set(theproduct, 'otherReviews', []);
        Vue.set(theproduct, 'yourReview', { rating: 0, numStars: 0, body: '' });
        Vue.set(theproduct, 'reviewState','Reviews');
        Vue.set(theproduct, 'isHidden', false);
    });
};

let showReviewState = function(productIndex){
  var temp = app.products[productIndex];
  //if(temp.reviewState == "Reviews"){
  //  temp.reviewState = "Close Reviews";
  //}else{
  //  temp.reviewState = "Reviews";
  //}
};

// implementation of search bar
let filterBooks = function () {
        for (var i=0; i<app.products.length;i++) {
            var theproduct = app.products[i];
            var name = app.products[i].name;
            //set the boolean for showing & hiding
        if (name.toLowerCase().includes(app.search_string.toLowerCase())){
            theproduct.isHidden = false;
        }else{
            theproduct.isHidden = true;
        }

    }
    console.log("here");
};

let saveReview = function(productIndex) {
    // exit the function if the user is not logged in
    if (app.loggedInUser == undefined) {
        return;
    }

    let theproduct = app.products[productIndex];
    let yourReview = theproduct.yourReview;
    yourReview.hasBeenSaved = false;
    //save the review
    $.post(saveReviewUrl, {
        product_id: theproduct.id,
        email: app.loggedInUser,
        body: yourReview.body
    }, function(response) {
        yourReview.hasBeenSaved = true;
        setTimeout(function() {
            yourReview.hasBeenSaved = false;
        }, 1000);
    });
};

//get all the product
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

//save the rating, star, and comment to datebase
let getYourReview = function(productIndex) {
    // exit the function if the user is not logged in
    if (app.loggedInUser == undefined) {
        return;
    }
    let theproduct = app.products[productIndex];
    $.getJSON(getYourReviewUrl, { product_id: theproduct.id, email: app.loggedInUser }, function(response) {
        if (response.review != null) {
            //set the corresponding value
            theproduct.yourReview.rating = response.review.rating;
            theproduct.yourReview.numStars = response.review.rating;
            theproduct.yourReview.body = response.review.body;
        }
        Vue.set(theproduct.yourReview, 'hasBeenSaved', false);
    });
};

let getOtherReviews = function(productIndex) {
    let theproduct = app.products[productIndex];
    $.getJSON(getOtherReviewsUrl, { product_id: theproduct.id }, function(response) {
        theproduct.otherReviews = response.other_reviews;
        // processReviews(productIndex);
    });
};

//only one review showed each time
let toggleReviewsSection = function(productIndex) {
    let theproduct = app.products[productIndex];
    for (let i = 0;i<app.products.length;i++){
        if (i != productIndex){
            app.products[i].showReviews =false;
            app.products[i].reviewState = "Reviews"
        }
    }
    theproduct.showReviews = !theproduct.showReviews;
    theproduct.reviewState = "Close Reviews";
    //var temp = app.products[productIndex];
    //if(temp.reviewState == "Reviews"){
    //  temp.reviewState = "Close Reviews";
    //}else{
    //  temp.reviewState = "Reviews";
    //}

};

let hoverStar = function(productIndex, starNum) {
    let theproduct = app.products[productIndex];
    theproduct.yourReview.numStars = starNum;
};

let leaveStarRow = function(productIndex) {
    let theproduct = app.products[productIndex];
    theproduct.yourReview.numStars = theproduct.yourReview.rating;
};

//
let clickStar = function(productIndex, starNum) {
    let theproduct = app.products[productIndex];
    theproduct.yourReview.rating = starNum;
    $.post(updateStarUrl, {
        product_id: theproduct.id,
        email: app.loggedInUser,
        rating: starNum
    }, function() {

    });
    //total star--includes all users' star, set to calculate avg star
    let totalstar = 0;
    let evaluationCount = theproduct.otherReviews.length + 1;
    for(let i=0; i<theproduct.otherReviews.length; i++) {
        totalstar += theproduct.otherReviews[i].rating;
        if (theproduct.otherReviews[i].rating == 0) {
          evaluationCount--;
        }
    }
    if (theproduct.yourReview.rating == 0) {
      evaluationCount --; // if user has rating 0.
    }
    totalstar += theproduct.yourReview.rating;
    //calculate the average stars
    theproduct.avg_rating = totalstar / evaluationCount;
};

let app = new Vue({
    el: "#app",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {
        products: [],
        starIndices: [1, 2, 3, 4, 5],
        loggedInUser: undefined,
        search_string:''
    },
    methods: {
        getYourReview: getYourReview,
        toggleReviewsSection: toggleReviewsSection,
        hoverStar: hoverStar,
        leaveStarRow: leaveStarRow,
        clickStar: clickStar,
        showReviewState:showReviewState,
        saveReview: saveReview,
        filterBooks: filterBooks
    }
});

onPageLoad();
