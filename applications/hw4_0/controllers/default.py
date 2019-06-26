# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------


def index():
    return dict()


def products():
    query = db.products
    links = []

    grid = SQLFORM.grid(
        query,
        field_id = db.products.id,
        fields = [db.products.id, db.products.name, db.products.description, db.products.price, db.products.total_star,
                  db.products.total_review],
        links=links,
        details=False,
        create=True, editable=True, deletable=True,
        cache_count=False,
        searchable=False,
        csv=False,
        user_signature=True,
    )
    return dict(grid = grid)

def reviews():
    query = db.reviews
    links = []

    grid = SQLFORM.grid(
        query,
        field_id = db.reviews.id,
        fields = [db.reviews.id, db.reviews.user_email, db.reviews.product_id, db.reviews.review_content, db.reviews.review_star],
        links=links,
        details=False,
        create=True, editable=True, deletable=True,
        cache_count=False,
        searchable=False,
        csv=False,
        user_signature=True,
    )
    return dict(grid = grid)
    

def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


