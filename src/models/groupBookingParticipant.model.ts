/**
 * Group Booking Participant Model
 * Stores individual participants in group bookings
 */

import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum ParticipantPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

interface GroupBookingParticipantAttributes {
  id: string;
  group_booking_id: string;
  customer_id: string;
  amount_owed_cents: number;
  payment_status: ParticipantPaymentStatus;
  checked_in: boolean;
  checked_in_at?: Date;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

type GroupBookingParticipantCreationAttributes = Optional<GroupBookingParticipantAttributes, 'id' | 'payment_status' | 'checked_in' | 'metadata' | 'created_at' | 'updated_at'>;

export class GroupBookingParticipant extends Model<GroupBookingParticipantAttributes, GroupBookingParticipantCreationAttributes> implements GroupBookingParticipantAttributes {
  declare id: string;
  declare group_booking_id: string;
  declare customer_id: string;
  declare amount_owed_cents: number;
  declare payment_status: ParticipantPaymentStatus;
  declare checked_in: boolean;
  declare checked_in_at?: Date;
  declare metadata: Record<string, unknown>;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initGroupBookingParticipant(sequelize: Sequelize): typeof GroupBookingParticipant {
  GroupBookingParticipant.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      group_booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'group_bookings', key: 'id' },
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
      },
      amount_owed_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      payment_status: {
        type: DataTypes.ENUM(...Object.values(ParticipantPaymentStatus)),
        allowNull: false,
        defaultValue: ParticipantPaymentStatus.PENDING,
      },
      checked_in: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      checked_in_at: {
        type: DataTypes.DATE,
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
      tableName: 'group_booking_participants',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['group_booking_id'] },
        { fields: ['customer_id'] },
        { fields: ['payment_status'] },
        { fields: ['checked_in'] },
      ],
    }
  );

  return GroupBookingParticipant;
}

