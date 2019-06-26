# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.




# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)


import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_current_time():
    return datetime.datetime.utcnow()

db.define_table('product',
                Field('product_id'),
                Field('product_author', default=get_user_email()),
                Field('product_title'),
                Field('product_content', 'text'),
                Field('product_price', 'double', default=0),
                Field('product_time', 'datetime', default=get_current_time()),
                Field('product_rating', default=0)
                )

db.product.product_title.label = T("Product Name")
db.product.product_content.label = T("Product Description")
db.product.product_price.label = T("Sales Price")
db.product.product_price.requires = IS_FLOAT_IN_RANGE(0,10**10, dot=".")

# # Likes. 
# db.define_table('user_like',
#                 Field('user_email'), # The user who flagged
#                 Field('product_id', 'reference product'), # The flagged product
# )

# Star ratings
db.define_table('star',
                Field('user_email', default=get_user_email()), # The user who starred
                Field('product_id', 'reference product'), # The starred product
                Field('rating', 'integer', default=None) # The star rating.
                )

# reviews
db.define_table('review',
                Field('product_id', 'reference product'),
                Field('user_email', default=get_user_email()),
                Field('review_desc', 'text'),
                Field('average_rating', 'integer')
                )