const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiUrl = 'https://test.satim.dz/payment/rest/register.do';

// Function to verify Shopify webhook
function verifyShopifyWebhook(req) {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const generatedHash = crypto
        .createHmac('sha256', process.env.f983dc98e0fbc84e915124a0c4d44945) // Use your API secret
        .update(JSON.stringify(req.body), 'utf8') // Ensure you're using the correct encoding
        .digest('base64'); // Encode to base64

    return hmac === generatedHash;
}

// Webhook endpoint to receive order creation events
app.post('/shopify-webhook', async (req, res) => {
    // Validate the webhook
    if (!verifyShopifyWebhook(req)) {
        return res.status(401).send('Unauthorized');
    }

    const shopifyOrder = req.body; // The order data sent by Shopify
    const orderNumber = shopifyOrder.id;
    const amount = shopifyOrder.total_price * 100; // Multiply for SATIM requirements
    const currency = '012';
    const returnUrl = process.env.RETURN_URL; // Set in your environment variables
    const failUrl = process.env.FAIL_URL; // Set in your environment variables
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
