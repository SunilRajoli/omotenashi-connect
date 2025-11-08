import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface BookingHistoryAttributes {
  id: string;
  booking_id: string;
  changed_by?: string;
  field_changed: string;
  old_value?: string;
  new_value?: string;
  reason?: string;
  created_at: Date;
}

type BookingHistoryCreationAttributes = Optional<BookingHistoryAttributes, 'id' | 'created_at'>;

export class BookingHistory extends Model<BookingHistoryAttributes, BookingHistoryCreationAttributes> implements BookingHistoryAttributes {
  declare id: string;
  declare booking_id: string;
  declare changed_by?: string;
  declare field_changed: string;
  declare old_value?: string;
  declare new_value?: string;
  declare reason?: string;
  declare readonly created_at: Date;
}

export function initBookingHistory(sequelize: Sequelize): typeof BookingHistory {
  BookingHistory.init(
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
      changed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      field_changed: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      old_value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      new_value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reason: {
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
      tableName: 'booking_history',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['booking_id', 'created_at'] },
      ],
    }
  );

  return BookingHistory;
}

