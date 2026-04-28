import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host || '';
  const subdomainHeader = req.headers['x-tenant'];

  const headers: Record<string, string> = {};
  if (host.includes('localhost') && subdomainHeader) {
    headers['X-Tenant'] = String(subdomainHeader);
  }

  try {
    const backendRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/tenant/branding`, {
      headers,
    });

    if (!backendRes.ok) {
      return res.status(backendRes.status).json({ message: 'Tenant not found' });
    }

    const data = await backendRes.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: 'Tenant lookup failed' });
  }
}
