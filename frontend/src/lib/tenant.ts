export async function detectTenant(host?: string) {
  const detectedHost = host ?? (typeof window !== 'undefined' ? window.location.host : '');
  // For hosts like diu.localhost:3000, extract first segment
  let subdomain = null;
  if (detectedHost.includes('localhost') || detectedHost.includes('127.0.0.1')) {
    const parts = detectedHost.split('.');
    subdomain = parts[0] || null;
  } else {
    const parts = detectedHost.split('.');
    if (parts.length >= 3) subdomain = parts[0];
  }

  return subdomain;
}
