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
        if (!config.mode) throw Error('mode is not correct (Merchant configure:' + this.name + ')');
        if (!config.client_id) throw Error('client_id is not correct (Merchant configure:' + this.name + ')');
        if (!config.client_secret) throw Error('client_secret is not correct (Merchant configure:' + this.name + ')');


        this.mode = config.mode;
        this.client_id = config.client_id;
        this.callback = {
            error: config.callback.error,
            success: config.callback.success
        };
        this.client_secret = config.client_secret;

        this.paypal = require('paypal-rest-sdk');

        this.paypal.configure({
            'mode': this.mode,
            'client_id': this.client_id,
            'client_secret': this.client_secret
        });
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
        const create_payment_json = {
            "intent": "order",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "result_url": this.callback.result,
                "return_url": this.callback.success,
                "cancel_url": this.callback.error
            },
            "transactions": [{
                "invoice_number": options.order_id,

                "item_list": {
                    "items": [{
                        "name": "Pay",
                        "sku": "item",
                        "price": options.amount,
                        "currency": options.currency,
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": options.currency,
                    "total": options.amount
                },
                "description": options.description || ''
            }]
        };

        if (this.debug) console.log('[Pay]->Merchant->' + this.name + ',' + 'formaterData result', create_payment_json);
        return Promise.resolve(create_payment_json);
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
            this.paypal.payment.create(form, function (error, payment) {
                let links = {};

                if (error) {
                    return reject(JSON.stringify(error));
                }
                // Capture HATEOAS links
                payment.links.forEach(function (linkObj) {
                    links[linkObj.rel] = {
                        href: linkObj.href,
                        method: linkObj.method
                    };
                });
                if (links.hasOwnProperty('approval_url')) {
                    return resolve({
                        action: 'redirect',
                        metod: 'get',
                        data: {},
                        url: links.approval_url.href
                    });
                }
                return reject('no redirect URI present');
            });
        });

    }

    checkPayment(options) {
        return options;
    }


}


module.exports = Merchant;