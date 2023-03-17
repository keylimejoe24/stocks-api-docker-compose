import pandas as pd
import numpy as np
import talib
from datetime import datetime

import alpaca as tradeapi


# Replace with your own Alpaca API credentials
API_KEY = "PKIU47VMEMXO5QPC6H8T"
API_SECRET = "H7hDF9pIssyCUWf2o2kyBi5MRzjNWl8QwcK9av0o"
APCA_API_BASE_URL = 'https://paper-api.alpaca.markets'

# Set up the Alpaca API client
api = tradeapi.REST(API_KEY, API_SECRET, APCA_API_BASE_URL, api_version='v2')

# Define the number of periods for the moving average and RSI
ma_periods = 20
rsi_periods = 14

# Define the minimum RSI value for a buy signal and the maximum RSI value for a sell signal
rsi_buy_threshold = 30
rsi_sell_threshold = 70

# Define the initial capital to invest
initial_capital = 10000

# Get historical price data for SPY
symbol = 'SPY'
barset = api.get_barset(symbol, 'day', limit=ma_periods+rsi_periods)
df = pd.DataFrame()
for i in range(ma_periods+rsi_periods):
    ts = barset[symbol][i].t
    df.loc[ts] = {
        'open': barset[symbol][i].o,
        'high': barset[symbol][i].h,
        'low': barset[symbol][i].l,
        'close': barset[symbol][i].c,
        'volume': barset[symbol][i].v,
    }

# Calculate the moving average and RSI
df['ma'] = talib.SMA(df['close'], timeperiod=ma_periods)
df['rsi'] = talib.RSI(df['close'], timeperiod=rsi_periods)

# Keep only the last row of the DataFrame
df = df.tail(1)

# Check if the RSI is below the buy threshold and the price is above the moving average
if df['rsi'].iloc[0] < rsi_buy_threshold and df['close'].iloc[0] > df['ma'].iloc[0]:
    # Buy SPY using the initial capital
    api.submit_order(
        symbol=symbol,
        qty=int(initial_capital / df['close'].iloc[0]),
        side='buy',
        type='market',
        time_in_force='gtc'
    )
    print(f"Bought {symbol} at {df['close'].iloc[0]}")

# Check if the RSI is above the sell threshold
elif df['rsi'].iloc[0] > rsi_sell_threshold:
    # Sell all shares of SPY
    positions = api.list_positions()
    for position in positions:
        if position.symbol == symbol:
            api.submit_order(
                symbol=symbol,
                qty=abs(int(float(position.qty))),
                side='sell',
                type='market',
                time_in_force='gtc'
            )
            print(f"Sold {symbol} at {df['close'].iloc[0]}")
            break
else:
    print(f"No action taken for {symbol}")