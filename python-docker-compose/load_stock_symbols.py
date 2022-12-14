import json,requests,time

tickers = []
with open('US-Stock-Symbols/all/all_tickers.txt') as f:
    lines = f.readlines()
    for line in lines:
        tickers.append(line.strip())
    f.close()

url = 'http://localhost:3000/api/scrape/run'
myobj = {'tickers': tickers[0:1000]} 

response = requests.post(url, json = myobj)
print(response)
