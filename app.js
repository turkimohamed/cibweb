const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiUrl = 'https://test.satim.dz/payment/rest/register.do';

app.post('/shopify-webhook', async (req, res) => {
    const shopifyOrder = req.body;
    const orderNumber = shopifyOrder.id;
    const amount = shopifyOrder.total_price * 100; // Multiply for SATIM requirements
    const currency = '012';
    const returnUrl = process.env.RETURN_URL;
    const failUrl = process.env.FAIL_URL;
    const force_terminal_id = 'E010901319';

    try {
        const response = await axios.get(apiUrl, {
            params: {
                userName: process.env.MERCHANT_USERNAME,
                password: process.env.MERCHANT_PASSWORD,
                orderNumber,
                amount,
                currency,
                returnUrl,
                failUrl,
                language: 'FR',
                jsonParams: JSON.stringify({ force_terminal_id })
            }
        });

        if (response.data.formUrl) {
            console.log("Payment link created:", response.data.formUrl);
            res.status(200).send({ message: 'Payment link generated', paymentLink: response.data.formUrl });
        } else {
            console.error("SATIM Error:", response.data.errorMessage);
            res.status(500).send({ error: response.data.errorMessage });
        }
    } catch (error) {
        console.error("Error creating payment link:", error.message);
        res.status(500).send({ error: 'Payment link creation failed' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
