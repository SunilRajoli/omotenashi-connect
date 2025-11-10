/**
 * Group Booking Model
 * Stores group booking information for events, parties, and group services
 */

import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum GroupBookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentSplitType {
  ORGANIZER_PAYS = 'organizer_pays',
  SPLIT_EQUAL = 'split_equal',
  INDIVIDUAL = 'individual',
}

interface GroupBookingAttributes {
  id: string;
  business_id: string;
  service_id?: string;
  organizer_customer_id: string;
  group_name?: string;
  min_participants: number;
  max_participants: number;
  current_participants: number;
  start_at: Date;
  end_at: Date;
  total_amount_cents: number;
  payment_split_type: PaymentSplitType;
  status: GroupBookingStatus;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

type GroupBookingCreationAttributes = Optional<GroupBookingAttributes, 'id' | 'current_participants' | 'status' | 'metadata' | 'created_at' | 'updated_at'>;

export class GroupBooking extends Model<GroupBookingAttributes, GroupBookingCreationAttributes> implements GroupBookingAttributes {
  declare id: string;
  declare business_id: string;
  declare service_id?: string;
  declare organizer_customer_id: string;
  declare group_name?: string;
  declare min_participants: number;
  declare max_participants: number;
  declare current_participants: number;
  declare start_at: Date;
  declare end_at: Date;
  declare total_amount_cents: number;
  declare payment_split_type: PaymentSplitType;
  declare status: GroupBookingStatus;
  declare metadata: Record<string, unknown>;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initGroupBooking(sequelize: Sequelize): typeof GroupBooking {
  GroupBooking.init(
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
      organizer_customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
      },
      group_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      min_participants: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      max_participants: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      current_participants: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 0,
        },
      },
      start_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      total_amount_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      payment_split_type: {
        type: DataTypes.ENUM(...Object.values(PaymentSplitType)),
        allowNull: false,
        defaultValue: PaymentSplitType.ORGANIZER_PAYS,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(GroupBookingStatus)),
        allowNull: false,
        defaultValue: GroupBookingStatus.PENDING,
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
      tableName: 'group_bookings',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['business_id'] },
        { fields: ['service_id'] },
        { fields: ['organizer_customer_id'] },
        { fields: ['status'] },
        { fields: ['start_at', 'end_at'] },
      ],
    }
  );

  return GroupBooking;
}

