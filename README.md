## Password Manager Backend

### Overview

This repository houses the backend logic for a password manager application built with Node.js, TypeScript, MongoDB, and Mongoose. It provides CRUD operations for users, cards, and items.

### Initialization Steps

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables-
   - Create a .env.local file with necessary environment variables
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
