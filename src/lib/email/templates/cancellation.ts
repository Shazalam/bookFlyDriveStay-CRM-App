export const cancellationTemplate = (data: any) => `
  <p>Dear ${data.fullName},</p>
  <p>We’re writing to confirm that your booking has been <b>cancelled</b>.</p>
  <ul>
    <li>Confirmation #: ${data._id}</li>
    <li>Cancellation Date: ${new Date().toLocaleDateString()}</li>
    <li>Cancellation Fee: $${data.cancellationFee || 0}</li>
    <li>Refund Amount (if applicable): $${data.refundAmount || 0}</li>
  </ul>
  <p>If you have questions, feel free to reach out to our support team.</p>
  <p>Thank you,<br/>Car Rentals</p>
`;
