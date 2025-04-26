require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// 接收所有 Content-Type，並把 body 當文字讀進來
app.use(express.text({ type: '*/*' }));

app.post('/webhook', async (req, res) => {
  let parsed;
  try {
    parsed = JSON.parse(req.body);
  } catch (e) {
    console.error('❌ 解析 webhook body 失敗:', e.message, '原始 body:', req.body);
    return res.status(400).send('Invalid webhook format');
  }

  // 取出 msg 或 message 欄位，沒有就用預設
  const text = parsed.msg || parsed.message || '🚀 爆拉訊號！';

  // 傳給 Telegram
  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(telegramUrl, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: text,
      // parse_mode: 'MarkdownV2'   // 如需格式化可開啟
    });
    console.log('✅ Telegram 訊息已推送:', text);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ 發送 Telegram 訊息失敗:', err.message);
    res.status(500).send('Failed to send message');
  }
});

// 健康檢查
app.get('/', (req, res) => {
  res.send('🚀 Webhook server is running!');
});

app.listen(port, () => {
  console.log(`✅ Webhook server is running on port ${port}`);
});
