# Upgrading from yahoo-finance v1

**THIS DOCUMENT IS A WORK IN PROGRESS**

Table of Contents

1. [General](#general)
2. [historical()](#historical)
3. [quote()](#quote)

<a name="general"></a>
## General

1. **symbol**: The most common change is that in v1, we accepted a `symbol` key
in the `options` dictionary. In v2, the `symbol` is usually the first
*parameter* to the function call. This is a lot more comfortable, as most APIs
take a single, required symbol or query parameter, and `options` are usually
optional.  See the examples below.

1. **validation** and **typescript**: we go to much greater lengths to ensure
that the data you get is consistent, even though Yahoo often change their
API.  If you use the optional typescript, you get a lot of help and hints as
to what the query result will look like.  See the
[validation docs](./validation.md) for further info.

<a name="quote"></a>
## quote()

**NB: v1's `quote()` relates to v2's `quoteSummary()`**.  This was an
unfortunate lack of foresight on our part in v1 without releasing
Yahoo's API had an entirely different `quote` API too.  In v2, we align
exactly with Yahoo's API naming.

The function signature has changed slightly, to remain consistent with the
rest of the library.

```js
// V1 took a single OPTIONS object as the only paramater
// The API was called "quote" (in v2, it's "quoteSummary")
yahooFinanceV1.quote({ symbol, modules });
{
  // Depends on modules argument:
  price: { /* ... */ },
  summaryDetail: { /* ... */ },
}

// V2 takes SYMBOL as 1st parameter, OPTIONS as 2nd.
// The API is called "quoteSummary" (in v1, it's "quote")
yahooFinanceV2.quoteSummary(symbol, { modules });
{
  // The output should otherwise be identical.
  // Please open an issue if you find any edge-cases.
}
```

**Query**

| Attribute     | v1                       | v2+                              |
| ------------- | ------------------------ | -------------------------------- |
| `symbol`      | As a `{ symbol }` option | First argument to quoteSummary()   |
| `modules`     | Remains the same         | Remains the same

Note: v1 could also accept a `symbols` key (note the "s" at the end for plural).
In v2 we accept a single symbol only, which more closely aligns to a single
network request being made.

**Results**

| Attribute     | v1                       | v2+                              |
| ------------- | ------------------------ | -------------------------------- |
| `symbol`      | Was included in each result | Not included in each result   |

<a name="historical"></a>
## historical()

The function signature has changed slightly, to remain consistent with the
rest of the library.

```js
// V1 took a single OPTIONS object as the only paramater
yahooFinanceV1.historical({ symbol, from, to });
[
  {
    date, open, high, low, close, adjClose, volume,
    symbol // was included
  },
  // ...
]

// V2 takes SYMBOL as 1st parameter, OPTIONS as 2nd.
yahooFinanceV2.historical(symbol, { period1 });
[
  {
    date, open, high, low, close, adjClose, volume,
    // symbol NOT included
  },
  // ...
]
```

**Query**

| Attribute     | v1                       | v2+                              |
| ------------- | ------------------------ | -------------------------------- |
| `symbol`      | As a `{ symbol }` option | First argument to historical()   |
| `fields`      | `{ from, to }`           | `{ period1, period2 }`.  Period2 defaults to now().
| dates         | "YYYY-MM-dd"             | JS Date object, or any format `new Date()` understands , so "YYYY-MM-dd" still works fine too.

**Results**

| Attribute     | v1                       | v2+                              |
| ------------- | ------------------------ | -------------------------------- |
| `symbol`      | Was included in each result | Not included in each result   |
