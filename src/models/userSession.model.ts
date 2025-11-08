import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface UserSessionAttributes {
  id: string;
  user_id: string;
  refresh_token_id?: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: Record<string, unknown>;
  last_active_at: Date;
  created_at: Date;
}

type UserSessionCreationAttributes = Optional<UserSessionAttributes, 'id' | 'last_active_at' | 'created_at'>;

export class UserSession extends Model<UserSessionAttributes, UserSessionCreationAttributes> implements UserSessionAttributes {
  declare id: string;
  declare user_id: string;
  declare refresh_token_id?: string;
  declare ip_address?: string;
  declare user_agent?: string;
  declare device_info?: Record<string, unknown>;
  declare last_active_at: Date;
  declare readonly created_at: Date;
}

export function initUserSession(sequelize: Sequelize): typeof UserSession {
  UserSession.init(
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
      },
      refresh_token_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'refresh_tokens', key: 'id' },
      },
      ip_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      device_info: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      last_active_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'user_sessions',
      underscored: true,
      timestamps: false,
      indexes: [
        { fields: ['user_id', 'last_active_at'] },
      ],
    }
  );

  return UserSession;
}