// This is the js for the default/index.html view.

var app = function () {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function (a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function (v) { var k = 0; return v.map(function (e) { e._idx = k++; }); };

    self.get_prods = function () {
        $.getJSON(get_prod_list_url,
            function (data) {
                // I am assuming here that the server gives me a nice list
                // of prods, all ready for display.

                self.vue.prod_list = data.prod_list;

                // prod-processing.
                self.process_prods();
            }
        );
    };

    self.get_revs = function () {
        $.getJSON(get_rev_list_url,
            function (data) {
                // I am assuming here that the server gives me a nice list
                // of prods, all ready for display.

                self.vue.review_list = data.review_list;

                enumerate(self.vue.review_list);
            }
        );
    };

    self.process_prods = function () {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts. 
        // We add the _idx attribute to the posts. 
        enumerate(self.vue.prod_list);
        // We initialize the smile status to match the like. 
        self.vue.prod_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats

            // Number of stars to display.
            Vue.set(e, 'stars', calc_stars(e));

            // Reviews
            Vue.set(e, 'reviews', 'Show Reviews');
        });
    };

    // Averages star values for a product
    function calc_stars(e) {
        var sum = 0;
        var count = 0;

        self.vue.review_list.forEach(function (r) {
            if (e.id == r.product) {
                count++;
                sum += parseInt(r.num);
            }
        });

        return Math.floor(sum / count);
    }

    self.get_star_avg = function (e) {
        value = 0;
        count = 0;
    };

    // Code for star ratings.
    self.stars_out = function (prod_idx) {
        // Out of the star rating; set number of visible back to rating.
        var p = self.vue.prod_list[prod_idx];
        self.vue.temp_star = p.stars;

        if (self.vue.clicked_star != p.stars)
            self.vue.temp_star = self.vue.clicked_star;
    };

    self.stars_over = function (star_idx) {
        // Hovering over a star; we show that as the number of active stars.
        self.vue.temp_star = star_idx;
    };

    self.set_stars = function (star_idx) {
        // The user has set this as the number of stars for the post.
        self.vue.clicked_star = star_idx;
    };

    self.show_reviews = function (prod_idx) {
        var p = self.vue.prod_list[prod_idx];

        if (p.reviews == 'Show Reviews') {
            p.reviews = 'Hide Reviews';
        } else {
            p.reviews = 'Show Reviews';
        }

        self.vue.prod_list.forEach(function (prod) {
            if (prod.id != p.id) {
                prod.reviews = 'Show Reviews';
            }
        });
    };

    // adds the review to the database
    self.add_review = function (prod_idx) {
        $.web2py.disableElement($("#add-rev"));

        var p = self.vue.prod_list[prod_idx];

        var sent_cont = self.vue.form_content;
        var sent_rating = self.vue.temp_star;

        if (sent_rating < 0 || sent_rating > 5)
            sent_rating = 0;

        $.post(add_rev_url,
            // data we are sending
            {
                product: p.id,
                cont: sent_cont,
                num: sent_rating,
            },

            // when done
            function (data) {
                //briefly display a check mark
                self.vue.check = prod_idx;
                setTimeout(function() {self.vue.check = -1;}, 1000);

                $.web2py.enableElement($("#add-rev"));
                self.vue.form_content = sent_cont;
                self.vue.temp_star = sent_rating;

                self.get_revs();
                self.get_prods();
                self.process_prods();
            }
        );
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_rating: "",
            form_content: "",
            prod_list: [],
            review_list: [],
            star_indices: [1, 2, 3, 4, 5],
            temp_star: 0,
            clicked_star: 0,
            search_string: "",
            check: -1,
        },
        methods: {
            // reviews
            show_reviews: self.show_reviews,
            add_review: self.add_review,

            // stars
            stars_out: self.stars_out,
            stars_over: self.stars_over,
            set_stars: self.set_stars,
        }

    });

    // Gets the prods.
    self.get_revs();
    self.get_prods();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () { APP = app(); });
