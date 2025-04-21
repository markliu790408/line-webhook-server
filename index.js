require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const DESTINATION = process.env.DESTINATION || 'both'; // line / telegram / both

app.use(express.text());

app.post('/webhook', async (req, res) => {
    let parsed;
    try {
        parsed = JSON.parse(req.body);
    } catch (e) {
        console.error('❌ 解析 webhook body 失敗:', e.message);
        return res.status(400).send('Invalid webhook format');
    }

    const symbol = parsed.symbol || "Unknown";
    const message = parsed.message || "🚀爆拉靈敏版起爆點！";
    const finalMessage = ${symbol}\n${message};

    try {
        if (DESTINATION === 'line' || DESTINATION === 'both') {
            await axios.post('https://api.line.me/v2/bot/message/push', {
                to: process.env.LINE_USER_ID,
                messages: [{ type: "text", text: finalMessage }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}
                }
            });
            console.log('✅ 發送到 LINE:', finalMessage);
        }

        if (DESTINATION === 'telegram' || DESTINATION === 'both') {
            await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: finalMessage
            });
            console.log('✅ 發送到 Telegram:', finalMessage);
        }

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
