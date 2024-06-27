const { Type } = require('../models/models')
const ApiError = require('../error/ApiError')
class typeController {
	async create(req, res, next) {
		try {
			const { name } = req.body
			const type = await Type.create({ name })
			return res.json(type)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}

	async getAll(req, res) {
		try {
			const types = await Type.findAll()
			return res.json(types)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}

	async delete(req, res, next) {
		try {
			const { id } = req.params
			const type = await Type.findByPk(id)

			if (!type) {
				return next(ApiError.notFound('Type not found'))
			}

			await type.destroy()
			return res.json({ message: 'Type deleted' })
		} catch (e) {
			next(ApiError.internal('Internal server error'))
		}
	}
}

module.exports = new typeController()
