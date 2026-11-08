import { API_URL } from "./config/api.js";

import { initializeImport } from "./modules/import.js";

import {loadAlarms, startAlarmPolling} from "./modules/alarms.js";

import { initializeFilters } from "./modules/filters.js";
import { initializeExport } from "./modules/export.js";
import { initializeSummary } from "./modules/summary.js";

function initializeUI() {
    console.log("Inicializando interfaz...");
    initializeImport();
    initializeFilters();
    initializeExport();
    initializeSummary();
    console.log("Interfaz inicializada.");
}

async function initialize() {
    // Inicializar eventos de interfaz
    initializeUI();
    try {
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) {
            throw new Error("Backend no disponible");
        }

        await loadAlarms();
        startAlarmPolling();
    } catch (error) {
        const uploadMessage = document.getElementById("uploadMessage");
        uploadMessage.textContent ="No se pudo conectar con el backend.";
        console.error(error);
    }
}

initialize();