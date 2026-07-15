function errorDetails(error) {
  if (!error) return "";
  if (typeof error === "string") return error;

  return [
    error.message,
    error.error,
    error.error_description,
    error.description,
    error.code,
    error.json?.error,
    error.json?.error_description,
    error.json?.message
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" ");
}

export function friendlyAuthError(error) {
  const details = errorDetails(error);
  const normalized = details.toLowerCase();

  if (/invalid_grant|email.*not.*confirm|confirm.*email|confirmation.*required/.test(normalized)) {
    return "Please confirm your email before logging in. Check your inbox for the secure confirmation link.";
  }

  if (/invalid login|invalid credential|incorrect password|wrong password/.test(normalized)) {
    return "Email or password is incorrect.";
  }

  if (/signup.*disabled|registration.*closed|signups?.*not.*allowed/.test(normalized)) {
    return "Account registration is currently closed.";
  }

  if (/already.*registered|already.*exists|user.*exists/.test(normalized)) {
    return "An account already exists for this email. Log in or reset your password.";
  }

  if (/identity|not found|404/.test(normalized)) {
    return "Authentication is temporarily unavailable.";
  }

  return details || "Authentication failed. Please try again.";
}

export function isOAuthRedirectSignal(error) {
  return /redirecting to oauth provider/i.test(errorDetails(error));
}
