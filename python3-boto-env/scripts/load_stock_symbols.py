import json,requests,time

def divide_chunks(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]

tickers = []
with open('US-Stock-Symbols/all/all_tickers.txt') as f:
    lines = f.readlines()
    for line in lines:
        tickers.append(line.strip())
    f.close()


urls = ["http://54.202.53.166:3000/api/scrape/run",
"http://52.11.23.253:3000/api/scrape/run",
"http://54.244.193.241:3000/api/scrape/run",
"http://52.37.68.232:3000/api/scrape/run",
"http://54.191.187.167:3000/api/scrape/run",
"http://35.91.168.216:3000/api/scrape/run",
"http://54.218.115.159:3000/api/scrape/run",
"http://35.165.178.90:3000/api/scrape/run"
]
ticker_chunks = list(divide_chunks(tickers, 8))

for index, url in enumerate(urls):
    print(url)
    myobj = {'tickers': ticker_chunks[index]} 
    response = requests.post(url, json = myobj)
    print(response)
