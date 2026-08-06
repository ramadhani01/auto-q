// POST /api/create-invoice
// Body: { amount?: number, videoId?: string }
// Membuat transaksi QRIS dinamis via Casaku dan mengembalikan
// qr_string (untuk dirender jadi QR code di frontend) + transactionId.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const amount = Number(body.amount) > 0 ? Number(body.amount) : 2000; // nominal default

    const casakuRes = await fetch('https://api.casaku.id/api/generate/v2/qris', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-license-key': process.env.CASAKU_LICENSE_KEY,
      },
      body: JSON.stringify({
        qr_id: process.env.CASAKU_QR_ID,
        amount,
        useUniqueCode: true,
        packageIds: ['id.dana'],
        expiredInMinutes: 15,
        qrType: 'dynamic',
        paymentMethod: 'qris',
        useQris: true,
        prefix: 'CSK',
      }),
    });

    const data = await casakuRes.json();

    if (!casakuRes.ok) {
      console.error('Casaku create-invoice error:', data);
      return res.status(casakuRes.status).json({
        error: data.message || 'Gagal membuat invoice QRIS',
      });
    }

    return res.status(200).json({
      transactionId: data.data.transactionId,
      qrString: data.data.qr_string,
      totalAmount: data.data.totalAmount,
      expiredAt: data.data.expiredAt,
    });
  } catch (err) {
    console.error('create-invoice error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
