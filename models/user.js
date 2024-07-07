'use strict';
const bcrypt = require('bcrypt');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      this.belongsToMany(models.Stock, { through: models.Portfolio })
      this.belongsToMany(models.Stock, { through: models.MarketOrder })
    }

    static async updateRole(id, role) {
      try {
        await this.update({ role: role }, { where: { id: id } });

      } catch (error) {
        throw error;
      }
    }

  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'This username has been used.'
      },
      validate: {
        notNull: {
          msg: 'Username is required.'
        },
        notEmpty: {
          msg: 'Username is required.'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password is required',
        },
        notEmpty: {
          msg: 'Password is required',
        },
        len: {
          args: [8],
          msg: 'Password minimum length is 8 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: 'This email has been used.'
      },
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Email is required.'
        },
        notEmpty: {
          msg: 'Email is required.'
        },
        isEmail: {
          msg: 'Invalid email.'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'broker', 'user'),
      allowNull: true,
      isIn: {
        args: [['admin', 'broker', 'user']],
        msg: 'Error: invalid role. check model',
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate(async (user) => {
    user.role = 'user'
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
  })

  return User;
};