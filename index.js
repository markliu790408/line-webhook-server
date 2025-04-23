require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;

// === 你的 API 金鑰 ===
const BLAVE_API_KEY = process.env.BLAVE_API_KEY;
const BLAVE_SECRET_KEY = process.env.BLAVE_SECRET_KEY;

// === Telegram Token / Chat ID (.env讀取)
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// === 觀察清單幣種 ===
const watchlist = [
    'ENJUSDT.P', 'TAOUSDT.P', 'XAIOUSDT.P', 'HIFIUSDT.P', 'LOKAUSDT.P',
    'MBOXUSDT.P', 'PIXELUSDT.P', 'LUMIAUSDT.P', 'BTCUSDT.P', 'ETHUSDT.P',
    'SOLUSDT.P', 'BNBUSDT.P', 'IOTXUSDT.P', 'SOLVUSDT.P', '1000BONKUSDT.P',
    '1000PEPEUSDT.P', 'MAGICUSDT.P'
];

// === TradingView 快訊接收處理 ===
app.use(express.json());
app.post('/webhook', async (req, res) => {
    const body = req.body;
    console.log('✅ 收到 TradingView webhook!', body);

    // 確認 body 正常
    if (!body || typeof body !== 'object') {
        console.error('❌ Webhook 資料異常:', body);
        return res.status(400).send('Invalid webhook data');
    }

    const textMessage = body.message || JSON.stringify(body);

    // === 取得 Blave 數據並篩選符合條件的幣種 ===
    try {
        const blaveResponse = await axios.get('https://api.blave.org/whale_hunter/get_symbols', {
            headers: {
                'api-key': BLAVE_API_KEY,
                'secret-key': BLAVE_SECRET_KEY
            }
        });

        const symbols = blaveResponse.data.data || [];
        const filtered = symbols.filter(item => {
            const symbol = item.symbol;
            // 確保該幣種在觀察清單中
            return watchlist.includes(symbol) &&
                (item.whaleHunter?.oi_1h > 1.5 || item.whaleHunter?.oi_4h > 1.2) &&
                item.whaleHunter?.longshort_1h < 0;
        });

        if (filtered.length > 0) {
            const messages = filtered.map(item => `🟢 ${item.symbol}｜1h OI: ${item.whaleHunter?.oi_1h}｜4h OI: ${item.whaleHunter?.oi_4h}｜1h LongShort: ${item.whaleHunter?.longshort_1h}`).join('\n');
            console.log(messages);

            // 推送到 Telegram
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: `🚀 Blave 監控通知 🚀\n符合條件的幣種有：\n${messages}`
            });
            console.log('✅ 已推送通知至 Telegram！');
        }

    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] ❌ 抓取 Blave 資料失敗，錯誤：`, error.message);
    }

    // === 推送 TradingView 訊息 ===
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

    // 推送到 Telegram
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
    res.send('🚀 Webhook server is running');
});

app.listen(port, () => {
    console.log(`✅ Server is listening on port ${port}`);
});
