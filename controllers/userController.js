const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, Basket } = require('../models/models')

const generateJwt = (id, email, role) => {
	return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
		expiresIn: '24h',
	})
}
class UserController {
	// - - - - - - - R E G I S T R A T I O N - - - - - - - -
	async registration(req, res, next) {
		try {
			const { email, password, role } = req.body
			if (!email || !password) {
				return next(ApiError.badRequest('Некорректный ввод Email и пароля'))
			}
			const candidate = await User.findOne({ where: { email } })
			if (candidate) {
				return next(
					ApiError.badRequest('Пользователь с таким Email уже существует')
				)
			}
			const hashPassword = await bcrypt.hash(password, 5)
			const user = await User.create({ email, role, password: hashPassword })
			const basket = await Basket.create({ userId: user.id })
			const token = generateJwt(user.id, user.email, user.role)
			return res.json({ token })
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}

	//------------------------ L O G I N ----------------
	async login(req, res, next) {
		try {
			const { email, password } = req.body
			const user = await User.findOne({ where: { email } })
			if (!user) {
				return next(ApiError.internal('Пользователь с таким именем не найден'))
			}
			let comparePassword = bcrypt.compareSync(password, user.password)
			if (!comparePassword) {
				return next(ApiError.internal('Неправильный пароль'))
			}
			const token = generateJwt(user.id, user.email, user.role)
			return res.json({ token })
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}

	// - - - - - - C H E C K - - - - - - - - -
	async check(req, res, next) {
		try {
			const token = generateJwt(req.user.id, req.user.email, req.user.role)
			return res.json({
				token,
				id: req.user.id,
				email: req.user.email,
				role: req.user.role,
			})
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
}

module.exports = new UserController()