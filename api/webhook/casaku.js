export const config = { api: { bodyParser: false } };
import crypto from 'crypto';

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const raw = await getRawBody(req);
  const signature = req.headers['x-casaku-signature'];
  const expected = crypto.createHmac('sha256', process.env.CASAKU_WEBHOOK_SECRET).update(raw).digest('hex');

  const valid = signature && expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  if (!valid) return res.status(401).json({ error: 'Invalid signature' });

  const payload = JSON.parse(raw);
  if (payload.status === 'paid') console.log('Paid:', payload.transactionId);
  res.status(200).json({ ok: true });
}
