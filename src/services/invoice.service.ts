/**
 * Invoice Service
 * Handles invoice generation, PDF creation, and management
 */

import { Transaction, WhereOptions } from 'sequelize';
import PDFDocument from 'pdfkit';
import { sequelize } from '../config/sequelize';
import { Invoice, InvoiceType, InvoiceStatus } from '../models/invoice.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { BookingPayment, PaymentStatus } from '../models/bookingPayment.model';
import { Business } from '../models/business.model';
import { Service } from '../models/service.model';
import { Customer } from '../models/customer.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { Locale } from '../types/enums';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3, S3_BUCKET } from '../config/storage';
import { env } from '../config/env';

export interface CreateInvoiceRequest {
  business_id: string;
  booking_id?: string;
  customer_id?: string;
  type: InvoiceType;
  items: Array<{
    description: string;
    description_ja?: string;
    quantity: number;
    unit_price_cents: number;
    tax_rate?: number;
  }>;
  notes?: string;
  billing_address?: {
    company_name?: string;
    name?: string;
    postal_code?: string;
    prefecture?: string;
    city?: string;
    street?: string;
    building?: string;
    phone?: string;
    email?: string;
  };
  tax_rate?: number;
  due_date?: string;
}

export interface InvoiceQueryParams {
  business_id?: string;
  booking_id?: string;
  customer_id?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  page?: number;
  limit?: number;
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber(businessId: string, type: InvoiceType): string {
  const prefix = type === InvoiceType.RECEIPT ? 'REC' : type === InvoiceType.INVOICE ? 'INV' : 'QUO';
  const timestamp = Date.now().toString(36).toUpperCase();
  const shortId = businessId.substring(0, 8).toUpperCase();
  return `${prefix}-${shortId}-${timestamp}`;
}

/**
 * Generate PDF for invoice (Japanese format - 領収書)
 */
async function generateInvoicePDF(
  invoice: Invoice,
  business: Business,
  customer: Customer | null,
  locale: Locale = Locale.JA
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Title (領収書 = Receipt)
      const title = invoice.type === InvoiceType.RECEIPT
        ? (locale === Locale.JA ? '領収書' : 'Receipt')
        : invoice.type === InvoiceType.INVOICE
        ? (locale === Locale.JA ? '請求書' : 'Invoice')
        : (locale === Locale.JA ? '見積書' : 'Quote');

      doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown(2);

      // Business Information (左側 = Left side)
      const businessName = locale === Locale.JA
        ? (business.display_name_ja || business.display_name_en || business.slug)
        : (business.display_name_en || business.display_name_ja || business.slug);

      doc.fontSize(12).font('Helvetica-Bold').text(locale === Locale.JA ? '発行者' : 'Issued By', 50, 150);
      doc.font('Helvetica').fontSize(10);
      doc.text(businessName, 50, 170);

      if (business.postal_code || business.prefecture || business.city) {
        const address = [
          business.postal_code,
          business.prefecture,
          business.city,
          business.street,
          business.building,
        ]
          .filter(Boolean)
          .join(' ');
        doc.text(address, 50, 190);
      }

      if (business.phone) {
        doc.text(`${locale === Locale.JA ? 'TEL' : 'Phone'}: ${business.phone}`, 50, 210);
      }
      if (business.email) {
        doc.text(`${locale === Locale.JA ? 'Email' : 'Email'}: ${business.email}`, 50, 230);
      }

      // Customer Information (右側 = Right side)
      const customerName = customer?.name || customer?.email || (locale === Locale.JA ? 'お客様' : 'Customer');
      const billingAddress = invoice.billing_address_json as CreateInvoiceRequest['billing_address'] | undefined;

      doc.font('Helvetica-Bold').fontSize(12).text(
        locale === Locale.JA ? '宛先' : 'Bill To',
        350,
        150
      );
      doc.font('Helvetica').fontSize(10);

      if (billingAddress?.company_name) {
        doc.text(billingAddress.company_name, 350, 170);
        doc.text(billingAddress.name || '', 350, 190);
      } else {
        doc.text(customerName, 350, 170);
      }

      if (billingAddress) {
        const address = [
          billingAddress.postal_code,
          billingAddress.prefecture,
          billingAddress.city,
          billingAddress.street,
          billingAddress.building,
        ]
          .filter(Boolean)
          .join(' ');
        if (address) {
          doc.text(address, 350, billingAddress.company_name ? 210 : 190);
        }
        if (billingAddress.phone) {
          doc.text(`${locale === Locale.JA ? 'TEL' : 'Phone'}: ${billingAddress.phone}`, 350, billingAddress.postal_code ? 230 : 210);
        }
        if (billingAddress.email) {
          doc.text(`${locale === Locale.JA ? 'Email' : 'Email'}: ${billingAddress.email}`, 350, billingAddress.phone ? 250 : 230);
        }
      } else if (customer) {
        if (customer.phone) {
          doc.text(`${locale === Locale.JA ? 'TEL' : 'Phone'}: ${customer.phone}`, 350, 190);
        }
        if (customer.email) {
          doc.text(`${locale === Locale.JA ? 'Email' : 'Email'}: ${customer.email}`, 350, 210);
        }
      }

      // Invoice Details
      doc.moveDown(4);
      const yPos = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text(locale === Locale.JA ? '請求書番号' : 'Invoice Number', 50, yPos);
      doc.text(invoice.invoice_number, 200, yPos);

      doc.text(locale === Locale.JA ? '発行日' : 'Issue Date', 50, yPos + 20);
      doc.text(
        new Date(invoice.issue_date).toLocaleDateString(locale === Locale.JA ? 'ja-JP' : 'en-US'),
        200,
        yPos + 20
      );

      if (invoice.due_date) {
        doc.text(locale === Locale.JA ? '支払期限' : 'Due Date', 50, yPos + 40);
        doc.text(
          new Date(invoice.due_date).toLocaleDateString(locale === Locale.JA ? 'ja-JP' : 'en-US'),
          200,
          yPos + 40
        );
      }

      if (invoice.booking_id) {
        doc.text(locale === Locale.JA ? '予約ID' : 'Booking ID', 350, yPos);
        doc.font('Helvetica').text(invoice.booking_id.substring(0, 8), 450, yPos);
      }

      // Items Table
      doc.moveDown(3);
      const tableY = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);

      // Table Header
      doc.rect(50, tableY, 500, 25).stroke();
      doc.text(locale === Locale.JA ? '項目' : 'Item', 55, tableY + 8);
      doc.text(locale === Locale.JA ? '数量' : 'Qty', 350, tableY + 8);
      doc.text(locale === Locale.JA ? '単価' : 'Unit Price', 400, tableY + 8);
      doc.text(locale === Locale.JA ? '金額' : 'Amount', 480, tableY + 8);

      // Table Rows
      let currentY = tableY + 25;
      const items = invoice.items_json as CreateInvoiceRequest['items'];
      doc.font('Helvetica').fontSize(9);

      for (const item of items) {
        doc.rect(50, currentY, 500, 30).stroke();
        const description = locale === Locale.JA && item.description_ja
          ? item.description_ja
          : item.description;
        doc.text(description, 55, currentY + 10, { width: 280 });
        doc.text(item.quantity.toString(), 350, currentY + 10);
        doc.text(`¥${(item.unit_price_cents / 100).toLocaleString()}`, 400, currentY + 10);
        const itemTotal = item.quantity * item.unit_price_cents;
        doc.text(`¥${(itemTotal / 100).toLocaleString()}`, 480, currentY + 10);
        currentY += 30;
      }

      // Totals
      const subtotalY = currentY;
      doc.rect(50, subtotalY, 500, 25).stroke();
      doc.font('Helvetica-Bold');
      doc.text(locale === Locale.JA ? '小計' : 'Subtotal', 400, subtotalY + 8);
      doc.text(`¥${(invoice.subtotal_cents / 100).toLocaleString()}`, 480, subtotalY + 8);

      if (invoice.tax_cents > 0) {
        const taxY = subtotalY + 25;
        doc.rect(50, taxY, 500, 25).stroke();
        doc.text(
          `${locale === Locale.JA ? '消費税' : 'Tax'} (${(Number(invoice.tax_rate) * 100).toFixed(0)}%)`,
          400,
          taxY + 8
        );
        doc.text(`¥${(invoice.tax_cents / 100).toLocaleString()}`, 480, taxY + 8);
      }

      const totalY = invoice.tax_cents > 0 ? subtotalY + 50 : subtotalY + 25;
      doc.rect(50, totalY, 500, 30).stroke();
      doc.fontSize(12);
      doc.text(locale === Locale.JA ? '合計' : 'Total', 400, totalY + 10);
      doc.text(`¥${(invoice.total_cents / 100).toLocaleString()}`, 480, totalY + 10);

      // Notes
      if (invoice.notes) {
        doc.moveDown(2);
        doc.font('Helvetica').fontSize(9);
        doc.text(locale === Locale.JA ? '備考' : 'Notes', 50, doc.y);
        doc.text(invoice.notes, 50, doc.y + 15, { width: 500 });
      }

      // Footer
      doc.fontSize(8).font('Helvetica');
      const footerY = 750;
      doc.text(
        locale === Locale.JA
          ? 'この領収書は自動生成されたものです。'
          : 'This invoice was automatically generated.',
        50,
        footerY,
        { align: 'center', width: 500 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Upload PDF to S3
 */
async function uploadPDFToS3(pdfBuffer: Buffer, key: string): Promise<string> {
  try {
    const client = (await s3.getClient()) as S3Client;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'public-read',
    });

    await client.send(command);

    const url = `https://${S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    logger.info({ key, size: pdfBuffer.length }, 'PDF uploaded to S3');

    return url;
  } catch (error) {
    logger.error({ error, key }, 'Failed to upload PDF to S3');
    throw error;
  }
}

/**
 * Create invoice from booking
 */
export async function createInvoiceFromBooking(
  bookingId: string,
  data: {
    type?: InvoiceType;
    billing_address?: CreateInvoiceRequest['billing_address'];
    notes?: string;
    tax_rate?: number;
  },
  userId?: string,
  userRole?: string
): Promise<Invoice> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Get booking with related data
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Business, as: 'business' },
        { model: Service, as: 'service' },
        { model: Customer, as: 'customer' },
      ],
      transaction,
    });

    if (!booking || booking.deleted_at) {
      throw new NotFoundError('Booking not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      const business = booking.get('business') as Business | undefined;
      if (business && business.owner_id !== userId) {
        const customer = booking.get('customer') as Customer | undefined;
        if (!customer || customer.user_id !== userId) {
          throw new ForbiddenError('Access denied');
        }
      }
    }

    // Check if booking has been paid
    const payments = await BookingPayment.findAll({
      where: {
        booking_id: bookingId,
        status: PaymentStatus.SUCCEEDED,
      },
      transaction,
    });

    if (payments.length === 0 && booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestError('Booking must be paid or completed before generating invoice');
    }

    // Get price snapshot
    const priceSnapshot = booking.price_snapshot_json as {
      final_price_cents?: number;
      base_price_cents?: number;
      service_name_ja?: string;
      service_name_en?: string;
    } | undefined;

    const totalAmountCents = priceSnapshot?.final_price_cents || priceSnapshot?.base_price_cents || 0;

    if (totalAmountCents === 0) {
      throw new BadRequestError('Booking has no amount to invoice');
    }

    // Calculate tax
    const taxRate = data.tax_rate ?? 0.1; // Default 10% (Japan)
    const subtotalCents = Math.round(totalAmountCents / (1 + taxRate));
    const taxCents = totalAmountCents - subtotalCents;

    // Create invoice items
    const service = booking.get('service') as Service | undefined;
    const serviceName = service?.name_ja || service?.name_en || 'Service';
    const serviceNameJa = service?.name_ja || serviceName;

    const items: CreateInvoiceRequest['items'] = [
      {
        description: serviceName,
        description_ja: serviceNameJa,
        quantity: 1,
        unit_price_cents: subtotalCents,
        tax_rate: taxRate,
      },
    ];

    // Generate invoice number
    const business = booking.get('business') as Business | undefined;
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    const invoiceType = data.type || InvoiceType.RECEIPT;
    const invoiceNumber = generateInvoiceNumber(business.id, invoiceType);

    // Create invoice
    const invoice = await Invoice.create(
      {
        business_id: booking.business_id,
        booking_id: bookingId,
        customer_id: booking.customer_id || undefined,
        invoice_number: invoiceNumber,
        type: invoiceType,
        status: InvoiceStatus.ISSUED,
        issue_date: new Date(),
        due_date: data.billing_address ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // 30 days for corporate
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        total_cents: totalAmountCents,
        currency: 'JPY',
        tax_rate: taxRate,
        items_json: items,
        notes: data.notes,
        billing_address_json: data.billing_address,
        metadata: {
          booking_id: bookingId,
          created_by: userId,
        },
      },
      { transaction }
    );

    // Generate and upload PDF
    try {
      const customer = booking.get('customer') as Customer | null;
      const pdfBuffer = await generateInvoicePDF(invoice, business, customer, Locale.JA);
      const pdfKey = `invoices/${business.id}/${invoice.id}.pdf`;
      const pdfUrl = await uploadPDFToS3(pdfBuffer, pdfKey);

      await invoice.update(
        {
          pdf_url: pdfUrl,
          pdf_storage_key: pdfKey,
        },
        { transaction }
      );

      logger.info({ invoiceId: invoice.id, bookingId }, 'Invoice created and PDF generated');
    } catch (error) {
      logger.error({ invoiceId: invoice.id, error }, 'Failed to generate PDF for invoice');
      // Don't fail invoice creation if PDF generation fails
    }

    return invoice.reload({ transaction });
  });
}

/**
 * Create custom invoice
 */
export async function createInvoice(
  data: CreateInvoiceRequest,
  userId?: string,
  userRole?: string
): Promise<Invoice> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists
    const business = await Business.findByPk(data.business_id, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      if (business.owner_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }

    // Verify booking if provided
    if (data.booking_id) {
      const booking = await Booking.findByPk(data.booking_id, { transaction });
      if (!booking || booking.deleted_at || booking.business_id !== data.business_id) {
        throw new BadRequestError('Invalid booking');
      }
    }

    // Verify customer if provided
    if (data.customer_id) {
      const customer = await Customer.findByPk(data.customer_id, { transaction });
      if (!customer || customer.deleted_at || customer.business_id !== data.business_id) {
        throw new BadRequestError('Invalid customer');
      }
    }

    // Calculate totals
    const taxRate = data.tax_rate ?? 0.1;
    let subtotalCents = 0;

    for (const item of data.items) {
      const itemTotal = item.quantity * item.unit_price_cents;
      const itemTaxRate = item.tax_rate ?? taxRate;
      subtotalCents += Math.round(itemTotal / (1 + itemTaxRate));
    }

    const totalCents = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price_cents, 0);
    const taxCents = totalCents - subtotalCents;

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber(data.business_id, data.type);

    // Create invoice
    const invoice = await Invoice.create(
      {
        business_id: data.business_id,
        booking_id: data.booking_id,
        customer_id: data.customer_id,
        invoice_number: invoiceNumber,
        type: data.type,
        status: InvoiceStatus.ISSUED,
        issue_date: new Date(),
        due_date: data.due_date ? new Date(data.due_date) : undefined,
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        currency: 'JPY',
        tax_rate: taxRate,
        items_json: data.items,
        notes: data.notes,
        billing_address_json: data.billing_address,
        metadata: {
          created_by: userId,
        },
      },
      { transaction }
    );

    // Generate and upload PDF
    try {
      const customer = data.customer_id
        ? await Customer.findByPk(data.customer_id, { transaction })
        : null;
      const pdfBuffer = await generateInvoicePDF(invoice, business, customer, Locale.JA);
      const pdfKey = `invoices/${data.business_id}/${invoice.id}.pdf`;
      const pdfUrl = await uploadPDFToS3(pdfBuffer, pdfKey);

      await invoice.update(
        {
          pdf_url: pdfUrl,
          pdf_storage_key: pdfKey,
        },
        { transaction }
      );

      logger.info({ invoiceId: invoice.id }, 'Invoice created and PDF generated');
    } catch (error) {
      logger.error({ invoiceId: invoice.id, error }, 'Failed to generate PDF for invoice');
    }

    return invoice.reload({ transaction });
  });
}

/**
 * Get invoice by ID
 */
export async function getInvoice(
  invoiceId: string,
  userId?: string,
  userRole?: string
): Promise<Invoice> {
  const invoice = await Invoice.findByPk(invoiceId, {
    include: [
      { model: Business, as: 'business' },
      { model: Booking, as: 'booking' },
      { model: Customer, as: 'customer' },
    ],
  });

  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Access control
  if (userRole !== 'admin' && userId) {
    const business = invoice.get('business') as Business | undefined;
    if (business && business.owner_id !== userId) {
      const customer = invoice.get('customer') as Customer | undefined;
      if (!customer || customer.user_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }
  }

  return invoice;
}

/**
 * List invoices
 */
export async function listInvoices(
  query: InvoiceQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ invoices: Invoice[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.business_id) {
    where.business_id = query.business_id;
  }
  if (query.booking_id) {
    where.booking_id = query.booking_id;
  }
  if (query.customer_id) {
    where.customer_id = query.customer_id;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.status) {
    where.status = query.status;
  }

  // Access control
  if (userRole !== 'admin' && userId) {
    // Users can only see invoices for their businesses or their own invoices
    const business = query.business_id
      ? await Business.findByPk(query.business_id)
      : null;
    if (business && business.owner_id !== userId) {
      // Check if user is a customer
      const customer = query.customer_id
        ? await Customer.findByPk(query.customer_id)
        : null;
      if (!customer || customer.user_id !== userId) {
        return { invoices: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
      }
      where.customer_id = customer.id;
    }
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Invoice.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business' },
      { model: Booking, as: 'booking' },
      { model: Customer, as: 'customer' },
    ],
    order: [['issue_date', 'DESC']],
    limit,
    offset,
  });

  return {
    invoices: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
  userId?: string,
  userRole?: string
): Promise<Invoice> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const invoice = await Invoice.findByPk(invoiceId, { transaction });
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      const business = await Business.findByPk(invoice.business_id, { transaction });
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }

    // Update status
    const updateData: { status: InvoiceStatus; paid_date?: Date } = { status };

    if (status === InvoiceStatus.PAID && !invoice.paid_date) {
      updateData.paid_date = new Date();
    }

    await invoice.update(updateData, { transaction });

    logger.info({ invoiceId: invoice.id, status }, 'Invoice status updated');

    return invoice.reload({ transaction });
  });
}

/**
 * Regenerate PDF for invoice
 */
export async function regenerateInvoicePDF(
  invoiceId: string,
  userId?: string,
  userRole?: string
): Promise<Invoice> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const invoice = await Invoice.findByPk(invoiceId, {
      include: [
        { model: Business, as: 'business' },
        { model: Customer, as: 'customer' },
      ],
      transaction,
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      const business = invoice.get('business') as Business | undefined;
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }

    // Generate and upload PDF
    const business = invoice.get('business') as Business;
    const customer = invoice.get('customer') as Customer | null;
    const pdfBuffer = await generateInvoicePDF(invoice, business, customer, Locale.JA);
    const pdfKey = invoice.pdf_storage_key || `invoices/${invoice.business_id}/${invoice.id}.pdf`;
    const pdfUrl = await uploadPDFToS3(pdfBuffer, pdfKey);

    await invoice.update(
      {
        pdf_url: pdfUrl,
        pdf_storage_key: pdfKey,
      },
      { transaction }
    );

    logger.info({ invoiceId: invoice.id }, 'Invoice PDF regenerated');

    return invoice.reload({ transaction });
  });
}

