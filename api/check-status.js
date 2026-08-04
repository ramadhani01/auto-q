export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { transactionId } = req.body;
  if (!transactionId) return res.status(400).json({ error: 'transactionId wajib diisi' });

  try {
    const response = await fetch('https://api.casaku.id/api/generate/check-status', {
      method: 'POST',
      headers: {
        'x-license-key': process.env.CASAKU_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactionId })
    });
    const result = await response.json();
    return res.status(200).json({ status: result.data?.status });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
