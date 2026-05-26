/** Official HILAZ HANGER copy — single source for static pages & SEO. */
export const BRAND = {
  name: 'HILAZ HANGER',
  tagline: 'Where fantasy unfolds',
  website: 'https://hilazhanger.shop',
  instagram: 'https://www.instagram.com/thehilaz.hanger',
  instagramHandle: '@thehilaz.hanger',
  phone: '+91 6383799574',
  phoneE164: '+916383799574',
  email: 'hello@hilazhanger.com',
  address: `338, Kalaingar Nagar,
Chettipalayam,
Coimbatore – 641201,
Tamil Nadu, India`,
  addressLine: '338, Kalaingar Nagar, Chettipalayam, Coimbatore – 641201, Tamil Nadu, India',
} as const;

export const STATIC_PAGES: Record<string, { title: string; description: string; body: string }> = {
  about: {
    title: 'About Us — HILAZ HANGER',
    description:
      'HILAZ HANGER is a premium fashion destination for modern women — co-ords, dresses, tops, skirts, and more. Based in Coimbatore, shipping across India.',
    body: `Welcome to HILAZ HANGER — a premium fashion destination curated for modern women who love trendy, stylish, and confident outfits.

At HILAZ HANGER, we focus on carefully selected fashion pieces including co-ords, dresses, dungarees, crop tops, skirts, jackets, sweaters, and more. Our collections are designed to blend comfort, trend, and individuality.

We believe fashion is more than clothing — it's self-expression. Every product is chosen to help our customers feel confident, fashionable, and unique.

Our mission is to provide premium-quality fashion at accessible prices while delivering a smooth and trustworthy shopping experience across India.

📍 ${BRAND.addressLine}
📞 ${BRAND.phone}
📸 Instagram: ${BRAND.instagramHandle}`,
  },
  faq: {
    title: 'FAQs — HILAZ HANGER',
    description: 'Shipping times, prepaid payments, exchanges, and order tracking for HILAZ HANGER.',
    body: `1. How long does shipping take?
Orders are usually processed within 1–3 business days. Delivery may take 4–8 business days depending on your location.

2. Do you provide Cash on Delivery (COD)?
No. Cash on Delivery (COD) is not available. We only accept prepaid orders through secure online payment (UPI, cards, netbanking via Razorpay).

3. Can I exchange a product?
Yes. Exchange requests are accepted for eligible products within the specified exchange period. See our Return & Refund Policy for details.

4. How can I track my order?
After dispatch, tracking details are shared via SMS, WhatsApp, or email. You can also use Track Order on our website with your order number and email.

5. How do I contact support?
WhatsApp us at ${BRAND.phone}, email ${BRAND.email}, or use the Contact page.`,
  },
  privacy: {
    title: 'Privacy Policy — HILAZ HANGER',
    description: 'How HILAZ HANGER collects, uses, and protects your personal information.',
    body: `Customer information such as name, phone number, address, and email is collected only to process orders, provide customer support, and improve your shopping experience.

Payment data is processed securely by Razorpay. We do not store your full card or UPI credentials on our servers.

We do not sell or share your personal data with third parties except as required for payment processing, shipping, and legal compliance.

You may contact us at ${BRAND.email} to request access or correction of your data.`,
  },
  shipping: {
    title: 'Shipping Policy — HILAZ HANGER',
    description: 'Processing and delivery timelines for orders across India.',
    body: `Orders are processed within 1–3 business days after successful prepaid payment confirmation.

We ship across India. Delivery typically takes 4–8 business days depending on courier service and your location.

Free shipping may apply on orders above ₹999 (as shown at checkout).

Once shipped, you will receive tracking information via SMS, WhatsApp, or email.`,
  },
  returns: {
    title: 'Return & Refund Policy — HILAZ HANGER',
    description: 'Returns and exchanges for damaged, defective, or incorrect items.',
    body: `Returns and exchanges are accepted only for damaged, defective, or incorrect products.

Requirements:
• Contact us within 24 hours of delivery
• Provide clear photos or video proof
• Include an unboxing video where applicable
• Product must be unused with original tags (unless defective)

Refunds, when approved, are processed to the original payment method within 7–10 business days.

For exchange requests on eligible items, contact us on WhatsApp at ${BRAND.phone} or email ${BRAND.email} with your order number.`,
  },
  terms: {
    title: 'Terms & Conditions — HILAZ HANGER',
    description: 'Terms of use for hilazhanger.shop.',
    body: `By using HILAZ HANGER (hilazhanger.shop) you agree to these terms.

• All orders are prepaid only. Cash on Delivery is not offered.
• Product prices, offers, and availability may change without prior notice.
• We reserve the right to cancel orders in case of stock issues, pricing errors, or suspected fraud.
• Website content, images, and branding are owned by HILAZ HANGER. Unauthorized use is prohibited.
• These terms are governed by the laws of India. Disputes are subject to courts in Coimbatore, Tamil Nadu.

For questions: ${BRAND.email} · ${BRAND.phone}`,
  },
  'size-guide': {
    title: 'Size Guide — HILAZ HANGER',
    description: 'How to choose the right size for dresses, co-ords, tops, and bottoms.',
    body: `How to measure (use a soft tape measure):

• Bust — around the fullest part
• Waist — around natural waistline
• Hips — around the fullest part

Size chart (inches) — guide only; fit may vary by style:

        XS    S     M     L     XL
Bust    32    34    36    38    40
Waist   24    26    28    30    32
Hips    34    36    38    40    42

Tips:
• Between sizes? Size up for a relaxed fit.
• Check the product description for fabric stretch.
• WhatsApp us at ${BRAND.phone} with your measurements — we're happy to help.`,
  },
};
