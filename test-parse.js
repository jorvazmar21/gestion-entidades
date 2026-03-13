const csv = `OBR;Obras;LUGAR;;L1;#icon-build;["PRL","SEC"];
PRV;Proveedores;LUGAR;;L1;#icon-handshake;[];
SED;Sedes;LUGAR;;L1;#icon-office;["PRL","SEC"];
PAR;Parque;LUGAR;;L1;#icon-tractor;["BHO","BIN","BPM","CRZ","CEL","CPH","CPN","CDI","DAR","RET","GDI","J2B","J3B","MTE","MPI","MHI","NAG","CCO","CPB","PIL","PEL","RGU","TIL","VEN"];
PRL;Principal;DELEGACION;ALMACEN;L2;;[];1
SEC;Secundario;DELEGACION;ALMACEN;L2;;[];
BHO;Bomba de Hormigón;DELEGACION;MAQUINARIA;L2;;[];
PST;Propiedades (PSet);PSET;;L1B;#icon-pset;[];`;

const lines = csv.split('\n');
try {
    const tiposEntidadDb = lines.map(line => {
        const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').replace(/""/g, '"'));
        return {
            id_tipo: vals[0],
            nombre: vals[1],
            categoria: vals[2],
            subCategoria: vals[3] || '',
            nivel: vals[4],
            icono: vals[5] || '',
            tipos_hijo_permitidos: vals[6] ? JSON.parse(vals[6]) : [],
            max_count_per_parent: vals[7] ? parseInt(vals[7]) : null
        };
    });
    console.log("Success:", tiposEntidadDb.length);
} catch (e) {
    console.error("Crash:", e.message);
}
