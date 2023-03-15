'use strict';

const fetch = require('node-fetch');
const constants = require('./constants');
const { MetricsTracker } = require('nodejs-metrics');
const logger = require('pine/lib/logger');
const needle = require('needle');

let metricsTracker = null;

// const _fetch = async (url, options, retries = 1) => {
//     try {
       
//         return result;
//     } catch (err) {
//         if (retries < constants.MaxRetries && err.type !== constants.TimeoutErrorString) {
//             return _fetch(url, options, retries + 1);
//         } else {
//             throw err;
//         }
//     }
// };

class Fetcher {
    constructor(logger) {
        this._logger = logger;
    }

    async fetch(url, options) {
        
        const mergedOptions = this._setDefaultOptions(options);
        const shouldTrackRequest = !mergedOptions.skipTrackRequest && metricsTracker;
        const startTime = process.hrtime();

        let response;
        try {
            if (shouldTrackRequest) {
                const currentRequestLabels = {
                    [constants.Metrics.Labels.Target]: new URL(url).host,
                    [constants.Metrics.Labels.Method]: mergedOptions && mergedOptions.method || constants.Metrics.DefaultValues.Method
                };
                let body = {
                    'root_url': 'https://query1.finance.yahoo.com',
                    'query_url': `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/DGICB`,
                    'params': {'lang': 'en-US',
                    'region': 'US',
                    'symbol': "DGICB",
                    'padTimeSeries': 'true',
                    'type': 'quarterlyCurrentLiabilities,quarterlyCurrentAssets,quarterlyShareIssued',
                    'merge': 'false',
                    'period1': '493590046',
                    'period2': "1678577636",
                    'corsDomain': 'finance.yahoo.com',
                }}
                
                const result = await fetch('http://rotating-proxy:5001/api/proxy',  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                  });
                 

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
                
                const endTime = process.hrtime(startTime);
                if (endTime[0] >= constants.WarnAfterSeconds) {
                    this._logger.info(`Request to ${url} took ${endTime[0]} seconds to execute.`);
                }
    
                // Always drain the response body to avoid memory leaks.
                // https://github.com/bitinn/node-fetch/issues/83
                // https://github.com/bitinn/node-fetch/issues/420
                // const buffer = await response.buffer();
                // response.text = async () => buffer.toString();
                // response.json = async () => {
                //     try {
                //         return JSON.parse(buffer.toString());
                //     } catch (e) {
                //         throw new Error(`Error parsing response from ${this._sanitizeUrl(url)}. Status: ${response.status}. Body: ${buffer.toString()}. ${e.toString()}`);
                //     }
                // };
                // response.buffer = async () => buffer;
    
                return result;
            } else {
                response = await _fetch(url, mergedOptions);
            }

           
        } catch (error) {
            const endTime = process.hrtime(startTime);
            this._logger.error(`Failed request for ${this._sanitizeUrl(url)} with "${error.message}" after ${endTime[0]} seconds`);
            throw error;
        }
    }

    _setDefaultOptions(options) {
        const mergedOptions = Object.assign({}, constants.DefaultRequestOptions, options);
        return mergedOptions;
    }

    _sanitizeUrl(url) {
        const parsedUrl = new URL(url);

        return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
    }
}

module.exports = {
    collectDefaultMetrics: (promClient) => {
        const externalHttpRequestDurationLabels = [constants.Metrics.Labels.Target, constants.Metrics.Labels.Method, constants.Metrics.Labels.StatusCode, constants.Metrics.Labels.Error];
        metricsTracker = new MetricsTracker({
            metrics: {
                [constants.Metrics.ExternalHttpRequestDurationSeconds]: new promClient.Histogram({
                    name: constants.Metrics.ExternalHttpRequestDurationSeconds,
                    help: `duration histogram of http responses labeled with: ${externalHttpRequestDurationLabels.join(', ')}`,
                    labelNames: externalHttpRequestDurationLabels,
                    buckets: constants.Metrics.HistogramValues.Buckets
                })
            }
        });
    },
    fetcherFactory: (logger) => {
        return new Fetcher(logger);
    }
};
