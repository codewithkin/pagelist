import { Paynow } from "paynow";

export interface PaynowGatewayConfig {
  integrationId: string;
  integrationKey: string;
  resultUrl: string;
  returnUrl: string;
}

export interface PaynowInitResponse {
  success: boolean;
  redirectUrl?: string;
  pollUrl?: string;
  error?: string;
}

export interface PaynowPollResponse {
  status?: string;
  error?: string;
  pollUrl?: string;
  paynowReference?: string;
  amount?: string;
  reference?: string;
}

export interface BookPaymentPayload {
  reference: string;
  title: string;
  amount: number;
}

export function createPaynowClient(config: PaynowGatewayConfig) {
  return new Paynow(
    config.integrationId,
    config.integrationKey,
    config.resultUrl,
    config.returnUrl,
  );
}

export async function sendBookPayment(
  client: ReturnType<typeof createPaynowClient>,
  payload: BookPaymentPayload,
): Promise<PaynowInitResponse | null> {
  const payment = client.createPayment(payload.reference);
  payment.add(payload.title, payload.amount);
  return (await client.send(payment)) as PaynowInitResponse | null;
}

export async function pollPaynowTransaction(
  client: ReturnType<typeof createPaynowClient>,
  pollUrl: string,
): Promise<PaynowPollResponse | null> {
  return (await client.pollTransaction(pollUrl)) as PaynowPollResponse | null;
}

export function isPaidStatus(status: string | undefined): boolean {
  const normalized = (status || "").trim().toLowerCase();
  return normalized === "paid" || normalized === "awaiting delivery" || normalized === "delivered";
}
