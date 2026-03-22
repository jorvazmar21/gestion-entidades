const fs = require('fs');
const pdf = require('pdf-parse');
let dataBuffer = fs.readFileSync('C:/Users/Jorge Vazquez/OneDrive - NORTUNEL, S.A/Escritorio/Antigravity/gestion-entidades/Documentacion/Info Lienzo Desacoplado.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(function(err) {
    console.error(err);
});
