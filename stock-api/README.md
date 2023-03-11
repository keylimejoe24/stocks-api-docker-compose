# nodejs-restapi-mongo
Example Project on how to build and develop REST API with NodeJS and MongoDB

curl 'http://localhost:3000/api/scrape/run' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3003' \
  -H 'Referer: http://localhost:3003/' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' \
  --data-raw '{"scrapeID":"e8808ec3-25aa-4a27-8268-7e4f54d02531","tickers":["A","AA","AAC","AAL","AAON","AAP","AAPL","AAT","AAWW","AB","ABB","ABBV","ABC","ABCB","ABCL","ABCM","ABEV","ABG","ABM","ABNB","ABR","ABST","ABT","AC","ACA","ACAD","ACCD","ACCO","ACDC","ACEL","ACGL","ACHC","ACI","ACIW","ACLS","ACLX","ACM","ACN","ACQR","ACRE","ACRS","ACT","ACVA","ADBE","ADC","ADEA","ADI","ADM","ADMA","ADNT","ADP","ADPT","ADSK","ADT","ADTN","ADUS","ADV","ADX","AEE","AEG","AEHR","AEIS","AEL","AEM","AEO","AEP","AER","AES","AFG","AFL","AFRM","AFYA","AG","AGAC","AGCO","AGEN","AGI","AGIO","AGL","AGM","AGNC","AGO","AGR","AGRO","AGTI","AGX","AGYS","AHCO","AHH","AI","AIG","AIMC","AIN","AIO","AIR","AIRC","AIT","AIV","AIZ","AJG","AJRD","AKAM","AKR","AKRO","AL","ALB","ALC","ALCC","ALE","ALEC","ALEX","ALG","ALGM","ALGN","ALGT","ALHC","ALIT","ALK","ALKS","ALKT","ALL","ALLE","ALLG","ALLK","ALLO","ALLY","ALNY","ALRM","ALSN","ALT","ALTR","ALV","ALVO","ALX","AM","AMAL","AMAT","AMBA","AMBC","AMBP","AMC","AMCR","AMCX","AMD","AME","AMED","AMEH","AMG","AMGN","AMH","AMK","AMKR","AMLX","AMN","AMOT","AMOV","AMP","AMPH","AMPL","AMPS","AMPX","AMR","AMRC","AMRK","AMRS","AMSF","AMT","AMTB","AMWD","AMWL","AMX","AMZN","AN","ANAB","ANDE","ANET","ANF","ANGI","ANGO","ANIP","ANSS","ANZU","AOD","AON","AOS","AOSL","APA","APAM","APD","APE","APG","APGB","APH","APLE","APLS","APO","APOG","APP"]}' \
  --compressed \
  --insecure