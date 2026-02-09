const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login({ email, password }) {
  await delay();
  if (!email || !password) {
    throw { status: 400, message: "Missing credentials" };
  }
  if (email.includes("invalid")) {
    throw { status: 401, message: "Invalid email or password" };
  }
  if (email.includes("2fa")) {
    return {
      status: 200,
      data: { temp_token: "temp-123", user_id: "user-2fa", requires2FA: true },
    };
  }
  return { status: 200, data: { token: "token-123" } };
}

export async function register({ fullName, username, email, password }) {
  await delay();
  if (!username || !email || !password) {
    throw { status: 400, message: "Missing required fields" };
  }
  if (email.includes("exists") || username.includes("exists")) {
    throw { status: 409, message: "Email or username already exists" };
  }
  return { status: 201, data: { user_id: "user-new", fullName } };
}

export async function forgotPassword({ email }) {
  await delay();
  if (!email) {
    throw { status: 400, message: "Email required" };
  }
  return { status: 200, data: { ok: true } };
}

export async function resetPassword({ token, password }) {
  await delay();
  if (!token || token === "invalid") {
    throw { status: 400, message: "Invalid token" };
  }
  if (!password || password.length < 6) {
    throw { status: 400, message: "Password too short" };
  }
  return { status: 200, data: { ok: true } };
}

export async function verify2FA({ user_id, code, temp_token }) {
  await delay();
  if (!user_id || !temp_token || code !== "123456") {
    throw { status: 400, message: "Invalid code" };
  }
  return { status: 200, data: { token: "token-2fa" } };
}
