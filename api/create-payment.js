export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { videoId } = req.body;
    if (!videoId) return res.status(400).json({ error: 'videoId wajib diisi' });

    const amount = 2000; // nominal, ubah sesuai kebutuhan

    const response = await fetch('https://api.casaku.id/api/generate/v2/qris', {
      method: 'POST',
      headers: {
        'x-license-key': process.env.CASAKU_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        qr_id: process.env.CASAKU_QRIS_ID,
        amount,
        useUniqueCode: true,
        packageIds: ['id.dana'],
        expiredInMinutes: 15,
        qrType: 'dynamic',
        paymentMethod: 'qris',
        useQris: true,
        prefix: 'VDY'
      })
    });

    const result = await response.json();
    if (!response.ok) return res.status(502).json({ error: 'Gagal membuat QRIS' });

    return res.status(200).json({
      transactionId: result.data.transactionId,
      qrString: result.data.qr_string,
      totalAmount: result.data.totalAmount,
      videoId
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
