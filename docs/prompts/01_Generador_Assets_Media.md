# Prompt Generador de Assets Visuales (Gestor de Media)
**Fecha de creación:** Marzo 2026
**Uso:** Copiar y pegar el siguiente bloque en Nano Banano / ChatGPT para generar el paquete ZIP inicial con todos los iconos de interfaz, arquitectura y respaldos del sistema.

***

Hola. Actúa como Diseñador de Interfaz (UI/UX) experto en sistemas SaaS B2B corporativos (estilo constructora/ingeniería moderna).

He construido el motor de un ERP reactivo llamado "FRACTAL CORE 1.0" siguiendo un sistema de diseño estricto y sobrio llamado "Crimson Ledger". Ahora necesito que generes un paquete de *assets* visuales completos respetando escrupulosamente los nombres de archivo y formatos requeridos.

**INSTRUCCIONES DE ESTILO VISUAL:**
- Diseño matemático, arquitectónico y serio. Nivel "Excel Premium".
- Paleta permitida: Blancos rotos (#f8f9ff), grises técnicos/acero (#727b89, #3b4758), granates corporativos (#7f1d1d) de forma muy seca, sin degradados saturados ni sombras de fantasía.
- Los SVG deben ser "stroke-based" (iconos de línea) limpios de 24x24px, grosor de línea medio (1.5px o 2px), nada de ilustraciones infantiles ("flat design") ni colores chillones. Minimalismo de alta densidad.

**ENTREGABLE:**
Necesito que estructures todos estos archivos en sus carpetas correspondientes y me proporciones el código en Python para generar un archivo `.zip` interactivo con todo dentro, listo para montar en mi servidor.

---
### 1. RAÍZ DEL PROYECTO
`favicon.ico` 
- Formato: .ico (multiresolución o 32x32). Logo de "Nortunel" u objeto corporativo abstracto minúsculo.

### 2. CARPETA: `/generics/`
*(Estas son las válvulas de respaldo para cuando algo falla en el sistema)*
`SVG_Generico.svg`: Cuadrado técnico gris con línea diagonal (fallback para iconos rotos).
`JPG_Generico.jpg`: Fondo esmerilado oscuro 1920x1080p con un leve patrón de red y "FRACTAL CORE" borroso en el centro (fallback para fotos/fondos rotos).
`PNG_Generico.png`: Silueta humana corporativa, hombros y cabeza en tonos grises técnicos (fallback para avatares de usuario).

### 3. CARPETA: `/icons/` (Bloque UI General)
`ui_candado.svg`: Candado de seguridad (Login).
`ui_email.svg`: Sobre de carta técnico (Login).
`ui_trash.svg`: Papelera de eliminación de entidades.
`ui_shield.svg`: Escudo táctico (Modo Administrador/Bypass).
`ui_filter.svg`: Icono de filtros avanzados (embudo/líneas).
`ui_search.svg`: Lupa paramétrica fina.
`ui_user_placeholder.svg`: Avatar vacío corporativo en formato .svg.

### 4. CARPETA: `/icons/` (Bloque Arquitectura y Sistemas)
*(Iconología para la consola de administración del software)*
`sys_tipos.svg`: Ruedas dentadas finas o engranajes (Gestión de Tipos).
`sys_diccionario.svg`: Libro abierto técnico o catálogo rígido (Diccionario de Datos).
`sys_raw.svg`: Matriz de celdas o tabla de Excel (Visor Tablas Raw).
`sys_media.svg`: Icono de cuadro/marco de imagen vectorial (Gestor de Media).
`sys_wysiwyg.svg`: Regla, escuadra o herramientas de medición (Taller WYSIWYG).
`sys_tabiques.svg`: Un muro segmentado o icono de ojo tachado técnico (Mostrar/Ocultar Tabiques).
`sys_forge.svg`: Un yunque moderno o elemento de fragua geométrico (Fragua Arquetipos ABAC).
`sys_inventory.svg`: Estructura de ADN abstracta o estantería matricial (Catálogo Inventario).
`sys_matrix.svg`: Un joystick o matriz de cruce de ejes X/Y (Mesa de Cruce L/E/A).

### 5. CARPETA: `/icons/` (Entornos Operativos Principales)
*(Los módulos masivos del sistema)*
`mod_OBR.svg`: Túnel/Obra civil.
`mod_PRO.svg`: Silueta de proveedor, maletín o edificio (Proveedores).
`mod_SED.svg`: Edificio de oficinas estructurado (Sedes).
`mod_MAQ.svg`: Retroexcavadora abstracta o engranaje de piñon (Maquinaria).

Por favor, diseña o busca estos archivos basándote en el estilo solicitado y genérame el código para que me descargue instantáneamente el `.zip` estructurado en carpetas.
