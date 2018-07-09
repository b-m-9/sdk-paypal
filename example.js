const Liqpay = require('./index');
const liqpayMerchant = new Liqpay.merchant('i37338111051', 'secret', {debug: true});

liqpayMerchant
    .getOrderId({
        amount: 1,
        currency: 'UAH',
        description: 'MIT SDK NODE TEST'
    })
    .then(res => {
        return liqpayMerchant.formaterData(res);
    })
    .then(res => {
        return liqpayMerchant.createPaymet(res)
    })
    .then(console.log)
    .catch((error) => {
        console.error('Create Error,', error);
    });