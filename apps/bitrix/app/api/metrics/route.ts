// app/api/metrics/route.ts (Next.js 13-15)
import { NextResponse } from 'next/server';
import client from 'prom-client';

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export async function GET() {
  const metrics = await registry.metrics();
  return new NextResponse(metrics, {
    status: 200,
    headers: { 'Content-Type': registry.contentType },
  });
}
