// *** Create new orders and replace ID's in DB *** //
const mongoose = require('mongoose');
const TrendMakerDB = require('./SignalGen/trendMakerSchema').TrendMaker;
const MongoConnectionURI = require('../app/DBConnections').Mongo;
const ccxt = require('ccxt');

mongoose.connect(MongoConnectionURI);

class TrendMakerExecution {

    constructor (exchange, currencyPair, currencyAmount, targetProfitPercentage) {
        console.log('IMPORTANT: Ensure your account has an equivalent amount of USDT!');

        this.targetProfitPercentage = targetProfitPercentage;
        this.exchangeName = exchange;
        this.currencyAmount = currencyAmount;
        this.currencyPair = currencyPair;
        this.exchange = new ccxt[exchange]();
        this.exchange.apiKey = secrets.exchange.key;
        this.exchange.apiSecret = secrets.exchange.secret;
    }

    async createInitialOrders () {
        try {
            this.createStraddleOrders();
        }
        catch (e) {
            console.log(e);
            console.log('TrendMakerExecution - createInitialOrders');
        }

    }

    onBuy () {
        console.log('Buy Order Filled');
    }

    async onSell () {
        try {
            await this.exchange.cancel(await TrendMaker.find({
                Exchange : this.exchangeName,
                CurrencyPair : this.currencyPair }));

            createStraddleOrders();
        }
        catch (e) {
            console.log(e);
            console.log('TrendMakerExecution - onSell');
        }
    }

    async createStraddleOrders () {
        try {
            let buyOrderID = await this.exchange.createLimitBuyOrder(this.currencyPair, this.currencyAmount, orderPrices.buyPrice());
            let sellOrderID = await this.exchange.createLimitSellOrder(this.currencyPair, this.currencyAmount, orderPrices.sellPrice());

            TrendMakerDB.updateBuyOrder();
            TrendMakerDB.updateSellOrder();
        }
        catch (e) {
            console.log(e);
            console.log('ERROR: TrendMakerExecution - createStraddleOrders');
        }
    }

    async sellPrice () {
        return new Promise(async function(resolve, reject) {
            try {
                const orderBook = await this.exchange.fetchOrderBook(this.currencyPair);
                const bid = orderBook.bids[0][0];
                const ask = orderBook.asks[0][0];
                //Calculate spread, accounting for prices being weird
                const naturalSpread = (bid < ask ? bid / ask : ask / bid);

                if (naturalSpread > this.targetProfitPercentage) {
                    const price = ask;
                }
                else {
                    const price = ask + ((this.targetProfitPercentage - naturalSpread) / 2);
                }
                resolve(price);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async buyPrice () {
        return new Promise(async function(resolve, reject) {
            try {
                const orderBook = await this.exchange.fetchOrderBook(this.currencyPair);
                const bid = orderBook.bids[0][0];
                const ask = orderBook.asks[0][0];
                //Calculate spread, accounting for prices being weird
                const naturalSpread = (bid < ask ? bid / ask : ask / bid);

                if (naturalSpread > this.targetProfitPercentage) {
                    const price = bid;
                }
                else {
                    const price = bid - ((this.targetProfitPercentage - naturalSpread) / 2);
                }
                resolve(price);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}

module.exports = {
    Execution : TrendMakerExecution
}
