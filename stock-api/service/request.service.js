const logger = require('../logger/api.logger');
const cheerio = require('cheerio');
const needle = require('needle');
const utils = require('../utils/utils');
const { HttpsProxyAgent } = require('hpagent');
const { performance } = require('perf_hooks');
const { HeaderGenerator, PRESETS } = require('header-generator');
const proxiesPool = require('proxies-pool')
const {fetcherFactory} = require('../http-client-with-prom-metrics-tracking');


const Fetcher = fetcherFactory(logger);

const proxies = [
    "http://205.134.235.132:3129",
    "http://8.142.142.250:80",
    "http://3.138.46.196:80",
    "http://173.249.25.220:80",
    "http://8.142.18.73:80",
    "http://216.137.184.253:80",
    "http://47.89.185.178:8888",
    "http://167.235.6.234:3128",
    "http://209.166.175.201:8080",
    "http://47.252.4.64:8888",
    "http://104.36.17.12:80",
    "http://157.230.34.219:3128",
    "http://161.82.183.156:80",
    "http://52.88.105.39:80",
    "http://8.141.251.188:3128",
    "http://209.166.175.201:3128",
    "http://143.244.133.78:80",
    "http://64.225.97.57:8080",
    "http://3.28.188.201:8080",
    "http://108.170.12.10:80",
    "http://104.225.220.233:80",
    "http://44.192.6.85:80",
    "http://68.183.111.90:80",
    "http://38.41.29.230:999",
    "http://35.201.247.214:80",
    "http://198.52.97.210:59394",
    "http://34.142.186.45:80",
    "http://161.35.223.141:80",
    "http://162.144.236.128:80",
    "http://137.184.100.135:80",
    "http://138.197.102.119:80",
    "http://38.7.129.49:999",
    "http://149.19.34.219:8082",
    "http://206.42.43.215:3128",
    "http://165.227.236.216:80",
    "http://100.20.101.185:80",
    "http://23.94.98.201:8080",
    "http://8.9.15.85:8090",
    "http://104.148.36.10:80",
    "http://162.247.153.124:80",
    "http://38.94.109.7:80",
    "http://38.94.109.12:80",
    "http://68.183.134.155:80",
    "http://65.21.131.27:80",
    "http://3.1.248.232:80",
    "http://209.146.105.241:80",
    "http://20.210.113.32:8123",
    "http://20.111.54.16:80",
    "http://68.183.242.248:3128",
    "http://20.24.43.214:8123",
    "http://54.90.145.243:7121",
    "http://137.184.197.190:80",
    "http://143.198.182.218:80",
    "http://138.91.159.185:80",
    "http://162.144.233.16:80",
    "http://54.175.197.235:80",
    "http://172.105.184.208:8001",
    "http://198.59.191.234:8080",
    "http://216.169.73.65:34679",
    "http://167.99.236.14:80",
    "http://64.119.29.22:8080",
    "http://205.201.49.132:53281",
    "http://149.19.34.219:80",
    "http://23.224.33.106:20351"]


const proxyPool = proxiesPool(proxies)

let headerGenerator = new HeaderGenerator(PRESETS.MODERN_DESKTOP,
    PRESETS.MODERN_MOBILE,
    PRESETS.MODERN_LINUX,
    PRESETS.MODERN_LINUX_FIREFOX,
    PRESETS.MODERN_LINUX_CHROME,
    PRESETS.MODERN_WINDOWS,
    PRESETS.MODERN_WINDOWS_FIREFOX,
    PRESETS.MODERN_WINDOWS_CHROME,
    PRESETS.MODERN_MACOS,
    PRESETS.MODERN_MACOS_FIREFOX,
    PRESETS.MODERN_MACOS_CHROME,
    PRESETS.MODERN_ANDROID);


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


class ProxiedRequest {
    constructor() {
    }
    async get(url, crumbAndCookies ={crumb: {},cookies: {}}) {
        // let ProxiedRequestStart = performance.now();
        // const end = httpRequestDurationMicroseconds.startTimer();
        
        let request = null
        let response = null
        
        while (response === null) {
            var randInt = getRandomInt(1, 5);
            if (randInt === 5) {
                request = Fetcher.fetch(url,{
                    skipTrackRequest: false,
                    headers:{ ...headerGenerator.getHeaders() },      
                    agent: new HttpsProxyAgent({
                        keepAlive: false,
                        rejectUnauthorized: false,
                        keepAliveMsecs: 10,
                        maxSockets: 256,
                        maxFreeSockets: 256,
                        scheduling: 'lifo',
                        proxy: 'http://scraperapi:3a2d1ce726317bca068416409b016741@proxy-server.scraperapi.com:8001'
                    }),           

                })
               
            } else {
                request = Fetcher.fetch(url,{
                    skipTrackRequest: false,
                    headers:{ ...headerGenerator.getHeaders() },           
                })
            }
            
            response = await request.then(function (resp) {
                return resp
            }).catch(function (error) {
                logger.error(error)
            })
            if ("You're sending requests a bit too fast! Please slow down your requests, or contact support@scraperapi.com with any questions." === response) {
                response = null
            }
          
        }

        // logger.info(`function  ProxiedRequest.get took ${(performance.now() - ProxiedRequestStart).toFixed(3)}ms`);
        return response


    }

}

module.exports = new ProxiedRequest();