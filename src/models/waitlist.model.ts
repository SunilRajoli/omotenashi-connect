import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum WaitlistStatus {
  ACTIVE = 'active',
  NOTIFIED = 'notified',
  CONVERTED = 'converted',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum WaitlistPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  VIP = 'vip',
}

interface WaitlistAttributes {
  id: string;
  business_id: string;
  service_id?: string;
  customer_id?: string;
  preferred_date?: Date;
  preferred_time_start?: string;
  preferred_time_end?: string;
  status: WaitlistStatus;
  priority: WaitlistPriority;
  notified_at?: Date;
  response_deadline?: Date;
  notification_count: number;
  last_notified_at?: Date;
  created_at: Date;
}

type WaitlistCreationAttributes = Optional<WaitlistAttributes, 'id' | 'status' | 'priority' | 'notification_count' | 'created_at'>;

export class Waitlist extends Model<WaitlistAttributes, WaitlistCreationAttributes> implements WaitlistAttributes {
  declare id: string;
  declare business_id: string;
  declare service_id?: string;
  declare customer_id?: string;
  declare preferred_date?: Date;
  declare preferred_time_start?: string;
  declare preferred_time_end?: string;
  declare status: WaitlistStatus;
  declare priority: WaitlistPriority;
  declare notified_at?: Date;
  declare response_deadline?: Date;
  declare notification_count: number;
  declare last_notified_at?: Date;
  declare readonly created_at: Date;
}

export function initWaitlist(sequelize: Sequelize): typeof Waitlist {
  Waitlist.init(
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
      customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onDelete: 'SET NULL',
      },
      preferred_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      preferred_time_start: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      preferred_time_end: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(WaitlistStatus)),
        allowNull: false,
        defaultValue: WaitlistStatus.ACTIVE,
      },
      priority: {
        type: DataTypes.ENUM(...Object.values(WaitlistPriority)),
        allowNull: false,
        defaultValue: WaitlistPriority.NORMAL,
      },
      notified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      response_deadline: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notification_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_notified_at: {
        type: DataTypes.DATE,
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
      tableName: 'waitlist',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['business_id', 'service_id'] },
        { fields: ['status', 'priority'] },
        { fields: ['response_deadline'] },
        { fields: ['customer_id'] },
      ],
    }
  );

  return Waitlist;
}

