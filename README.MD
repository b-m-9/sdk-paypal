### Installation
```
npm install --save sdk-paypal
```
require module
```javascript
const PayPal = require('sdk-paypal');
```
## Merchant Documentation:
Init
```javascript

const PaypalMerchant = new Paypal.Merchant({
    mode: "sandbox",
    client_id: 'Ac-AXyglk7AeZCL3fbR8ovtCh1A-3t2EKVqjTvag2lLSQ8Rxm7B7aIVromgHGj0DiiPdxQdJdPEiXeOu',
    client_secret: 'EGs3jRM6VCuNllsDfbExDlTgHQ2md3_8Ywg97ThBCmBrJg9kHJv-YNOLRk1VZhkiQx6X9JgU7_eF7BaT',
    callback: {
        error: 'https://error.com',
        success: 'https://success.com'
    }
}, {debug: false});
```
### Create payment
```javascript

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

```
### Browse function:
```javascript
function payment(param) {
    var method = param.method || "post";
    var form = document.createElement("form");
    form.setAttribute("method", param.method);
    form.setAttribute("action", param.url);
    for (var key in param.data) {
        if (param.data.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", param.data[key]);

            form.appendChild(hiddenField);
        }
    }
    document.body.appendChild(form);
    form.submit();
}
```
