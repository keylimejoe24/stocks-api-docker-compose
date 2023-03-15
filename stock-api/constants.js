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