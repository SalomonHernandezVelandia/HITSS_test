export let allAlarmData = [];
export let visibleAlarmData = [];
export let currentColumns = [];

// Actualizar datos generales
export function setAlarmData(data, columns) {
    allAlarmData = data;
    currentColumns = columns;
}

// Actualizar registros visibles sin cambiar su referencia
export function setVisibleAlarmData(data) {
    visibleAlarmData.splice(
        0,
        visibleAlarmData.length,
        ...data
    );
}