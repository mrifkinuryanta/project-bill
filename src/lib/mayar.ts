import crypto from "crypto";

// For MVP, we use placeholder implementation if keys are missing
const MAYAR_API_URL = process.env.MAYAR_API_URL || "https://api.mayar.id";
const MAYAR_API_KEY = process.env.MAYAR_API_KEY || "";
const MAYAR_WEBHOOK_SECRET = process.env.MAYAR_WEBHOOK_SECRET || "";

export interface CreatePaymentLinkParams {
    amount: number;
    customerName: string;
    customerEmail: string;
    description: string;
}

export interface MayarPaymentLinkResponse {
    link: string;
    id?: string;
}

export async function createPaymentLink(
    params: CreatePaymentLinkParams
): Promise<MayarPaymentLinkResponse> {
    // If no API key is provided, we simulate the Mayar API for MVP testing
    if (!MAYAR_API_KEY) {
        console.warn("No MAYAR_API_KEY provided. Using simulated payment link.");
        return {
            link: `https://mayar.id/pay/mock-${crypto.randomBytes(4).toString("hex")}`,
            id: crypto.randomBytes(8).toString("hex"),
        };
    }

    // Real Mayar API logic would go here
    // Mayar endpoint for payment links is typically /v1/payment-link
    const response = await fetch(`${MAYAR_API_URL}/v1/payment-link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MAYAR_API_KEY}`,
        },
        body: JSON.stringify({
            amount: params.amount,
            customer_name: params.customerName,
            customer_email: params.customerEmail,
            description: params.description,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Mayar API Error: ${errorData}`);
    }

    const data = await response.json();

    // Format adjustment based on Mayar's actual response object
    return {
        link: data.data?.link || data.link || "https://mayar.id/pay/mock",
        id: data.data?.id || data.id,
    };
}

export function verifyMayarWebhook(payload: string, signature: string): boolean {
    if (!MAYAR_WEBHOOK_SECRET) {
        console.warn("No MAYAR_WEBHOOK_SECRET provided. Skipping webhook signature verification.");
        return true;
    }

    const hmac = crypto.createHmac('sha256', MAYAR_WEBHOOK_SECRET);
    const digest = hmac.update(payload).digest('hex');

    return digest === signature;
}
