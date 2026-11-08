import {
    allAlarmData,
    setVisibleAlarmData
} from "./state.js";

import { normalizeAlertLevel } from "./alert-level.js";
import { buildTable } from "./table.js";


// APLICAR FILTRO
export function applyFilter() {
    const alertFilter = document.getElementById("alertFilter");
    const selectedLevel = alertFilter.value;
    const filteredData = allAlarmData.filter(alarm => {
        const level = normalizeAlertLevel(alarm.ALERT_LEVEL);
        if (selectedLevel === "ALL") {
            return true;
        }
        return level === selectedLevel;
    });
    // Actualizar registros visibles
    setVisibleAlarmData(filteredData);
    // Renderizar tabla
    buildTable();
}


// INICIALIZAR FILTROS
export function initializeFilters() {
    const alertFilter = document.getElementById("alertFilter");
    alertFilter.addEventListener("change",applyFilter);
}
