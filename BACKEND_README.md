# Backend Integration Guide

This document outlines the API endpoints that need to be implemented by the backend team to make the frontend fully functional. The frontend currently uses stubbed/mocked functions for these API calls, which can be found documented with `TODO (Backend)` comments throughout the codebase.

## 1. Authentication & Onboarding Flow

The onboarding flow is separated into multiple steps. The backend should ideally support partial profile creation or handle the final profile assembly at the very end.

### 1.1 Check Phone / Email Availability
* **Endpoint:** `GET /api/auth/check-phone` (or similar)
* **Purpose:** Checks if a phone number or email is already registered before allowing the user to proceed with signup.
* **Payload/Query:** `?phone=+1234567890`
* **Response:** `{ "exists": boolean }`
* **Frontend Location:** `src/screens/auth/SignUpScreen.tsx`

### 1.2 Sign Up (Initial)
* **Endpoint:** `POST /api/auth/signup`
* **Purpose:** Registers the user with their phone number and password. Should trigger the sending of an OTP to the provided phone number.
* **Payload:** `{ "phone": "+1234567890", "password": "securePassword123!" }`
* **Response:** `{ "success": true, "token": "temp_auth_token" }` (or similar session identifier to track the user through the onboarding flow).
* **Frontend Location:** `src/screens/auth/SignUpScreen.tsx`

### 1.3 Verify OTP
* **Endpoint:** `POST /api/auth/verify-otp`
* **Purpose:** Verifies the 4-digit code sent to the user's phone or email.
* **Payload:** `{ "phone": "+1234567890", "code": "1234" }`
* **Response:** `{ "success": true, "token": "valid_auth_token" }`
* **Frontend Location:** `src/screens/auth/PhoneVerificationScreen.tsx` (and `EmailVerificationScreen.tsx`)

### 1.4 Resend OTP
* **Endpoint:** `POST /api/auth/resend-otp`
* **Purpose:** Resends a new 4-digit verification code. Must include rate-limiting.
* **Payload:** `{ "phone": "+1234567890" }`
* **Response:** 200 OK
* **Frontend Location:** `src/screens/auth/PhoneVerificationScreen.tsx`

## 2. Profile Setup Flow

After verifying their OTP, the user is navigated through a series of profile setup screens.

### 2.1 Upload Profile Picture
* **Endpoint:** `POST /api/users/profile/photo`
* **Purpose:** Uploads the user's selected profile picture.
* **Content-Type:** `multipart/form-data`
* **Payload:** The raw image blob/file.
* **Response:** `{ "url": "https://cdn.example.com/user/photo.jpg" }`
* **Frontend Location:** `src/screens/profile-setup/UserProfileScreen.tsx`
* **Note:** Alternatively, the backend can provide a pre-signed S3 URL for the frontend to upload directly to the CDN.

### 2.2 Check Username Availability
* **Endpoint:** `GET /api/users/check-username`
* **Purpose:** Verifies if a chosen username is available while the user is typing (debounced on the frontend).
* **Payload/Query:** `?username=johndoe`
* **Response:** `{ "exists": boolean }`
* **Frontend Location:** `src/screens/profile-setup/UsernameScreen.tsx`

### 2.3 Finalize Profile Creation
* **Endpoint:** `POST /api/users/profile`
* **Purpose:** Submits all the gathered onboarding data to finalize the user's account.
* **Payload:** `{ "username": "johndoe", "gender": "Male", "location": "New York, USA", "profilePictureUrl": "..." }`
* **Response:** `{ "success": true, "user": { ... } }`
* **Frontend Location:** `src/screens/profile-setup/UsernameScreen.tsx`

## 3. General Authentication

### 3.1 Sign In
* **Endpoint:** `POST /api/auth/login`
* **Purpose:** Authenticates returning users.
* **Payload:** `{ "identifier": "+1234567890", "password": "securePassword123!" }`
* **Response:** `{ "token": "jwt_token", "user": { ... } }`
* **Frontend Location:** `src/screens/auth/SignInScreen.tsx`

### 3.2 Forgot Password / Reset
* **Endpoint:** `POST /api/auth/forgot-password`
* **Purpose:** Initiates a password reset flow by sending an OTP to the provided email/phone.
* **Payload:** `{ "email": "user@example.com" }`
* **Frontend Location:** `src/screens/auth/ForgotPasswordScreen.tsx`

