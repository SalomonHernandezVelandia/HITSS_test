import {
    visibleAlarmData,
    currentColumns
} from "./state.js";

import { normalizeAlertLevel } from "./alert-level.js";

// CONSTRUIR TABLA
export function buildTable() {
    const alarmsTable = document.getElementById("alarmsTable");
    const totalRecords = document.getElementById("totalRecords");
    const thead = alarmsTable.querySelector("thead");
    const tbody = alarmsTable.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";
    totalRecords.textContent = visibleAlarmData.length;

    // ESTADO VACÍO
    if (visibleAlarmData.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = currentColumns.length || 1;
        cell.className = "empty-state";
        cell.textContent = "No hay registros para mostrar.";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    // ENCABEZADOS
    const headerRow = document.createElement("tr");
    currentColumns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // FILAS
    visibleAlarmData.forEach(alarm => {
        const row = document.createElement("tr");
        const level = normalizeAlertLevel(alarm.ALERT_LEVEL);
        // Colorear fila
        if (level === "CRITICO") {
            row.classList.add("row-critico");
        } else if (level === "WARN") {
            row.classList.add("row-warn");
        } else {
            row.classList.add("row-normal");
        }

        currentColumns.forEach(column => {
            const td = document.createElement("td");
            const value = alarm[column];
            // ALERT_LEVEL
            if (column === "ALERT_LEVEL") {
                td.classList.add("alert-cell");
                const badge = document.createElement("span");
                badge.classList.add("alert-badge");
                if (level === "CRITICO") {
                    badge.classList.add("critico");
                    badge.textContent = "CRÍTICO";
                } else if (level === "WARN") {
                    badge.classList.add("warn");
                    badge.textContent = "WARN";
                } else {
                    badge.classList.add("normal");
                    badge.textContent = "NORMAL";
                }
                td.appendChild(badge);
            } else {
                td.textContent =
                    value === null ||
                    value === undefined ||
                    value === ""
                        ? "-"
                        : value;
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
}