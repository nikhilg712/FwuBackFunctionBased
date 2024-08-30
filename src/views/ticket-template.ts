export const ticketTemplate = (
  BookingId: number,
  PNR: number,
  passengerName: string,
  origin: string,
  destination: string
) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f8f8;
          }
          .ticket-container {
            width: 600px;
            margin: 20px auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 15px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .content h2 {
            margin-top: 0;
          }
          .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .info div {
            width: 45%;
          }
          .footer {
            background-color: #f1f1f1;
            padding: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="header">
            <h1>Flight Ticket</h1>
          </div>
          <div class="content">
            <h2>Booking Information</h2>
            <div class="info">
              <div><strong>Booking ID:</strong> ${BookingId}</div>
              <div><strong>PNR:</strong> ${PNR}</div>
            </div>
            <div class="info">
              <div><strong>Passenger Name:</strong> ${passengerName}</div>

            </div>
            <div class="info">
              <div><strong>Origin:</strong> ${origin}</div>
              <div><strong>Destination:</strong> ${destination}</div>
            </div>

          </div>
          <div class="footer">
            <p>Thank you for choosing our Flew With Us. Have a safe flight!</p>
          </div>
        </div>
      </body>
    </html>
    `;
};
