import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { eventEmitter } from '@/lib/events';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  // Fallback to empty role if undefined on session.user (though we casted it elsewhere)
  const role = (session.user as any).role || 'CUSTOMER';
  const clientId = randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      eventEmitter.addClient({
        id: clientId,
        userId,
        role,
        controller
      });
      
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          clearInterval(interval);
          eventEmitter.removeClient(clientId);
        }
      }, 30000);
      
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        eventEmitter.removeClient(clientId);
      });
    },
    cancel() {
      eventEmitter.removeClient(clientId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    }
  });
}