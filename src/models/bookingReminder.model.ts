import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface BookingReminderAttributes {
  id: string;
  booking_id: string;
  reminder_type: string;
  sent_at?: Date;
  scheduled_at: Date;
  created_at: Date;
}

type BookingReminderCreationAttributes = Optional<BookingReminderAttributes, 'id' | 'created_at'>;

export class BookingReminder extends Model<BookingReminderAttributes, BookingReminderCreationAttributes> implements BookingReminderAttributes {
  declare id: string;
  declare booking_id: string;
  declare reminder_type: string;
  declare sent_at?: Date;
  declare scheduled_at: Date;
  declare readonly created_at: Date;
}

export function initBookingReminder(sequelize: Sequelize): typeof BookingReminder {
  BookingReminder.init(
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
      reminder_type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'booking_reminders',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return BookingReminder;
}

