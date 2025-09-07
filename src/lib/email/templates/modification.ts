export const modificationTemplate = (data: T) => `
  <p>Dear ${data.fullName},</p>
  <p>Your booking has been successfully <b>modified</b>. Please review the updated itinerary:</p>
  <ul>
    <li>Vehicle: ${data.vehicleType}</li>
    <li>Pickup: ${data.pickupDate} at ${data.pickupLocation}</li>
    <li>Drop-off: ${data.dropoffDate} at ${data.dropoffLocation}</li>
    <li>Modification Fee: $${data.modificationFee || 0}</li>
    <li>Total: $${data.total}</li>
  </ul>
  <p>If all details are correct, kindly reply with "I acknowledge" and provide your driver’s license number.</p>
  <p>Thank you,<br/>Car Rentals</p>
`;
