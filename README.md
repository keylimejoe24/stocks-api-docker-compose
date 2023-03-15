# stocks-api-docker-compose

### Amazon Linux 2 AMI & Docker Compose
- https://gist.github.com/npearce/6f3c7826c7499587f00957fee62f8ee9

touch my_password.txt
docker login
cat ~/my_password.txt | docker login --username joja5627 --password-stdin
docker image tag rhel-httpd:latest registry-host:5000/myadmin/rhel-httpd:latest
docker image push registry-host:5000/myadmin/rhel-httpd:latest
docker push joja5627/algorithms-server:tagname

curl --location --request GET 'http://localhost:5001' \
--header 'Content-Type: application/json' \
--data-raw '{
        "root_url": "https://query1.finance.yahoo.com",
        "query_url": "https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/DGICB",
        "params": {
                "lang": "en-US",
                "region": "US",
                "symbol": "DGICB",
                "padTimeSeries": "true",
                "type": "quarterlyCurrentLiabilities,quarterlyCurrentAssets,quarterlyShareIssued",
                "merge": "false",
                "period1": "493590046",
                "period2": "1678577636",
                "corsDomain": "finance.yahoo.com"
        }
}'

curl --location --request GET 'http://localhost:5001' \
-H "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0"
--header 'Content-Type: application/json' \
--data-raw '{
        "root_url": "https://query1.finance.yahoo.com",
        
        "params": {
                "lang": "en-US",
                "region": "US",
                "symbol": "DGICB",
                "padTimeSeries": "true",
                "type": "quarterlyCurrentLiabilities,quarterlyCurrentAssets,quarterlyShareIssued",
                "merge": "false",
                "period1": "493590046",
                "period2": "1678577636",
                "corsDomain": "finance.yahoo.com"
        }
}'

curl --location --request GET 'http://localhost:5001' \
--header 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0' \
--data-raw '{"root_url": "https://query1.finance.yahoo.com","params": { "lang": "en-US", "region": "US", "symbol": "DGICB", "padTimeSeries": "true", "type": "quarterlyCurrentLiabilities,quarterlyCurrentAssets,quarterlyShareIssued", "merge": "false", "period1": "493590046", "period2": "1678577636", "corsDomain": "finance.yahoo.com"}}'

"period1": "493590046", "period2": "1678577636", DGICB
 
curl 'https://pagead2.googlesyndication.com/getconfig/sodar?sv=200&tid=xfad&tv=01_247&st=int' \
  -H 'authority: pagead2.googlesyndication.com' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'origin: https://s0.2mdn.net' \
  -H 'referer: https://s0.2mdn.net/' \
  -H 'sec-ch-ua: "Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' \
  -H 'x-client-data: CJC2yQEIpLbJAQjBtskBCKmdygEI29PKAQjc4coBCJahywEI8oDNAQi9hs0BCJyIzQE=' \
  --compressed

  curl 'http://localhost:3000/api/scrape/run' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://3.83.232.168:3003' \
  -H 'Referer: http://3.83.232.168:3003/' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' \
  --data-raw '{"scrapeID":"8122b24a-d614-48a6-9d3d-a96af47e72d3","tickers":["AAPL","ABB","ABBV","ABNB","ABT","ACN","ADBE","ADI","ADM","ADP","AIG","AMAT","AMD"]}' \
  --compressed \
  --insecure

  curl 'http://localhost:5001/stop'