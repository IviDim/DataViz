# coding=utf-8
'''
© Kirusanth Poopalasingan ( info@kiru.io )
'''
import flask as f
import pickle

app = f.Flask(__name__)


@app.route('/')
def parse():
    with open('data/counts_apr.pkl', 'rb') as f:
        data = pickle.load(f)
        print(data)

    return "Hello World"

if __name__ == '__main__':
    app.run()
