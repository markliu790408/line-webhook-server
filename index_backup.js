require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.text());

app.post('/webhook', async (req, res) => {
    let parsed;
try {
    parsed = JSON.parse(req.body);
} catch (e) {
    console.error('❌ 解析 webhook body 失敗:', e.message);
    return res.status(400).send('Invalid webhook format');
}

const message = parsed.message || "🚀爆拉靈敏版起爆點！";

    try {
        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: process.env.LINE_USER_ID,
            messages: [
                { type: "text", text: message }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            }
        });
        console.log('✅ LINE 訊息已推送:', message);
        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ 發送失敗:', error.response?.data || error.message);
        res.status(500).send('Failed');
    }
});

app.get('/', (req, res) => {
    res.send('🚀 Webhook server is running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
