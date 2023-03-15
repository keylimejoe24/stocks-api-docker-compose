const logger = require('../logger/api.logger');
const cheerio = require('cheerio');
const needle = require('needle');
const utils = require('../utils/utils');
const { HttpsProxyAgent } = require('hpagent');
const { performance } = require('perf_hooks');
const { HeaderGenerator, PRESETS } = require('header-generator');
const proxiesPool = require('proxies-pool')
const {fetcherFactory} = require('../http-client-with-prom-metrics-tracking');
const fetch = require('node-fetch');
const constants = require('./constants.js');


class ProxiedRequest {
    constructor() {
    }
   
    async get(url,body={},metricsTracker) {
        // let ProxiedRequestStart = performance.now();
        // const end = httpRequestDurationMicroseconds.startTimer();
        
        let request = null
        let response = null
        
        while (response === null) {
           
          
            const startTime = process.hrtime();
            const currentRequestLabels = {
                [constants.Metrics.Labels.Target]: new URL(url).host,
                [constants.Metrics.Labels.Method]: 'GET'
            };
            const result = await fetch(url,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              }).then(function (resp) {
                return resp
            }).catch(function (error) {
                logger.error("==========")
                logger.error(error)
                logger.error("==========")
            })
            response = await metricsTracker.trackHistogramDuration({
                metricName: constants.Metrics.ExternalHttpRequestDurationSeconds,
                labels: currentRequestLabels,
                action: async () => { return result},
                handleResult: (err, labels) => {
                    if (err) {
                        labels[constants.Metrics.Labels.Error] = err.name || err.type || err.code;

                        return;
                    }

                    labels[constants.Metrics.Labels.StatusCode] = result.statusCode;
                }
            });
            
            // const endTime = process.hrtime(startTime);
            // if (endTime[0] >= constants.WarnAfterSeconds) {
            //     this._logger.info(`Request to ${url} took ${endTime[0]} seconds to execute.`);
            // }

          
        }

        // logger.info(`function  ProxiedRequest.get took ${(performance.now() - ProxiedRequestStart).toFixed(3)}ms`);
        return response


    }

}

module.exports = new ProxiedRequest();