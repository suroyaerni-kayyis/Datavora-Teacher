export default async function (req: any, res: any) {
  try {
    // Dynamic import to catch initialization errors
    const module = await import('../server');
    const app = module.default;
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Error:", err);
    res.status(500).json({ 
      error: err.message, 
      stack: err.stack,
      type: 'Initialization Error'
    });
  }
}
