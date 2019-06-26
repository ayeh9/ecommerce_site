// This is the js for the default/index.html view.

var app = function() {

    var self = {};
    Vue.config.silent = false; // show all warnings
    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};
    // gets the list of products
    self.get_products = function() {
      $.getJSON(get_product_list_url,
          function(data) {
              // assign the data's list to VUE
            self.vue.product_list = data.product_list;
            for (var i = 0; i < data.product_list.length; i++){
              self.vue.buy_list[i] = 0;
            }
            // Post-processing.
            self.process_products();
          }
      );
    };

    // post processing, assigns the attributes to Vue
    self.process_products = function() {
        enumerate(self.vue.product_list);
        // adding watched attributes
        self.vue.product_list.map(function (e) {
          // for showing reviewers
          Vue.set(e, '_show', !e.review);
          // list of reviewers
          Vue.set(e, '_reviewers', []);
          // list of reviews
          Vue.set(e, '_reviews', []);
          // list of ratings
          Vue.set(e, '_star_ratings', []);
          // the specific user's rating
          Vue.set(e, '_the_rating', 0);
          // boolean if the user has reviewed the product before
          Vue.set(e, '_has_reviewed', 0);
          // for displaying stars
          Vue.set(e, '_num_stars_display', e.rating);
        });
    };

    // adds a review to the database. passes to api.py
    self.add_review = function (product_idx, id) {
    // diable button to prevent double submission
        $.web2py.disableElement($("#add-review"));
        $.post(add_review_url,
            // data being sent to api.py
            {
                product_id: id,
                // the new review
                review: self.vue.form_review,
                // the user's specific review, if reviewed before
                user_review: self.vue.product_list[product_idx]._the_review,
            },
            function (data) {
                // reenable button
                $.web2py.enableElement($("#add-review"));
            });
    };

    // gets and displays list of reviewers
    self.show_reviewers = function(product_idx) {
        var p = self.vue.product_list[product_idx];
            $.getJSON(get_reviewers_url, {product_id: p.id}, function (data) {
                p._reviewers = data.reviewers
                p._reviews = data.reviews
                p._star_ratings = data.star_ratings
                p._the_review = data.the_review
                p._the_rating = data.the_rating
                p._has_reviewed = data.has_reviewed
            })
    };

    // for when review button is opened / closed
    self.review_click = function (product_idx) {
      var p_list = self.vue.product_list;
      var p = p_list[product_idx];
      // if the product is displayed/hidden, go through all the products and flip their display
      // options. this is how I managed to do the 'close all other lists of reviews'.
      // ex: product1 has reviews shown. product2 reviews clicked. code goes through list of products.
      //   if a product is displaying, code flips it to hidden. then flips specific product to display.
      //   in this instance, it flips product1 to hidden, then product2 to display
      if (!p._show_reviewers){
        for (var i = 0; i < p_list.length; i++){
          if (p_list[i]._show_reviewers){
            if (p_list[i]._show){
              p_list[i]._show_reviewers = false;
              p_list[i]._show = false;
            }
          }
        }
        p._show_reviewers = true;
        p._show = true;
      } else {
        for (var i = 0; i < p_list.length; i++){
          if (p_list[i]._show_reviewers){
            if (p_list[i]._show){
              p_list[i]._show_reviewers = true;
              p_list[i]._show = true;
            }
          }
        }
        p._show_reviewers = false;
        p._show = false;
      }
    };

    // if mouse out, display num_stars or the user's rating
    self.stars_out = function (product_idx) {
        var p = self.vue.product_list[product_idx];
        p._num_stars_display = p.rating;
        p._the_rating = p.the_rating;
    };

    // display what the mouse is over
    self.stars_over = function(product_idx, star_idx) {
        var p = self.vue.product_list[product_idx];
        p._num_stars_display = star_idx;
        p._the_rating = star_idx;
    };

    // set stars to the index that's clicked
    self.set_stars = function(product_idx, star_idx) {
        var p = self.vue.product_list[product_idx];
        p.rating = star_idx;
        // Sends the rating to the server.
        $.post(set_stars_url, {
            product_id: p.id,
            rating: star_idx
        });
    };

    // when searching, alter the product list by eliminating what is not being searched for
    self.do_search = function() {
      // if searching
      if (self.vue.search_string != ''){
        $.getJSON(search_url,
          {search_string: self.vue.search_string},
          function(data) {
            // 2nd array to copy the products that need to display
            var product_list2 = [];
            // goes through product list and products returned from the search
            // copies the desired products into temp array
            // needs to be copies because product list has attributes not present in search_list
            for (var i = 0; i < self.vue.product_list.length; i++){
              for (var j = 0; j < data.search_list.length; j++){
                if (self.vue.product_list[i].product_name == data.search_list[j].product_name){
                  product_list2.push(self.vue.product_list[i]);
                }
              }
            }
            // sets the main product list as that temp array
            self.vue.product_list = product_list2;
            self.process_products();
          });
      // search bar is empty, re-acquire all products
      } else {
        self.get_products();
      }
    };

    // code for flashing checkmark. set variable to true, then false after 2s
    self.do_call = function() {
      self.vue.confirm = true;
      setInterval(
        function () {self.vue.confirm = false}, 2000
      );
    };

    // either increments item in cart, or adds it
    self.inc_cart = function(pid, index){
      // can't add 0 or neg
      if (self.vue.buy_list[index] <= 0){
        return;
      }
      // send to db
      $.post(inc_cart_url, {
        product_id: pid,
        amount: self.vue.buy_list[index]
      })
      // variable if successfully added
      self.vue.added = true;
    };

    // toggle between shop and cart
    self.change_page = function() {
      if (self.vue.page == 'shop'){
        self.vue.page = 'cart';
        // get the user's cart from db & copy to vue
        $.getJSON(get_cart_url,
          function(data){
            user_signature = true;
            hash_vars = false;
            self.vue.cart_list = data.cart_list;
            self.vue.total = data.total;
          });
      } else {
        self.vue.page = 'shop';
      }
    };

    // deletes items in the cart by calling api
    self.clear_cart = function() {
      $.getJSON(clear_cart_url,
        function(response) {
          user_signature = true;
          hash_vars = false;
        })
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
          form_review: '',
          product_list: [],
          cart_list: [],
          star_indices: [1, 2, 3, 4, 5],
          confirm: false,
          search_string: '',
          // list of ints for amount user wants for each product
          buy_list: [],
          page: 'shop',
          total: 0,
          // var if successfully added
          added: false
        },
        methods: {
          add_review: self.add_review,
          review_click: self.review_click,
          show_reviewers: self.show_reviewers,
          stars_out: self.stars_out,
          stars_over: self.stars_over,
          set_stars: self.set_stars,
          do_call: self.do_call,
          do_search: self.do_search,
          inc_cart: self.inc_cart,
          change_page: self.change_page,
          clear_cart: self.clear_cart
        }
    });

    // Gets the products
    self.get_products();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
