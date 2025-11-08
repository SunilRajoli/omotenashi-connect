import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface PaymentWebhookAttributes {
  id: string;
  provider: string;
  event_type: string;
  signature?: string;
  payload_json: Record<string, unknown>;
  processed_at?: Date;
  retry_count: number;
  created_at: Date;
}

type PaymentWebhookCreationAttributes = Optional<PaymentWebhookAttributes, 'id' | 'retry_count' | 'created_at'>;

export class PaymentWebhook extends Model<PaymentWebhookAttributes, PaymentWebhookCreationAttributes> implements PaymentWebhookAttributes {
  declare id: string;
  declare provider: string;
  declare event_type: string;
  declare signature?: string;
  declare payload_json: Record<string, any>;
  declare processed_at?: Date;
  declare retry_count: number;
  declare readonly created_at: Date;
}

export function initPaymentWebhook(sequelize: Sequelize): typeof PaymentWebhook {
  PaymentWebhook.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      provider: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      event_type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      signature: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      payload_json: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      retry_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'payment_webhooks',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return PaymentWebhook;
}

