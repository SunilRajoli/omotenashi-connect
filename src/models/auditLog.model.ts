import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
import { UserRole } from './user.model';

interface AuditLogAttributes {
  id: string;
  actor_user_id?: string;
  actor_role?: UserRole;
  entity: string;
  entity_id?: string;
  action: string;
  before_json?: Record<string, unknown>;
  after_json?: Record<string, unknown>;
  ip?: string;
  ua?: string;
  created_at: Date;
}

type AuditLogCreationAttributes = Optional<AuditLogAttributes, 'id' | 'created_at'>;

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  declare id: string;
  declare actor_user_id?: string;
  declare actor_role?: UserRole;
  declare entity: string;
  declare entity_id?: string;
  declare action: string;
  declare before_json?: Record<string, any>;
  declare after_json?: Record<string, any>;
  declare ip?: string;
  declare ua?: string;
  declare readonly created_at: Date;
}

export function initAuditLog(sequelize: Sequelize): typeof AuditLog {
  AuditLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      actor_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      actor_role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: true,
      },
      entity: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      action: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      before_json: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      after_json: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      ip: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ua: {
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
      tableName: 'audit_logs',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['entity', 'entity_id'] },
      ],
    }
  );

  return AuditLog;
}

