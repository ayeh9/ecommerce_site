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



# Product table
db.define_table('products',
                Field('name', 'string'),
                Field('description', 'text'),
                Field('price', 'float'),
                Field('total_star', 'integer', default=0),
                Field('total_review', 'integer', default=0)
                )


db.define_table('reviews',
                Field('user_email'),
                Field('product_id', 'reference products'),
                Field('review_content', 'text'),
                Field('review_star', 'integer', default=0)
                )

db.define_table('stars',
                Field('user_email'),
                Field('review_id', 'reference reviews'),
                Field('review_rating', 'text'),
                )

db.products.price.represent = lambda v, r : "$ {:,.2f}".format(v)

db.products.name.label = T("Product Name")
db.products.description.label = T("Product Description")
