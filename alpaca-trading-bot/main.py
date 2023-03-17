###
# Algorithmic Trading Bot
###

import AlpacaAPI
from TradingAlgorithm import Action, calculate_action
from alpaca.trading import PositionSide
import math


position_size_dollars = 5000

def main():
    print("AlpacaAPI.get_tradeable_assets()")
    tradeable_assets = AlpacaAPI.get_tradeable_assets()
  
    count = 0
    for asset in tradeable_assets:
        action = calculate_action(asset.symbol)
        # print("Asset is " + asset.symbol + " and action is " + action.name)
        # TODO is it necessary to do this every time?
        positions = AlpacaAPI.get_positions()
        account = AlpacaAPI.get_account()

        # if we have an open position for this asset, pull it out of the list
        # otherwise position = None
        if any(position.symbol == asset.symbol for position in positions):
            # print("open position found for " + asset.symbol)
            position = AlpacaAPI.get_position(asset.symbol)
        else:
            position = None
            # print("no open positions found for " + asset.symbol)

        # if we don't have a position yet all we can do is buy Long or Short
        if position is None:
            # check for free buying power
            # TODO compare against buying power not cash
            if position_size_dollars < float(account.cash):
                if action == Action.LONG:
                    # if we can buy fractionable shares
                    # buy $position_share_dollars
                    if asset.fractionable:
                        AlpacaAPI.buy_dollars(asset.symbol, position_size_dollars)
                    # else calculate the maximum number of whole shares
                    # we can buy for $position_share_dollars
                    else:
                        quote = AlpacaAPI.get_latest_quote(asset.symbol)
                        if quote == 0:
                            continue
                        shares = math.floor(position_size_dollars / quote)
                        AlpacaAPI.buy_shares(asset.symbol, shares)
                elif action == Action.SHORT and asset.shortable:
                    # API cannot short fractionable shares
                    # so calculate the maximum number of whole shares
                    # we can short for $position_share_dollars
                    quote = AlpacaAPI.get_latest_quote(asset.symbol)
                    if quote == 0:
                        continue
                    shares = math.floor(position_size_dollars / quote)
                    AlpacaAPI.sell_shares(asset.symbol, shares)
                # else:
                #    print("decided not to open new position in " + asset.symbol)
            # else:
            #    print("not enough buying power to open position in " + asset.symbol)
        # else we do have a position, and we can hold it or close it
        # algorithm calls for close
        elif action == Action.CLOSE:
            AlpacaAPI.close_position(asset.symbol)
        # algorithm calls for a position of the opposite side so close the current position
        # do not purchase the opposite side at this time
        elif position.side == PositionSide.LONG and action.value > 2:
            AlpacaAPI.close_position(asset.symbol)
        elif position.side == PositionSide.SHORT and action.value < 4:
            AlpacaAPI.close_position(asset.symbol)
        # else we hold the position
        else:
            print("Holding position in " + asset.symbol)


if __name__ == "__main__":
   main()