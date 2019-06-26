def get_logged_in_user():
    user = None if auth.user is None else auth.user.email
    return response.json(dict(user=user))

def get_all_products():
    products = db(db.theproduct).select()
    for theproduct in products:
        reviews = db((db.review.product_id == theproduct.id) & (db.review.rating > 0)).select(db.review.rating) #makes sure product matches its review
        sum = 0
        for review in reviews:
            sum += review.rating
        # if the length of the review is 0, then do nothing
        if len(reviews) == 0:
            pass
        # else calculate the avg star
        else:
            theproduct.avg_rating = sum / len(reviews) #number of ratings that are returned
    return response.json(dict(products=products))

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
def get_your_review():
    review = db((db.review.product_id == request.vars.product_id) & (db.review.email == request.vars.email)).select().first()
    return response.json(dict(review=review))

def get_other_reviews():
    if auth.user is None:
        other_reviews = db(db.review.product_id == request.vars.product_id).select()
    else:
        other_reviews = db( (db.review.product_id == request.vars.product_id) & (db.review.email != auth.user.email) ).select()
    return response.json(dict(other_reviews=other_reviews))


#update star
@auth.requires_login()
def update_star():
    db.review.update_or_insert(
        ((db.review.product_id == request.vars.product_id) & (db.review.email == request.vars.email)),
        rating=request.vars.rating,
        product_id=request.vars.product_id
    )
    return "ok"
