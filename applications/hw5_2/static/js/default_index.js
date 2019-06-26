// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    // Function to search for products typed in search bar
    self.do_search = function() {
        $.getJSON(search_url,
            { search_string: self.vue.search_string },
            function(data){
                self.vue.product_list = data.product_list;
                self.process_products();
                console.log("search result returned to product list");
            }
        );
        
    };

    // Function to get all products
    self.get_products = function() {
        $.getJSON(get_product_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of products, all ready for display.
                self.vue.product_list = data.product_list;
                self.process_products();
            }
        );
    };

    // Process the list of products, add in variables we will need for each product
    self.process_products = function() {
        enumerate(self.vue.product_list);
        
        self.vue.product_list.map(function (e) {
            Vue.set(e, '_num_stars_avg_display', e.product_rating);
            Vue.set(e, '_num_stars_display', e.product_rating);
            Vue.set(e, '_review_section_closed', true);
            Vue.set(e, '_review_section_opened', false);
            Vue.set(e, 'desired_quantity', 1);
            Vue.set(e, 'buy_checkmark', false);
        });    
    };

    // Process the list of products in cart, add in variables we will need for each product
    self.process_cart = function() {
        enumerate(self.vue.cart_list);
        self.vue.cart_total = 0;
        self.vue.cart_list.map(function (e) {
            Vue.set(e, '_total_price', e.product_price * e.quantity);
            Vue.set(e, 'cart_quantity', e.quantity);
            self.vue.cart_total += e.product_price * e.quantity;
        });

        console.log('In Process Cart function');
        console.log(self.vue.cart_list);
        console.log(self.vue.cart_total)
    };

    // When the open review button is clicked
    self.open_reviews = function(product_idx) {
        self.vue.submit_checkmark = false;
        self.get_reviews(product_idx);
        // If theres a product already displayed, close it
        self.close_reviews(self.vue.product_displayed);
        
        // Expand product that was clicked on
        self.vue.product_displayed = product_idx;
        var productToBeDisplayed = self.vue.product_list[product_idx];
        productToBeDisplayed._review_section_closed = false;
        productToBeDisplayed._review_section_opened = true;
    };

    // When the close review button is clicked
    self.close_reviews = function(product_idx) {
        if(self.vue.product_displayed != null){
            var expandedProduct = self.vue.product_list[self.vue.product_displayed];
            expandedProduct._review_section_closed = true;
            expandedProduct._review_section_opened = false;
            self.vue.product_displayed = null;
        }
    };

    // When the submit button is clicked
    self.add_review = function(product_idx) {
        self.vue.submit_checkmark = false;

        // Cannot submit empty review
        if(self.vue.review_content == ""){
            self.vue.review_content_empty = true;
            return;
        }
        self.vue.review_content_empty = false;

        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-review"));

        var sent_review_content = self.vue.review_content;
        var p = self.vue.product_list[product_idx];

        $.post(add_review_url,
            // Data we are sending.
            {
                product_id: p.id,
                review_content: self.vue.review_content
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-review"));
                // Clears the form.
                self.vue.review_content = "";
                // Adds the review to the list of reviews. 
                var new_review = {
                    id: data.review_id,
                    review_content: sent_review_content
                };
                
                self.vue.submit_checkmark = true;
                setTimeout(function () {
                    self.vue.submit_checkmark = false;
                }, 3000);
            });
    };

    // Function to retrieve reviews for a particular product
    self.get_reviews = function(product_idx) {
        self.vue.user_review = "";
        var p = self.vue.product_list[product_idx];
        $.getJSON(get_review_list_url,
            {
                product_id: p.id
            },
            function(data) {
                self.vue.review_list = data.review_list;

                $.getJSON(get_user_email_url,
                    function(data) {
                        self.vue.user_email = data.user_email[0].user_email;
                        if(self.vue.user_email){
                            var i = null;
                            for(i = 0; i < self.vue.review_list.length; ++i){
                                if(self.vue.review_list[i].user_email === self.vue.user_email){
                                    break;
                                }
                            }
                            if(i >= 0 && i < self.vue.review_list.length){
                                self.vue.user_review = self.vue.review_list.splice(i,1);
                                p = self.vue.user_review;
                                self.vue.review_content = p[0].review_content;
                            }
                        }
                    }
                );
            }
        );
    }

    // Code for star ratings.
    self.stars_out = function (product_idx) {
        // Out of the star rating; set number of visible back to rating.
        var p = self.vue.product_list[product_idx];
        p._num_stars_display = p.product_rating;
    };

    self.stars_over = function(product_idx, star_idx) {
        // Hovering over a star; we show that as the number of active stars.
        var p = self.vue.product_list[product_idx];
        p._num_stars_display = star_idx;
    };

    self.set_stars = function(product_idx, star_idx) {
        // The user has set this as the number of stars for the product.
        var p = self.vue.product_list[product_idx];
        p.product_rating = star_idx;
        // Sends the rating to the server.
        $.post(set_stars_url, {
            product_id: p.id,
            rating: star_idx
        });
    };

    // Code for adjusting buy quantity
    self.inc_desired_quantity = function(product_idx, qty) {
        // Inc and dec to desired quantity.
        var p = self.vue.product_list[product_idx];
        p.desired_quantity += qty;
        if(p.desired_quantity < 1){
            p.desired_quantity = 1;
        }
    };

    // Code for adjusting cart quantity
    self.inc_cart_quantity = function(product_idx, qty) {
        // Inc and dec to desired quantity.
        var p = self.vue.cart_list[product_idx];
        p.cart_quantity += qty;
        if(p.cart_quantity < 0){
            p.cart_quantity = 0;
        }
        console.log('in cart increase quantity');
        console.log(p.cart_quantity)
        $.post(add_to_cart_url,
            // Data we are sending.
            {
                product_id: p.id,
                quantity: p.cart_quantity
            },
            function(data) {
                self.go_to_cart();
            });
    };

    self.buy_product = function(product_idx){
        console.log("clicking buy product button!!")
        var p = self.vue.product_list[product_idx];
        console.log(p)
        console.log(p.desired_quantity)
        // Add to shopping cart
        $.post(add_to_cart_url,
            // Data we are sending.
            {
                product_id: p.id,
                quantity: p.desired_quantity
            },
            function(data) {
                p.buy_checkmark = true;
                setTimeout(function () {
                    p.buy_checkmark = false;
                }, 2000);
            });
    }

    self.get_cart = function() {
        $.getJSON(get_cart_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of products, all ready for display.
                self.vue.cart_list = data.cart_list;
                self.process_cart();
            }
        );
    };

    self.go_to_store = function() {
        self.vue.store_page = true;
        self.vue.shopping_cart = false;
    };

    self.go_to_cart = function() {
        self.vue.store_page = false;
        self.vue.shopping_cart = true;
        self.get_cart();
    };

    self.pay = function() {
        console.log("pay clicked");
        $.getJSON(delete_cart_url);
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            submit_checkmark: false,
            search_string: "",
            user_email: "",
            user_review: "",
            product_displayed: null,
            review_content_empty: false,
            review_content: "",
            review_list: [],
            product_list: [],
            star_indices: [1, 2, 3, 4, 5],
            store_page: true,
            shopping_cart: false,
            cart_list: [],
            cart_total: 0,
        },
        methods: {
            open_reviews: self.open_reviews,
            close_reviews: self.close_reviews,
            add_review: self.add_review,
            get_reviews: self.get_reviews,

            // Star ratings.
            stars_out: self.stars_out,
            stars_over: self.stars_over,
            set_stars: self.set_stars,
            
            do_search: self.do_search,
            inc_desired_quantity: self.inc_desired_quantity,
            inc_cart_quantity: self.inc_cart_quantity,
            buy_product: self.buy_product,

            go_to_store: self.go_to_store,
            go_to_cart: self.go_to_cart,
            get_cart: self.get_cart,
            pay: self.pay,
        }

    });

    
    self.get_products();
    
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
