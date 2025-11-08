import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface BusinessHourAttributes {
  id: string;
  business_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

type BusinessHourCreationAttributes = Optional<BusinessHourAttributes, 'id' | 'is_closed'>;

export class BusinessHour extends Model<BusinessHourAttributes, BusinessHourCreationAttributes> implements BusinessHourAttributes {
  declare id: string;
  declare business_id: string;
  declare day_of_week: number;
  declare open_time: string;
  declare close_time: string;
  declare is_closed: boolean;
}

export function initBusinessHour(sequelize: Sequelize): typeof BusinessHour {
  BusinessHour.init(
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
      day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      open_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      close_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      is_closed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'business_hours',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['business_id'] },
      ],
    }
  );

  return BusinessHour;
}

