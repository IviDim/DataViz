# coding=utf-8
'''
© Kirusanth Poopalasingan ( info@kiru.io )
'''
import flask as f
import pandas as pd
import sqlalchemy as sql
import pickle
from flask_cors import CORS
import wikipedia
import json

engine = sql.create_engine('sqlite:///database_working.db')
metadata = sql.MetaData()
articles = sql.Table('articles', metadata,
    sql.Column('title', sql.String),
    sql.Column('year', sql.Integer),
    sql.Column('month', sql.Integer),
    sql.Column('day', sql.Integer),
    sql.Column('view_count', sql.Integer),
    sql.Column('peak_date', sql.Date),
    sql.Column('summary', sql.Text),
    sql.Column('page_id', sql.Integer)
)
metadata.create_all(engine)
app = f.Flask(__name__)
app.config.update(DEBUG=False)
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
            select sum(view_count), title, peak_date, summary, page_id
            from articles
              where (year * 100 + month) >= (100 * :sy + :sm)
                and (year * 100 + month) <= (100 * :ey + :em)
            group by title
            order by sum(view_count) desc
            limit 50
        ''', dict(sy=int(start_year), sm=int(start_month),
              ey=int(end_year), em=int(end_month)))
        rows=list(rows)
        x = list(map(lambda y: str(y[4]), rows))
        x1 = ','.join(x)
        rows1 = con.execute('''
            select peak_date, max(view_count), title
            from articles
                where (year * 100 + month) >= (100 * :sy + :sm)
                and (year *100 + month) <= (100 * :ey + :em)
                and page_id in ('''+ x1 + ''')
            group by title
        ''', dict(sy=int(start_year), sm=int(start_month),
              ey=int(end_year), em=int(end_month)))

        title_to_peak_date = {}

        for r1 in rows1:
            title_to_peak_date[r1[2]] = r1[0]
            print(title_to_peak_date)

        for r in rows:
            bla = {"article_name": r[1],
                   "view_count": r[0],
                   "peak_date": title_to_peak_date[r[1]],
                   "summary": r[3]
                   }
            result.append(bla)
            print(bla)

    return f.jsonify(result)


# Create another endpoint for the summary request
@app.route('/summary/<article_name>')
def get_summary(article_name):

    result=[]
    with engine.connect() as con:
        rows= con.execute('''
            select title, summary
            from articles
                where (title) == :an
            limit 1
        ''', dict(an=str(article_name)))

        for r in rows:
            res = {"article_name": r[0],
                   "summary": r[1]
                   }
            result.append(res)
            print(res)
    return f.jsonify(result)
#
#
@app.route('/links/<article_name>')
def get_neighbors(article_name):
    neighbors = wikipedia.WikipediaPage(title=article_name).links
    return json.dumps(neighbors)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
