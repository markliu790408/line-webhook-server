require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.text()); // 使用 express.text() 來處理傳送的 webhook

app.post('/webhook', async (req, res) => {
    let parsed;
    try {
        // 確保解析 webhook 請求中的 body 成為 JSON 格式
        parsed = JSON.parse(req.body); 
    } catch (e) {
        console.error('❌ 解析 webhook body 失敗:', e.message);
        return res.status(400).send('Invalid webhook format');
    }

    const message = parsed.message || "🚀 爆拉訊號！"; // 提取 webhook 中的訊息

    try {
        // 推送到 LINE
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
        console.error('❌ 發送 LINE 訊息失敗:', error.message);
        res.status(500).send('Failed to send message');
    }
});

// 設置根路由
app.get('/', (req, res) => {
    res.send('🚀 Webhook server is running!');
});

app.listen(port, () => {
    console.log(`✅ Webhook server is running on port ${port}`);
});
