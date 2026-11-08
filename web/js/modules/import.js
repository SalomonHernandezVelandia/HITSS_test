import { API_URL } from "../config/api.js";
import { loadAlarms } from "./alarms.js";


// INICIALIZAR IMPORTACIÓN
export function initializeImport() {
    console.log("Inicializando módulo de importación...");

    const csvFile = document.getElementById("csvFile");
    const selectFileBtn = document.getElementById("selectFileBtn");
    const fileName = document.getElementById("fileName");
    const uploadMessage = document.getElementById("uploadMessage");
    const importBtn = document.getElementById("importBtn");

    // Verificar elementos HTML
    if (!csvFile || !selectFileBtn || !fileName || !uploadMessage || !importBtn) {
        console.error("Error: No se encontraron todos los elementos de importación.");
        return;
    }

    let selectedFile = null;

    // SELECCIONAR ARCHIVO
    selectFileBtn.addEventListener("click", () => {
        console.log("Botón seleccionar archivo presionado.");
        csvFile.click();
    });

    // ARCHIVO SELECCIONADO
    csvFile.addEventListener("change", () => {
        selectedFile = csvFile.files[0];
        if (!selectedFile) {
            return;
        }

        console.log("Archivo seleccionado:", selectedFile.name);
        fileName.textContent = selectedFile.name;
        importBtn.disabled = false;
        uploadMessage.textContent = "Archivo listo para importar.";
    });

    // IMPORTAR CSV
    importBtn.addEventListener("click", async () => {
        if (!selectedFile) {
            uploadMessage.textContent = "Primero debes seleccionar un archivo CSV.";
            return;
        }

        importBtn.disabled = true;
        uploadMessage.textContent = "Procesando archivo...";

        try {
            const response = await fetch(
                `${API_URL}/alarms/import`,
                {
                    method: "POST",
                    headers: {
                        "X-Filename": selectedFile.name,
                        "Content-Type": "text/csv"
                    },
                    body: selectedFile
                }
            );

            const result = await response.json();
            if (!response.ok) {
                throw new Error(
                    result.detail ||
                    "Error al importar el archivo."
                );
            }
            uploadMessage.textContent = `Importación exitosa: ${result.total_records} registros.`;
            // Actualizar tabla
            await loadAlarms();
        } catch (error) {
            console.error("Error importando CSV:", error);
            uploadMessage.textContent = error.message;
        } finally {
            importBtn.disabled = false;
        }
    });
}
