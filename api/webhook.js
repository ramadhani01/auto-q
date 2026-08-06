// POST /api/webhook
// Didaftarkan sebagai "URL Webhook Kustom" di dashboard Casaku:
//   https://<domain-kamu>.vercel.app/api/webhook
//
// Catatan: flow unlock video di situs ini TIDAK bergantung pada
// webhook (frontend polling langsung ke /api/check-status), jadi
// endpoint ini sifatnya pelengkap untuk logging/audit transaksi.
// Body parser dimatikan karena signature harus dihitung dari raw body.

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const crypto = require('crypto');

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-casaku-signature'];
    const secret = process.env.CASAKU_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return res.status(401).json({ error: 'Signature atau secret tidak ada' });
    }

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    const isValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(rawBody);
    console.log('Webhook Casaku diterima:', payload.transactionId, payload.status);

    // Balas 200 secepatnya sesuai aturan retry Casaku (max 10 detik).
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('webhook error:', err);
    return res.status(500).json({ error: 'Gagal memproses webhook' });
  }
}

module.exports = handler;
module.exports.config = {
  api: { bodyParser: false },
};
