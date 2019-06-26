# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.
import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_datetime():
    return datetime.datetime.utcnow()

# defines main db table
db.define_table('products',
                Field('name', 'string'),
                Field('description', 'text'),
                Field('sales_price', 'double'),
                Field('time_posted', 'datetime', default=get_datetime()),
                Field('user_who_created_it', 'string', default=get_user_email()))

# Stars ratings
db.define_table('user_star',
                Field('user_email'), # The user who starred
                Field('product_id', 'reference products'), # The starred post
                Field('rating', 'integer', default=None) # The star rating.
                )

db.define_table('user_review',
                Field('user_email'),
                Field('product_id', 'reference products'),
                Field('review', 'text')
                )

db.define_table('shopping_cart',
                Field('user_email'),
                Field('product_id', 'reference products'),
                Field('amount', 'integer')
                )

# adds $ to front of number
db.products.sales_price.represent  = lambda v, r : "$ " + str(v)

# enables auditing
auth.enable_record_versioning(db)
