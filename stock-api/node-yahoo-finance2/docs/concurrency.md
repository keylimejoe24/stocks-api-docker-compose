# Concurrency

This section refers to features found in v1.11.0 and later.

1. [Introduction](#intro)
1. [Related: quoteCombine()](#quoteCombine)
1. [Promise Refresher](#promise-refresher)
1. [Options](#options)

<a name="intro"></a>
## Introduction

As with any API, we need to be careful over how many requests we send both
simultaneously and in a certain time period, to avoid overloading the server
or (more likely in Yahoo's case) being locked out (temporarily) for exceeding
the rate limits.  We also want to avoid choking our own network connection.

As such, `yahoo-finance` has a *built-in concurrency limit of 4 (by default)*.
This means, no matter how many times you call `yahooFinance.*`, we'll ensure
that there are never more than 4 simultaneous requests to Yahoo (when the 1st
requests completes, the 5th request will be made, etc).

The concurrency limit *applies across the entire library*.  If you call
`yahooFinance.quote()` and `yahooFinance.quoteSummary()` and others, all
in different places, you still don't need to worry about exceeding any
resource limits.  Calls are queued in the order they are called (i.e. the
first function you call will be the first one to return - assuming all calls
were to take the same time).

<a name="quoteCombine"></a>
## Related: quoteCombine()

If all you need are `quote` requests, be aware of
[quoteCombine](./other/quoteCombine.md), that will combine all your individual
`quoteCombine(symbol)` calls into a single network request.  Yahoo's `quote`
API is the only one that supports multiple symbols in a single request (if you
find anymore,
[let us know](https://github.com/gadicc/node-yahoo-finance2/issues/new/choose)).

<a name="promise-refresher"></a>
## Promise Refresher

Our modules all return promises.  Here's a quick recap on how to run multiple
requests in series or in parallel.  Both approaches return the same result:

```js
const symbols = ['TSLA', 'MSFT', 'AAPL'];

// Series: perform one request at a time, one after the other
const data = [];
for (let symbol of symbols)
  data.push(await yahooFinance.quoteSummary(symbol));

// Parallel: perform all requests simultaneously (within concurrency limit)
const data = Promise.all(symbols.map(symbol => yahooFinance.quoteSummary(symbol)));
```

Note that for the parallel case, our internal *concurrency limit is observed*.
So even with that single line, you get the convenience of parallelization
without needing to worry about exceeding resource limits.

This also makes it safe to make calls anywhere, such as in a `forEach()`
callback.  e.g.

```js
// Will run in parallel, but without exceeding the concurrency limit
databaseResults.forEach(async (row) => {
  const result = await yahooFinance.quoteCombine(row.symbol);
  // do something
});
```

<a name="options"></a>
## Options

**The default concurrency limit is 4**

You can change it with:

```js
yahooFinance.setGlobalConfig({ queue: { concurrency: 1 } }); // or 8, Infinity, etc.
```

Changing the value applies retroactively to previously queued requests.

Although we don't recommend it, it's also possible to change at request time:

```js
const moduleOptions = { query: { concurrency: 1 }};
yahooFinance.someModule(symbol, query, moduleOptions);
```

This approach is less preferred as it is less clear what's going on.  This
updates the concurrency limit of the entire queue across all requests from
all modules (and not just the current call) - so it can be misleading.
