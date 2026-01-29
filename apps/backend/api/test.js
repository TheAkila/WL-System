// Minimal test endpoint to debug Vercel deployment
export default function handler(req, res) {
  res.status(200).json({
    message: 'Test endpoint works!',
    time: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    }
  });
}
