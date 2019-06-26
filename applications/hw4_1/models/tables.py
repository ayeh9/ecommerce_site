# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

db.define_table('products',
    Field('name', 'string'),
    Field('description', 'text'),
    Field('price', 'double'),
)

db.define_table('reviews',
    Field('usr', 'string'),
    Field('product', 'integer'),
    Field('cont', 'text'),
    Field('num', 'integer', default=0),
)

#db.products.id.readable = False
db.reviews.id.readable = False

# after defining tables, uncomment below to enable auditing
auth.enable_record_versioning(db)
