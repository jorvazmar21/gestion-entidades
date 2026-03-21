const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components', 'admin');

function traverse(d) {
    fs.readdirSync(d).forEach(file => {
        const fullPath = path.join(d, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            const exact_words = {
                'LICITACIÃ“N': 'LICITACIÓN',
                'PRODUCCIÃ“N': 'PRODUCCIÓN',
                'TOPOGRAFÃ A': 'TOPOGRAFÍA',
                'ADMINISTRACIÃ“N': 'ADMINISTRACIÓN',
                'DescripciÃ³n': 'Descripción',
                'Ãºltimo': 'último',
                'reciÃ©n': 'recién',
                'Ã¡rbol': 'árbol',
                'precauciÃ³n': 'precaución',
                'CatalogaciÃ³n': 'Catalogación',
                'AsignaciÃ³n': 'Asignación',
                'tÃ¡ctica': 'táctica',
                'ESTÃ NDAR': 'ESTÁNDAR',
                'EdiciÃ³n': 'Edición',
                'AprobaciÃ³n': 'Aprobación',
                'CatÃ¡logo': 'Catálogo',
                'VÃ­nculo': 'Vínculo',
                'TipologÃ­a': 'Tipología',
                'EstÃ¡ticos': 'Estáticos',
                'DinÃ¡micos': 'Dinámicos',
                'AUDITORÃ A': 'AUDITORÍA',
                'estÃ¡tico': 'estático',
                'JerÃ¡rquico': 'Jerárquico',
                'CategorÃ­a': 'Categoría',
                'SubcategorÃ­a': 'Subcategoría',
                'CÃ³digo': 'Código',
                'UbicaciÃ³n': 'Ubicación',
                'fÃ­sica': 'física',
                'imputaciÃ³n': 'imputación',
                'lÃ³gico': 'lógico',
                'archivÃ³': 'archivó',
                'Ãºltima': 'última',
                'modificaciÃ³n': 'modificación',
                'modificÃ³': 'modificó',
                'MÃ³dulo': 'Módulo',
                'ClasificaciÃ³n': 'Clasificación',
                'LÃ­mite': 'Límite',
                'DESCRIPCIÃ“N': 'DESCRIPCIÓN',
                'vacÃ­o': 'vacío',
                'construcciÃ³n': 'construcción',
                'CONFIGURACIÃ“N': 'CONFIGURACIÓN',
                'GARANTÃ A': 'GARANTÍA',
                'MÃ³dulos': 'Módulos',
                'Ãºnico': 'único',
                'BÃšSQUEDA': 'BÚSQUEDA',
                'NAVEGACIÃ“N': 'NAVEGACIÓN'
            };
            
            for(let bad in exact_words) {
               if(content.includes(bad)) {
                  content = content.split(bad).join(exact_words[bad]);
                  changed = true;
               }
            }
            
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed ' + file);
            }
        }
    });
}
traverse(dir);
