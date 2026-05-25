import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccess) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private scriptLoaded = false;

  loadScript(): Promise<void> {
    if (this.scriptLoaded && window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-razorpay]');
      if (existing) {
        existing.addEventListener('load', () => {
          this.scriptLoaded = true;
          resolve();
        });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.dataset['razorpay'] = 'true';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });
  }

  openCheckout(options: {
    key: string;
    amountPaise: number;
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    onSuccess: (res: RazorpaySuccess) => void;
    onDismiss?: () => void;
  }): void {
    if (!window.Razorpay) {
      throw new Error('Razorpay not loaded');
    }
    const rzp = new window.Razorpay({
      key: options.key || environment.razorpayKey,
      amount: options.amountPaise,
      currency: 'INR',
      name: 'Hilaz Hanger',
      description: `Order ${options.orderNumber}`,
      order_id: options.orderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: { color: '#4a0e0e' },
      handler: options.onSuccess,
      modal: { ondismiss: options.onDismiss },
    });
    rzp.open();
  }

  isConfigured(keyId?: string): boolean {
    const key = keyId || environment.razorpayKey;
    return !!key && !key.includes('YOUR');
  }
}
