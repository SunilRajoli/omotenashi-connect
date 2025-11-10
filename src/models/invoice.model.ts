import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum InvoiceType {
  RECEIPT = 'receipt', // 領収書 (Japanese receipt)
  INVOICE = 'invoice', // 請求書 (Japanese invoice)
  QUOTE = 'quote', // 見積書 (Japanese quote)
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

interface InvoiceAttributes {
  id: string;
  business_id: string;
  booking_id?: string;
  customer_id?: string;
  invoice_number: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issue_date: Date;
  due_date?: Date;
  paid_date?: Date;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  tax_rate: number;
  items_json: Record<string, unknown>[];
  notes?: string;
  billing_address_json?: Record<string, unknown>;
  pdf_url?: string;
  pdf_storage_key?: string;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

type InvoiceCreationAttributes = Optional<InvoiceAttributes, 'id' | 'status' | 'currency' | 'tax_rate' | 'metadata' | 'created_at' | 'updated_at'>;

export class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
  declare id: string;
  declare business_id: string;
  declare booking_id?: string;
  declare customer_id?: string;
  declare invoice_number: string;
  declare type: InvoiceType;
  declare status: InvoiceStatus;
  declare issue_date: Date;
  declare due_date?: Date;
  declare paid_date?: Date;
  declare subtotal_cents: number;
  declare tax_cents: number;
  declare total_cents: number;
  declare currency: string;
  declare tax_rate: number;
  declare items_json: Record<string, unknown>[];
  declare notes?: string;
  declare billing_address_json?: Record<string, unknown>;
  declare pdf_url?: string;
  declare pdf_storage_key?: string;
  declare metadata: Record<string, unknown>;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initInvoice(sequelize: Sequelize): typeof Invoice {
  Invoice.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      business_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'businesses', key: 'id' },
        onDelete: 'CASCADE',
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'SET NULL',
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onDelete: 'SET NULL',
      },
      invoice_number: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(InvoiceType)),
        allowNull: false,
        defaultValue: InvoiceType.RECEIPT,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(InvoiceStatus)),
        allowNull: false,
        defaultValue: InvoiceStatus.DRAFT,
      },
      issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      paid_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      subtotal_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tax_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'JPY',
      },
      tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.1, // 10% default tax rate (Japan)
      },
      items_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      billing_address_json: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      pdf_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pdf_storage_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'invoices',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['business_id'] },
        { fields: ['booking_id'] },
        { fields: ['customer_id'] },
        { fields: ['invoice_number'] },
        { fields: ['status', 'issue_date'] },
      ],
    }
  );

  return Invoice;
}

