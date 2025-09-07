export const bookingTemplate = (data: any) => `
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
                  <strong>reply to this email with “I acknowledge”</strong> and provide your
                  <strong>driving license number</strong> to proceed.
                </p>

                <!-- Vehicle Details -->
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin:14px 0;">
                  <div style="font-size:15px;font-weight:700;margin-bottom:6px;">🚘 Vehicle Details</div>
                   <img
                  src="${data.vehicleImage || "https://wallpapers.com/images/featured/4k-car-g6a4f0e15hkua5oa.jpg"}"
                  alt="${data.vehicleType || "Rental Vehicle"}"
                  style="display:block;width:100%;height:auto;border:0;max-height:320px;object-fit:cover"
                />
                  <div style="font-size:14px;line-height:1.5;">
                    <div><strong>Type:</strong> ${data.vehicleType || "—"}</div>
                    <div><strong>Rental Company:</strong> ${data.rentalCompany || "—"}</div>
                    ${data.confirmationNo
    ? `<div><strong>Confirmation:</strong> #${data.confirmationNo}</div>`
    : ""}
                  </div>
                </div>

                <!-- Payment Breakdown -->
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin:14px 0;">
                  <div style="font-size:15px;font-weight:700;margin-bottom:8px;">💳 Payment Breakdown</div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                    <tr>
                      <td style="padding:6px 0;">${Number(data.mco || 0).toFixed(2)} USD – Charged under <strong>BookFlyDriveStay Car Rental</strong></td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">${Number(data.payableAtPickup || 0).toFixed(2)} USD – Charged under <strong>${data.rentalCompany || "Car Rental Partner"}</strong></td>
                    </tr>
                  </table>
                  <div style="margin-top:8px;font-weight:700;">Total Car Rental Cost: $${Number(data.total || 0).toFixed(2)}</div>
                </div>

                <!-- Itinerary -->
                <div style="margin:16px 0 8px;font-size:15px;font-weight:700;">📅 Car Rental Itinerary</div>
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

                <!-- Travel advisory -->
                <div style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#4b5563;">
                   Please be aware of any coronavirus (COVID-19) travel advisories and review updates from the World Health Organization (WHO)..
                  <a href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/travel-advice" style="color:#4f46e5;text-decoration:none;">Find out more</a>.
                </div>

                <!-- Signature / Consent -->
                <p style="margin:14px 0 0;font-size:13px;line-height:1.7;color:#4b5563;">
                  I, ${data.fullName}, read the terms &amp; conditions and understand that the price is <strong>non-refundable</strong>.
                  I agree to pay the total amount mentioned above for this purchase. I understand this serves as my legal signature.
                  For any queries, call <a href="tel:+18556133131" style="color:#4f46e5;text-decoration:none;">+1 (855) 613-3131</a>.
                </p>

                <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#4b5563;">
                  Your e-Voucher will be emailed within 24 hours (after credit-card verification). We value your business and
                  look forward to serving your travel needs in the near future.
                </p>

                <!-- Closing -->
                <p style="margin:16px 0 0;font-size:14px;">
                  Thanks &amp; Regards,<br/>
                  <strong>${data.salesAgent || "Reservations Desk"}</strong><br/>
                  Reservations Desk
                </p>

                <!-- CHANGES / CANCELLATION -->
                <div style="margin:18px 0 4px;font-size:15px;font-weight:700;">CHANGES / CANCELLATION</div>
                <div style="font-size:13px;line-height:1.7;color:#4b5563;">
                  <strong>AM Credit Card Policy:</strong> The driver must present a valid driver license and a credit card in his/her name upon pick-up.
                  A credit-card deposit is required by the rental company; please ensure sufficient funds are available on the card. <br/>
                  <strong>Debit Card Policy:</strong> Debit cards are not accepted for payment or for qualification at time of pick-up for most locations.
                  See Important Rental Information for complete debit-card policy. <br/>
                  <strong>Car Rental Notice:</strong> The total estimated car-rental cost includes government taxes and fees. Actual total cost may vary
                  based on additional items added or services used.
                </div>
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
