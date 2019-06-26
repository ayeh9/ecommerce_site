def get_user_email():
    return None if auth.user is None else auth.user.email

def get_name():
    return None if auth.user is None else auth.user.first_name + ' ' + auth.user.last_name

db.define_table('theproduct',
    Field('name', default=''),
    Field('description', default=''),
    Field('price', 'float',default=0.0)
)
db.theproduct.price.requires = IS_FLOAT_IN_RANGE(0,1e10,dot=".",error_message='The price should be a float number and greater than or equal to 0')

db.define_table('review',
    Field('product_id', 'reference theproduct'),
    Field('rating', 'integer', default=0),
    Field('email', default=get_user_email()),
    Field('name', default=get_name()),
    Field('body', 'text', default='')
)

# Stars ratings
db.define_table('user_star',
                Field('user_email'), # The user who starred
                Field('product_id', 'reference theproduct'), # The starred product
                Field('rating', 'integer', default=0) # The star rating.
                )
