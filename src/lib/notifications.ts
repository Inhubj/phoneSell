import { prisma } from "./prisma";
import { BUSINESS } from "./constants";
import { resolveSmtpSettings, sendSmtpMail } from "./smtp";

export type NotifyInput = {
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  eventType: string;
  recipient: string;
  subject?: string;
  body: string;
  orderId?: string;
  actorId?: string;
};

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

export const TEMPLATES: Record<string, { subject?: string; sms: string; email: string }> = {
  ORDER_CONFIRMATION: {
    subject: "Your pickup request {{orderNumber}} is confirmed",
    sms: "PhoneSell: Request {{orderNumber}} received. Est. value {{price}}. Pickup {{date}} {{slot}}. Call {{phone}}",
    email: "Hello {{name}}, your phone sale request {{orderNumber}} has been submitted. Estimated value {{price}}. Pickup {{date}} {{slot}}. Our executive will contact you. Call {{phone}}.",
  },
  PICKUP_SCHEDULED: {
    subject: "Pickup scheduled for {{orderNumber}}",
    sms: "Pickup for {{orderNumber}} is scheduled on {{date}} {{slot}}. PhoneSell {{phone}}",
    email: "Your doorstep pickup for {{orderNumber}} is scheduled on {{date}} between {{slot}}.",
  },
  EXECUTIVE_ASSIGNED: {
    subject: "Pickup executive assigned for {{orderNumber}}",
    sms: "Executive {{executive}} will collect your phone for {{orderNumber}}. PhoneSell",
    email: "Pickup executive {{executive}} ({{executiveMobile}}) has been assigned to order {{orderNumber}}.",
  },
  EXECUTIVE_ARRIVING: {
    sms: "Our executive is on the way for {{orderNumber}}. Please keep the device ready. PhoneSell",
    email: "Our pickup executive is on the way to collect your device for order {{orderNumber}}.",
  },
  DEVICE_COLLECTED: {
    sms: "Device collected for {{orderNumber}}. Inspection will follow. PhoneSell {{phone}}",
    email: "We have collected your device for {{orderNumber}}. Inspection will be completed shortly.",
  },
  PRICE_REVISED: {
    sms: "Revised offer for {{orderNumber}}: {{price}}. Please confirm. PhoneSell {{phone}}",
    email: "After inspection, the revised purchase price for {{orderNumber}} is {{price}}. Please confirm acceptance.",
  },
  PAYMENT_COMPLETED: {
    sms: "Payment of {{price}} completed for {{orderNumber}}. Thank you. PhoneSell",
    email: "Payment of {{price}} for order {{orderNumber}} has been marked completed. Thank you for selling with PhoneSell.",
  },
};

export async function sendNotification(input: NotifyInput, vars: Record<string, string> = {}) {
  const cfg = await prisma.notificationConfig.findUnique({
    where: { channel: input.channel },
  });
  const smtp = input.channel === "EMAIL" ? resolveSmtpSettings(cfg?.configJson) : null;
  const enabled = input.channel === "EMAIL" ? Boolean(smtp) : Boolean(cfg?.isEnabled);
  const provider = input.channel === "EMAIL" ? "smtp" : cfg?.provider ?? "console";
  const body = interpolate(input.body, { phone: BUSINESS.phone, ...vars });
  const subject = input.subject
    ? interpolate(input.subject, { phone: BUSINESS.phone, ...vars })
    : null;

  const record = await prisma.notification.create({
    data: {
      orderId: input.orderId,
      actorId: input.actorId,
      channel: input.channel,
      eventType: input.eventType,
      recipient: input.recipient,
      subject,
      body,
      provider,
      status: enabled ? "QUEUED" : "LOGGED",
    },
  });

  if (!enabled) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[notify:console]", input.channel, input.eventType, input.recipient);
    }
    return {
      status: "LOGGED" as const,
      error:
        input.channel === "EMAIL"
          ? "SMTP is not configured on this server. Add SMTP_HOST, SMTP_USER and SMTP_PASS in Vercel → Settings → Environment Variables, then redeploy."
          : undefined,
    };
  }

  try {
    if (input.channel === "EMAIL") {
      if (!smtp) {
        await prisma.notification.update({
          where: { id: record.id },
          data: {
            status: "PENDING_PROVIDER",
            error: "SMTP is not configured. Set SMTP_HOST in env or Admin → Notifications.",
          },
        });
        return { status: "PENDING_PROVIDER" as const, error: "SMTP is not configured." };
      }
      await sendSmtpMail(smtp, input.recipient, subject || "PhoneSell", body);
      await prisma.notification.update({
        where: { id: record.id },
        data: { status: "SENT", sentAt: new Date(), error: null, provider: "smtp" },
      });
      return { status: "SENT" as const };
    }

    await prisma.notification.update({
      where: { id: record.id },
      data: {
        status: "PENDING_PROVIDER",
        error: `Provider "${provider}" is enabled but credentials are not connected yet.`,
      },
    });
    return { status: "PENDING_PROVIDER" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.notification.update({
      where: { id: record.id },
      data: { status: "FAILED", error: message },
    });
    return { status: "FAILED" as const, error: message };
  }
}

export async function notifyOrderEvent(
  eventType: keyof typeof TEMPLATES,
  order: {
    id: string;
    orderNumber: string;
    estimatedPrice: number;
    finalPrice?: number | null;
    pickupDate?: Date | null;
    customer: { fullName: string; mobile: string; email?: string | null };
    pickupSlot?: { label: string } | null;
    assignment?: { executive: { name: string; mobile: string } } | null;
  },
) {
  const tpl = TEMPLATES[eventType];
  const price = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(order.finalPrice ?? order.estimatedPrice);
  const vars = {
    orderNumber: order.orderNumber,
    name: order.customer.fullName,
    price,
    date: order.pickupDate
      ? order.pickupDate.toLocaleDateString("en-IN")
      : "TBD",
    slot: order.pickupSlot?.label ?? "TBD",
    phone: BUSINESS.phone,
    executive: order.assignment?.executive.name ?? "our executive",
    executiveMobile: order.assignment?.executive.mobile ?? BUSINESS.phone,
  };

  await sendNotification(
    {
      channel: "SMS",
      eventType,
      recipient: order.customer.mobile,
      body: tpl.sms,
      orderId: order.id,
    },
    vars,
  );
  await sendNotification(
    {
      channel: "WHATSAPP",
      eventType,
      recipient: order.customer.mobile,
      body: tpl.sms,
      orderId: order.id,
    },
    vars,
  );
  if (order.customer.email) {
    await sendNotification(
      {
        channel: "EMAIL",
        eventType,
        recipient: order.customer.email,
        subject: tpl.subject,
        body: tpl.email,
        orderId: order.id,
      },
      vars,
    );
  }
}
