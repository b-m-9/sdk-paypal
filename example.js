const Paypal = require('./index');
const PaypalMerchant = new Paypal.Merchant({
    mode: "sandbox",
    client_id: '__ClientId',
    client_secret: '__Secret',
    callback: {
        error: 'https://error.com',
        success: 'https://success.com'
    }
}, {debug: false=});

PaypalMerchant
    .getOrderId({
        amount: 1,
        currency: 'USD',
        description: 'MIT SDK NODE TEST'
    })
    .then(res => {
        return PaypalMerchant.createPaymet(res)
    })
    .then(console.log)
    .catch((error) => {
        console.error('Create Error,', error);
    });