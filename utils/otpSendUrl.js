/**
 * Generates the URL for sending a two-factor authentication (2FA) SMS using the fast2sms API.
 * This function constructs the API endpoint with the provided phone number and verification code.
 *
 * @param {string} phoneNumber - The phone number to which the 2FA SMS will be sent.
 * @param {string} code - The verification code to include in the 2FA SMS.
 * @returns {string} - The complete URL for triggering a 2FA SMS using the fast2sms API.
 */
export const otpSendUrl = function (phoneNumber, code) {
  // Construct the URL with the fast2sms API endpoint, API key, phone number, and verification code
  return `https://www.2factor.in/API/R1?module=TRANS_SMS&to=${phoneNumber}&from=OCTVIA&apikey=5a1a049e-c604-11eb-8089-0200cd936042&templatename=otp%20verification&var1=${code}`;
};
