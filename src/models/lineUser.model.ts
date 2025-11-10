/**
 * LINE User Model
 * Stores LINE user connections and profile information
 */

import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface LineUserAttributes {
  id: string;
  user_id: string;
  line_user_id: string;
  display_name?: string;
  picture_url?: string;
  status_message?: string;
  language?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

type LineUserCreationAttributes = Optional<LineUserAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'>;

export class LineUser extends Model<LineUserAttributes, LineUserCreationAttributes> implements LineUserAttributes {
  declare id: string;
  declare user_id: string;
  declare line_user_id: string;
  declare display_name?: string;
  declare picture_url?: string;
  declare status_message?: string;
  declare language?: string;
  declare is_active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initLineUser(sequelize: Sequelize): typeof LineUser {
  LineUser.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      line_user_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      display_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      picture_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      language: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'line_users',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['line_user_id'] },
        { fields: ['is_active'] },
      ],
    }
  );

  return LineUser;
}

