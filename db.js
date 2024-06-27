const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
	process.env.DB_NAME, // название БД
	process.env.DB_USER, // Пользователь БД
	process.env.DB_PASSWORD, // Пароль БД
	{
		dialect: 'postgres',
		host: process.env.DB_HOST, // Хост БД
		port: process.env.DB_PORT, // IP БД
	}
)
