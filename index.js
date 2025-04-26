app.post('/webhook', async (req, res) => {
    let parsed;
    try {
        // 確保 body 是有效的 JSON 物件
        parsed = JSON.parse(req.body);  // 解析 JSON 格式的 webhook 請求
    } catch (e) {
        console.error('❌ 解析 webhook body 失敗:', e.message);
        return res.status(400).send('Invalid webhook format');
    }

    const message = parsed.message || "🚀 爆拉訊號！"; // 從 webhook 中提取訊息

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
