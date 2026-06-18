// Serverless auth endpoint. Validates the dashboard password server-side
// against the DASHBOARD_PASSWORD environment variable (set in Vercel project
// settings). Keeps the password out of the client bundle entirely.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  if (password === process.env.DASHBOARD_PASSWORD) {
    return res.status(200).json({ success: true });
  }
  return res.status(401).json({ error: 'Incorrect password' });
}
