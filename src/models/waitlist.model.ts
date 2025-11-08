import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum WaitlistStatus {
  ACTIVE = 'active',
  NOTIFIED = 'notified',
  CONVERTED = 'converted',
  CANCELLED = 'cancelled',
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
  notified_at?: Date;
  created_at: Date;
}

type WaitlistCreationAttributes = Optional<WaitlistAttributes, 'id' | 'status' | 'created_at'>;

export class Waitlist extends Model<WaitlistAttributes, WaitlistCreationAttributes> implements WaitlistAttributes {
  declare id: string;
  declare business_id: string;
  declare service_id?: string;
  declare customer_id?: string;
  declare preferred_date?: Date;
  declare preferred_time_start?: string;
  declare preferred_time_end?: string;
  declare status: WaitlistStatus;
  declare notified_at?: Date;
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
      notified_at: {
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
      ],
    }
  );

  return Waitlist;
}

