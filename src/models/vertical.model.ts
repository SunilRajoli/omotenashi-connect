import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface VerticalAttributes {
  id: string;
  slug: string;
  name_en: string;
  name_ja: string;
  config_json: Record<string, unknown>;
}

type VerticalCreationAttributes = Optional<VerticalAttributes, 'id' | 'config_json'>;

export class Vertical extends Model<VerticalAttributes, VerticalCreationAttributes> implements VerticalAttributes {
  declare id: string;
  declare slug: string;
  declare name_en: string;
  declare name_ja: string;
  declare config_json: Record<string, unknown>;
}

export function initVertical(sequelize: Sequelize): typeof Vertical {
  Vertical.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      name_en: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      name_ja: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      config_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    {
      sequelize,
      tableName: 'verticals',
      underscored: true,
      timestamps: false,
    }
  );

  return Vertical;
}