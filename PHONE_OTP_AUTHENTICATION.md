# Phone OTP Authentication Setup Guide

## 🎉 Feature Added: Phone Number Authentication with OTP

Your TravelBuddy app now includes secure phone number verification during account registration using OTP (One-Time Password).

## 📋 What's New

### Backend Changes

1. **OTP Service** (`server/services/otpService.js`)
   - Generates 6-digit OTP codes
   - Sends OTP via SMS (currently in development mode - logs to console)
   - Validates OTP with expiry (10 minutes)
   - Prevents spam with attempt limits (max 3 attempts)
   - Supports resend functionality with rate limiting

2. **User Model Updates** (`server/models/User.js`)
   - Added `phone` field with unique sparse index
   - Added `phoneVerified` boolean flag
   - Added `phoneVerifiedAt` timestamp

3. **OTP Routes** (`server/routes/otp.js`)
   - `POST /api/otp/send` - Send OTP to phone number
   - `POST /api/otp/verify` - Verify OTP code
   - `POST /api/otp/resend` - Resend OTP with rate limiting
   - `POST /api/otp/verify-existing` - Verify phone for logged-in users

4. **Updated Registration** (`server/routes/auth.js`)
   - Now requires phone number verification before account creation
   - Validates phone number format
   - Ensures unique phone numbers across users

### Frontend Changes

1. **Enhanced Signup Page** (`src/App.jsx`)
   - Two-step registration process:
     - Step 1: Basic information (name, email, password, phone)
     - Step 2: Phone verification with OTP
   - Visual progress indicator
   - Real-time OTP input validation
   - Countdown timer for resend OTP (60 seconds)
   - Clean, intuitive UI with success/error messages

2. **API Integration** (`src/api.js`)
   - Added `otpAPI` with methods:
     - `sendOTP(phone)` - Request OTP
     - `verifyOTP(phone, otp)` - Verify OTP
     - `resendOTP(phone)` - Resend OTP
   - Updated `authAPI.register()` to include phone verification

## 🚀 How to Use

### For Users

1. **Start Registration**
   - Fill in your name, email, and password
   - Enter your phone number with country code (e.g., +1234567890)

2. **Verify Phone**
   - Click "Verify" button next to phone number
   - An OTP will be sent to your phone
   - Enter the 6-digit code received
   - Click "Verify OTP"

3. **Complete Registration**
   - Once phone is verified (green checkmark appears)
   - Click "Sign Up" to create your account

### For Developers

#### Development Mode (Current Setup)

The OTP service is in **development mode** and logs OTP to the console instead of sending actual SMS:

```
========================================
📱 SMS SERVICE (DEVELOPMENT MODE)
========================================
To: +1234567890
Message: Your TravelBuddy verification code is: 123456. Valid for 10 minutes. Do not share this code.
========================================
```

**To test:**
1. Start the server: `cd server && npm start`
2. Start the frontend: `npm run dev`
3. Register a new account
4. Check the server console for the OTP code
5. Enter the OTP in the verification form

#### Production Setup (SMS Integration)

To enable real SMS sending, edit `server/services/otpService.js`:

##### Option 1: Twilio (Recommended)

```javascript
// Install Twilio
npm install twilio

// In .env file
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

// In otpService.js, replace sendSMS function:
async function sendSMS(phoneNumber, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
  
  return true;
}
```

##### Option 2: MSG91 (Free Tier Available)

```javascript
npm install msg91-sms

// In .env
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=your_sender_id

// In otpService.js
const msg91 = require('msg91-sms');

async function sendSMS(phoneNumber, message) {
  await msg91.sendSMS({
    authkey: process.env.MSG91_AUTH_KEY,
    mobiles: phoneNumber,
    message: message,
    sender: process.env.MSG91_SENDER_ID,
    route: '4'
  });
  return true;
}
```

##### Option 3: TextLocal (UK-focused)

```javascript
npm install textlocal

// Similar setup with TextLocal API
```

## 🔒 Security Features

- ✅ OTP expires after 10 minutes
- ✅ Maximum 3 verification attempts per OTP
- ✅ Rate limiting on OTP resend (60-second cooldown)
- ✅ Phone number format validation
- ✅ Unique phone number enforcement
- ✅ Secure OTP generation using crypto-random numbers
- ✅ Server-side validation of all inputs

## 📱 Phone Number Format

Users should enter phone numbers with country code:
- US: `+11234567890` or `+1 (123) 456-7890`
- UK: `+447911123456`
- India: `+919876543210`

The system will:
- Clean and format phone numbers automatically
- Validate minimum 10 digits, maximum 15 digits
- Store in international format (+XXXXXXXXXXXXX)

## 🛠 Configuration

### OTP Settings (in `otpService.js`)

```javascript
const OTP_LENGTH = 6;              // OTP digit length
const OTP_EXPIRY_MINUTES = 10;     // OTP validity period
```

### Customization Options

1. **Change OTP length**: Modify `OTP_LENGTH` constant
2. **Change expiry time**: Modify `OTP_EXPIRY_MINUTES` constant
3. **Change max attempts**: Modify the `attempts >= 3` check in `verifyOTP()`
4. **Change resend cooldown**: Modify countdown in frontend (currently 60 seconds)

## 🔍 Testing

### Test Scenarios

1. **Successful Registration**
   - Enter valid phone number
   - Receive and enter correct OTP
   - Complete registration

2. **Invalid OTP**
   - Enter wrong OTP code
   - Should show error and remaining attempts

3. **Expired OTP**
   - Wait 10+ minutes after receiving OTP
   - Should prompt to request new OTP

4. **Resend OTP**
   - Request new OTP before timer expires
   - Should show "Please wait" message
   - After timer expires, should send new OTP

5. **Duplicate Phone**
   - Try registering with already-verified phone number
   - Should show error message

## 🐛 Troubleshooting

### OTP Not Received
- Check server console for the OTP (development mode)
- Verify phone number format includes country code
- Check server logs for errors

### Verification Failed
- Ensure OTP hasn't expired (10 minutes)
- Check you haven't exceeded 3 attempts
- Verify correct phone number was entered

### Account Creation Failed
- Ensure phone was successfully verified
- Check for duplicate email/phone
- Verify all required fields are filled

## 📚 API Reference

### Send OTP
```
POST /api/otp/send
Body: { "phone": "+1234567890" }
Response: { "success": true, "message": "OTP sent successfully", "expiresIn": 600 }
```

### Verify OTP
```
POST /api/otp/verify
Body: { "phone": "+1234567890", "otp": "123456" }
Response: { "success": true, "message": "Phone number verified successfully" }
```

### Resend OTP
```
POST /api/otp/resend
Body: { "phone": "+1234567890" }
Response: { "success": true, "message": "OTP sent successfully", "expiresIn": 600 }
```

### Register with Phone
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "phoneVerified": true
}
Response: { "token": "...", "user": {...} }
```

## 🎨 UI Features

- Progress bar showing registration steps
- Real-time validation feedback
- Countdown timer for OTP resend
- Visual verification status (green checkmark)
- Responsive design for mobile/desktop
- Clear error and success messages
- Smooth transitions between steps

## 🚀 Next Steps

1. **Enable SMS Service**: Choose and integrate a real SMS provider
2. **Add Phone to Profile**: Allow users to add/update phone in profile settings
3. **Phone Login**: Add option to login with phone + OTP
4. **Two-Factor Auth**: Use OTP for additional security on sensitive actions
5. **SMS Notifications**: Send trip updates and alerts via SMS

## 📝 Notes

- Current implementation is FREE (no SMS costs in development mode)
- Production SMS services have various pricing models:
  - Twilio: ~$0.0075 per SMS (free trial available)
  - MSG91: Free tier + paid plans
  - TextLocal: Pay-as-you-go pricing
- Consider implementing Redis for OTP storage in production (currently in-memory)
- Add rate limiting middleware to prevent abuse

---

**Feature implemented by:** GitHub Copilot  
**Date:** January 2026  
**Version:** 1.0.0
