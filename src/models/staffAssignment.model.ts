import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum StaffRole {
  MANAGER = 'manager',
  RECEPTIONIST = 'receptionist',
  SERVICE_PROVIDER = 'service_provider',
}

interface StaffAssignmentAttributes {
  id: string;
  user_id: string;
  business_id: string;
  role: StaffRole;
  permissions_json: Record<string, unknown>;
  hired_at: Date;
  terminated_at?: Date;
}

type StaffAssignmentCreationAttributes = Optional<StaffAssignmentAttributes, 'id' | 'permissions_json' | 'hired_at'>;

export class StaffAssignment extends Model<StaffAssignmentAttributes, StaffAssignmentCreationAttributes> implements StaffAssignmentAttributes {
  declare id: string;
  declare user_id: string;
  declare business_id: string;
  declare role: StaffRole;
  declare permissions_json: Record<string, any>;
  declare hired_at: Date;
  declare terminated_at?: Date;
}

export function initStaffAssignment(sequelize: Sequelize): typeof StaffAssignment {
  StaffAssignment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      business_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'businesses', key: 'id' },
        onDelete: 'CASCADE',
      },
      role: {
        type: DataTypes.ENUM(...Object.values(StaffRole)),
        allowNull: false,
      },
      permissions_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      hired_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      terminated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'staff_assignments',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['business_id'] },
      ],
    }
  );

  return StaffAssignment;
}

