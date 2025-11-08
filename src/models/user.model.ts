import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

interface UserAttributes {
  id: string;
  email: string;
  password_hash: string;
  family_name?: string;
  given_name?: string;
  family_name_kana?: string;
  given_name_kana?: string;
  display_name?: string;
  phone?: string;
  timezone: string;
  role: UserRole;
  is_active: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'timezone' | 'role' | 'is_active' | 'created_at' | 'updated_at'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password_hash: string;
  declare family_name?: string;
  declare given_name?: string;
  declare family_name_kana?: string;
  declare given_name_kana?: string;
  declare display_name?: string;
  declare phone?: string;
  declare timezone: string;
  declare role: UserRole;
  declare is_active: boolean;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Helper method
  getFullName(locale: 'ja' | 'en' = 'ja'): string {
    if (locale === 'ja') {
      return `${this.family_name || ''} ${this.given_name || ''}`.trim();
    }
    return `${this.given_name || ''} ${this.family_name || ''}`.trim();
  }
}

export function initUser(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.CITEXT,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      family_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      given_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      family_name_kana: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      given_name_kana: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      display_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      timezone: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'Asia/Tokyo',
      },
      role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.CUSTOMER,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: 'users',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['email'] },
        { fields: ['role', 'is_active'] },
      ],
    }
  );

  return User;
}
