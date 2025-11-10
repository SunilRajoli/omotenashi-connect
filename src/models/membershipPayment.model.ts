/**
 * Membership Payment Model
 * Stores recurring payments for memberships
 */

import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

interface MembershipPaymentAttributes {
  id: string;
  membership_id: string;
  amount_cents: number;
  currency: string;
  payment_provider: string;
  payment_intent_id?: string;
  status: PaymentStatus;
  paid_at?: Date;
  failed_at?: Date;
  failure_reason?: string;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

type MembershipPaymentCreationAttributes = Optional<MembershipPaymentAttributes, 'id' | 'status' | 'metadata' | 'created_at' | 'updated_at'>;

export class MembershipPayment extends Model<MembershipPaymentAttributes, MembershipPaymentCreationAttributes> implements MembershipPaymentAttributes {
  declare id: string;
  declare membership_id: string;
  declare amount_cents: number;
  declare currency: string;
  declare payment_provider: string;
  declare payment_intent_id?: string;
  declare status: PaymentStatus;
  declare paid_at?: Date;
  declare failed_at?: Date;
  declare failure_reason?: string;
  declare metadata: Record<string, unknown>;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initMembershipPayment(sequelize: Sequelize): typeof MembershipPayment {
  MembershipPayment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      membership_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'memberships', key: 'id' },
        onDelete: 'CASCADE',
      },
      amount_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'JPY',
      },
      payment_provider: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      payment_intent_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(PaymentStatus)),
        allowNull: false,
        defaultValue: PaymentStatus.PENDING,
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      failed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      failure_reason: {
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
      tableName: 'membership_payments',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['membership_id'] },
        { fields: ['status'] },
        { fields: ['payment_provider', 'payment_intent_id'] },
        { fields: ['paid_at'] },
      ],
    }
  );

  return MembershipPayment;
}

