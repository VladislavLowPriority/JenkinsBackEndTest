const { Brand } = require('../models/models')
const ApiError = require('../error/ApiError')

class BrandController {
	async create(req, res) {
		const { name } = req.body
		const brand = await Brand.create({ name })
		return res.json(brand)
	}

	async getAll(req, res) {
		const brands = await Brand.findAll()
		return res.json(brands)
	}

	async delete(req, res, next) {
		try {
			const { id } = req.params
			const brand = await Brand.findByPk(id)

			if (!brand) {
				return next(ApiError.notFound('Бренд не найден'))
			}

			await brand.destroy()
			return res.json({ message: 'Бренд удалён' })
		} catch (e) {
			next(ApiError.internal('Internal server error'))
		}
	}
}

module.exports = new BrandController()
