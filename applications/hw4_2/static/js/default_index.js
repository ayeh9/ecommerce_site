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

    // Searches for a string
    self.do_search = function () {
        $.getJSON(search_url,
            {search_string: self.vue.search_string},
            function (data) {
                self.vue.product_search = data.product_search;
                self.process_strings();
            });
    };

    self.process_strings=function(){
        enumerate(self.vue.product_search);
        self.vue.product_search.map(function (e){
            Vue.set(e, '_num_stars_display', e.rating);
        });
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.add_review = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-review"));
        var sent_desc = self.vue.form_desc; // Makes a copy 
        var sent_average = self.vue.form_average;
        var sent_id = self.vue.product_id;
        $.getJSON(add_review_url,
            // Data we are sending.
            {
                product_id: self.vue.product_id,
                review_desc: self.vue.form_desc,
                average_rating: self.vue.form_average,
            },
            // What do we do when the product succeeds?
            function (data) {
                $.web2py.enableElement($("#add-review"));
            });
    };

    self.get_reviews = function() {
        $.getJSON(get_review_list_url,
            function(data) {
                self.vue.review_list = data.review_list;
                self.process_products();
            }
        );
    };

    self.get_products = function() {
        $.getJSON(get_product_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of products, all ready for display.
                self.vue.product_list = data.product_list;
                // product-processing.
                self.process_products();
            }
        );
    };

    self.process_products = function() {
        // This function is used to product-process products, after the list has been modified
        // or after we have gotten new products. 
        // We add the _idx attribute to the products. 
        enumerate(self.vue.product_list);
        // We initialize the smile status to match the like. 
        self.vue.product_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
            // Did I like it? 
            // Vue.set(e, '_smile', e.like);
            // Who liked it?
            // Vue.set(e, '_likers', []);
            // Do I know who liked it? (This could also be a timestamp to limit refresh)
            // Vue.set(e, '_likers_known', false);
            // Do I show who liked? 
            // Vue.set(e, '_show_likers', false);
            // Number of stars to display.
            Vue.set(e, '_num_stars_display', e.rating);
        });
    };

    self.process_reviews = function() {
        // This function is used to review-process reviews, after the list has been modified
        // or after we have gotten new reviews. 
        // We add the _idx attribute to the products. 
        enumerate(self.vue.product_list);
        // We initialize the smile status to match the like. 
        self.vue.review_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
            // Did I like it? 
            // Vue.set(e, '_smile', e.like);
            // Who liked it?
            // Vue.set(e, '_likers', []);
            // Do I know who liked it? (This could also be a timestamp to limit refresh)
            // Vue.set(e, '_likers_known', false);
            // Do I show who liked? 
            // Vue.set(e, '_show_likers', false);
            // Number of stars to display.
            Vue.set(e, '_num_stars_display', e.rating);
        });
    };

    // Code for getting and displaying the list of likers. 
    // self.show_likers = function(product_idx) {
    //     var p = self.vue.product_list[product_idx];
    //     p._show_likers = true;
    //     if (!p._likers_known) {
    //         $.getJSON(get_likers_url, {product_id: p.id}, function (data) {
    //             p._likers = data.likers
    //             p._likers_known = true;
    //         })
    //     }
    // };

    // self.hide_likers = function(product_idx) {
    //     var p = self.vue.product_list[product_idx];
    //     p._show_likers = false;
    // };

    // // Smile change code. 
    // self.like_mouseover = function (product_idx) {
    //     // When we mouse over something, the face has to assume the opposite
    //     // of the current state, to indicate the effect.
    //     var p = self.vue.product_list[product_idx];
    //     p._smile = !p.like;
    // };

    // self.like_click = function (product_idx) {
    //     // The like status is toggled; the UI is not changed.
    //     var p = self.vue.product_list[product_idx];
    //     p.like = !p.like;
    //     // We force a refresh.
    //     p._likers_known = false;
    //     // We need to product back the change to the server.
    //     $.post(set_like_url, {
    //         product_id: p.id,
    //         like: p.like
    //     },
    //     function (data) {
    //         self.show_likers(product_idx);
    //         p._smile = !p.like;
    //     });
    // };

    // self.like_mouseout = function (product_idx) {
    //     // The like and smile status coincide again.
    //     var p = self.vue.product_list[product_idx];
    //     p._smile = p.like;
    // };

    // Code for star ratings.
    self.stars_out = function (product_idx) {
        // Out of the star rating; set number of visible back to rating.
        var p = self.vue.product_list[product_idx];
        p._num_stars_display = p.rating;
    };

    self.stars_over = function(product_idx, star_idx) {
        // Hovering over a star; we show that as the number of active stars.
        var p = self.vue.product_list[product_idx];
        p._num_stars_display = star_idx;
    };

    self.set_stars = function(product_idx, star_idx) {
        // The user has set this as the number of stars for the product.
        var p = self.vue.product_list[product_idx];
        p.rating = star_idx;
        // Sends the rating to the server.
        $.post(set_stars_url, {
            product_id: p.id,
            rating: star_idx
        })
    };


    

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_content: "",
            form_desc: "",
            form_average: "",
            product_list: [],
            product_search: [],
            review_list: [],
            star_indices: [1, 2, 3, 4, 5],
            strings: [],
            search_string: ''
        },
        methods: {
            add_review: self.add_review,
            get_reviews:self.get_reviews,
            stars_out: self.stars_out,
            stars_over: self.stars_over,
            set_stars: self.set_stars,
            do_search: self.do_search
        }

    });

    // If we are logged in, shows the form to add products.
    if (is_logged_in) {
        $("#add_product").show();
    }

    // Gets the products.
    self.get_products();
    self.get_reviews();

    // does searching
    self.do_search();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
