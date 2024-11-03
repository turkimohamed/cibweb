const express = require('express');
const axios = require('axios');
const cors = require('cors'); // استيراد مكتبة CORS

const app = express();
const PORT = 3000;

app.use(cors()); // تفعيل CORS

// إعداد بيانات API
const apiUrl = 'https://test.satim.dz/payment/rest/register.do';
const merchantUsername = 'SAT241027-2147483562';  // أدخل اسم المستخدم الخاص بك
const merchantPassword = 'satim120';  // أدخل كلمة المرور الخاصة بك

// تسجيل طلب جديد مع SATIM-IPAY
app.get('/create-payment', async (req, res) => {
    const orderNumber = `ORDER_${Date.now()}`; // رقم طلب فريد لكل عملية
    const amount = 50000; // مبلغ الطلب، يجب مضاعفة المبلغ بـ 100
    const currency = '012'; // كود العملة الخاصة بالدينار الجزائري
    const returnUrl = 'http://localhost:3000/success';
    const failUrl = 'http://localhost:3000/fail';
    const force_terminal_id = 'E010901319';

    console.log("Starting payment creation process...");
    console.log("Order details:", { orderNumber, amount, currency });

    try {
        const response = await axios.get(apiUrl, {
            params: {
                userName: merchantUsername,
                password: merchantPassword,
                orderNumber,
                amount,
                currency,
                returnUrl,
                failUrl,
                language: 'FR',
                jsonParams: JSON.stringify({ force_terminal_id })
            }
        });

        // طباعة الاستجابة لتصحيح الأخطاء
        console.log("SATIM Response Data:", response.data);

        // تحقق من استجابة SATIM-IPAY
        if (response.data.formUrl) {
            console.log("Redirecting to payment URL:", response.data.formUrl);
            res.redirect(response.data.formUrl);
        } else {
            console.error("SATIM Error Message:", response.data.errorMessage);
            res.send(`Error: ${response.data.errorMessage}`);
        }
    } catch (error) {
        // طباعة التفاصيل الكاملة للخطأ
        console.error("Error creating payment:", error.message);
        console.error("Error details:", error);

        res.send(`Error creating payment: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

