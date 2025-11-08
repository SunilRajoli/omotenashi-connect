import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface BusinessHolidayAttributes {
  id: string;
  business_id: string;
  date: Date;
  reason?: string;
}

type BusinessHolidayCreationAttributes = Optional<BusinessHolidayAttributes, 'id'>;

export class BusinessHoliday extends Model<BusinessHolidayAttributes, BusinessHolidayCreationAttributes> implements BusinessHolidayAttributes {
  declare id: string;
  declare business_id: string;
  declare date: Date;
  declare reason?: string;
}

export function initBusinessHoliday(sequelize: Sequelize): typeof BusinessHoliday {
  BusinessHoliday.init(
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
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'business_holidays',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['business_id', 'date'] },
      ],
    }
  );

  return BusinessHoliday;
}

