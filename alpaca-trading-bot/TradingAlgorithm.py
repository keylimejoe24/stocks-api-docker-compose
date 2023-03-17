###
# Implementation of the trading algorithm
###

import AlpacaAPI
from datetime import date, datetime, timedelta
from enum import Enum
import numpy as np

business_days = 7
percent_variance = 0.2


class Action(Enum):
    LONG = 1
    HOLD_LONG = 2
    CLOSE = 3
    HOLD_SHORT = 4
    SHORT = 5


def get_start_date(days):
    today = date.today()
    start = today

    count = 0
    while count < days:
        start = start - timedelta(days=1)

        # get list of all days
        today_str = str(today)
        start_str = str(start)

        count = abs(np.busday_count(today_str, start_str))

    start_dt = datetime.combine(start, datetime.min.time())
    return start_dt


def calculate_sma(bars, symbol):
    sum = 0
    for day in bars[symbol]:
        sum = sum + day.close

    sma = sum / len(bars[symbol])

    return sma


def calculate_action(symbol):
    try:
        # calculate SMA and get latest quote
        start_date = get_start_date(business_days)
        bars = AlpacaAPI.get_bar_data(symbol, start_date)
        latest_quote = AlpacaAPI.get_latest_quote(symbol)

        sma = calculate_sma(bars, symbol)

        # Compare SMA and latest quote for action
        if latest_quote < sma:
            if latest_quote <= sma * (1 - percent_variance):
                return Action.SHORT
            return Action.HOLD_SHORT

        if sma * (1 + percent_variance) <= latest_quote:
            return Action.LONG

        if sma <= latest_quote:
            return Action.HOLD_LONG

        return Action.CLOSE
    except:
        return Action.CLOSE
