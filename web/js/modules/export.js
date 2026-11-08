import {
    visibleAlarmData,
    currentColumns
} from "./state.js";

import { normalizeAlertLevel } from "./alert-level.js";


// EXPORTAR A EXCEL
export function exportToExcel() {
    if (typeof XLSX === "undefined") {
        alert("No se pudo cargar la librería de Excel.");
        return;
    }
    if (visibleAlarmData.length === 0) {
        alert("No hay registros visibles para exportar.");
        return;
    }

    const excelData = visibleAlarmData.map(alarm => {
        const record = {};

        currentColumns.forEach(column => {
            const value = alarm[column];

            record[column] =
                column === "ALERT_LEVEL"
                    ? normalizeAlertLevel(value)
                    : value ?? "";
        });
        return record;
    });

    const worksheet = XLSX.utils.json_to_sheet(
        excelData,
        {
            header: currentColumns
        }
    );

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Alarmas"
    );

    const alertFilter = document.getElementById("alertFilter");
    const filterName = alertFilter.value.toLowerCase();
    const filename = `alarmas_${filterName}.xlsx`;
    XLSX.writeFile(workbook, filename);
}


// INICIALIZAR EXPORTACIÓN
export function initializeExport() {
    const exportExcelBtn = document.getElementById("exportExcelBtn");
    exportExcelBtn.addEventListener("click", exportToExcel);
}