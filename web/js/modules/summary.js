import { API_URL } from "../config/api.js";

// ELEMENTOS HTML
const summaryBtn = document.getElementById("summaryBtn");
const summaryModal = document.getElementById("summaryModal");
const closeSummaryBtn = document.getElementById("closeSummaryBtn");
const summaryTotal = document.getElementById("summaryTotal");
const summaryDate = document.getElementById("summaryDate");
const summaryMessage = document.getElementById("summaryMessage");
const summaryChart = document.getElementById("summaryChart");
const summaryTableBody = document.getElementById("summaryTableBody");

// ABRIR MODAL
async function openSummary() {
    console.log("Botón resumen presionado");
    summaryModal.hidden = false;
    summaryTotal.textContent = "0";
    summaryDate.textContent = "Consultando fecha...";
    summaryMessage.textContent = "Consultando información...";
    summaryChart.innerHTML = "";
    summaryTableBody.innerHTML = "";
    await loadDailySummary();
}

// CERRAR MODAL
function closeSummary() {
    summaryModal.hidden = true;
}

// CONSULTAR BACKEND
async function loadDailySummary() {
    try {
        console.log("Consultando resumen del día...");
        const response = await fetch(
            `${API_URL}/alarms/summary/today`
        );
        const result = await response.json();
        console.log("Respuesta del backend:", result);

        if (!response.ok) {
            throw new Error(
                result.detail ||
                "No se pudo consultar el resumen."
            );
        }
        renderDailySummary(result);
    } catch (error) {
        console.error("Error en resumen:", error);
        summaryMessage.textContent = error.message;
    }
}

// RENDERIZAR RESUMEN
function renderDailySummary(result) {
    const total = result.total || 0;
    const hourlyData = result.hours || [];

    summaryTotal.textContent = total;
    summaryDate.textContent = result.date || "Resumen de hoy";

    summaryMessage.textContent = total === 0
        ? "No se registraron alarmas durante el día de hoy."
        : "Resumen generado correctamente.";

    summaryChart.innerHTML = "";
    summaryTableBody.innerHTML = "";

    // ORGANIZAR LAS 24 HORAS DEL DÍA
    const hourlyMap = new Map();
    hourlyData.forEach(item => {
        const hourKey = String(item.hour)
            .slice(0, 2)
            .padStart(2, "0");
        hourlyMap.set(hourKey, Number(item.count) || 0);
    });

    // Crear las 24 horas, incluyendo las que tienen 0 alarmas
    const completeHours = Array.from(
        { length: 24 },
        (_, index) => {
            const hour = String(index).padStart(2, "0");
            return {
                hour: `${hour}:00`,
                count: hourlyMap.get(hour) || 0
            };
        }
    );

    // ESCALA DEL GRÁFICO
    const maxValue = Math.max(
        ...completeHours.map(item => item.count),
        1
    );

    // GENERAR GRÁFICO Y TABLA
    completeHours.forEach(item => {
        const hour = item.hour;
        const count = item.count;

        // GRÁFICO DE BARRAS HORIZONTALES
        const barContainer = document.createElement("div");
        barContainer.className = "summary-bar-container";

        // Hora
        const barLabel = document.createElement("span");
        barLabel.className = "summary-bar-label";
        barLabel.textContent = hour;

        // Barra
        const bar = document.createElement("div");
        bar.className = "summary-bar";
        const percentage = (count / maxValue) * 100;
        bar.style.width = `${percentage}%`;
        bar.title = `${hour}: ${count} alarmas`;

        // Cantidad
        const barValue = document.createElement("span");
        barValue.className = "summary-bar-value";
        barValue.textContent = count;

        // Orden: hora → barra → cantidad
        barContainer.appendChild(barLabel);
        barContainer.appendChild(bar);
        barContainer.appendChild(barValue);
        summaryChart.appendChild(barContainer);

        // TABLA DE DOS COLUMNAS
        const row = document.createElement("tr");
        const hourCell = document.createElement("td");
        hourCell.textContent = hour;
        const countCell = document.createElement("td");
        countCell.textContent = count;
        row.appendChild(hourCell);
        row.appendChild(countCell);
        summaryTableBody.appendChild(row);
    });

}


// INICIALIZAR EVENTOS
export function initializeSummary() {
    console.log("Inicializando resumen del día");

    if (!summaryBtn || !summaryModal || !closeSummaryBtn) {
        console.error("No se encontraron los elementos del resumen en HTML.");
        return;
    }

    summaryBtn.addEventListener("click", openSummary);
    closeSummaryBtn.addEventListener("click", closeSummary);

    // Cerrar al hacer clic fuera
    summaryModal.addEventListener("click", event => {
        if (event.target.classList.contains("summary-modal-overlay")) {
            closeSummary();
        }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" &&!summaryModal.hidden) {
            closeSummary();
        }
    });
}