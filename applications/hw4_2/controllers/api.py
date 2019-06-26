# Here go your api methods.

# @auth.requires_signature()
def add_review():
    review_id = db.review.insert(
        product_id=request.vars.product_id,
        user_email=auth.user.email,
        review_desc=request.vars.review_desc,
        average_rating=request.vars.average_rating,
    )
    # We return the id of the new product, so we can insert it along all the others.
    return response.json(dict(review_id=review_id))

@auth.requires_signature(hash_vars=False)
def search():
    s = request.vars.search_string or ''
    res = []
    rows = db().select(db.product.ALL)
    for row in rows:
        if s in row.product_title:
            res.append(row)
    return response.json(dict(product_list=res))

def get_product_list():
    results = []
    if auth.user is None:
        # Not logged in.
        rows = db().select(db.product.ALL, orderby=~db.product.product_time)
        for row in rows:
            results.append(dict(
                id=row.id,
                product_title=row.product_title,
                product_content=row.product_content,
                product_price=row.product_price,
                product_author=row.product_author,
                like=False, # Anyway not used as the user is not logged in. 
                rating=None, # As above
            ))
    else:
        # Logged in.
        rows = db().select(db.product.ALL, db.star.ALL,
                            left=[
                                # db.user_like.on((db.user_like.product_id == db.product.id) & (db.user_like.user_email == auth.user.email)),
                                db.star.on((db.star.product_id == db.product.id) & (db.star.user_email == auth.user.email)),
                            ],
                            orderby=~db.product.product_time)
        for row in rows:
            results.append(dict(
                id=row.product.id,
                product_title=row.product.product_title,
                product_content=row.product.product_content,
                product_price=row.product.product_price,
                product_author=row.product.product_author,
                # like = False if row.user_like.id is None else True,
                rating = None if row.star.id is None else row.star.rating,
            ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(product_list=results))

def get_reviews():
    results = []
    if auth.user is None:
        # Not logged in.
        rows = db().select(db.product.ALL, db.review.ALL,
                            left=[
                                # db.user_like.on((db.user_like.product_id == db.product.id) & (db.user_like.user_email == auth.user.email)),
                                db.review.on((db.review.product_id == db.product.id)),
                            ],
                            orderby=~db.product.product_time)
        for row in rows:
            results.append(dict(
                product_id=row.review.product_id,
                user_email=row.review.user_email,
                review_desc=row.review.review_desc,
                average_rating=row.review.average_rating
            ))
    else:
        # Logged in.
        rows = db().select(db.product.ALL, db.review.ALL,
                            left=[
                                # db.user_like.on((db.user_like.product_id == db.product.id) & (db.user_like.user_email == auth.user.email)),
                                db.review.on((db.review.product_id == db.product.id)),
                            ],
                            orderby=~db.product.product_time)
        for row in rows:
            results.append(dict(
                product_id=row.review.product_id,
                user_email=row.review.user_email,
                review_desc=row.review.review_desc,
                average_rating=row.review.average_rating
            ))
    print(results)
    # For homogeneity, we always return a dictionary.
    return response.json(dict(review_list=results))

@auth.requires_signature(hash_vars=False)
def set_stars():
    """Sets the star rating of a product."""
    product_id = int(request.vars.product_id)
    rating = int(request.vars.rating)
    db.star.update_or_insert(
        (db.star.product_id == product_id) & (db.star.user_email == auth.user.email),
        product_id = product_id,
        user_email = auth.user.email,
        rating = rating
    )
    return "ok" # Might be useful in debugging.
