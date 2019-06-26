# Here go your api methods.

def get_prod_list():

    prod_list = db(db.products).select(
        db.products.id, 
        db.products.name, 
        db.products.description, 
        db.products.price,
        orderby=~db.products.price
    ).as_list()

    return response.json(dict(prod_list=prod_list))

def get_rev_list():

    review_list = db(db.reviews).select(
        db.reviews.usr, 
        db.reviews.product, 
        db.reviews.cont,
        db.reviews.num,
    ).as_list()

    return response.json(dict(review_list=review_list))

@auth.requires_signature()
def add_review():
    rev_id = db.reviews.update_or_insert(
        (db.reviews.product == request.vars.product) & (db.reviews.usr == auth.user.email),
        usr=auth.user.email,
        cont=request.vars.cont,
        product=request.vars.product,
        num=request.vars.num,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(rev_id=rev_id))

