# Swagger API Documentation Guide

## 🚀 Accessing Swagger UI

Once your application is running, you can access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

## 🔐 How to Use Bearer Token Authentication

### Step 1: Sign Up or Sign In

1. Navigate to the **Authentication** section in Swagger UI
2. Use the **POST /auth/signup** endpoint to create a new account, or
3. Use the **POST /auth/signin** endpoint to log in with existing credentials

### Step 2: Copy the Access Token

After successful authentication, you'll receive a response like:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwiYWNhZGVteUlkIjpudWxsLCJpYXQiOjE2MzY2NzI4MDAsImV4cCI6MTYzNjc1OTIwMH0.xyz...",
  "user": { ... }
}
```

**Copy the entire `accessToken` value** (without quotes).

### Step 3: Authorize in Swagger UI

1. Click the **"Authorize"** button (🔒 icon) at the top right of the Swagger UI page
2. A modal will appear with a field labeled "Value"
3. Paste your JWT token into the "Value" field
4. Click **"Authorize"**
5. Click **"Close"** to close the modal

### Step 4: Make Authenticated Requests

Now all requests to protected endpoints (marked with a lock icon 🔒) will automatically include your JWT token in the Authorization header.

You can now:
- ✅ Create academies (POST /academies)
- ✅ Get academy details (GET /academies/:id)
- ✅ Any other protected endpoints

## 📝 Features

### Persist Authorization
The token is automatically saved in your browser, so you won't need to re-enter it after page refresh.

### Clear Authorization
To log out or switch accounts:
1. Click the **"Authorize"** button again
2. Click **"Logout"** 
3. Sign in with a different account and repeat the authorization process

## 🎯 API Tags

The API is organized into the following sections:

- **Authentication** - Sign up and sign in endpoints (public)
- **Academies** - Academy management endpoints (protected)

## 💡 Tips

1. **Try it out**: Each endpoint has a "Try it out" button that lets you test the API directly from the browser
2. **View examples**: Each endpoint includes example requests and responses
3. **Validation**: Swagger shows which fields are required and their validation rules
4. **Response codes**: All possible HTTP status codes are documented for each endpoint

## 🔍 Testing Workflow Example

1. **Sign Up** - POST /auth/signup
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```

2. **Copy Token** - Copy the `accessToken` from the response

3. **Authorize** - Click the Authorize button and paste the token

4. **Create Academy** - POST /academies
   ```json
   {
     "name": "Modern Academy",
     "code": "MA001",
     "address": "123 Main St",
     "phone": "+1234567890",
     "email": "info@academy.com"
   }
   ```

5. **Get Academy** - GET /academies/{id} with the academy ID from the previous response

## 🛡️ Security

- JWT tokens expire after 24 hours (configurable in .env)
- Tokens are stored only in your browser's session storage
- Never share your JWT token with others
- Use HTTPS in production

## 📚 OpenAPI Specification

The complete OpenAPI specification is available at:
```
http://localhost:3000/api/docs-json
```

You can import this into tools like Postman, Insomnia, or use it for code generation.
