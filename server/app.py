# coding=utf-8
'''
© Kirusanth Poopalasingan ( info@kiru.io )
'''
import flask as f
import pandas as pd
import sqlalchemy as sql
import pickle
from flask_cors import CORS

engine = sql.create_engine('sqlite:///database.db')
metadata = sql.MetaData()
articles = sql.Table('articles', metadata,
    sql.Column('id', sql.String),
    sql.Column('title', sql.String),
    sql.Column('year', sql.Integer),
    sql.Column('month', sql.Integer),
    sql.Column('day', sql.Integer),
    sql.Column('view_count', sql.Integer),
    sql.Column('main_category', sql.String)
)
metadata.create_all(engine)
app = f.Flask(__name__)

CORS(app)

@app.route('/')
def index():
    return "Hello World."

# @app.route('/all')
# def all_view_count():
#     with open('data/counts_apr.pkl', 'rb') as f:
#         data = pickle.load(f)
#         for key in data:
#             wiki_id = key
#             hours = data[wiki_id]
#             print(hours[0])
#             print(key, len(hours))
#             break
#         #print(data)
#
#     return "Hello World"

@app.route('/topArticles/<start_year>/<start_month>/<end_year>/<end_month>')
def all_view_count(start_year, start_month,
                   end_year, end_month):

    result = []
    with engine.connect() as con:
        rows = con.execute('''
            select id, sum(view_count), title
            from articles
              where (year * 100 + month) >= (100 * :sy + :sm)
                and (year * 100 + month) <= (100 * :ey + :em)
            group by id
            order by sum(view_count) desc
            limit 50
        ''', dict(sy=int(start_year), sm=int(start_month),
              ey=int(end_year), em=int(end_month)))

        for r in rows:
            bla = {"article_id": r[0],
                   "article_name": r[2],
                   "view_count": r[1],
                   "main_category": ""
                   }
            result.append(bla)
            print(bla)

    return f.jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
