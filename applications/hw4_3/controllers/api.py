def get_logged_in_user():
    user = None if auth.user is None else auth.user.email
    return response.json(dict(user=user))

def get_all_products():
    products = db(db.product).select()
    return response.json(dict(products=products))

@auth.requires_login()
def get_your_review():
    review = db((db.review.product_id == request.vars.product_id) & (db.review.email == request.vars.email)).select().first()
    return response.json(dict(review=review))

@auth.requires_login()
def get_your_star():
    user_star = db((db.user_star.product_id == request.vars.product_id) & (db.user_star.email == request.vars.email)).select().first()
    return response.json(dict(user_star=user_star))

@auth.requires_login()
def save_review():
    print(request.vars.product_id)
    print(request.vars.email)
    db.review.update_or_insert(
        ((db.review.product_id == request.vars.product_id) & (db.review.email == request.vars.email)),
        body=request.vars.body,
        product_id=request.vars.product_id
    )
    return "ok"

@auth.requires_login()
def save_star():
    print(request.vars.product_id)
    print(request.vars.email)
    db.user_star.update_or_insert(
        ((db.user_star.product_id == request.vars.product_id) & (db.user_star.email == request.vars.email)),
        rating=request.vars.rating,
        product_id=request.vars.product_id
    )
    return "ok"

def get_other_reviews():
    if auth.user is None:
        other_reviews = db(db.review.product_id == request.vars.product_id).select()
    else:
        other_reviews = db( (db.review.product_id == request.vars.product_id) & (db.review.email != auth.user.email) ).select()

    return response.json(dict(other_reviews=other_reviews))

def get_other_stars():
    if auth.user is None:
        other_stars = db(db.user_star.product_id == request.vars.product_id).select()
    else:
        other_stars = db( (db.user_star.product_id == request.vars.product_id) & (db.user_star.email != auth.user.email) ).select()

    return response.json(dict(other_stars=other_stars))

@auth.requires_signature(hash_vars=False)
def set_stars():
    """Sets the star rating of a product."""
    product_id = int(request.vars.product_id)
    rating = int(request.vars.rating)
    db.user_star.update_or_insert(
        (db.user_star.product_id == product_id) & (db.user_star.email == auth.user.email),
        product_id = product_id,
        email = auth.user.email,
        rating = rating
    )
    return "ok" # Might be useful in debugging.
