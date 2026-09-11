import nodemailer from "nodemailer";
import { BUSINESS } from "./constants";

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
};

type SmtpJson = {
  host?: string;
  port?: number | string;
  secure?: boolean | string;
  user?: string;
  pass?: string;
  from?: string;
};

export function parseSmtpJson(raw?: string | null): SmtpJson {
  try {
    return raw ? (JSON.parse(raw) as SmtpJson) : {};
  } catch {
    return {};
  }
}

export function resolveSmtpSettings(configJson?: string | null): SmtpSettings | null {
  const json = parseSmtpJson(configJson);
  const host = String(json.host || process.env.SMTP_HOST || "").trim();
  if (!host) return null;

  const port = Number(json.port || process.env.SMTP_PORT || 587);
  const secureRaw = json.secure ?? process.env.SMTP_SECURE;
  const secure =
    typeof secureRaw === "boolean"
      ? secureRaw
      : String(secureRaw || "").toLowerCase() === "true" || port === 465;
  const user = String(json.user || process.env.SMTP_USER || "").trim() || undefined;
  const pass = String(json.pass || process.env.SMTP_PASS || "").replace(/\s/g, "") || undefined;
  const from = String(json.from || process.env.SMTP_FROM || user || BUSINESS.email).trim();

  return { host, port: Number.isFinite(port) ? port : 587, secure, user, pass, from };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlFromText(subject: string, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e8eef5;">
            <tr>
              <td>
                <p style="margin:0 0 6px;font-size:12px;letter-spacing:.14em;color:#0072bc;font-weight:700;">PHONESELL</p>
                <h1 style="margin:0 0 16px;font-size:20px;">${escapeHtml(subject)}</h1>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#5b6b80;">${escapeHtml(body).replace(/\n/g, "<br/>")}</p>
                <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This email was sent by PhoneSell. Call ${BUSINESS.phoneDisplay} if you did not request it.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function gmailFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/534|535|5\.7\.14|5\.7\.8|Username and Password not accepted|Please log in via your web browser/i.test(message)) {
    return "Gmail blocked SMTP. Sign in to Gmail in your browser, open https://accounts.google.com/DisplayUnlockCaptcha, then send OTP again. Use a 16-character App Password with no spaces.";
  }
  return message;
}

export async function sendSmtpMail(settings: SmtpSettings, to: string, subject: string, text: string) {
  const pass = settings.pass?.replace(/\s/g, "");
  const isGmail = /gmail\.com/i.test(settings.host) || /gmail\.com/i.test(settings.user || "");
  const transporter = nodemailer.createTransport(
    isGmail
      ? {
          service: "gmail",
          auth: settings.user && pass ? { user: settings.user, pass } : undefined,
          connectionTimeout: 10_000,
          greetingTimeout: 10_000,
          socketTimeout: 15_000,
        }
      : {
          host: settings.host,
          port: settings.port,
          secure: settings.secure,
          requireTLS: settings.port === 587,
          auth: settings.user && pass ? { user: settings.user, pass } : undefined,
          connectionTimeout: 10_000,
          greetingTimeout: 10_000,
          socketTimeout: 15_000,
        },
  );

  try {
    await transporter.sendMail({
      from: isGmail && settings.user ? settings.user : settings.from,
      to,
      subject,
      text,
      html: htmlFromText(subject, text),
    });
  } catch (error) {
    throw new Error(gmailFriendlyError(error));
  }
}
