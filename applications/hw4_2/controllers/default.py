# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------


def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """
    grid = SQLFORM.grid(db.product,
        create=True, editable=True, 
    )
    return dict(grid=grid)

def products():
    """Returns the store page, with the list of products to be bought"""
    # Complete.
    query = db.product
    links = []
    if auth.user:  
        links.append(
            dict(header="", 
                 body = lambda row : A(' View', _href=URL('default', 'view_product', args=[row.id], user_signature=True)))
        )
        links.append(
            dict(header="", 
                 body = lambda row : A(' Edit', _href=URL('default', 'edit_product', args=[row.id], user_signature=True)))
        )
        links.append(
        dict(header="", body = lambda row : A(' Delete', _class='fa fa-trash-o', 
        _href=URL('default', 'delete', args=[row.id], user_signature=True)))
        )
    else:
        links.append(
            dict(header="", 
                 body = lambda row : A(' View', _href=URL('default', 'view_product', args=[row.id], user_signature=True)))
        )
    grid = SQLFORM.grid(
        query, 
        field_id = db.product.id, # Useful, not mandatory.
        fields = [db.product.id,
                db.product.product_title,
                db.product.product_price], 
        links = links,
        # And now some generic defaults.
        details=False,
        create=True, editable=False, deletable=False,
        csv=True, 
        user_signature=True # We don't need it as one cannot take actions directly from the form.
    )
    return dict(grid=grid)

def view_product():
    """Controller to view a product."""
    p = db.product(request.args(0))
    if p is None:
        form = P('No such product')
    else:
        form = SQLFORM(db.product, p, readonly=True)
    return dict(form=form)

def edit_product():
    product = db.product(request.args(0))
    # We must validate everything we receive.
    if product is None:
        logging.info("Invalid edit call")
        redirect(URL('default', 'index'))
    """ Editable """
    form = SQLFORM.factory(
        Field('product_title', default=product.product_title),
        Field('product_price', 'float', default = product.product_price), 
    )
    # We can process the form.  This will check that the request is a POST,
    # and also perform validation, but in this case there is no validation.
    if form.process().accepted:
        # We insert the result, as in add1.
        product.product_title = form.vars.product_title
        product.product_price = form.vars.product_price
        # And we load default/index via redirect.
        product.update_record()
        redirect(URL('default', 'index'))
    # We ask web2py to lay out the form for us.
    logger.info("My session is: %r" % session)
    return dict(form=form)

@auth.requires_signature()
@auth.requires_login()
def delete():
    product = db.product(request.args(0))
    # We must validate everything we receive.
    if product is None:
        logging.info("Invalid delete call")
        redirect(URL('default', 'viewall'))
    # One can edit only one's own posts.
    if product.product_author != auth.user.email:
        logging.info("Attempt to delete some one else's post by: %r" % auth.user.email)
        redirect(URL('default', 'products'))
    db(db.product.id == product.id).delete()
    redirect(URL('default', 'products'))

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

