import nodemailer from "nodemailer";

// Configure email transporter (update with your SMTP settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const orderConfirmationTemplate = (order, user) => `
  <h2>Order Confirmation</h2>
  <p>Dear ${user.name},</p>
  <p>Thank you for your order! Your order #${order._id} has been confirmed.</p>
  
  <h3>Order Details:</h3>
  <ul>
    ${order.items.map(item => `<li>${item.name} x ${item.quantity} - Rs.${item.price}</li>`).join("")}
  </ul>
  <p><strong>Total: Rs.${order.totalAmount}</strong></p>
  
  <h3>Shipping Address:</h3>
  <p>${order.shippingAddress?.fullName}<br/>
  ${order.shippingAddress?.addressLine1}<br/>
  ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}</p>
  
  <p>We will notify you when your order is shipped.</p>
  <p>Best regards,<br/>Handmade Crafts Team</p>
`;

// Send order confirmation email
export const sendOrderConfirmation = async (order, user) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Email notifications disabled - SMTP not configured");
    return false;
  }

  try {
    await transporter.sendMail({
      from: '"Handmade Crafts" <noreply@handmade.com>',
      to: user.email,
      subject: `Order Confirmed - #${order._id}`,
      html: orderConfirmationTemplate(order, user)
    });
    console.log(`Order confirmation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return false;
  }
};

// WhatsApp notification (using WhatsApp Business API or third-party service)
export const sendWhatsAppNotification = async (order, phone) => {
  if (!process.env.WHATSAPP_API_URL || !process.env.WHATSAPP_TOKEN) {
    console.log("WhatsApp notifications disabled - API not configured");
    return false;
  }

  const message = `*New Order Received*\n\nOrder #${order._id}\nTotal: Rs.${order.totalAmount}\nItems: ${order.items.length}\n\nCustomer: ${order.shippingAddress?.fullName}\nPhone: ${phone}`;

  try {
    const response = await fetch(process.env.WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message }
      })
    });
    console.log(`WhatsApp notification sent, status: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
    return false;
  }
};