import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || 'your-secret';

export function getUserFromRequest(req) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = Object.fromEntries(
      cookieHeader.split(";").map(cookie => {
        const [name, ...rest] = cookie.trim().split("=");
        return [name, decodeURIComponent(rest.join("="))];
      })
    );

    const token = cookies.token;
    if (!token) return null;

    const payload = jwt.verify(token, SECRET);
    return payload; // typically includes email and other claims
  } catch {
    return null;
  }
}
