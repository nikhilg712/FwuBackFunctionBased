import {Passenger} from '../models/Booking'


export const ticketTemplate = (
  BookingId: number,
  origin: string,
  destination: string,
  flightStatus: string,
  cabinClass: string,
  flightNumber: number,
  airlineCode: string,
  airlineName: string,
  flightDate: string,
  originCityCode: string,
  departureTime: string,
  originAirportName: string,
  destinationCityCode: string,
  arrivalTime: string,
  destinationAirportName: string,
  terminal: number,
  cabinBAggage: string,
  currency: string,
  netPayable: number,
  passengers: Passenger[],
  PNR: string
) => {
  const barcodeSections = passengers
    .map(
      (passenger) => `
    <div class="barcode-section">
      <p><strong>Passenger Name:</strong> ${passenger.FirstName} ${passenger.LastName}</p>
      <p><strong>Barcode:</strong></p>
      <img src="${passenger.BarcodeDetails}" alt="Barcode for ${passenger.FirstName}">
      <p>PNR: ${PNR}</p>
    </div>
  `
    )
    .join("");

  return `
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Booking</title>
  <style>
          body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              padding: 0;
              margin: 0;
          }
          .container {
              max-width: 800px;
              margin: 20px auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              background-color: #4CAF50;
              color: white;
              padding: 15px;
              border-radius: 8px 8px 0 0;
          }
          .header h2 {
              margin: 0;
          }
          .booking-info {
              margin-top: 20px;
          }
          .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
          }
          .info-section span {
              font-weight: bold;
              font-size: 14px;
          }
          .info-section div {
              flex: 1;
          }
          .details {
              background-color: #f0f0f0;
              padding: 10px;
              margin-bottom: 20px;
              border-radius: 8px;
          }
          .barcode {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
          }
          .barcode-section {
              text-align: center;
              margin-bottom: 20px;
              flex: 1;
              min-width: 180px;
          }
          .barcode img {
              height: 60px;
              margin-bottom: 10px;
          }
          .footer {
              text-align: center;
              font-weight: bold;
              background-color: #f4f4f4;
              padding: 10px;
              border-radius: 0 0 8px 8px;
          }
          .footer p {
              margin: 0;
              font-size: 16px;
          }
          /* Responsive Styles */
          @media (max-width: 600px) {
              .info-section {
                  flex-direction: column;
              }
              .barcode {
                  flex-direction: column;
                  align-items: center;
              }
          }
  </style>
  </head>
  <body>
  <div class="container">
  <div class="header">
  <h2>Flight Booking</h2>
  <p>Booking Id: ${BookingId}</p>
  </div>
   
          <div class="booking-info">
  <h3>${origin} TO ${destination}</h3>
  <div class="info-section">
  <div><span>Date:</span> ${flightDate}</div>
  <div><span>Flight:</span> ${airlineName} ${airlineCode}-${flightNumber} - ${cabinClass} (${flightStatus})</div>
  </div>
  <div class="info-section">
  <div><span>Departure:</span> ${originCityCode} ${departureTime} (${originAirportName})</div>
  <div><span>Arrival:</span> ${destinationCityCode} ${arrivalTime} (${destinationAirportName})</div>
  </div>
  <div class="info-section">
  <div><span>Terminal:</span> ${terminal}</div>
  </div>
  <div class="details">
  <p><strong>Baggage Allowance:</strong></p>
  <ul>
  <li>Cabin Baggage: ${cabinBAggage}</li>
  </ul>
  </div>
  </div>
  <div class="barcode">
  ${barcodeSections}
  </div>
   
          <div class="footer">
  <p>Amount Paid: ${currency} ${netPayable.toFixed(2)}</p>
  </div>
  </div>
  </body>
  </html>
  `;
};

