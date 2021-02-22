# Degiro Charts

:warning: Not Affiliated with DEGIRO in any way

Build charts from degiro's export CSV function.

![still ugly but arguably less](https://user-images.githubusercontent.com/6273120/108095477-d3b1dc00-7077-11eb-921d-488aeba9623d.png)

Features in progress:

- Find associated ticker for products
- Fees calculator
- More charts
- Plot my transactions on actual stock price chart. Looking at a stock price chart I want to see the exact moment I bought/sold.
- make it pretty

### Development

How I'm trying to organise, this is likely to change

```

- src
-- [components]: View components with display logic only
-- [views]: App pages, integrates view components and page specific logic
-- [IsinMap]: Business logic for managing missing isin lookup
-- App.tsx: Root app, includes app wide business logic
-- TransactionUtils.ts Doesn't have a home yet, transactions related helpers
-- CsvUtils.ts Doesn't have a home yet, Csv parsing related helpers
```
