# https://stackoverflow.com/questions/41452819/list-append-in-for-loop
# https://stackoverflow.com/questions/16882447/web2py-getting-field-from-rows-object
# https://stackoverflow.com/questions/31861565/web2py-check-if-record-in-database
# http://web2py.com/books/default/chapter/29/06/the-database-abstraction-layer#update_or_insert
# https://www.geeksforgeeks.org/python-list-insert/
# https://alligator.io/vuejs/v-model-two-way-binding/
# http://web2py.com/books/default/chapter/29/06/the-database-abstraction-layer
# https://love2dev.com/blog/javascript-remove-from-array/

# gets the list of all products
def get_product_list():
    results = []
    rows = db().select(db.products.ALL, orderby=~db.products.time_posted)
    for row in rows:
        sum = 0
        average = 0
        # calculates the average rating of each product, and assigns to the rating attribute
        for rating in db(db.user_star.product_id == row.id).select():
            sum = sum + int(rating.rating)
            average = sum/len(db(db.user_star.product_id == row.id).select())
        # appends the products to the list
        results.append(dict(
            id=row.id,
            product_name=row.name,
            product_description=row.description,
            product_sales_price=row.sales_price,
            rating = average,
            review = False if row.user_review.id is None else True
        ))
    # returns the whole list
    return response.json(dict(product_list=results))

# adds new user reviews or updates
@auth.requires_signature()
def add_review():
    # variable declarations
    p_id = request.vars.product_id
    email = auth.user.email
    user_rev_query = (db.user_review.product_id == p_id) & (db.user_review.user_email == email)
    updated_rev = request.vars.user_review
    new_rev = request.vars.review

    # if the user has reviewed before
    if (db(user_rev_query).count()):
        # if the review is not blank, updates the db
        if (updated_rev is not ''):
            db.user_review.update_or_insert(user_rev_query, review = updated_rev)
            return response.json(dict(user_review=updated_rev))
        # if the review is blank, updates the db (uses different var than if review is not blank)
        else:
            db.user_review.update_or_insert(user_rev_query, review = new_rev)
            return response.json(dict(user_review=new_rev))
    # if the user has not reviewed before, inserts new review
    else:
        review_id = db.user_review.insert(product_id=p_id, review=new_rev, user_email=email)
    return response.json(dict(review_id=review_id))

# gets the reviewers of each product
def get_reviewers():
    # var declarations
    p_id = request.vars.product_id
    has_reviewed = None
    the_review = None
    the_rating = None
    names = []
    review_emails = []
    star_ratings = []

    # returns full list of user_emails and reviews from user_reviews
    rows = db(db.user_review.product_id == p_id).select(db.user_review.user_email)
    rows2 = db(db.user_review.product_id == p_id).select(db.user_review.review)
    reviewers_list = [r.user_email for r in rows]
    reviews_list = [r2.review for r2 in rows2]

    # stores the user's name (fn + ln) depending on their email into a list
    for user_email in reviewers_list:
        row_names = (db(db.auth_user.email == user_email).select(db.auth_user.first_name, db.auth_user.last_name))
        for row in row_names:
            names.append(row.first_name + " " + row.last_name)

    # if user is logged in
    if auth.user is not None:
        # query the user's specific email and review
        user_review = db((db.user_review.product_id == p_id) & (db.user_review.user_email == auth.user.email)).select(db.user_review.review)
        user_rating = db((db.user_star.product_id == p_id) & (db.user_star.user_email == auth.user.email)).select(db.user_star.rating)
        # assign the review to var
        for rev in user_review:
            the_review = rev.review
        # assign the rating to a var
        for rat in user_rating:
            the_rating = rat.rating
        # if there's a review, they've reviewed before
        if (the_review):
            has_reviewed = True
        else:
            has_reviewed = False
    # not logged in, no review
    else:
        the_review = None

    # checks each email in full list to get the user's rating. puts into list. if reviewed but not starred, append 0
    for email in reviewers_list:
        temp_row = db((db.user_star.product_id == p_id) & (db.user_star.user_email == email)).select(db.user_star.rating)
        for row in temp_row:
            star_ratings.append(int(row.rating))
        if(not temp_row):
            star_ratings.append(0)

    return response.json(dict(reviewers=names, reviews=reviews_list, the_review=the_review, has_reviewed=has_reviewed, star_ratings=star_ratings, the_rating=the_rating, no_rating=0))

# sets the stars on click
@auth.requires_signature()
def set_stars():
    # variables
    product_id = int(request.vars.product_id)
    rating = int(request.vars.rating)
    # updates or inserts the rating
    db.user_star.update_or_insert(
        (db.user_star.product_id == product_id) & (db.user_star.user_email == auth.user.email),
        product_id = product_id,
        user_email = auth.user.email,
        rating = rating
    )
    return "ok" # Might be useful in debugging.

# search function. almost the same as main get_products function
# returns the list of products that start with the desired search string
def search():
    s = request.vars.search_string
    results = []
    rows = db(db.products.name.startswith(s)).select(db.products.ALL, orderby=~db.products.time_posted)
    for row in rows:
        sum = 0
        average = 0
        # calculates the average rating of each product, and assigns to the rating attribute
        for rating in db(db.user_star.product_id == row.id).select():
            sum = sum + int(rating.rating)
            average = sum/len(db(db.user_star.product_id == row.id).select())
        # appends the products to the list
        results.append(dict(
            id=row.id,
            product_name=row.name,
            product_description=row.description,
            product_sales_price=row.sales_price,
            rating = average,
            review = False if row.user_review.id is None else True
        ))
    # returns the list of products that should display
    return response.json(dict(search_list=results))

# get list of user's products in cart db
@auth.requires_signature()
def get_cart():
    results = []
    rows = db(db.shopping_cart.user_email == auth.user.email).select()
    total = 0
    for row in rows:
        product_name = ''
        product_price = 0
        product_rows = db(db.products.id == row.product_id).select()
        # obtain product info from pid
        for product in product_rows:
            product_name = product.name
            product_price = product.sales_price
        # appends the products to the list
        results.append(dict(
            user_email = auth.user.email,
            product_id=row.product_id,
            amount=row.amount,
            product_name=product_name,
            product_price=product_price,
        ))
        # subtotal, based on total for each specific product
        total += row.amount * product_price
    # returns the whole list
    return response.json(dict(cart_list=results, total=total))

# deletes the entries in db
@auth.requires_signature()
def clear_cart():
    db(db.shopping_cart.user_email == auth.user.email).delete()
    return "deleted"

# adds or updates product to cart
@auth.requires_signature()
def inc_cart():
    # vars
    p_id = request.vars.product_id
    email = auth.user.email
    user_cart_query = (db.shopping_cart.product_id == p_id) & (db.shopping_cart.user_email == email)
    amnt = int(request.vars.amount)
    the_old_amnt = 0
    old_amount = db(user_cart_query).select(db.shopping_cart.amount)
    # obtain the data already in db
    for old_amnt in old_amount:
        the_old_amnt = int(old_amnt.amount)
    # add old amount with the new amount
    the_new_amnt = the_old_amnt + amnt
    # if the user has carted before
    if (db(user_cart_query).count()):
        # if the cart is not blank, updates the db
        db.shopping_cart.update_or_insert(user_cart_query, amount = the_new_amnt)
        return response.json(dict(amount=the_new_amnt))
    # if the user has not reviewed before, inserts new review
    else:
        cart_id = db.shopping_cart.insert(product_id=p_id, amount=amnt, user_email=email)
    return response.json(dict(amount=amnt))
