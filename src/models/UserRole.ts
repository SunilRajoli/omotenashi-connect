import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface UserRoleAttrs { id: string; userId: string; roleId: string; }
type Creation = Optional<UserRoleAttrs, 'id'>;

export class UserRole extends Model<UserRoleAttrs, Creation> implements UserRoleAttrs {
  declare id: string; declare userId: string; declare roleId: string;

  static initModel(sequelize: Sequelize) {
    UserRole.init({
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
      roleId: { type: DataTypes.UUID, allowNull: false, field: 'role_id' }
    }, {
      sequelize, tableName: 'user_roles', underscored: true,
      indexes: [{ unique: true, fields: ['user_id','role_id'] }]
    });
    return UserRole;
  }
}
