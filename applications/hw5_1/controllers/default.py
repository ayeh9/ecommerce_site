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
    form = SQLFORM.grid(db.products)
    return dict(form=form)

def user():
    return dict(form=auth())

@cache.action()
def download():
    return response.download(request, db)

def call():
    return service()
