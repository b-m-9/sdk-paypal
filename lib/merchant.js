"use strict";
const crypto = require('crypto');

class Merchant {
    constructor(config, options) {
        this.name = 'stripe';
        this.version = '1.0.0';
        this.debug = false;
        if (options && options.debug === true)
            this.debug = true;
        if (options && options.version)
            this.version = options.version;
        if (this.debug) console.log('[Pay]->Merchant->' + this.name + ',' + 'constructor', config, 'options', options);
        if (!config.public_key) throw Error('public_key is not correct (Merchant configure:' + this.name + ')');
        if (!config.secret_key) throw Error('secret_key is not correct (Merchant configure:' + this.name + ')');


        this.public_key = config.public_key;
        this.secret_key = config.secret_key;
        this.stripe = require('../stripe/stripe.js')(config.secret_key);
    }


    checkOptions(options) {
        if (this.debug) console.log('[Pay]->Merchant->' + this.name + ',' + 'checkOptions', options);

        if (!this.version) return Promise.reject('version undefined');
        if (isNaN(+options.amount)) return Promise.reject('amount NaN');
        if (+options.amount < 0) return Promise.reject('amount < 0');
        if (!options.currency) return Promise.reject('currency undefined');
        if (!options.order_id) return Promise.reject('order_id undefined');
        if (['USD', 'EUR', 'RUB', 'UAH'].indexOf(options.currency.toUpperCase()) === -1) return Promise.reject('currency is not valid [UAH,USD, EUR, RUB]');
        return Promise.resolve(options);
    }

    async formaterData(options) {

        if (this.debug) console.log('[Pay]->Merchant->' + this.name + ',' + 'formaterData in', options);
        let checkOptions = await this.checkOptions(options);
        if (!checkOptions) {
            console.error('[Pay]->Merchant->' + this.name + ', Error function getHash! return checkOptions:', checkOptions);
            return Promise.reject('[Pay]->Merchant->' + this.name + ', Error function getHash! return checkOptions#1');
        }
        let desc = '';
        if (options.m_desc)
            desc = new Buffer(options.m_desc).toString('base64');
        let result = {
            version: this.version,
            public_key: this.public_key,
            action: 'pay',
            amount: (+options.amount).toFixed(2),
            currency: options.currency.toUpperCase(),
            description: options.description,
            order_id: options.order_id,
            type: "buy",
            language: "ru"

        };
        if (this.debug) console.log('[Pay]->Merchant->' + this.name + ',' + 'formaterData result', result);
        return Promise.resolve(result);
    }

    async getHash(options) {
        let data = await this.formaterData(options);
        if (data === null) {
            console.error('getHash null ^^^');
            return Promise.reject('[Pay]->Merchant->' + this.name + ', Error function getHash! return checkOptions:' + JSON.stringify(options));


        }

        let string_hash = new Buffer(JSON.stringify(data)).toString('base64');
        if (this.debug) console.log('[Pay]->Merchant->' + this.name + ',' + 'string_to_hash', string_hash);

        let sha1 = crypto.createHash('sha1').update(this.private_key + string_hash + this.private_key).digest('base64');
        if (this.debug) console.log('[Pay]->Merchant->' + this.name + ',' + 'hash_sha1', sha1);
        return Promise.resolve(sha1);

    }

    getOrderId(options) {
        return new Promise((resolve, reject) => {
            options.order_id = 'ORDER_' + (new Date().getTime());
            resolve(options);
        });
    }

    async createPaymet(options) {
        if (!options.order_id)
            options.order_id = await this.getOrderId(options);
        let form = await this.formaterData(options);
        let hash = await this.getHash(options);

        let data = {
            data: new Buffer(JSON.stringify(form)).toString('base64'),
            signature: hash
        };
        let res = {action: 'redirect', metod: 'post', data: data, url: 'https://www.liqpay.ua/api/3/checkout'};
        return res;
    }

    checkPayment(options) {
        return options;
    }


}


module.exports = Merchant;