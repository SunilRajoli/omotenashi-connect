/**
 * Booking QR Code Model
 * Stores QR codes for bookings and check-in tracking
 */

import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum QrCodeStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

interface BookingQrCodeAttributes {
  id: string;
  booking_id: string;
  qr_code: string;
  qr_code_hash: string;
  expires_at: Date;
  used_at?: Date;
  used_by?: string; // staff user_id
  status: QrCodeStatus;
  created_at: Date;
  updated_at: Date;
}

type BookingQrCodeCreationAttributes = Optional<BookingQrCodeAttributes, 'id' | 'status' | 'created_at' | 'updated_at'>;

export class BookingQrCode extends Model<BookingQrCodeAttributes, BookingQrCodeCreationAttributes> implements BookingQrCodeAttributes {
  declare id: string;
  declare booking_id: string;
  declare qr_code: string;
  declare qr_code_hash: string;
  declare expires_at: Date;
  declare used_at?: Date;
  declare used_by?: string;
  declare status: QrCodeStatus;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initBookingQrCode(sequelize: Sequelize): typeof BookingQrCode {
  BookingQrCode.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE',
      },
      qr_code: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      qr_code_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      used_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(QrCodeStatus)),
        allowNull: false,
        defaultValue: QrCodeStatus.ACTIVE,
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
      tableName: 'booking_qr_codes',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['booking_id'] },
        { fields: ['qr_code_hash'] },
        { fields: ['status'] },
        { fields: ['expires_at'] },
      ],
    }
  );

  return BookingQrCode;
}

