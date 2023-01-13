'use strict';

module.exports = {
    Metrics: {
        Labels: {
            Target: 'target',
            Method: 'method',
            StatusCode: 'status_code',
            Error: 'error'
        },
        DefaultValues: {
            Method: 'GET'
        },
        ExternalHttpRequestDurationSeconds: 'external_http_request_duration_seconds',
        HistogramValues: {
            Buckets: [0.1, 0.3, 1.5, 5, 10, 15, 20, 30]
        }
    },
    MaxRetries: 5,
    WarnAfterSeconds: 30,
    TimeoutErrorString: 'request-timeout',
    DefaultRequestOptions: {
        timeout: 30 * 10000
    }
};

//external_http_request_duration_seconds_bucket
// sum(increase(external_http_request_duration_seconds_count[1m]))
// histogram_quantile(0.9, sum(rate(external_http_request_duration_seconds_bucket[10m])) by (le, route))
// rate(external_http_request_duration_seconds_sum[5m]) / rate(external_http_request_duration_seconds_count[5m])