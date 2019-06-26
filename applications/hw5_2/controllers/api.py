# Here go your api methods.

def get_user_email():
    result = []
    if auth.user:
        result.append(dict(user_email=auth.user.email))
    else:
        result.append(dict(user_email=None))
    return response.json(dict(user_email=result))

def get_review_list():
    product_id = int(request.vars.product_id)
    results = []

    rows = db(
        (db.review.review_product_id == product_id) & 
        (db.star.star_product_id == product_id) & 
        (db.review.review_user_email == db.star.star_user_email) &
        (db.review.review_product_id == db.star.star_product_id)).select(distinct=True)

    for row in rows:
        results.append(dict(
            star_rating=row.star.star_rating,
            review_content=row.review.review_content,
            user_name=row.review.review_user_name,
            user_email=row.review.review_user_email
        ))

    return response.json(dict(review_list=results))

@auth.requires_signature(hash_vars=False)
def search():
    search_string = request.vars.search_string
    results = []
    rows = db().select(db.product.ALL)

    for row in rows:
        if row.product_name.startswith(search_string):
            results.append(dict(
                id=row.id,
                product_name=row.product_name,
                product_desc=row.product_desc,
                product_price=row.product_price,
                product_rating=row.product_rating
            ))
    
    return response.json(dict(product_list=results))

def get_product_list():
    results = []
    rows = db().select(db.product.ALL)

    for row in rows:
        results.append(dict(
                id=row.id,
                product_name=row.product_name,
                product_desc=row.product_desc,
                product_price=row.product_price,
                product_rating=row.product_rating
            ))

    # For homogeneity, we always return a dictionary.
    return response.json(dict(product_list=results))

@auth.requires_signature(hash_vars=False)
def set_stars():
    """Sets the star rating of a product."""
    product_id = int(request.vars.product_id)
    rating = int(request.vars.rating)
    db.star.update_or_insert(
        (db.star.star_product_id == product_id) & (db.star.star_user_email == auth.user.email),
        star_product_id = product_id,
        star_user_email = auth.user.email,
        star_rating = rating
    )

    star_rating_count = 0
    star_points = 0

    rows = db(db.star.star_product_id == product_id).select()
    for row in rows:
        star_points += row.star_rating
        star_rating_count += 1

    new_avg_rating = star_points / star_rating_count

    results = []
    results.append(dict(
        count = star_rating_count,
        points = star_points,
        avg = new_avg_rating
    ))

    db.product.update_or_insert(
        (db.product.id == product_id),
        product_rating = new_avg_rating
    )
    return response.json(dict(numbers=results)) # Might be useful in debugging.

@auth.requires_signature(hash_vars=False)
def add_review():
    product_id = int(request.vars.product_id)
    review = request.vars.review_content
    db.review.update_or_insert(
        (db.review.review_product_id == product_id) & (db.review.review_user_email == auth.user.email),
        review_product_id = product_id,
        review_content = review,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return "review added"

@auth.requires_signature(hash_vars=False)
def add_to_cart():
    product_id = int(request.vars.product_id)
    quantity = request.vars.quantity
    db.shopping_cart.update_or_insert(
        (db.shopping_cart.shopping_cart_product_id == product_id) & (db.shopping_cart.shopping_cart_user_email == auth.user.email),
        shopping_cart_product_id = product_id,
        shopping_cart_quantity = quantity,
        shopping_cart_user_email = auth.user.email,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return "write to shopping cart ok"

@auth.requires_signature(hash_vars=False)
def get_cart_list():
    results = []
    rows = db(db.shopping_cart.shopping_cart_user_email == auth.user.email).select()

    for row in rows:
        item = db(db.product.id == row.shopping_cart_product_id).select()
        results.append(dict(
                # id=row.shopping_cart_product_id,
                id=item[0].id,
                quantity=row.shopping_cart_quantity,
                # item=item
                product_name=item[0].product_name,
                product_desc=item[0].product_desc,
                product_price=item[0].product_price,
                product_rating=item[0].product_rating,
            ))

    # For homogeneity, we always return a dictionary.
    return response.json(dict(cart_list=results))

@auth.requires_signature(hash_vars=False)
def delete_cart_list():
    db(db.shopping_cart.shopping_cart_user_email == auth.user.email).delete()
    return "Shopping cart cleared"