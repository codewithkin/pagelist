declare module "paynow" {
  export class Payment {
    add(title: string, amount: number): void;
  }

  export class Paynow {
    constructor(
      integrationId: string,
      integrationKey: string,
      resultUrl: string,
      returnUrl: string,
    );
    createPayment(reference: string, authEmail?: string): Payment;
    send(payment: Payment): Promise<{
      success: boolean;
      redirectUrl?: string;
      pollUrl?: string;
      error?: string;
    } | null>;
    pollTransaction(url: string): Promise<{
      status?: string;
      error?: string;
      pollUrl?: string;
      paynowReference?: string;
      amount?: string;
      reference?: string;
    } | null>;
  }
}
