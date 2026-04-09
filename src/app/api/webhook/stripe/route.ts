// Stripe Webhook Handler
// TODO: Implement Stripe webhook handler for subscription events (checkout.session.completed, etc.)

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'TODO: Implement' });
}
