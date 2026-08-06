// POST /api/cancel-invoice
// Body: { transactionId: string }
// Dipanggil saat user klik "Batal" di modal QR, supaya transaksi
// pending tidak menggantung di sistem Casaku.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionId } = req.body || {};
    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId wajib diisi' });
    }

    const casakuRes = await fetch('https://api.casaku.id/api/generate/cancel-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-license-key': process.env.CASAKU_LICENSE_KEY,
      },
      body: JSON.stringify({ transactionId }),
    });

    const data = await casakuRes.json();

    if (!casakuRes.ok) {
      console.error('Casaku cancel-invoice error:', data);
      return res.status(casakuRes.status).json({
        error: data.message || 'Gagal membatalkan transaksi',
      });
    }

    return res.status(200).json({ status: data.data.status });
  } catch (err) {
    console.error('cancel-invoice error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
