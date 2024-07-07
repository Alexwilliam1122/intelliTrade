'use strict'

module.exports = {
    currencyFormatter: (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR"
        }).format(number);
    },

    amountFormatter: (number) => {
        let numberString = String(number);
        if (numberString.indexOf('.') !== -1 || numberString.indexOf(',') !== -1) {
            let parts = numberString.split(/\.|,/);
            let integerPart = parts[0];
            let decimalPart = parts[1];
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return integerPart + (decimalPart ? ',' + decimalPart : '');

        } else {
            return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
    }
}