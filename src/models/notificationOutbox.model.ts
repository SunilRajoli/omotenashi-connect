import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum DeliveryStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

interface NotificationOutboxAttributes {
  id: string;
  kind: string;
  to_email?: string;
  to_phone?: string;
  locale: string;
  tone: string;
  template: string;
  data_json: Record<string, unknown>;
  scheduled_at?: Date;
  sent_at?: Date;
  attempts: number;
  delivery_status?: DeliveryStatus;
  error_message?: string;
  created_at: Date;
}

type NotificationOutboxCreationAttributes = Optional<NotificationOutboxAttributes, 'id' | 'locale' | 'tone' | 'attempts' | 'created_at'>;

export class NotificationOutbox extends Model<NotificationOutboxAttributes, NotificationOutboxCreationAttributes> implements NotificationOutboxAttributes {
  declare id: string;
  declare kind: string;
  declare to_email?: string;
  declare to_phone?: string;
  declare locale: string;
  declare tone: string;
  declare template: string;
  declare data_json: Record<string, any>;
  declare scheduled_at?: Date;
  declare sent_at?: Date;
  declare attempts: number;
  declare delivery_status?: DeliveryStatus;
  declare error_message?: string;
  declare readonly created_at: Date;
}

export function initNotificationOutbox(sequelize: Sequelize): typeof NotificationOutbox {
  NotificationOutbox.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kind: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      to_email: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      to_phone: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      locale: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'ja',
      },
      tone: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'polite',
      },
      template: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      data_json: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      delivery_status: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'notifications_outbox',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return NotificationOutbox;
}

