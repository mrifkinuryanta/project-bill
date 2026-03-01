import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const MAYAR_WEBHOOK_SECRET = process.env.MAYAR_WEBHOOK_SECRET;

export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get('x-mayar-signature');

        if (!MAYAR_WEBHOOK_SECRET) {
            console.error('MAYAR_WEBHOOK_SECRET is not configured');
            return NextResponse.json({ error: 'Webhook Secret Not Configured' }, { status: 500 });
        }

        if (!signature) {
            return NextResponse.json({ error: 'Missing Signature' }, { status: 401 });
        }

        // Verify Signature: HMAC SHA256 of the raw body using the webhook secret
        const expectedSignature = crypto
            .createHmac('sha256', MAYAR_WEBHOOK_SECRET)
            .update(bodyText)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid signature. Expected:', expectedSignature, 'Got:', signature);
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 403 });
        }

        // Parse the payload
        const payload = JSON.parse(bodyText);

        // We are looking for payment success events.
        const eventName = payload.event;

        // According to Mayar docs, successful payments usually trigger "payment.success"
        if (eventName === 'payment.success') {
            const data = payload.data;
            const referenceId = data.referenceId; // This is the invoice ID we sent during creation

            if (!referenceId) {
                return NextResponse.json({ error: 'Missing referenceId in payload' }, { status: 400 });
            }

            // Update the invoice status
            await prisma.invoice.update({
                where: { id: referenceId },
                data: {
                    status: 'paid',
                    paidAt: new Date(),
                },
            });

            console.log(`[MAYAR WEBHOOK] Invoice ${referenceId} marked as paid.`);
        } else {
            console.log(`[MAYAR WEBHOOK] Ignored event: ${eventName}`);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
