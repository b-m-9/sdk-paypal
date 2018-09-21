"use strict";
const crypto = require('crypto');

class Merchant {
    constructor(config, options) {
        this.name = 'paypal';
        this.version = '1.0.0';
        this.debug = (options && options.debug === true);

        if (options && options.version)
            this.version = options.version;

        if (this.debug) console.log('[Pay]->Merchant->' + this.name + ',' + 'constructor', config, 'options', options);

        if (!config.callback) throw Error('callback is not correct (Merchant configure:' + this.name + ')');
        if (config.callback.success.length < 5) throw Error('callback.success is not correct (Merchant configure:' + this.name + ')');
        if (config.callback.error.length < 5) throw Error('callback.success is not correct (Merchant configure:' + this.name + ')');
        if (!config.callback) throw Error('callback is not correct (Merchant configure:' + this.name + ')');
        // if (!config.debug) throw Error('username is not correct (Merchant configure:' + this.name + ')');
        if (!config.username) throw Error('username is not correct (Merchant configure:' + this.name + ')');
        if (!config.password) throw Error('password is not correct (Merchant configure:' + this.name + ')');
        if (!config.signature) throw Error('signature is not correct (Merchant configure:' + this.name + ')');


        this.debug = !!config.debug;
        this.username = config.username;
        this.password = config.password;
        this.signature = config.signature;
        this.callback = {
            error: config.callback.error,
            success: config.callback.success
        };

        this.Paypal = require('./core');
        this.paypal = this.Paypal.init(this.username, this.password, this.signature, this.callback.success, this.callback.error, this.debug);
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
        if (this.debug) console.log('[Pay]->Merchant->' + this.name + ',' + 'formaterData result', options);
        return Promise.resolve(options);
    }


    getOrderId(options) {
        return new Promise((resolve, reject) => {
            options.order_id = (new Date().getTime());
            resolve(options);
        });
    }

    async createPaymet(options) {
        if (!options.order_id)
            options.order_id = await this.getOrderId(options);
        let form = await this.formaterData(options);

        return await new Promise((resolve, reject) => {
            this.paypal.pay(options.order_id, form.amount, 'TopUp', form.currency, (err, url) => {
                if (err)
                    return reject(err);
                return resolve({url})
            });
        });

    }

    checkPayment(options) {
        return new Promise((resolve, reject) => {
            this.paypal.detail(options.token, options.payer, function (err, data, invoiceNumber, price, custom_data_array) {
                if (err) {
                    console.log(err);
                    return;
                }
                if (data.success)
                    return resolve(data);

                return reject(data);


            });

        });
    }


}


module.exports = Merchant;