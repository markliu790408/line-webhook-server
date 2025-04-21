require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// 用 text 模式接收 TradingView 傳來的 webhook
app.use(express.text());

app.post('/webhook', async (req, res) => {
    console.log('✅ 收到 TradingView webhook！');

    let parsed;
    try {
        parsed = JSON.parse(req.body);
    } catch (e) {
        console.error('❌ 解析 webhook body 失敗:', e.message);
        return res.status(400).send('Invalid webhook format');
    }

    const message = parsed.message || "🚀爆拉靈敏版起爆點！";

    // 推送到 LINE
    try {
        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: process.env.LINE_USER_ID,
            messages: [{ type: "text", text: message }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            }
        });
        console.log('✅ LINE 訊息已推送:', message);
    } catch (error) {
        console.error('❌ LINE 推送失敗:', error.response?.data || error.message);
    }

    // 推送到 Telegram
    try {
        const telegramURL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(telegramURL, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message
        });
        console.log('✅ Telegram 訊息已推送:', message);
    } catch (error) {
        console.error('❌ Telegram 推送失敗:', error.response?.data || error.message);
    }

    res.status(200).send('OK');
});

// 測試用首頁
app.get('/', (req, res) => {
    res.send('🚀 Webhook server is running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
