# Here go your api methods.


def get_product_list():
    product_list = db(db.products).select(db.products.id, db.products.name, db.products.description, db.products.price,
                                          db.products.total_star, db.products.total_review).as_list()
    return response.json(dict(product_list=product_list))


def get_review_list():
    review_list = db(db.reviews).select(db.reviews.id, db.reviews.user_email, db.reviews.product_id,
                                        db.reviews.review_content, db.reviews.review_star, orderby=~db.reviews.id).as_list()
    return response.json(dict(review_list=review_list))


def get_star_list():
    star_list = db(db.stars).select(db.stars.id, db.stars.user_email, db.stars.review_id,
                                    db.stars.review_rating).as_list()
    return response.json(dict(star_list=star_list))


def add_review():
    review_id = db.reviews.insert(
        user_email=auth.user.email,
        product_id=request.vars.product_id,
        review_content=request.vars.review_content,
        review_star=request.vars.review_star,
    )

    star_id = db.stars.insert(
        user_email=auth.user.email,
        review_id=request.vars.review_id,
        rating=request.vars.rating,

    )
    return response.json(dict(review_id=review_id, star_id=star_id))


def search():
    print('hi')
    s = request.vars.search_string or ''
    names = db(db.products).select(db.products.name).as_list()
    print(type(names))

    return response.json(dict(strings=res))