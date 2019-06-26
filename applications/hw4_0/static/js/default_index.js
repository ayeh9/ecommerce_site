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

    // Grabs all the products into a list
    self.get_products = function() {
        $.getJSON(get_product_list_url,
            function(data) {
                self.vue.product_list = data.product_list;
                enumerate(self.vue.product_list);
            }
        );
    }

    // Grabs all the reviews into a list
    self.get_reviews = function() {
        $.getJSON(get_review_list_url,
            function(data) {
                self.vue.review_list = data.review_list;
                enumerate(self.vue.review_list);
            }
        );
    }

    // Calculates the product average given a specific ID
    self.get_avg = function(product_id) {
        var avg = 0;
        var total_star = 0;
        var total_review = 0;
        for (i = 0; i < self.vue.review_list.length; i ++) {
            if (self.vue.review_list[i].product_id === product_id){
                total_star += self.vue.review_list[i].review_star;
                total_review += 1;
            }
        }
        avg = Math.ceil(total_star / total_review);
        if (isNaN(avg)) {
            avg = 0;
        }
        return avg;
    }

    // Sets the star when clicked on when making a new review
    self.star_set = function (idx) {
        self.vue.review_star = self.vue.star_hover = idx;
    }

    // Opens a product's review
    self.detail_open = function(product_id){
        self.vue.details = product_id;
        // Also resets the shown stars
        self.vue.review_star = self.vue.star_hover = 0;
    }

    // Closes a product's review
    self.detail_close = function(){
        self.vue.details = -1;
        // Also resets the shown stars
        self.vue.review_star = self.vue.star_hover = 0;
    }

    // Adds a review to a specified product
    self.add_review = function (product_id) {
        $.web2py.disableElement($("#add_review"));
        var sent_content = self.vue.review_content;
        var sent_rating = self.vue.review_star; // Makes a copy
        self.vue.check_mark = true;
        setTimeout(function (){self.vue.check_mark = false;}, 3000);
        $.post(add_review_url,
            {
                product_id: product_id,
                review_content: sent_content,
                review_star: sent_rating,
            },
            function (data) {
                $.web2py.enableElement($("#add_review"));
                // Clears the form.
                self.vue.review_content = "";
                self.vue.review_star = self.vue.star_hover = 0;
                var new_review = {
                    user_email: 'te',
                    product_id: product_id,
                    review_content: sent_content,
                    review_rating: sent_rating
                };
                enumerate(self.vue.review_list)

                self.get_reviews()
            });
        self.get_reviews()
    };

    // Searches for products that match the search query
    self.do_search = function () {
        self.vue.name_array = [];
        for (var i = 0; i < self.vue.product_list.length; i ++){
            self.vue.name_array.push(self.vue.product_list[i].name)
        }
        $.getJSON(search_url,
            {
                search_string: self.vue.search_string,
                name_array: self.vue.name_array,
            },
            function (data) {
                self.vue.strings = data.strings;
            });
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            product_list : [],
            review_list: [],
            star_list: [],
            star_indices: [1, 2, 3, 4, 5],
            details: -1,
            review_content: "",
            review_star: 0,
            star_hover: 0,
            star_avg: 0,
            check_mark: false,
            strings: [],
            search_string: '',
            name_array: [],
        },
        methods: {
            add_review: self.add_review,
            detail_open: self.detail_open,
            detail_close: self.detail_close,
            star_set: self.star_set,
            get_avg: self.get_avg,
            do_search: self.do_search

        }

    });
    self.get_products();
    self.get_reviews();
    self.get_stars()



    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
