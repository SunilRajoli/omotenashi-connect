import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface StaffWorkingHourAttributes {
  id: string;
  resource_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

type StaffWorkingHourCreationAttributes = Optional<StaffWorkingHourAttributes, 'id'>;

export class StaffWorkingHour extends Model<StaffWorkingHourAttributes, StaffWorkingHourCreationAttributes> implements StaffWorkingHourAttributes {
  declare id: string;
  declare resource_id: string;
  declare day_of_week: number;
  declare start_time: string;
  declare end_time: string;
}

export function initStaffWorkingHour(sequelize: Sequelize): typeof StaffWorkingHour {
  StaffWorkingHour.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resource_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'resources', key: 'id' },
        onDelete: 'CASCADE',
      },
      day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'staff_working_hours',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return StaffWorkingHour;
}

