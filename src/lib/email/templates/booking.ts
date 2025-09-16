export interface BookingTemplateData {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  rentalCompany?: string;
  vehicleImage?: string;
  vehicleType?: string;
  total?: string;
  mco?: string;
  payableAtPickup?: string;
  pickupDate?: string;
  dropoffDate?: string;
  pickupTime?: string;
  dropoffTime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  cardLast4?: string;
  expiration?: string;
  cardExpiry?: string;
  billingAddress?: string;
  salesAgent?: string;
  confirmationNumber?: string;
}

export const bookingTemplate = (data: BookingTemplateData) => {
  const html = `
  <div style="margin:0;padding:0;background:#f5f7fb;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f7fb;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background:#4f46e5;color:#ffffff;padding:18px 20px;text-align:center;">
                <div style="font-size:20px;font-weight:700;line-height:1.2;">🚗 BookFlyDriveStay</div>
                <div style="font-size:13px;margin-top:4px;">Car Rental Confirmation</div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:20px 20px 8px;color:#111827;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 10px;font-size:15px;">Dear <strong>${data.fullName}</strong>,</p>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;">
                  Greetings of the day! Please review the <strong>car rental itinerary</strong> and
                  <strong>payment breakdown</strong> below. If everything looks correct, kindly
                  <strong>reply to this email with "I acknowledge"</strong> and provide your
                  <strong>driving license number</strong> to proceed.
                </p>

                <!-- Vehicle Details -->
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin:14px 0;">
                  <div style="font-size:15px;font-weight:700;margin-bottom:6px;">🚘 Rental Car Overview</div>
                   <img
                  src="${data.vehicleImage || "https://wallpapers.com/images/featured/4k-car-g6a4f0e15hkua5oa.jpg"}"
                  alt="${data.vehicleType || "Rental Vehicle"}"
                  style="display:block;width:100%;height:auto;border:0;max-height:320px;object-fit:cover"
                />
                  <div style="font-size:14px;line-height:1.5;">
                    <div><strong>Rental Company:</strong> ${data.rentalCompany || "—"}</div>
                    ${data.confirmationNumber
    ? `<div><strong>Confirmation:</strong> #${data.confirmationNumber}</div>`
    : ""}
                  </div>
                </div>

                <!-- Payment Breakdown -->
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin:14px 0;">
                  <div style="font-size:15px;font-weight:700;margin-bottom:8px;">💳 Payment Breakdown</div>
                 <div style="margin-top:8px;font-weight:700;">🚗 Car Rental - Total: $${Number(data.total || 0).toFixed(2)}</div>
                    <p>This amount has been split into two charges:</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                    <tr>
                      <td style="padding:6px 0;">1. ${Number(data.mco || 0).toFixed(2)} USD – Charged under <strong>BookFlyDriveStay Car Rental</strong></td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">2. ${Number(data.payableAtPickup || 0).toFixed(2)} USD – Charged under <strong>${data.rentalCompany || "Car Rental Partner"}</strong></td>
                    </tr>
                  </table>
                </div>

                <!-- Itinerary -->
                <div style="margin:16px 0 8px;font-size:15px;font-weight:700;">📅 Reservation Details</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                  <tr>
                    <td valign="top" style="width:50%;padding:8px;border:1px solid #e5e7eb;">
                      <div style="font-weight:700;margin-bottom:4px;">Pick-up</div>
                      <div>${data.pickupDate || "—"}${data.pickupTime ? ` at ${data.pickupTime}` : ""}</div>
                      <div style="color:#374151;">${data.pickupLocation || "—"}</div>
                    </td>
                    <td valign="top" style="width:50%;padding:8px;border:1px solid #e5e7eb;">
                      <div style="font-weight:700;margin-bottom:4px;">Drop-off</div>
                      <div>${data.dropoffDate || "—"}${data.dropoffTime ? ` at ${data.dropoffTime}` : ""}</div>
                      <div style="color:#374151;">${data.dropoffLocation || "—"}</div>
                    </td>
                  </tr>
                </table>

                <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">
                  Note: All prices quoted above are inclusive of all taxes &amp; fees.
                </p>

                <!-- Credit Card Authorization -->
                <div style="margin:16px 0 8px;font-size:15px;font-weight:700;">💳 Credit Card Authorization</div>
                <div style="font-size:14px;line-height:1.6;">
                  Cardholder Name: ${data.fullName}<br/>
                  Card Number: **** **** **** ${data.cardLast4 || "••••"}<br/>
                  Expiration: ${data.expiration || data.cardExpiry || "—"}<br/>
                  Billing Address: ${data.billingAddress || "—"}
                </div>

                   <!-- [START] UPDATED Travel Advisory with Emoji Icon -->
                <div style="margin:16px 0 0; background-color:#ffecd1; border-radius:8px; padding:12px 16px; border:1px solid #fce1b3;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    <tr>
                      <!-- Emoji Icon Cell -->
                     <td valign="top" style="width:28px; font-size:18px; line-height:1.4;">
  ⓘ
</td>
                      <!-- Text Cell -->
                      <td valign="top" style="font-size:13px; line-height:1.6; color:#856404; font-family:Arial,Helvetica,sans-serif;">
                        Please be aware of any coronavirus (COVID-19) travel advisories and review updates from the World Health Organization (WHO).
                        <a href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/travel-advice" style="color:#bf7c00; text-decoration:none; font-weight:bold;">Find out more</a>.
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Signature / Consent -->
                <p style="margin:14px 0 0;font-size:13px;line-height:1.7;color:#4b5563;">
                  I, ${data.fullName}, read the terms &amp; conditions and understand that the price is <strong>non-refundable</strong>.
                  I agree to pay the total amount mentioned above for this purchase. I understand this serves as my legal signature.
                  For any queries, call <a href="tel:+18556133131" style="color:#4f46e5;text-decoration:none;">+1 (855) 613-3131</a>.
                </p>

                  <!-- Closing -->
                <p style="margin:16px 0 0;font-size:14px;line-height:1.6;">
                  Thanks & Regards!,<br/>
                  <strong style="color:#0f740f;">${data.salesAgent || "Sales Team"}</strong><br/>
                 (Reservations Desk) 
                </p>

                <!-- Closing -->
                  <!-- [START] CORRECTED SIGNATURE AND CONTACT INFO -->
                <div style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#4b5563;">
                  <p style="margin:0;">BookFlyDriveStay</p>
                  
                  <!-- Styled Horizontal Rule -->
                  <hr style="width:100%; border:0; border-top:1px solid #e0e0e0; margin:3px 0;" />
                  
                  <p style="margin:0;">
                    <strong style="color:#111827;">Toll-free (24/7):</strong> +1 (855) 613-3131
                  </p>
                </div>

                <!-- [START] HIGHLIGHTED CHANGES / CANCELLATION SECTION -->
                <div style="margin-top:20px;padding:14px 16px;background-color:#ffecd1;border-radius:8px;border:1px solid #e5e7eb;">
                    <div style="font-size:15px;font-weight:700;color:#111827;text-align:center">CHANGES / CANCELLATION</div>
                    <div style="margin-top:8px;font-size:13px;line-height:1.7;color:#4b5563;">
                        <strong>AM Credit Card Policy:</strong> The driver must present a valid driver license and a credit card in his/her name upon pick-up.
                        A credit-card deposit is required by the rental company; please ensure sufficient funds are available on the card. <br/>
                        <strong>Debit Card Policy:</strong> Debit cards are not accepted for payment or for qualification at time of pick-up for most locations.
                        See Important Rental Information for complete debit-card policy. <br/>
                        <strong>Car Rental Notice:</strong> The total estimated car-rental cost includes government taxes and fees. Actual total cost may vary
                        based on additional items added or services used.
                    </div>
                </div>
                <!-- [END] HIGHLIGHTED CHANGES / CANCELLATION SECTION -->

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f3f4f6;padding:14px 18px;text-align:center;color:#6b7280;font-size:12px;">
                © ${new Date().getFullYear()} BookFlyDriveStay • Toll-free (24/7): +1 (855) 613-3131
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;

  const subject = `${data.rentalCompany || "Car Rental"} - Booking Confirmation #${data.confirmationNumber || ""}`;
  
  return { subject, html };
};