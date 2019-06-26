def get_user_email():
    return None if auth.user is None else auth.user.email

def get_name():
    return None if auth.user is None else auth.user.first_name + ' ' + auth.user.last_name

db.define_table('product',
    Field('product_name'),
    Field('product_desc', 'text'),
    Field('product_price', 'double')
)

db.define_table('review',
    Field('product_id', 'reference product'),
    Field('body', 'text', default=''),
    Field('email', default=get_user_email()),
    Field('name', default=get_name())
)

# Stars ratings
db.define_table('user_star',
    Field('email'), # The user who starred
    Field('product_id', 'reference product'), # The starred product
    Field('rating', 'integer',default=None) # The star rating.
)
