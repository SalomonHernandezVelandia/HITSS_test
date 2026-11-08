import { API_URL } from "../config/api.js";
import { applyFilter } from "./filters.js";

import {
    setAlarmData
} from "./state.js";


// CONSULTAR ALARMAS
export async function loadAlarms() {
    try {
        const response = await fetch(`${API_URL}/alarms`);
        if (!response.ok) {
            throw new Error(
                "No fue posible consultar las alarmas."
            );
        }

        const result = await response.json();

        setAlarmData(
            result.data || [],
            result.columns || []
        );

        if (!(result.columns || []).includes("ALERT_LEVEL")) {
            console.warn(
                "El backend no devuelve ALERT_LEVEL."
            );
        }
        applyFilter();
    } catch (error) {
        console.error(error);
        const uploadMessage = document.getElementById("uploadMessage");
        if (uploadMessage) {
            uploadMessage.textContent = error.message;
        }
    }
}

// ACTUALIZACIÓN AUTOMÁTICA
export function startAlarmPolling() {
    setInterval(() => {
        loadAlarms();
    }, 30000);
}