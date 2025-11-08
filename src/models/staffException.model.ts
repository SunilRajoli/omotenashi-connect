import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface StaffExceptionAttributes {
  id: string;
  resource_id: string;
  date: Date;
  is_working: boolean;
  note?: string;
}

type StaffExceptionCreationAttributes = Optional<StaffExceptionAttributes, 'id' | 'is_working'>;

export class StaffException extends Model<StaffExceptionAttributes, StaffExceptionCreationAttributes> implements StaffExceptionAttributes {
  declare id: string;
  declare resource_id: string;
  declare date: Date;
  declare is_working: boolean;
  declare note?: string;
}

export function initStaffException(sequelize: Sequelize): typeof StaffException {
  StaffException.init(
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
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      is_working: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'staff_exceptions',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return StaffException;
}

