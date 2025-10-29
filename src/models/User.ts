import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface UserAttrs {
  id: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  locale: 'ja' | 'en';
  status: 'active' | 'suspended';
  emailVerifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
type Creation = Optional<UserAttrs, 'id' | 'phone' | 'fullName' | 'avatarUrl' | 'emailVerifiedAt' | 'createdAt' | 'updatedAt'>;

export class User extends Model<UserAttrs, Creation> implements UserAttrs {
  declare id: string;
  declare email: string;
  declare phone: string | null;
  declare passwordHash: string;
  declare fullName: string | null;
  declare avatarUrl: string | null;
  declare locale: 'ja' | 'en';
  declare status: 'active' | 'suspended';
  declare emailVerifiedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize) {
    User.init({
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      phone: { type: DataTypes.STRING(32) },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
      fullName: { type: DataTypes.STRING(160), field: 'full_name' },
      avatarUrl: { type: DataTypes.STRING(1024), field: 'avatar_url' },
      locale: { type: DataTypes.ENUM('ja','en'), allowNull: false, defaultValue: 'ja' },
      status: { type: DataTypes.ENUM('active','suspended'), allowNull: false, defaultValue: 'active' },
      emailVerifiedAt: { type: DataTypes.DATE, field: 'email_verified_at' }
    }, { sequelize, tableName: 'users', underscored: true });
    return User;
  }
}
