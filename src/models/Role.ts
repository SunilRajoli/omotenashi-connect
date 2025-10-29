import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface RoleAttrs { id: string; key: 'user'|'owner'|'staff'|'admin'; nameJa: string; nameEn: string; }
type Creation = Optional<RoleAttrs, 'id'>;

export class Role extends Model<RoleAttrs, Creation> implements RoleAttrs {
  declare id: string; declare key: 'user'|'owner'|'staff'|'admin'; declare nameJa: string; declare nameEn: string;

  static initModel(sequelize: Sequelize) {
    Role.init({
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      key: { type: DataTypes.ENUM('user','owner','staff','admin'), allowNull: false, unique: true },
      nameJa: { type: DataTypes.STRING, allowNull: false, field: 'name_ja' },
      nameEn: { type: DataTypes.STRING, allowNull: false, field: 'name_en' }
    }, { sequelize, tableName: 'roles', underscored: true });
    return Role;
  }
}
