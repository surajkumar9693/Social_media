const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')


const authentication = async function (req, res, next) {
    try {
        let token = req.headers["authorization"]

        if (!token) {
            return res.status(401).send({ status: false, message: 'please provide token' })
        }

        let bearerToken = token.split(' ')[1]

        jwt.verify(bearerToken, 'om,arsh,suraj', function (error, decoded) {
            if (error) {
                return res.status(401).send({ status: false, message: 'please provide valid token' })
            }

            req.decodedToken = decoded
            //console.log(req.decodedToken.userId)
            next()
        })

    } catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }
}
//=================================================================================================================================================
const authorisation = async function (req, res, next) {
    try {
        let userId = req.params.userId
        
        let user = await userModel.findById(userId)

        if (!user) {
            return res.status(404).send({ status: false, message: 'user id does not exist' })
        }
        if (req.decodedToken.userId != user._id) {
            return res.status(403).send({ status: false, message: 'not authorised' })
        }
        next()

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

module.exports = { authentication, authorisation }