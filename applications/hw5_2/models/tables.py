# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_user_name():
    return None if auth.user is None else auth.user.first_name + " " + auth.user.last_name

db.define_table('product',
    Field('product_name', label='Name'),
    Field('product_desc', label='Description'),
    Field('product_price', 'float', default=0, label='Price'),
    Field('product_rating', 'float', default=0, label='Rating')
)

db.product.id.readable = False
db.product.id.writable = False

db.product.product_price.requires = IS_FLOAT_IN_RANGE(0, 1e10)
db.product.product_rating.requires = IS_FLOAT_IN_RANGE(0, 5)


db.define_table('star',
    Field('star_product_id'),
    Field('star_user_email', default=get_user_email()),
    Field('star_rating', 'integer', default=None)
)

db.define_table('review',
    Field('review_product_id'),
    Field('review_user_email', default=get_user_email()),
    Field('review_user_name', default=get_user_name()),
    Field('review_content')
)

db.define_table('shopping_cart',
    Field('shopping_cart_product_id'),
    Field('shopping_cart_quantity', 'integer'),
    Field('shopping_cart_user_email', default=get_user_email())
)


# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
