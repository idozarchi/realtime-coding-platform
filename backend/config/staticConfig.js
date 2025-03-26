const path = require('path');
const express = require('express');

const setupStaticFiles = (app) => {
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../../frontend/build')));
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
        });
    }
};

module.exports = setupStaticFiles; 