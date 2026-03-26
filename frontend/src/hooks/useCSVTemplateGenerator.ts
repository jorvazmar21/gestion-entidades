export function generateCSVTemplate(_moldeId: string, selectedStaticPsets: string[], selectedDynamicPsets: string[]) {
    // Generates a CSV string with headers
    // Core Entity Headers
    const headers = ['id_entidad', 'id_padre', 'codigo', 'nombre'];
    
    // Add Static PSet columns
    selectedStaticPsets.forEach(pset => {
        headers.push(`PSET_ESTATICO:${pset}`);
    });

    // Add Dynamic PSet columns
    selectedDynamicPsets.forEach(pset => {
        headers.push(`PSET_DINAMICO:${pset}`);
    });

    return headers.join(';') + '\n';
}

export function downloadCSV(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
