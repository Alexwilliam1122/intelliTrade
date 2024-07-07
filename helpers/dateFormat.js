'use strict'

module.exports = {
    dateFormatter: (date) => {
        return new Date(date).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    },

    dbDate: (inputDate) => {
        const dateObj = new Date(inputDate);
        dateObj.setDate(dateObj.getDate() + 1);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}