const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function isValidEmail(value) {
  return EMAIL_RE.test(cleanString(value, 160));
}

function validateContactPayload(body = {}) {
  const name = cleanString(body.name, 100);
  const email = cleanString(body.email, 160).toLowerCase();
  const message = cleanString(body.message, 2000);
  const errors = {};

  if (name.length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (message.length < 10) errors.message = 'Message must be at least 10 characters.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: { name, email, message }
  };
}

module.exports = { cleanString, isValidEmail, validateContactPayload };
