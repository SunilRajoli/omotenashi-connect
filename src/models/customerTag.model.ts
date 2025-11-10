import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum TagType {
  MANUAL = 'manual', // Manually added by business owner
  AUTO = 'auto', // Automatically added based on rules
}

export enum TagCategory {
  BEHAVIOR = 'behavior', // Based on customer behavior
  VALUE = 'value', // Based on customer value
  ENGAGEMENT = 'engagement', // Based on engagement level
  CUSTOM = 'custom', // Custom category
}

interface CustomerTagAttributes {
  id: string;
  business_id: string;
  customer_id: string;
  tag_name: string;
  tag_type: TagType;
  category: TagCategory;
  color?: string;
  description?: string;
  auto_rule_json?: Record<string, unknown>; // Rule that created this tag (for auto tags)
  created_by?: string; // User ID who created the tag (for manual tags)
  created_at: Date;
}

type CustomerTagCreationAttributes = Optional<CustomerTagAttributes, 'id' | 'created_at'>;

export class CustomerTag extends Model<CustomerTagAttributes, CustomerTagCreationAttributes> implements CustomerTagAttributes {
  declare id: string;
  declare business_id: string;
  declare customer_id: string;
  declare tag_name: string;
  declare tag_type: TagType;
  declare category: TagCategory;
  declare color?: string;
  declare description?: string;
  declare auto_rule_json?: Record<string, unknown>;
  declare created_by?: string;
  declare readonly created_at: Date;
}

export function initCustomerTag(sequelize: Sequelize): typeof CustomerTag {
  CustomerTag.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      business_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'businesses', key: 'id' },
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onDelete: 'CASCADE',
      },
      tag_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tag_type: {
        type: DataTypes.ENUM(...Object.values(TagType)),
        allowNull: false,
        defaultValue: TagType.MANUAL,
      },
      category: {
        type: DataTypes.ENUM(...Object.values(TagCategory)),
        allowNull: false,
        defaultValue: TagCategory.CUSTOM,
      },
      color: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      auto_rule_json: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'customer_tags',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['business_id', 'customer_id'] },
        { fields: ['business_id', 'tag_name'] },
        { fields: ['tag_type', 'category'] },
      ],
    }
  );

  return CustomerTag;
}

