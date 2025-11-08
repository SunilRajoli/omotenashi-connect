import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum PaymentMode {
  DEPOSIT = 'deposit',
  FULL = 'full',
  HOLD = 'hold',
  PAY_ON_ARRIVAL = 'pay_on_arrival',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

interface BookingPaymentAttributes {
  id: string;
  booking_id: string;
  provider?: string;
  provider_charge_id?: string;
  provider_intent_id?: string;
  amount_cents: number;
  currency: string;
  mode: PaymentMode;
  status: PaymentStatus;
  raw_response?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

type BookingPaymentCreationAttributes = Optional<BookingPaymentAttributes, 'id' | 'currency' | 'status' | 'created_at' | 'updated_at'>;

export class BookingPayment extends Model<BookingPaymentAttributes, BookingPaymentCreationAttributes> implements BookingPaymentAttributes {
  declare id: string;
  declare booking_id: string;
  declare provider?: string;
  declare provider_charge_id?: string;
  declare provider_intent_id?: string;
  declare amount_cents: number;
  declare currency: string;
  declare mode: PaymentMode;
  declare status: PaymentStatus;
  declare raw_response?: Record<string, any>;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initBookingPayment(sequelize: Sequelize): typeof BookingPayment {
  BookingPayment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE',
      },
      provider: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      provider_charge_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      provider_intent_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      amount_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      currency: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'JPY',
      },
      mode: {
        type: DataTypes.ENUM(...Object.values(PaymentMode)),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(PaymentStatus)),
        allowNull: false,
        defaultValue: PaymentStatus.PENDING,
      },
      raw_response: {
        type: DataTypes.JSONB,
        allowNull: true,
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
      tableName: 'booking_payments',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['booking_id'] },
        { fields: ['status', 'created_at'] },
      ],
    }
  );

  return BookingPayment;
}

