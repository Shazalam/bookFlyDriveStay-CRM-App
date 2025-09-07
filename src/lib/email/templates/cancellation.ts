export interface BookingTemplateData {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  rentalCompany?: string;
  vehicleImage?: string;
  vehicleType?: string;
  vehicleCategory?: string;
  total?: number;
  mco?: number;
  payableAtPickup?: number;
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
  confirmationNo?: string;
}

export const cancellationTemplate = (data: BookingTemplateData) => `
  <p>Dear ${data.fullName},</p>
  <p>We’re writing to confirm that your booking has been <b>cancelled</b>.</p>
  <ul>
    
    <li>Cancellation Date: ${new Date().toLocaleDateString()}</li>
    
  </ul>
  <p>If you have questions, feel free to reach out to our support team.</p>
  <p>Thank you,<br/>Car Rentals</p>
`;

// <li>Confirmation #: ${data._id}</li>
// <li>Cancellation Fee: $${data.cancellationFee || 0}</li>
//     <li>Refund Amount (if applicable): $${data.refundAmount || 0}</li>