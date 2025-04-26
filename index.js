require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// 1) 改成接受任何 Content-Type，並把原始 body 當作文字讀進來
app.use(express.text({ type: '*/*' }));

app.post('/webhook', async (req, res) => {
    let parsed;
    try {
        // 把 text 轉成 JSON
        parsed = JSON.parse(req.body);
    } catch (e) {
        console.error('❌ 解析 webhook body 失敗:', e.message, '原始 body:', req.body);
        return res.status(400).send('Invalid webhook format');
    }

    // 2) 先取 parsed.msg（或 fallback 到 parsed.message），再 fallback 到預設
    const message = parsed.msg || parsed.message || "🚀 爆拉訊號！";

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
        res.sendStatus(200);
    } catch (error) {
        console.error('❌ 發送 LINE 訊息失敗:', error.message);
        res.status(500).send('Failed to send message');
    }
});

// 健康檢查路由
app.get('/', (req, res) => {
    res.send('🚀 Webhook server is running!');
});

app.listen(port, () => {
    console.log(`✅ Webhook server is running on port ${port}`);
});
