// POST /api/check-status
// Body: { transactionId: string }
// Diteruskan ke Casaku check-status. Frontend polling endpoint ini
// tiap beberapa detik selama modal QR terbuka.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionId } = req.body || {};
    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId wajib diisi' });
    }

    const casakuRes = await fetch('https://api.casaku.id/api/generate/check-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-license-key': process.env.CASAKU_LICENSE_KEY,
      },
      body: JSON.stringify({ transactionId }),
    });

    const data = await casakuRes.json();

    if (!casakuRes.ok) {
      console.error('Casaku check-status error:', data);
      return res.status(casakuRes.status).json({
        error: data.message || 'Gagal memeriksa status transaksi',
      });
    }

    // status: 'pending' | 'paid' | 'cancel' | 'expired'
    return res.status(200).json({ status: data.data.status });
  } catch (err) {
    console.error('check-status error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
