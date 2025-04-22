require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();  // ← 剛剛漏這行
const port = process.env.PORT || 3000;

// 改成接收 JSON 物件
app.use(express.json());

app.post('/webhook', async (req, res) => {
    const body = req.body;
    console.log('✅ 收到 TradingView webhook!', body);

    // 確認 body 正常
    if (!body || typeof body !== 'object') {
        console.error('❌ Webhook 資料異常:', body);
        return res.status(400).send('Invalid webhook data');
    }

    // 轉成文字訊息
    const textMessage = body.message || JSON.stringify(body);

    // LINE 推送
    try {
        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: process.env.LINE_USER_ID,
            messages: [
                { type: "text", text: textMessage }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            }
        });
        console.log('✅ LINE 訊息已推送:', textMessage);
    } catch (error) {
        console.error('❌ LINE 推送失敗:', error.response?.data || error.message);
    }

    // Telegram 推送
    try {
        const telegramURL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(telegramURL, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: textMessage
        });
        console.log('✅ Telegram 訊息已推送:', textMessage);
    } catch (error) {
        console.error('❌ Telegram 推送失敗:', error.response?.data || error.message);
    }

    res.status(200).send('OK');
});

app.get('/', (req, res) => {
    res.send('🚀 Webhook server is running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
