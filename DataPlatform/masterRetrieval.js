//Retrieval Scripts
const getOHLCV = require('./getOHLCV').getOHLCV;
const getBidAsk = require('./getBidAsk').getBidAsk;

// Connections and Config
const mongoose = require('mongoose');
const config = require('./config');


(async () => {
	try {
		//OHLCV
		config.OHLCV.forEach(ticker => {
			getOHLCV(ticker.Exchange, ticker.CurrencyPair, ticker.TimeFrame);
		});
		//BidAsk
		config.OrderBook.forEach( ticker => {
			getBidAsk(ticker.Exchange, ticker.CurrencyPair);
		});
	}
	catch (e) {
		console.log(e)
	}
})();
