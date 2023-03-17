###
# Implementation of Alpaca data and trading APIs
###

# https://alpaca.markets/docs/python-sdk/index.html

from alpaca.trading.client import TradingClient
from alpaca.data import StockHistoricalDataClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.trading.enums import OrderStatus
from alpaca.trading.requests import GetAssetsRequest
from alpaca.trading.enums import AssetClass, AssetStatus
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame
from alpaca.data.requests import StockLatestQuoteRequest

import time
import os
import boto3
import json

import boto3
from botocore.exceptions import ClientError

secrets_manager_client = boto3.client('secretsmanager')
apca_api_key_id = ""
apca_api_secret_key = ""
try:
    # Get the APCA-API-KEY-ID secret value
    apca_api_key_id_secret_value = secrets_manager_client.get_secret_value(SecretId='APCA-API-KEY-ID')
    apca_api_key_id = apca_api_key_id_secret_value['SecretString']
    
    # Get the APCA-API-SECRET-KEY secret value
    apca_api_secret_key_secret_value = secrets_manager_client.get_secret_value(SecretId='APCA-API-SECRET-KEY')
    apca_api_secret_key = apca_api_secret_key_secret_value['SecretString']
    
    print(f"APCA-API-KEY-ID: {apca_api_key_id}")
    print(f"APCA-API-SECRET-KEY: {apca_api_secret_key}")
    
except ClientError as e:
    print(f"Error retrieving secret: {e}")


# get API keys from user Environment Variables
API_PUBLIC_KEY = apca_api_key_id
API_PRIVATE_KEY = apca_api_secret_key

# Get Paper Trading client
# paper=True enables paper trading
trading_client = TradingClient(API_PUBLIC_KEY, API_PRIVATE_KEY, paper=True)

# Get historical data client
historical_data_client = StockHistoricalDataClient(API_PUBLIC_KEY, API_PRIVATE_KEY)


def get_account():
    return trading_client.get_account()


def get_tradeable_assets():
    # request = GetAssetsRequest(
    #    AssetStatus=AssetStatus.ACTIVE,
    #    AssetClass=AssetClass.US_EQUITY
    # )
    assets = trading_client.get_all_assets()
    tradeable_assets = list(filter(lambda asset: asset.tradable and asset.asset_class == AssetClass.US_EQUITY, assets))

    return tradeable_assets


def buy_shares(symbol, qty):
    # prepare order
    order_data = MarketOrderRequest(
                symbol=symbol,
                qty=qty,
                side=OrderSide.BUY,
                time_in_force=TimeInForce.DAY
                )

    # issue order request
    print("Buying " + str(qty) + " shares of " + symbol)
    market_order = trading_client.submit_order(order_data=order_data)


def buy_dollars(symbol, amt):
    # prepare order
    order_data = MarketOrderRequest(
                symbol=symbol,
                notional=amt,
                side=OrderSide.BUY,
                time_in_force=TimeInForce.DAY
                )

    # issue order request
    print("Buying " + str(amt) + " dollars of " + symbol)
    market_order = trading_client.submit_order(order_data=order_data)


def sell_shares(symbol, qty):
    # prepare order
    order_data = MarketOrderRequest(
        symbol=symbol,
        qty=qty,
        side=OrderSide.SELL,
        time_in_force=TimeInForce.DAY
    )

    # issue order request
    print("Selling/Shorting " + str(qty) + " shares of " + symbol)
    market_order = trading_client.submit_order(order_data=order_data)


def sell_dollars(symbol, amt):
    # prepare order
    order_data = MarketOrderRequest(
                symbol=symbol,
                notional=amt,
                side=OrderSide.SELL,
                time_in_force=TimeInForce.DAY
                )

    # issue order request
    print("Selling/Shorting " + str(amt) + " dollars of " + symbol)
    market_order = trading_client.submit_order(order_data=order_data)


def close_position(symbol):
    print("Closing entire position in " + symbol)
    try:
        order = trading_client.close_position(symbol_or_asset_id=symbol)
    except:
        print("Failed to close position in " + symbol)


def get_positions():
    open_positions = trading_client.get_all_positions()

    # for position in open_positions:
    #    print(str(position.qty) + " shares of " + position.symbol)

    return open_positions


def get_position(symbol):
    return trading_client.get_open_position(symbol_or_asset_id=symbol)


def get_bar_data(symbol, start_date):
    request_params = StockBarsRequest(
        symbol_or_symbols=[symbol],
        timeframe=TimeFrame.Day,
        start=start_date
    )

    bars = historical_data_client.get_stock_bars(request_params)

    # convert to dataframe
    # bars.df
    # print(bars["SPY"][1].close)

    return bars


def get_latest_quote(symbol):
    request_params = StockLatestQuoteRequest(symbol_or_symbols=symbol)
    latest_quote = historical_data_client.get_stock_latest_quote(request_params)

    return latest_quote[symbol].ask_price
