// Test 1: Dividend Rate Comparison
// forward annual dividen rate > trailing annual dividen rate = buy
// forward annual dividen rate < trailing annual dividen rate = sell
// % swing = (forward annual dividen rate - trailing annual dividen rate) / trailing annual dividen rate 
// estimated stock price = previous close * ( 1 - % swing )
var _ = require('lodash');

const logger = require('../logger/api.logger');

let defaultResponseObject = {
    currentMarketValue: "N/A",
    estimatedStockPrice: "N/A",
    weight: 0,
}




const checkForNullOrUndefinedFields = (obj, keys) => {
    let currentResObj = _.clone(defaultResponseObject);
    let description = "Missing "

    keys.forEach(key => {
        if (_.isNil(obj[key])) {
            if (!_.isEqual("Missing ", description)) {
                description += " AND "
            }
            description += key
        } else {
            currentResObj[key] = obj[key]
        }
    })
    if (!_.isEqual("Missing ", description)) {
        currentResObj["description"] = description
    }

    return currentResObj
}
const dividendRateComparison = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["trailingAnnualDividendRate", "forwardAnnualDividendRate", "previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }
    logger.info(JSON.stringify(ticker))
    logger.info(parseFloat(ticker["trailingAnnualDividendRate"]))
    logger.info(parseFloat(ticker["forwardAnnualDividendRate"]))
    let forwardAndTrailingDifference = parseFloat(ticker["trailingAnnualDividendRate"]) - parseFloat(ticker["forwardAnnualDividendRate"])
    let percentSwing = parseFloat(forwardAndTrailingDifference / parseFloat(ticker["trailingAnnualDividendRate"]))
    logger.info(percentSwing)
    if ((parseFloat(ticker["forwardAnnualDividendRate"]) > parseFloat(ticker["trailingAnnualDividendRate"]))) {
        return {
            "Trailing Annual Dividend Rate": ticker["forwardAnnualDividendRate"],
            "Forward Annual Dividend Rate": ticker["trailingAnnualDividendRate"],
            currentMarketValue: ticker.previousClose,
            description: "Trailing Annual Dividend Rate > Forward Annual Dividend Rate",
            estimatedStockPrice: (parseFloat(ticker.previousClose) * (1 + percentSwing)),
            weight: 1 + percentSwing
        }
    } else if ((parseFloat(ticker["forwardAnnualDividendRate"]) < parseFloat(ticker["trailingAnnualDividendRate"]))) {
        return {
            "Trailing Annual Dividend Rate": ticker["forwardAnnualDividendRate"],
            "Forward Annual Dividend Rate": ticker["trailingAnnualDividendRate"],
            currentMarketValue: ticker.previousClose,
            description: "Trailing Annual Dividend Rate < Forward Annual Dividend Rate",
            estimatedStockPrice: (parseFloat(ticker.previousClose) * (1 + percentSwing)),
            weight: -1 + percentSwing
        }
    } else {
        return {
            "Trailing Annual Dividend Rate": ticker["forwardAnnualDividendRate"],
            "Forward Annual Dividend Rate": ticker["trailingAnnualDividendRate"],
            currentMarketValue: ticker.previousClose,
            description: "Trailing Annual Dividend Rate === Forward Annual Dividend Rate",
            estimatedStockPrice: 'N/A',
            weight: -1
        }
    }




}


// Test:2 Peg Ratio and EPS 

// PEG Ratio = ( EPS (TTM) / Quarterly Revenue Growth (yoy)
// Dividend Payout Ratio =(Forward Dividend / EPS (TTM))

// If PEG Ratio > .5 and Dividend Payout Ratio > .5 = BUY
// If PEG Ratio < .5 and Dividend Payout Ratio < 1 = SELL
const pegRatioAndEPS = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["quarterlyRevenueGrowth", "eps", "previousClose"])

    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    if (parseFloat(ticker["quarterlyRevenueGrowth"]) === 0) {
        return {
            "Quarterly Revenue Growth (yoy)": ticker["quarterlyRevenueGrowth"],
            "PE Ratio (TTM)": ticker["eps"],
            currentMarketValue: ticker.previousClose,
            description: "Quarterly Revenue Growth is 0",
            estimatedStockPrice: 'N/A',
            weight: 0
        }
    }


    let pegRatio = (parseFloat(ticker["eps"]) / parseFloat(ticker["quarterlyRevenueGrowth"]))

    let dividenPayoutRatio = (parseFloat(ticker["eps"]) / parseFloat(ticker["quarterlyRevenueGrowth"]))

    if (((pegRatio > .5) && (dividenPayoutRatio > .5))) {
        return {
            "Quarterly Revenue Growth (yoy)": ticker["quarterlyRevenueGrowth"],
            "PE Ratio (TTM)": ticker["eps"],
            "Dividend Payout Ratio": dividenPayoutRatio,
            "PEG Ratio": pegRatio,
            currentMarketValue: ticker.previousClose,
            description: "PEG Ratio > .5 and Dividend Payout Ratio > .5",
            estimatedStockPrice: parseFloat(ticker.previousClose),
            weight: 1
        }
    } else if (((pegRatio < .5) && (dividenPayoutRatio < 1))) {
        return {
            "Quarterly Revenue Growth (yoy)": ticker["quarterlyRevenueGrowth"],
            "PE Ratio (TTM)": ticker["eps"],
            "Dividend Payout Ratio": dividenPayoutRatio,
            "PEG Ratio": pegRatio,
            currentMarketValue: ticker.previousClose,
            description: "PEG Ratio < .5 and Dividend Payout Ratio < 1",
            estimatedStockPrice: parseFloat(ticker.previousClose),
            weight: -1
        }
    } else {
        return {
            "Quarterly Revenue Growth (yoy)": ticker["quarterlyRevenueGrowth"],
            "PE Ratio (TTM)": ticker["eps"],
            "Dividend Payout Ratio": dividenPayoutRatio,
            "PEG Ratio": pegRatio,
            currentMarketValue: ticker.previousClose,
            description: "NOT PEG Ratio > .5 and Dividend Payout Ratio > .5 OR PEG Ratio < .5 and Dividend Payout Ratio < 1 ",
            estimatedStockPrice: 'N/A',
            weight: 0
        }
    }
}


// Test 3: Beta Swings
// Expected % Move = ( Beta (5Y Monthly)) * (S&P500 52-Week Change)
// Possible Correction %= (Expected % Move) - (52-Week Change %)
// Estimated Stock Price = (Possible Correction %+1)* (Previous Close)
const betaSwings = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["sAndPFiveHundredFiftyTwoWeekChange", "fiftyTwoWeekChange", "beta", "previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    let expectedPercentMove = parseFloat(ticker.beta) * parseFloat(ticker.sAndPFiveHundredFiftyTwoWeekChange)
    let possibleCorrection = expectedPercentMove - parseFloat(ticker.fiftyTwoWeekChange)


    if (possibleCorrection > 1) {
        return {
            currentMarketValue: ticker.previousClose,
            description: "Possible Correction > 1",
            estimatedStockPrice: (possibleCorrection / 100 + 1) * parseFloat(ticker.previousClose),
            weight: 1 + (possibleCorrection / 100 + 1)
        }
    } if (possibleCorrection < -1) {
        return {
            currentMarketValue: ticker.previousClose,
            description: "Possible Correction < 1",
            estimatedStockPrice: (possibleCorrection / 100 + 1) * parseFloat(ticker.previousClose),
            weight: -1 - (possibleCorrection / 100 + 1),
        }
    } else if ((1 > possibleCorrection) && (possibleCorrection > -1)) {
        return {
            currentMarketValue: ticker.previousClose,
            description: "1 > Possible Correction > -1",
            estimatedStockPrice: (possibleCorrection / 100 + 1) * parseFloat(ticker.previousClose),
            weight: 0
        }
    }


}


/*
Test 4: 52 Week Low and Highs & Volume

% from 52 Week Low = (Previous Close - 52 Week Low) / 52 Week Low 
% from 52 Week High = (Previous Close - 52 Week High) / 52 Week High

Volume Discrepancy = (Volume - Avg. Volume) / (Avg. Volume)

If Previous Close is within 10% from 52 Week Low, AND Volume Discrepancy is > 0 = BUY
If Previous Close is within 10% from 52 Week Low, AND Volume Discrepancy is < 0 = SELL
If Previous Close is within 10% from 52 Week High, AND Volume Discrepancy is > 0 = BUY
If Previous Close is within 10% from 52 Week High, AND Volume Discrepancy is < 0 = SELL

If Previous Close > 50-Day Moving Average > 200-Day Moving Average AND Volume Discrepancy is > 0 = BUY   
Estimated Stock Price = Previous Close + (50-Day Moving Average - 200-Day Moving Average AND Volume Discrepancy)
*/
const isNumberWithinPercentOfNumber = (firstN, percent, secondN) => {
    let decimalPercent = percent / 200.0;
    let highRange = secondN * (1.0 + decimalPercent);
    let lowRange = secondN * (1.0 - decimalPercent);
    return lowRange <= firstN && firstN <= highRange;
}


const fiftyTwoWeekLowsHighsAndVolume = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["sAndPFiveHundredFiftyTwoWeekChange", "fiftyTwoWeekChange", "fiftyTwoWeekLow", "fiftyTwoWeekHigh", "averageVolume", "previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    let fromFiftyTwoWeekLow = (parseFloat(ticker.previousClose) - parseFloat(ticker.fiftyTwoWeekLow)) / parseFloat(ticker.fiftyTwoWeekLow)
    let fromFiftyTwoWeekHigh = (parseFloat(ticker.previousClose) - parseFloat(ticker.fiftyTwoWeekHigh)) / parseFloat(ticker.fiftyTwoWeekHigh)
    let volumeDiscrepancy = (parseFloat(ticker.volume) - parseFloat(ticker.averageVolume)) / parseFloat(ticker.averageVolume)
    let expectedPercentMove = parseFloat(ticker.beta) * parseFloat(ticker.sAndPFiveHundredFiftyTwoWeekChange)
    let possibleCorrection = expectedPercentMove - parseFloat(ticker.fiftyTwoWeekChange)

    if (isNumberWithinPercentOfNumber(parseFloat(ticker.previousClose), fromFiftyTwoWeekHigh) && (volumeDiscrepancy > 0)) {
        return {
            currentMarketValue: ticker.previousClose,
            description: "Previous Close is within 10% from 52 Week High, AND Volume Discrepancy is > 0",
            estimatedStockPrice: (possibleCorrection / 100 + 1) * parseFloat(ticker.previousClose),
            weight: 1 + (possibleCorrection / 100 + 1)
        }
    } else if (isNumberWithinPercentOfNumber(parseFloat(ticker.previousClose), fromFiftyTwoWeekHigh) && (volumeDiscrepancy < 0)) {
        return {
            currentMarketValue: ticker.previousClose,
            description: "Previous Close > 50-Day Moving Average > 200-Day Moving Average AND Volume Discrepancy is < 0",
            estimatedStockPrice: (possibleCorrection / 100 + 1) * parseFloat(ticker.previousClose),
            weight: -1 - (possibleCorrection / 100 + 1)
        }
    } else if (isNumberWithinPercentOfNumber(parseFloat(ticker.previousClose), fromFiftyTwoWeekLow) && (volumeDiscrepancy > 0)) {
        return {
            currentMarketValue: ticker.previousClose,
            description: "Previous Close is within 10% from 52 Week Low, AND Volume Discrepancy is > 0",
            estimatedStockPrice: (possibleCorrection / 100 + 1) * parseFloat(ticker.previousClose),
            weight: 1 + (possibleCorrection / 100 + 1)
        }
    } else if (isNumberWithinPercentOfNumber(parseFloat(ticker.previousClose), fromFiftyTwoWeekLow) && (volumeDiscrepancy < 0)) {
        return {
            currentMarketValue: ticker.previousClose,
            description: "Previous Close is within 10% from 52 Week Low, AND Volume Discrepancy is < 0",
            estimatedStockPrice: (possibleCorrection / 100 + 1) * parseFloat(ticker.previousClose),
            weight: 1 - (possibleCorrection / 100 + 1)
        }
    }
    return {
        "fromFiftyTwoWeekLow": fromFiftyTwoWeekLow,
        "fromFiftyTwoWeekHigh": fromFiftyTwoWeekHigh,
        "volumeDiscrepancy": volumeDiscrepancy,
        "expectedPercentMove": expectedPercentMove,
        "possibleCorrection": possibleCorrection,
        description: "No Results",
    }




}


/*
Test 5:  Moving Average Mean Reversions

If Previous Close > 50-Day Moving Average > 200-Day Moving Average AND Volume Discrepancy is > 0 = BUY   
Estimated Stock Price = Previous Close + (50-Day Moving Average - 200-Day Moving Average AND Volume Discrepancy)

If Previous Close > 50-Day Moving Average > 200-Day Moving Average AND Volume Discrepancy is < 0 = SELL  
Estimated Stock Price = 50-Day Moving Average

If 50-Day Moving Average > Previous Close > 200-Day Moving Average AND Volume Discrepancy is > 0 = BUY   
Estimated Stock Price = 50-Day Moving Average

If 50-Day Moving Average > Previous Close > 200-Day Moving Average AND Volume Discrepancy is < 0 = SELL   
Estimated Stock Price = 200-Day Moving Average

If 50-Day Moving Average > 200-Day Moving Average > Previous Close AND Volume Discrepancy is > 0 = BUY
Estimated Stock Price = 200-Day Moving Average

If 50-Day Moving Average > 200-Day Moving Average > Previous Close AND Volume Discrepancy is < 0 = SELL
Estimated Stock Price = Previous Close - (50-Day Moving Average - 200-Day Moving Average)

If 200-Day Moving Average > 50-Day Moving Average > Previous Close AND Volume Discrepancy is > 0 = BUY
Estimated Stock Price = 50-Day Moving Average

If 200-Day Moving Average > 50-Day Moving Average > Previous Close AND Volume Discrepancy is < 0 = SELL
Estimated Stock Price = Previous Close - (200-Day Moving Average - 50-Day Moving Average)
*/
const movingAverageMeanReversions = (ticker) => {
    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["fiftyDayAverage", "twoHundredDayAverage", "averageVolume", "previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    let volumeDiscrepancy = (parseFloat(ticker.volume) - parseFloat(ticker.averageVolume)) / parseFloat(ticker.averageVolume)

    let prevClose50Day200DayComp = ((parseFloat(ticker.previousClose) > parseFloat(ticker.fiftyDayAverage)) && (parseFloat(ticker.fiftyDayAverage) > parseFloat(ticker.twoHundredDayAverage)))
    let fiftyPreviousCloseTwoHundred = ((parseFloat(ticker.fiftyDayAverage) > parseFloat(ticker.previousClose)) && (parseFloat(ticker.previousClose) > parseFloat(ticker.twoHundredDayAverage)))

    let twoHundredDayMovingAvgGrtr500Avrg = ((parseFloat(ticker.twoHundredDayAverage) > parseFloat(ticker.fiftyDayAverage)) && (parseFloat(ticker.fiftyDayAverage) > parseFloat(ticker.previousClose)))
    let twoHundredPrevious50 = ((parseFloat(ticker.twoHundredDayAverage) > parseFloat(ticker.previousClose)) && (parseFloat(ticker.previousClose) > parseFloat(ticker.fiftyDayAverage)))
    let fiftyTwoHundredPrevious = ((parseFloat(ticker.fiftyDayAverage) > parseFloat(ticker.twoHundredDayAverage)) && (parseFloat(ticker.twoHundredDayAverage) > parseFloat(ticker.previousClose)))
    let previousTwoHundredFifty = ((parseFloat(ticker.previousClose) > parseFloat(ticker.twoHundredDayAverage)) && parseFloat(ticker.twoHundredDayAverage) > parseFloat(ticker.fiftyDayAverage))
    let fiftyto200MovingAvgDif = parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.twoHundredDayAverage)



    let percentSwing = (((parseFloat(ticker.previousClose) + fiftyto200MovingAvgDif) - ticker.previousClose) / ticker.previousClose)
    if ((prevClose50Day200DayComp && (volumeDiscrepancy > 0))) {

        if (fiftyto200MovingAvgDif < 1) {
            fiftyto200MovingAvgDif = fiftyto200MovingAvgDif * -1
        }
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "Previous Close > 50-Day Moving Average > 200-Day Moving Average AND Volume Discrepancy is > 0",
            estimatedStockPrice: parseFloat(ticker.fiftyDayAverage),
            weight: 1 + (parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    } else if ((prevClose50Day200DayComp && (volumeDiscrepancy < 0))) {
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "Previous Close > 50-Day Moving Average > 200-Day Moving Average AND Volume Discrepancy is < 0",
            estimatedStockPrice: parseFloat(ticker.previousClose) + fiftyto200MovingAvgDif,
            weight: -1 - percentSwing
        }
    }
    else if ((fiftyPreviousCloseTwoHundred && (volumeDiscrepancy > 0))) {

        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "50-Day Moving Average > Previous Close > 200-Day Moving Average AND Volume Discrepancy is > 0",
            estimatedStockPrice: parseFloat(ticker.fiftyDayAverage),
            weight: 1 + (parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    }
    else if ((fiftyPreviousCloseTwoHundred && (volumeDiscrepancy < 0))) {
        let fiftyto200MovingAvgDif = parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.twoHundredDayAverage)
        if (fiftyto200MovingAvgDif < 1) {
            fiftyto200MovingAvgDif = fiftyto200MovingAvgDif * -1
        }

        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "50-Day Moving Average > Previous Close > 200-Day Moving Average AND Volume Discrepancy is < 0",
            estimatedStockPrice: parseFloat(ticker.twoHundredDayAverage),
            weight: -1 + (parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    }
    else if ((twoHundredDayMovingAvgGrtr500Avrg && (volumeDiscrepancy > 0))) {
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "200-Day Moving Average > 50-Day Moving Average > Previous Close AND Volume Discrepancy is > 0",
            estimatedStockPrice: parseFloat(ticker.fiftyDayAverage),
            weight: 1 + (parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    } else if ((twoHundredDayMovingAvgGrtr500Avrg && (volumeDiscrepancy < 0))) {
        let fiftyto200MovingAvgDif = parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.twoHundredDayAverage)
        if (fiftyto200MovingAvgDif < 1) {
            fiftyto200MovingAvgDif = fiftyto200MovingAvgDif * -1
        }
        let estimatedStockPrice = parseFloat(ticker.previousClose) - (parseFloat(ticker.twoHundredDayAverage) - parseFloat(ticker.fiftyDayAverage))
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "200-Day Moving Average > 50-Day Moving Average > Previous Close AND Volume Discrepancy is < 0",
            estimatedStockPrice: estimatedStockPrice,
            weight: -1 + (estimatedStockPrice - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    } else if ((twoHundredPrevious50 && (volumeDiscrepancy > 0))) {
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "200-Day Moving Average > Previous Close > 50-Day Moving Average AND Volume Discrepancy is > 0",
            estimatedStockPrice: parseFloat(ticker.twoHundredDayAverage),
            weight: 1 + (parseFloat(ticker.twoHundredDayAverage) - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    } else if ((twoHundredPrevious50 && (volumeDiscrepancy < 0))) {
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "200-Day Moving Average > Previous Close > 50-Day Moving Average AND Volume Discrepancy is < 0",
            estimatedStockPrice: parseFloat(ticker.fiftyDayAverage),
            weight: -1 + (parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    } else if ((previousTwoHundredFifty && (volumeDiscrepancy > 0))) {
        let fiftyto200MovingAvgDif = (parseFloat(ticker.twoHundredDayAverage) - parseFloat(ticker.fiftyDayAverage))
        if (fiftyto200MovingAvgDif < 1) {
            fiftyto200MovingAvgDif = fiftyto200MovingAvgDif * -1
        }
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "Previous Close > 200-Day Moving Average > 50-Day Moving Average AND Volume Discrepancy is > 0",
            estimatedStockPrice: parseFloat(ticker.previousClose) + fiftyto200MovingAvgDif,
            weight: 1 + (fiftyto200MovingAvgDif / parseFloat(ticker.previousClose))
        }
    } else if ((previousTwoHundredFifty && (volumeDiscrepancy < 0))) {
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "Previous Close > 200-Day Moving Average > 50-Day Moving Average AND Volume Discrepancy is < 0",
            estimatedStockPrice: parseFloat(ticker.twoHundredDayAverage),
            weight: -1 + (parseFloat(ticker.twoHundredDayAverage) - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    } else if ((fiftyTwoHundredPrevious && (volumeDiscrepancy > 0))) {
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "50-Day Moving Average > 200-Day Moving Average > Previous Close AND Volume Discrepancy is > 0",
            estimatedStockPrice: parseFloat(ticker.twoHundredDayAverage),
            weight: 1 + (parseFloat(ticker.twoHundredDayAverage) - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    } else if ((fiftyTwoHundredPrevious && (volumeDiscrepancy < 0))) {
        let fiftyto200MovingAvgDif = parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.twoHundredDayAverage)
        if (fiftyto200MovingAvgDif < 1) {
            fiftyto200MovingAvgDif = fiftyto200MovingAvgDif * -1
        }
        return {
            volumeDiscrepancy: volumeDiscrepancy,
            percentSwing: percentSwing,
            currentMarketValue: ticker.previousClose,
            description: "50-Day Moving Average > 200-Day Moving Average > Previous Close AND Volume Discrepancy is < 0",
            estimatedStockPrice: parseFloat(ticker.previousClose) - (parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.twoHundredDayAverage)),
            weight: -1 - ((parseFloat(ticker.previousClose) - (parseFloat(ticker.fiftyDayAverage) - parseFloat(ticker.twoHundredDayAverage))) - parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose)
        }
    }
}




// Test 6: Stocks can't go up 7 days in a row/go down 7 days in a row
// If (Close* of Yesterday) > (Close* of 3rd line date) > (Close* of 4th line date) > (Close* of 5th line date) > (Close* of 6th line date) = SELL  
// Expected Price = ((Close* of Today) + (Close* of 6th line date))/2

// If (Close* of Yesterday) < (Close* of 3rd line date) < (Close* of 4th line date) < (Close* of 5th line date) < (Close* of 6th line date) = BUY
// Expected Price = ((Close* of Yesterday) + (Close* of 6th line date))/2
const stockMovementSevenDays = (ticker) => {
    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["closingHistories"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }
    let closingHistories = ticker.closingHistories
    if (Array.isArray(closingHistories) && closingHistories.length === 4) {
        if (((parseFloat(closingHistories[0]) > parseFloat(closingHistories[1])) &&
            (parseFloat(closingHistories[1]) > parseFloat(closingHistories[2])) &&
            (parseFloat(closingHistories[2]) > parseFloat(closingHistories[3])))) {
            return {
                closingHistories: ticker.closingHistories,
                currentMarketValue: ticker.previousClose,
                description: '(Close* of Yesterday) > (Close* of 3rd line date) > (Close* of 4th line date) > (Close* of 5th line date) > (Close* of 6th line date)',
                estimatedStockPrice: (parseFloat(closingHistories[1]) + parseFloat(closingHistories[4])) / 2,
                weight: -1 + (((parseFloat(closingHistories[1]) + parseFloat(closingHistories[4])) / 2) - ticker.previousClose) / ticker.previousClose
            }
        } else if (
            ((parseFloat(closingHistories[0]) < parseFloat(closingHistories[1])) &&
                (parseFloat(closingHistories[1]) < parseFloat(closingHistories[2])) &&
                (parseFloat(closingHistories[2]) < parseFloat(closingHistories[3])))) {
            return {
                closingHistories: ticker.closingHistories,
                currentMarketValue: ticker.previousClose,
                description: '(Close* of Yesterday) < (Close* of 3rd line date) < (Close* of 4th line date) < (Close* of 5th line date) < (Close* of 6th line date)',
                estimatedStockPrice: (parseFloat(closingHistories[0]) + parseFloat(closingHistories[3])) / 2,
                weight: 1 + (((parseFloat(closingHistories[0]) + parseFloat(closingHistories[3])) / 2) - ticker.previousClose) / ticker.previousClose
            }
        } else {
            return {
                closingHistories: ticker.closingHistories,
                currentMarketValue: ticker.previousClose,
                description: 'No Trend In Stock Movement',
                estimatedStockPrice: 'N/A',
                weight: 0
            }
        }
    } else {
        return {
            closingHistories: ticker.closingHistories,
            currentMarketValue: ticker.previousClose,
            description: 'No Trend In Stock Movement',
            estimatedStockPrice: 'N/A',
            weight: 0
        }
    }


}

// Test 7: % of Shares Short
// NextEra Energy, Inc. (NEE) Valuation Measures & Financial Statistics (yahoo.com)
// If (Short % of Shares Outstanding) || (Short % of Shares Outstanding) < 5% = BUY OR
// If not BUY, HOLD
const shortPercentOfSharesOutstanding = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["shortPercentOfSharesOutstanding","previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    let percentOfSharesOutStanding = (parseFloat(ticker.shortPercentOfSharesOutstanding) / 100)
    let lessThanFivePercent = (percentOfSharesOutStanding < 0.05)
    let greaterThanThirtyPercent = (percentOfSharesOutStanding > .3)

    if (greaterThanThirtyPercent) {
        return {
            currentMarketValue: ticker.previousClose,
            description: "(Short % of Shares Outstanding) > 30% ",
            estimatedStockPrice: ((1 + percentOfSharesOutStanding) * parseFloat(ticker.previousClose)),
            weight: 1 + percentOfSharesOutStanding
        }
    } else if (lessThanFivePercent) {
        return {
            currentMarketValue: ticker.previousClose,
            description: "(Short % of Shares Outstanding) < 5% ",
            estimatedStockPrice: ((1 + percentOfSharesOutStanding) * parseFloat(ticker.previousClose)),
            weight: 1 + percentOfSharesOutStanding
        }
    } else {
        return {
            currentMarketValue: ticker.previousClose,
            description: "(Short % of Shares Outstanding) < 30% || (Short % of Shares Outstanding) > 5% )",
            estimatedStockPrice: "N/A",
            weight: 0
        }
    }
}

// Test 8:  Revenue Growth
// Amazon.com, Inc. (AMZN) Valuation Measures & Financial Statistics (yahoo.com)
// Estimated Stock Move % = (Quarterly Revenue Growth (yoy))
// Estimated Stock Price $ = (1+ (Quarterly Revenue Growth (yoy)) * Previous Close
// If Estimated Stock Move % is positive = BUY
// If Estimated Stock Move % is Negative = SELL

const revenueGrowth = (ticker) => {
    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["revenueGrowth","previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    if (parseFloat(ticker.revenueGrowth) > 0) {
        let percentMovement = (parseFloat(ticker.revenueGrowth) / 100)
        return {
            currentMarketValue: ticker.previousClose,
            description: "(Quarterly Revenue Growth (yoy) > 0",
            estimatedStockPrice: ((1 + percentMovement) * parseFloat(ticker.previousClose)),
            weight: 1 + percentMovement
        }
    } else if (parseFloat(ticker.revenueGrowth) < 0) {
        let percentMovement = (parseFloat(ticker.revenueGrowth) / 100)
        return {
            currentMarketValue: ticker.previousClose,
            description: "(Quarterly Revenue Growth (yoy) < 0",
            estimatedStockPrice: ((1 + percentMovement) * parseFloat(ticker.previousClose)),
            weight: -1 + percentMovement
        }
    } else {
        return {
            currentMarketValue: ticker.previousClose,
            description: "(Quarterly Revenue Growth (yoy) == 0",
            estimatedStockPrice: "N/A",
            weight: 0
        }
    }

}

// Test 9:  Earnings Growth:
// Amazon.com, Inc. (AMZN) Valuation Measures & Financial Statistics (yahoo.com)

// Estimated Stock Move % = (Quarterly Earnings Growth (yoy))
// Estimated Stock Price $ = (1+ (Quarterly Earnings Growth Growth (yoy)) * Previous Close
// If Estimated Stock Move % is positive = BUY
// If Estimated Stock Move % is Negative = SELL

const earningsGrowth = (ticker) => {
    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["earningsGrowth","previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    if (parseFloat(ticker.earningsGrowth) > 0) {
        let percentMovement = (parseFloat(ticker.earningsGrowth) / 100);
        return {
            'Quarterly Earnings Growth (yoy)': ticker.earningsGrowth,
            currentMarketValue: ticker.previousClose,
            description: "(Quarterly Earnings Growth (yoy) > 0",
            estimatedStockPrice: ((1 + percentMovement) * parseFloat(ticker.previousClose)),
            weight: 1 + percentMovement
        }
    } else if (parseFloat(ticker.earningsGrowth) < 0) {
        let percentMovement = (parseFloat(ticker.earningsGrowth) / 100);
        return {
            'Quarterly Earnings Growth (yoy)': ticker.earningsGrowth,
            currentMarketValue: ticker.previousClose,
            description: "(Quarterly Earnings Growth (yoy) < 0",
            estimatedStockPrice: ((1 + percentMovement) * parseFloat(ticker.previousClose)),
            weight: -1 + percentMovement
        }
    } else {
        return {
            'Quarterly Earnings Growth (yoy)': ticker.earningsGrowth,
            currentMarketValue: ticker.previousClose,
            description: "(Quarterly Earnings Growth (yoy) = NA",
            estimatedStockPrice: "N/A",
            weight: 0
        }
    }

}

// Test 10: Trailing P/E vs.Forward P/E PART 2
// Amazon.com, Inc. (AMZN) Valuation Measures & Financial Statistics (yahoo.com)
// Expected Stock Price Move $ = (Forward P/E - Trailing P/E)  * Diluted EPS (ttm)
// If (Expected Stock Price Move $) is positive, = BUY
// If (Expected Stock Price Move $) is negative, = SELL
// Expected Stock Price $ = (Expected Stock Price Move $) + Previous Close


const trailingPEvsForward = (ticker) => {
    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["trailingPE","forwardPE","dilutedEPS","previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    let currentTrailingPE = parseFloat(ticker.trailingPE)
    let currentForwardPE = parseFloat(ticker.forwardPE)


    let expectedStockPriceMove = ((currentForwardPE - currentTrailingPE) * parseFloat(ticker.dilutedEPS))

    if (expectedStockPriceMove > 0) {
        return {
            "Trailing P/E": currentTrailingPE,
            "Forward P/E": currentForwardPE,
            currentMarketValue: ticker.previousClose,
            description: "Expected Stock Price Move > 0",
            estimatedStockPrice: expectedStockPriceMove + parseFloat(ticker.previousClose),
            weight: 1 + ((expectedStockPriceMove + parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose))
        }
    } else if (expectedStockPriceMove < 0) {
        return {
            "Trailing P/E": currentTrailingPE,
            "Forward P/E": currentForwardPE,
            currentMarketValue: ticker.previousClose,
            description: "Expected Stock Price Move < 0",
            estimatedStockPrice: expectedStockPriceMove + parseFloat(ticker.previousClose),
            weight: -1 - ((expectedStockPriceMove + parseFloat(ticker.previousClose)) / parseFloat(ticker.previousClose))
        }
    }
}



// Test 11: Ability to Pay Current Liabilities.
// Meta Platforms, Inc. (META) Balance Sheet - Yahoo Finance

// If Current Assets > Current Liabilities = BUY
// If Current Assets < Current Liabilities = SELL


const abilityToPayCurrentLiabilities = (ticker) => {
    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["totalCurrentAssets","totalCurrentLiabilities","dilutedEPS","previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    let currentAssets = parseFloat(ticker.totalCurrentAssets)
    let currentLiabilities = parseFloat(ticker.totalCurrentLiabilities)

    if ((parseFloat(ticker.totalCurrentAssets) > parseFloat(ticker.totalCurrentLiabilities))) {
        return {
            'Current Assets': currentAssets,
            'Current Liabilities': currentLiabilities,
            currentMarketValue: ticker.previousClose,
            description: "Current Assets > Current Liabilities",
            estimatedStockPrice: ticker.previousClose,
            weight: 1
        }
    } else if ((parseFloat(ticker.totalCurrentAssets) < parseFloat(ticker.totalCurrentLiabilities))) {
        return {
            'Current Assets': currentAssets,
            'Current Liabilities': currentLiabilities,
            currentMarketValue: ticker.previousClose,
            description: "Current Assets < Current Liabilities ",
            estimatedStockPrice: ticker.previousClose,
            weight: -1
        }
    }
}


// Test 12: Stock Buy-Backs
// Meta Platforms, Inc. (META) Balance Sheet - Yahoo Finance
// 
// If (Share Issued **Column 2) - (Share Issued **Column 1) > 0, = BUY
// If (Share Issued **Column 2) - (Share Issued **Column 1) < 0, = SELL
// Estimated Swing % = ((Share Issued **Column 2) - (Share Issued **Column 1)) / (Share Issued ** Column 2)
// Estimated Stock Price = (1 + (Estimated Swing %) * Previous Close



const stockBuyBacks = (ticker) => {

    // logger.info(JSON.stringify(ticker))
    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["currentlyIssuedShares","previouslyIssuedShares","previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }
    

    let currentlyIssuedShares = parseFloat(ticker.currentlyIssuedShares)
    let previouslyIssuedShares = parseFloat(ticker.previouslyIssuedShares)
    if ((isNaN(currentlyIssuedShares) || isNaN(previouslyIssuedShares))) {
        return {
            'Current Issued Shares': ticker.currentlyIssuedShares,
            'Previous Issued Shares': ticker.previouslyIssuedShares,
            currentMarketValue: "N/A",
            description: "Current Issued Shares OR Previous Issued Shares Equals N/A ",
            estimatedStockPrice: ticker.previousClose,
            weight: -1,
        }
    }

    let previousMinusCurrent = (previouslyIssuedShares - currentlyIssuedShares)
    let estimatedSwing = (previousMinusCurrent / previouslyIssuedShares)
    let estimatedStockValue = ((1 + estimatedSwing) * parseFloat(ticker.previousClose))

    if (((previousMinusCurrent) > 0)) {
        return {
            'Current Issued Shares': ticker.currentlyIssuedShares,
            'Previous Issued Shares': ticker.previouslyIssuedShares,
            currentMarketValue: ticker.previousClose,
            description: "((Previous Issued Shares) - (Current Issued Shares)) > 0",
            estimatedStockPrice: estimatedStockValue,
            weight: 1 + estimatedSwing
        }
    } else if (((previousMinusCurrent) < 0)) {
        return {
            'Current Issued Shares': ticker.currentlyIssuedShares,
            'Previous Issued Shares': ticker.previouslyIssuedShares,
            currentMarketValue: ticker.previousClose,
            description: "((Previous Issued Shares) - (Current Issued Shares)) < 0",
            estimatedStockPrice: estimatedStockValue,
            weight: -1 + estimatedSwing
        }
    }
}

/*

Test 14: Market Equilibrium:
In a Market Equilibrium: $SPY Dividend % = 10 Year GOVT Treasury Rate YTM % = YOY CPI %

Data Point for SPY Dividend Yeild % is called "yeild" on the link below: 
SPDR S&P 500 ETF Trust (SPY) Stock Price, News, Quote & History - Yahoo Finance

Data Point for 10 year govt treasury ytm % (USE 10 YR and most recent Date):
Resource Center | U.S. Department of the Treasury

Data Point for YOY CPI : Looking for the 8.2%, under the heading "CPI-U, US CITY AVERAGE, ALL ITEMS" AND 3RD DATA POINT DOWN"
Latest Numbers : U.S. Bureau of Labor Statistics (bls.gov)

RIGHT NOW:
CPI = 8.2%
SPY DIV % = 1.73%
10 YEAR TREASURY YTM = 4.25%

^^ THIS MEANS THAT INFLATION NEEDS TO COME DOWN, TO DO THAT, INTEREST RATES NEED TO COME UP, AND SPY DIVIDEND NEEDS TO COME UP (AKA STOCKS GO DOWN)"

IF CPI % > 10 Year Treasury % > Dividend Yield % = SELL
IF CPI % > Dividend Yield % > 10 Year Treasury % = SELL
IF Dividend Yield % > CPI % > 10 Year Treasury % = BUY
IF Dividend Yield %  > 10 Year Treasury % > CPI % = BUY
IF 10 Year Treasury % > CPI % > Dividend Yield % = BUY
IF 10 Year Treasury % > Dividend Yield % > CPI % = BUY

*/
const marketEquilibrium = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["tenYearGovtTreasuryYtm","yoyCPI","spyDividenYield","previousClose"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    let tenYearGovTreasury = parseFloat(ticker.tenYearGovtTreasuryYtm)
    let yoyCPI = (parseFloat(ticker.yoyCPI) * 100)
    let dividenYield = parseFloat(ticker.spyDividenYield)

    if ((isNaN(tenYearGovTreasury) || isNaN(yoyCPI) || isNaN(dividenYield))) {
        return {
            '10 Year Govt Treasury (YTM)': ticker.tenYearGovTreasury,
            'Yoy CPI': ticker.yoyCPI,
            'SPY Dividend Yield': ticker.spyDividenYield,
            currentMarketValue: "N/A",
            description: "10 Year Govt Treasury (YTM) OR Yoy CPI OR SPY Dividend Yield is N/A ",
            estimatedStockPrice: ticker.previousClose,
            weight: "N/A",
        }
    }

    if ((yoyCPI > tenYearGovTreasury) && (tenYearGovTreasury > dividenYield)) {
        return {
            '10 Year Govt Treasury (YTM)': ticker.tenYearGovTreasury,
            'Yoy CPI': ticker.yoyCPI,
            'SPY Dividend Yield': ticker.spyDividenYield,
            currentMarketValue: "N/A",
            description: "CPI % > SPY Dividend Yield % > 10 Year Treasury",
            weight: -1,
        }

    } else if ((yoyCPI > dividenYield) && (dividenYield > tenYearGovTreasury)) {
        return {
            '10 Year Govt Treasury (YTM)': ticker.tenYearGovTreasury,
            'Yoy CPI': ticker.yoyCPI,
            'SPY Dividend Yield': ticker.spyDividenYield,
            currentMarketValue: "N/A",
            description: "SPY Dividend Yield % > CPI % > 10 Year Treasury",
            weight: 1,
        }

    } else if ((dividenYield > yoyCPI) && (yoyCPI > tenYearGovTreasury)) {
        return {
            '10 Year Govt Treasury (YTM)': ticker.tenYearGovTreasury,
            'Yoy CPI': ticker.yoyCPI,
            'SPY Dividend Yield': ticker.spyDividenYield,
            currentMarketValue: "N/A",
            description: "SPY DIV % > CPI % > 10 YEAR TREASURY",
            estimatedStockPrice: ticker.previousClose,
            weight: 1,
        }

    } else if ((dividenYield > tenYearGovTreasury) && (tenYearGovTreasury > yoyCPI)) {
        return {
            '10 Year Govt Treasury (YTM)': ticker.tenYearGovTreasury,
            'Yoy CPI': ticker.yoyCPI,
            'SPY Dividend Yield': ticker.spyDividenYield,
            currentMarketValue: "N/A",
            description: "SPY Dividend Yield %  > 10 Year Treasury % > CPI",
            estimatedStockPrice: ticker.previousClose,
            weight: 1,
        }

    } else if ((tenYearGovTreasury > yoyCPI) && (yoyCPI > dividenYield)) {
        return {
            '10 Year Govt Treasury (YTM)': ticker.tenYearGovTreasury,
            'Yoy CPI': ticker.yoyCPI,
            'SPY Dividend Yield': ticker.spyDividenYield,
            currentMarketValue: "N/A",
            description: "10 Year Treasury % > CPI % > SPY Dividend Yield",
            estimatedStockPrice: ticker.previousClose,
            weight: 1,
        }

    } else if ((tenYearGovTreasury > dividenYield) && (dividenYield > yoyCPI)) {
        return {
            '10 Year Govt Treasury (YTM)': ticker.tenYearGovTreasury,
            'Yoy CPI': ticker.yoyCPI,
            'SPY Dividend Yield': ticker.spyDividenYield,
            currentMarketValue: "N/A",
            description: "10 Year Treasury % > SPY Dividend Yield % > CPI",
            estimatedStockPrice: ticker.previousClose,
            weight: 1,
        }
    }


}

/*
TEST 15: YIELD CURVE IN ORDER
IDEALLY TREASURY DATES SHOULD HAVE HIGHER INTEREST RATES AS MATURITY DATE GETS FURTHER IN THE FUTURE:
Resource Center | U.S. Department of the Treasury
Use the Most Recent Date, and these headings: Skipping 2month & 4month
1 Mo	
3 Mo	
6 Mo	1 Yr	2 Yr	3 Yr	5 Yr	7 Yr	10 Yr	20 Yr	30 Yr

BUY = 1Mo < 3Mo < 6M < 1 Yr < 2Yr < 3 Yr < 5 Yr < 7Yr <10 Yr < 20 Yr < 30 Yr
SELL = if any of these are out of order.  I want to know the data point out of order as well. That is the time period when to predict recession.

Today's 1year treasury rate is the peak, and the 2 year is lower than the 1 year. The time period that is out of order is the predict of when a recession will hit in a year.

*/
const yieldCurveInOrder = (ticker) => {

    /* 
    "1 Mo": 3.76,
    "2 Mo": 3.95,
    "3 Mo": 4.13,
    "4 Mo": 4.27,
    "6 Mo": 4.44,
    "1 Yr": 4.5,
    "2 Yr": 4.3,
    "3 Yr": 4.29,
    "5 Yr": 4.09,
    "7 Yr": 4.01,
    "10 Yr": 3.96,
    "20 Yr": 4.32,
    "30 Yr": 4.12
    */
    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["treasuryYieldCurve"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }

    let months = Object.keys(ticker.treasuryYieldCurve)
    let vals = Object.values(ticker.treasuryYieldCurve)
    let recessionValues = {}

    vals.forEach(((v, i) => {
        if (i != vals.length) {
            if (vals[i] > vals[i + 1]) {
                recessionValues[Object.keys(recessionValues).length] = `${months[i]}: ${vals[i]} > ${months[i + 1]}: ${vals[i + 1]}`
            }
        }
    }))
    if (recessionValues.length > 0) {
        return {
            description: "Yield Curve Recession Values",
            recessionValues: recessionValues,
            "Treasury Yield Curve": ticker.treasuryYieldCurve,
            weight: -1
        }

    }


    // if (ticker["Operating Cash Flow (ttm)"] > 1) {
    //     return {
    //         "Yield Curve In Order": ticker["Yield Curve In Order"],
    //         description: "1Mo < 3Mo < 6M < 1 Yr < 2Yr < 3 Yr < 5 Yr < 7Yr <10 Yr < 20 Yr < 30 Yr",
    //         estimatedStockPrice: "N/A",
    //         weight: 1
    //     }
    // } else {
    //     return {

    //         currentMarketValue: ticker.previousClose,
    //         description: "Operating Cash Flow (ttm) < 0",
    //         estimatedStockPrice: "N/A",
    //         weight: -1
    //     }
    // }
}

/*
Test 16:  Is the 10 Year Treasury Rate Increasing or decreasing this week?
Resource Center | U.S. Department of the Treasury

Use the most recent date and most recent date (minus 5 days), and 10 year treasury Column.  

If Today's 10 yr % > 5 days ago 10 year % = SELL
If Today's 10 yr % < 5 days ago 10 year % = BUY
Estimated Stock Price Move % = (5 days ago 10 yr % - todays 10 yr % ) / ( 5 days ago 10 yr %)
Estimate Stock Price = Previous Close * (1+ Estimated Stock Price Move %)

*/
const tenYearTreasuryRate = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["tenYearTreasuryRate"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }
    let todaysTenYearTreasuryRate = parseFloat(Object.values(ticker.tenYearTreasuryRate)[0])
    let fiveDaysAgoTreasuryRate = parseFloat(Object.values(ticker.tenYearTreasuryRate)[1])
    let estimatedStockPriceMove = (fiveDaysAgoTreasuryRate - todaysTenYearTreasuryRate) / fiveDaysAgoTreasuryRate
    let estimatedStockPrice = parseFloat(ticker.previousClose) * (1 + estimatedStockPriceMove)

    if (todaysTenYearTreasuryRate < fiveDaysAgoTreasuryRate) {
        return {
            estimatedStockPriceMove: estimatedStockPriceMove,
            "Ten Year Treasury Rate": ticker.tenYearTreasuryRate,
            currentMarketValue: ticker.previousClose,
            description: "Today's 10 yr % < 5 days ago 10 year",
            estimatedStockPrice: estimatedStockPrice,
            weight: 1 + estimatedStockPriceMove,

        }
    } else if (todaysTenYearTreasuryRate > fiveDaysAgoTreasuryRate) {
        return {
            estimatedStockPriceMove: estimatedStockPriceMove,
            "Ten Year Treasury Rate": ticker.tenYearTreasuryRate,
            currentMarketValue: ticker.previousClose,
            description: "Today's 10 yr % > 5 days ago 10 year",
            estimatedStockPrice: estimatedStockPrice,
            weight: -1 + estimatedStockPriceMove,
        }
    } else if (todaysTenYearTreasuryRate === fiveDaysAgoTreasuryRate) {
        return {
            estimatedStockPriceMove: estimatedStockPriceMove,
            "Ten Year Treasury Rate": ticker.tenYearTreasuryRate,
            currentMarketValue: ticker.previousClose,
            description: "Today's 10 yr % === 5 days ago 10 year",
            estimatedStockPrice: estimatedStockPrice,
            weight: 0,
        }
    }
}


/*
Test 17:  Is the 10 Year Treasury Rate Increasing or decreasing this Month?
Resource Center | U.S. Department of the Treasury

Use the most recent date and most recent date (minus 30 days), and 10 year treasury Column.  

If Today's 10 yr % > 30 days ago 10 year % = SELL
If Today's 10 yr % < 30 days ago 10 year % = BUY
Estimated Stock Price Move % = (30 days ago 10 yr % - todays 10 yr % ) / ( 30 days ago 10 yr %)
Estimate Stock Price = Previous Close * (1+ Estimated Stock Price Move %)
*/

const tenYearTreasuryRateMonthly = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["tenYearTreasuryRateMonthly"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }
    let todaysTenYearTreasuryRate = parseFloat(Object.values(ticker.tenYearTreasuryRateMonthly)[0])
    let lastMonthsTreasuryRate = parseFloat(Object.values(ticker.tenYearTreasuryRateMonthly)[1])
    let estimatedStockPriceMove = (lastMonthsTreasuryRate - todaysTenYearTreasuryRate) / lastMonthsTreasuryRate
    let estimatedStockPrice = parseFloat(ticker.previousClose) * (1 + estimatedStockPriceMove)

    if (todaysTenYearTreasuryRate < lastMonthsTreasuryRate) {
        return {
            "Ten Year Treasury Rate Monthly": ticker.tenYearTreasuryRateMonthly,
            currentMarketValue: ticker.previousClose,
            description: "Today's 10 yr % < 1 Month Ago 10 year",
            estimatedStockPrice: estimatedStockPrice,
            weight: 1 + estimatedStockPriceMove,
            estimatedStockPriceMove: estimatedStockPriceMove

        }
    } else if (todaysTenYearTreasuryRate > lastMonthsTreasuryRate) {
        return {
            "Ten Year Treasury Rate Monthly": ticker.tenYearTreasuryRateMonthly,
            currentMarketValue: ticker.previousClose,
            description: "Today's 10 yr % > 1 Month Ago 10 year",
            estimatedStockPrice: estimatedStockPrice,
            weight: -1 + estimatedStockPriceMove,
            estimatedStockPriceMove: estimatedStockPriceMove
        }
    } else {
        return {
            "Ten Year Treasury Rate Monthly": ticker.tenYearTreasuryRateMonthly,
            currentMarketValue: ticker.previousClose,
            description: "Today's 10 yr % > 1 Month Ago 10 year",
            estimatedStockPrice: estimatedStockPrice,
            estimatedStockPriceMove: estimatedStockPriceMove,
            weight: 0,
        }
    }
}



/*
Test 18:  Is the 10 Year Treasury Rate Increasing or decreasing this Quarter?
Resource Center | U.S. Department of the Treasury

Use the most recent date and most recent date (minus 30 days), and 10 year treasury Column.  

If Today's 10 yr % > 90 days ago 10 year % = SELL
If Today's 10 yr % < 90 days ago 10 year % = BUY
Estimated Stock Price Move % = (90 days ago 10 yr % - todays 10 yr % ) / (90 days ago 10 yr %)
Estimate Stock Price = Previous Close * (1+ Estimated Stock Price Move %)
*/

const tenYearTreasuryRateQuarterly = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["tenYearTreasuryRateQuarterly"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }
    let todaysTenYearTreasuryRate = parseFloat(Object.values(ticker.tenYearTreasuryRateQuarterly)[0])
    let lastQuartersTreasuryRate = parseFloat(Object.values(ticker.tenYearTreasuryRateQuarterly)[1])
    let estimatedStockPriceMove = (lastQuartersTreasuryRate - todaysTenYearTreasuryRate) / lastQuartersTreasuryRate
    let estimatedStockPrice = parseFloat(ticker.previousClose) * (1 + estimatedStockPriceMove)

    if (todaysTenYearTreasuryRate < lastQuartersTreasuryRate) {
        return {
            "Ten Year Treasury Rate Quarterly": ticker.tenYearTreasuryRateQuarterly,
            currentMarketValue: ticker.previousClose,
            description: "Today's 10 yr % < 90 days ago 10 year",
            estimatedStockPrice: estimatedStockPrice,
            weight: 1 + estimatedStockPriceMove,

        }
    } else if (todaysTenYearTreasuryRate > lastQuartersTreasuryRate) {
        return {
            "Ten Year Treasury Rate Quarterly": ticker.tenYearTreasuryRateQuarterly,
            currentMarketValue: ticker.previousClose,
            description: "Today's 10 yr % > 90 days ago 10 year",
            estimatedStockPrice: estimatedStockPrice,
            weight: -1 - estimatedStockPriceMove,
        }
    } else if (todaysTenYearTreasuryRate === lastQuartersTreasuryRate) {
        return {
            "Ten Year Treasury Rate Quarterly": ticker.tenYearTreasuryRateQuarterly,
            currentMarketValue: ticker.previousClose,
            description: "Today's 10 yr % === 90 days ago 10 year",
            estimatedStockPrice: estimatedStockPrice,
            weight: 0,
        }
    }
}

/*
Test 19: Money Supply
Stocks will go down if money supply shrinks, if it goes up stocks go up
The Fed - Money Stock Measures - H.6 Release - October 25, 2022 (federalreserve.gov)
Use Most Recent Month Row, Column is "Seasonally Adjusted M1"

If Most Recent Seasonally Adjusted M1 > 1month ago Seasonally Adjusted M1 = BUY
if Most Recent Seasonally Adjusted M1 > 1month ago Seasonally Adjusted M1 = SELL
Estimated Stock Price Move % = (Most Recent Seasonally Adjusted M1 - 1month ago Seasonally Adjusted M1) / (1month ago Seasonally Adjusted M1)
Estimated Stock Price = Previous Close * (1+ Estimated Stock Price Move %)
*/
const m1SeasonallyAdjusted = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["m1SeasonallyAdjustedLastMonth","m1SeasonallyAdjustedCurrent"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }
    let m1SeasonallyAdjustedLastMonth = parseFloat(ticker.m1SeasonallyAdjustedLastMonth)
    let m1SeasonallyAdjustedCurrent = parseFloat(ticker.m1SeasonallyAdjustedCurrent)
    let estimatedStockPriceMove = (m1SeasonallyAdjustedLastMonth - m1SeasonallyAdjustedCurrent) / m1SeasonallyAdjustedLastMonth
    let estimatedStockPrice = parseFloat(ticker.previousClose) * (1 + estimatedStockPriceMove)

    if (m1SeasonallyAdjustedCurrent > m1SeasonallyAdjustedLastMonth) {
        return {
            'm1SeasonallyAdjustedLastMonth': ticker.m1SeasonallyAdjustedLastMonth,
            'm1SeasonallyAdjustedCurrent': ticker.m1SeasonallyAdjustedCurrent,
            currentMarketValue: ticker.previousClose,
            description: "Most Recent Seasonally Adjusted M1 > 1month ago Seasonally Adjusted M1",
            estimatedStockPrice: estimatedStockPrice,
            weight: 1 + estimatedStockPriceMove,

        }
    } else if (m1SeasonallyAdjustedCurrent < m1SeasonallyAdjustedLastMonth) {
        return {
            'm1SeasonallyAdjustedLastMonth': ticker.m1SeasonallyAdjustedLastMonth,
            'm1SeasonallyAdjustedCurrent': ticker.m1SeasonallyAdjustedCurrent,
            currentMarketValue: ticker.previousClose,
            description: "Most Recent Seasonally Adjusted M1 < 1month ago Seasonally Adjusted M1",
            estimatedStockPrice: estimatedStockPrice,
            weight: -1 -  estimatedStockPriceMove,
        }
    } else if (m1SeasonallyAdjustedCurrent === m1SeasonallyAdjustedLastMonth) {
        return {
            'm1SeasonallyAdjustedLastMonth': ticker.m1SeasonallyAdjustedLastMonth,
            'm1SeasonallyAdjustedCurrent': ticker.m1SeasonallyAdjustedCurrent,
            currentMarketValue: ticker.previousClose,
            description: "Most Recent Seasonally Adjusted M1 === 1month ago Seasonally Adjusted M1",
            estimatedStockPrice: estimatedStockPrice,
            weight: 0,
        }
    }
}

// Test 19: Average Wage Growth:
// If Average Wage is going up, stocks will go up. If wages are going down, stocks are going down.
// Table B-3. Average hourly and weekly earnings of all employees on private nonfarm payrolls by industry sector, seasonally adjusted - 2022 Q03 Results (bls.gov)
// Use "total private" for the row, and Most recent month & last month as columns

// If Most Recent Month Hourly Wage > Last Month Hourly Wage = BUY
// If Most Recent Month Hourly Wage < Last Month Hourly Wage = SELL
// Estimated Stock Price Move % = (Most Recent Month Hourly Wage - Last Month Hourly Wage) / (Last Month Hourly Wage)
// Estimate Stock Price = Previous Close * (1+ Estimated Stock Price Move %)
const averageWageGrowth = (ticker) => {

   
    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["lastMonthsWeeklyEarnings","currentWeeklyEarnings"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }
    let lastMonthWeeklyEarningStr = `${ticker.lastMonthsWeeklyEarnings}`
    let currentWeeklyEarningStr = `${ticker.currentWeeklyEarnings}`
    let lastMonthWeeklyEarningStrWithoutDollarSign = lastMonthWeeklyEarningStr.replace('$', '')
    let currentWeeklyEarningStrWithoutDollarSign = currentWeeklyEarningStr.replace('$', '')
    
    let lastMonthsWeeklyEarnings = parseFloat(_.replace(lastMonthWeeklyEarningStrWithoutDollarSign,new RegExp(',','g'),'.'))
    let currentWeeklyEarnings = parseFloat(_.replace(currentWeeklyEarningStrWithoutDollarSign,new RegExp(',','g'),'.'))
    let estimatedStockPriceMove = (lastMonthsWeeklyEarnings - currentWeeklyEarnings) / lastMonthsWeeklyEarnings
    let estimatedStockPrice = parseFloat(ticker.previousClose) * (1 + estimatedStockPriceMove)

    if (currentWeeklyEarnings > lastMonthsWeeklyEarnings) {
        return {
            'lastMonthsWeeklyEarnings': ticker.lastMonthsWeeklyEarnings,
            'currentWeeklyEarnings': ticker.currentWeeklyEarnings,
            currentMarketValue: ticker.previousClose,
            description: "Most Recent Month Hourly Wage > Last Month Hourly Wage",
            estimatedStockPrice: estimatedStockPrice,
            weight: 1 + estimatedStockPriceMove,

        }
    } else if (currentWeeklyEarnings < lastMonthsWeeklyEarnings) {
        return {
            'lastMonthsWeeklyEarnings': ticker.lastMonthsWeeklyEarnings,
            'currentWeeklyEarnings': ticker.currentWeeklyEarnings,
            currentMarketValue: ticker.previousClose,
            description: "Most Recent Month Hourly Wage < Last Month Hourly Wage",
            estimatedStockPrice: estimatedStockPrice,
            weight: -1 + estimatedStockPriceMove,
        }
    } else if (currentWeeklyEarnings === lastMonthsWeeklyEarnings) {
        return {
            'lastMonthsWeeklyEarnings': ticker.lastMonthsWeeklyEarnings,
            'currentWeeklyEarnings': ticker.currentWeeklyEarnings,
            currentMarketValue: ticker.previousClose,
            description: "Most Recent Month Hourly Wage === Last Month Hourly Wage",
            estimatedStockPrice: estimatedStockPrice,
            weight: 0
        }
    }
}




/*
Test 21: Free Cash Flow Yield per Stock:
Apple Inc. (AAPL) Valuation Measures & Financial Statistics (yahoo.com)

If a stock has a positive number for "Operating Cash Flow (ttm)" = BUY
If a stock has a negative number for "Operating Cash Flow (ttm)" = SELL
*/
const freeCashFlowYieldPerStock = (ticker) => {

    let missingFieldsResObj = checkForNullOrUndefinedFields(ticker, ["operatingCashFlow"])
    if (_.has(missingFieldsResObj, "description")) {
        return missingFieldsResObj
    }


    if (ticker["Operating Cash Flow (ttm)"] > 1) {
        return {
            "Operating Cash Flow (ttm)": ticker["Operating Cash Flow (ttm)"],
            currentMarketValue: ticker.previousClose,
            description: "Operating Cash Flow (ttm) > 0",
            estimatedStockPrice: ticker.previousClose,
            weight: 1
        }
    } else {
        return {
            "Operating Cash Flow (ttm)": ticker["Operating Cash Flow (ttm)"],
            currentMarketValue: ticker.previousClose,
            description: "Operating Cash Flow (ttm) < 0",
            estimatedStockPrice: ticker.previousClose,
            weight: -1
        }
    }
}


module.exports = {
    marketEquilibrium,
    dividendRateComparison,
    pegRatioAndEPS,
    betaSwings,
    fiftyTwoWeekLowsHighsAndVolume,
    movingAverageMeanReversions,
    shortPercentOfSharesOutstanding,
    stockMovementSevenDays,
    revenueGrowth,
    earningsGrowth,
    abilityToPayCurrentLiabilities,
    trailingPEvsForward,
    stockBuyBacks,
    freeCashFlowYieldPerStock,
    yieldCurveInOrder,
    tenYearTreasuryRate,
    tenYearTreasuryRateMonthly,
    tenYearTreasuryRateQuarterly,
    m1SeasonallyAdjusted,
    averageWageGrowth
};