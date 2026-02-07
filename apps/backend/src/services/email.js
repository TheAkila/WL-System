import nodemailer from 'nodemailer'

// Create transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail app password
    },
  })
}

// Send email
export async function sendEmail({ to, subject, html }) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Lifting Social" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email send error:', error)
    return { success: false, error }
  }
}

// Order Confirmation Email
export function getOrderConfirmationEmail(orderData) {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br/>
        <span style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        LKR ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #000000; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Lifting Social</h1>
                </td>
              </tr>

              <!-- Success Icon -->
              <tr>
                <td style="padding: 40px 30px 20px; text-align: center;">
                  <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 40px;">✓</span>
                  </div>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <h2 style="margin: 0 0 10px; color: #000000; font-size: 24px;">Order Confirmed!</h2>
                  <p style="margin: 0; color: #666666; font-size: 16px;">
                    Thank you for your order, ${orderData.customerName}!
                  </p>
                  <p style="margin: 10px 0 0; color: #666666; font-size: 14px;">
                    Order Number: <strong style="color: #000000;">${orderData.orderNumber}</strong>
                  </p>
                </td>
              </tr>

              <!-- Order Items -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <h3 style="margin: 0 0 20px; color: #000000; font-size: 18px;">Order Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    ${itemsHtml}
                    <tr>
                      <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <strong>Subtotal</strong>
                      </td>
                      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                        LKR ${orderData.subtotal.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <strong>Shipping</strong>
                      </td>
                      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                        LKR ${orderData.shipping.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; background-color: #f9f9f9;">
                        <strong style="font-size: 18px;">Total</strong>
                      </td>
                      <td style="padding: 12px; background-color: #f9f9f9; text-align: right;">
                        <strong style="font-size: 18px; color: #000000;">LKR ${orderData.total.toLocaleString()}</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Shipping Address -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <h3 style="margin: 0 0 15px; color: #000000; font-size: 18px;">Shipping Address</h3>
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; color: #333333; line-height: 1.6;">
                    <strong>${orderData.shippingAddress.fullName}</strong><br/>
                    ${orderData.shippingAddress.address}<br/>
                    ${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode || ''}<br/>
                    Phone: ${orderData.shippingAddress.phone}
                  </div>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding: 0 30px 40px; text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}" style="display: inline-block; padding: 15px 40px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Track Your Order
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eee;">
                  <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:support@liftingsocial.lk" style="color: #000000;">support@liftingsocial.lk</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © 2026 Lifting Social. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// Order Status Update Email
export function getOrderStatusUpdateEmail(data) {
  const statusMessages = {
    processing: {
      title: 'Order is Being Processed',
      message: 'We are preparing your order for shipment.',
      color: '#3b82f6',
    },
    shipped: {
      title: 'Order Shipped!',
      message: 'Your order is on its way to you.',
      color: '#10b981',
    },
    delivered: {
      title: 'Order Delivered',
      message: 'Your order has been successfully delivered. Thank you for shopping with us!',
      color: '#059669',
    },
    cancelled: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If you have any questions, please contact us.',
      color: '#ef4444',
    },
  }

  const statusInfo = statusMessages[data.status] || statusMessages.processing

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #000000; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Lifting Social</h1>
                </td>
              </tr>

              <!-- Status Update -->
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <div style="width: 80px; height: 80px; background-color: ${statusInfo.color}; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 40px;">📦</span>
                  </div>
                  <h2 style="margin: 0 0 10px; color: #000000; font-size: 24px;">${statusInfo.title}</h2>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px;">
                    Hi ${data.customerName},
                  </p>
                  <p style="margin: 0; color: #666666; font-size: 16px;">
                    ${statusInfo.message}
                  </p>
                </td>
              </tr>

              <!-- Order Info -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
                    <p style="margin: 0 0 5px; color: #666666; font-size: 14px;">Order Number</p>
                    <p style="margin: 0; color: #000000; font-size: 18px; font-weight: bold;">${data.orderNumber}</p>
                    ${
                      data.trackingNumber
                        ? `
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                    <p style="margin: 0 0 5px; color: #666666; font-size: 14px;">Tracking Number</p>
                    <p style="margin: 0; color: #000000; font-size: 16px; font-weight: bold;">${data.trackingNumber}</p>
                    `
                        : ''
                    }
                  </div>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding: 0 30px 40px; text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}/dashboard" style="display: inline-block; padding: 15px 40px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    View Order Details
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eee;">
                  <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:support@liftingsocial.lk" style="color: #000000;">support@liftingsocial.lk</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © 2026 Lifting Social. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}
