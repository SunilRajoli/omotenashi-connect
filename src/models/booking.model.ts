import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum BookingStatus {
  PENDING = 'pending',
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  EXPIRED = 'expired',
}

export enum BookingSource {
  WEB = 'web',
  OWNER_PORTAL = 'owner_portal',
  PHONE = 'phone',
  IMPORT = 'import',
}

interface BookingAttributes {
  id: string;
  business_id: string;
  service_id?: string;
  resource_id?: string;
  customer_id?: string;
  start_at: Date;
  end_at: Date;
  status: BookingStatus;
  source: BookingSource;
  price_snapshot_json?: Record<string, unknown>;
  policy_snapshot_json?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

type BookingCreationAttributes = Optional<BookingAttributes, 'id' | 'source' | 'metadata' | 'created_at' | 'updated_at'>;

export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  declare id: string;
  declare business_id: string;
  declare service_id?: string;
  declare resource_id?: string;
  declare customer_id?: string;
  declare start_at: Date;
  declare end_at: Date;
  declare status: BookingStatus;
  declare source: BookingSource;
  declare price_snapshot_json?: Record<string, unknown>;
  declare policy_snapshot_json?: Record<string, unknown>;
  declare metadata: Record<string, unknown>;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initBooking(sequelize: Sequelize): typeof Booking {
  Booking.init(
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
      service_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'services', key: 'id' },
      },
      resource_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'resources', key: 'id' },
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      start_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(BookingStatus)),
        allowNull: false,
      },
      source: {
        type: DataTypes.ENUM(...Object.values(BookingSource)),
        allowNull: false,
        defaultValue: BookingSource.WEB,
      },
      price_snapshot_json: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      policy_snapshot_json: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      deleted_at: {
        type: DataTypes.DATE,
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
      tableName: 'bookings',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['business_id', 'start_at'] },
        { fields: ['customer_id'] },
      ],
    }
  );

  return Booking;
}

