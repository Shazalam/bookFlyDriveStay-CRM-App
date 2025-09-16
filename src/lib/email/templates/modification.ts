export interface BookingChange {
  field: string;
  oldValue: string | number | null;
  newValue: string | number | null;
}

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
  changes?: BookingChange[]; // <-- NEW
}

export const bookingModificationTemplate = (data: BookingTemplateData) => {
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
                <div style="font-size:13px;margin-top:4px;">Reservation Modification Confirmation</div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:20px 20px 8px;color:#111827;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 10px;font-size:15px;">Dear <strong>${data.fullName}</strong>,</p>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;">
                  We’re writing to confirm that your <strong>car rental reservation has been modified</strong>.
                  Please review your <strong>updated itinerary</strong> and
                  <strong>payment summary</strong> below. If everything looks correct, kindly
                  <strong>reply to this email with “I acknowledge”</strong> and provide your
                  <strong>driving license number</strong> to proceed.
                </p>

                ${
                  data.changes && data.changes.length > 0
                    ? `
                    <!-- Changes Summary -->
                    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 14px;margin:16px 0;">
                      <div style="font-size:15px;font-weight:700;margin-bottom:6px;">⚡ Summary of Changes</div>
                      <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.5;color:#92400e;list-style:disc;">
                        ${data.changes
                          .map(
                            c => `<li><strong>${c.field}:</strong> ${c.oldValue || "—"} → ${c.newValue || "—"}</li>`
                          )
                          .join("")}
                      </ul>
                    </div>`
                    : ""
                }

                <!-- Vehicle Details -->
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin:14px 0;">
                  <div style="font-size:15px;font-weight:700;margin-bottom:6px;">🚘 Updated Vehicle Details</div>
                  <img
                    src="${data.vehicleImage || "https://wallpapers.com/images/featured/4k-car-g6a4f0e15hkua5oa.jpg"}"
                    alt="${data.rentalCompany || "Rental Vehicle"}"
                    style="display:block;width:100%;height:auto;border:0;max-height:320px;object-fit:cover"
                  />
                  <div style="font-size:14px;line-height:1.5;">
                    <div><strong>Rental Company:</strong> ${data.rentalCompany || "—"}</div>
                    ${data.confirmationNumber ? `<div><strong>Confirmation #:</strong> ${data.confirmationNumber}</div>` : ""}
                  </div>
                </div>

                <!-- Payment Breakdown -->
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin:14px 0;">
                  <div style="font-size:15px;font-weight:700;margin-bottom:8px;">💳 Updated Payment Summary</div>
                  <div style="margin-top:8px;font-weight:700;">Total: $${Number(data.total || 0).toFixed(2)}</div>
                  <p>This amount is split into:</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                    <tr>
                      <td style="padding:6px 0;">1. ${Number(data.mco || 0).toFixed(2)} USD – Already charged under <strong>BookFlyDriveStay</strong></td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">2. ${Number(data.payableAtPickup || 0).toFixed(2)} USD – To be paid at pickup under <strong>${data.rentalCompany || "Car Rental Partner"}</strong></td>
                    </tr>
                  </table>
                </div>

                <!-- Itinerary -->
                <div style="margin:16px 0 8px;font-size:15px;font-weight:700;">📅 Updated Itinerary</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                  <tr>
                    <td valign="top" style="width:50%;padding:8px;border:1px solid #e5e7eb;">
                      <div style="font-weight:700;margin-bottom:4px;">Pick-up</div>
                      <div>${data.pickupDate || "—"}${data.pickupTime ? " at " + data.pickupTime : ""}</div>
                      <div style="color:#374151;margin-top:4px;">${data.pickupLocation || "—"}</div>
                    </td>
                    <td valign="top" style="width:50%;padding:8px;border:1px solid #e5e7eb;">
                      <div style="font-weight:700;margin-bottom:4px;">Drop-off</div>
                      <div>${data.dropoffDate || "—"}${data.dropoffTime ? " at " + data.dropoffTime : ""}</div>
                      <div style="color:#374151;margin-top:4px;">${data.dropoffLocation || "—"}</div>
                    </td>
                  </tr>
                </table>

                <!-- Contact -->
                <div style="margin-top:16px;font-size:14px;">
                  <p style="margin:6px 0;"><strong>Email:</strong> ${data.email || "—"}</p>
                  <p style="margin:6px 0;"><strong>Phone:</strong> ${data.phoneNumber || "—"}</p>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#6b7280;">
                <p style="margin:4px 0;">© ${new Date().getFullYear()} BookFlyDriveStay</p>
                <p style="margin:4px 0;">Toll-free 24/7: <a href="tel:+18556133131" style="color:#2563eb;text-decoration:none;">+1 (855) 613-3131</a></p>
                <p style="margin:6px 0 0;font-size:11px;line-height:1.5;color:#9ca3af;">
                  This email contains confidential information related to your rental reservation. 
                  Please do not share this confirmation number publicly.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>`;

  const subject = `${data.rentalCompany || "Car Rental"} - Reservation Modification #${data.confirmationNumber || ""}`;
  return { subject, html };
};
