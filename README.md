# Event Management Backend 🎟️

This is an Express Node.js backend application for event management. It provides APIs for managing events, transactions, tickets, user authentication, and more.

## Features

- **Events CRUD:** Create, Read, Update, and Delete operations for events.
- **Transactions CRUD:** Create, Read, Update, and Delete operations for transactions.
- **Tickets CRUD:** Create, Read, Update, and Delete operations for tickets.
- **Transaction Verification:** Verify transactions for ticket purchases.
- **Email Sending:** Send emails for various notifications, such as transaction confirmations.
- **User Signup, Login, and Password Reset:** Authentication system for users with signup, login, and password reset functionalities.
- **Authentication with JWT:** Authentication is based on JSON Web Tokens (JWT) for secure user sessions.
- **IP Rate Limiting:** Automatically limit the rate of requests from individual IPs to prevent abuse or DoS attacks.
- **Detailed Request Logging:** Log detailed information for every request made to the backend for security and monitoring purposes.
- **Middleware Authorization:** All requests are put through a middleware to ensure only authorized users can access sensitive data.

## Technologies Used

- **Node.js:** Backend server environment.
- **Express:** Web framework for Node.js used for building APIs.
- **MongoDB:** NoSQL database for storing event, transaction, and user data.
- **JWT:** JSON Web Tokens for user authentication.
- **Nodemailer:** Node.js library for sending emails.

## Usage

- After starting the server, you can access the API endpoints using tools like Postman or integrate them into your frontend application.
