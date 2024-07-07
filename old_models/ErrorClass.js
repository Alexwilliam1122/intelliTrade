'use strict'

module.exports = class ErrorValidation {
    constructor(property_names = []) {
        this.error = false
        for (const name of property_names) {
            this[name] = ''
        }
    }

    errorEmpty(property) {
        this.error = true
        this[property] = `This field cannot be empty.`
    }

    errorLength(property, minLength) {
        this.error = true
        this[property] = `Minimum length is ${minLength} characters.`
    }

    errorDate(property) {
        this.error = true
        this[property] = `Maximum date chosen is today.`
    }

    errorPassword(property) {
        this.error = true
        this[property] = `Password and retyped password are incorrect.`
    }
}