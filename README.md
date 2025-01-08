## Password Manager Backend

### Overview

This repository houses the backend logic for a password manager application built with Node.js, TypeScript, MongoDB, and Mongoose. It provides CRUD operations for users, cards, and items.

### Initialization Steps

1. Install dependencies

   ```bash
   npm install
   ```

2. In the root of the project, create a .env file and add the following properties:

   ```bash
   MONGO_CONNECTION_STRING="MONGODB STRING CONNECTION PROVIDED BY THE MONGODB"
   ENCRYPTION_KEY="A RANDOM KEY STRING HASH"
   SESSION_SECRET="A RANDOM SESSION SCREET STRING"
   PORT=5000
   ```

3. Start server

   ```bash
   npm start
   ```

### Technologies

- **Node.js:** JavaScript runtime
- **TypeScript:** Typed superset of JavaScript
- **MongoDB:** NoSQL database
- **Mongoose:** MongoDB object modeling tool

### Models

- **User:** Stores user information (email, hashed password, etc.)
- **Card:** Manages credit card details (number, expiration, CVV, etc.)
- **Item:** Contains password-related data (password, username, name, category, etc.)

### Features

- User authentication and authorization
- CRUD operations for users, cards, and items
- Secure password hashing and storage
- Data encryption for the cards and items models
- Data validation and error handling
