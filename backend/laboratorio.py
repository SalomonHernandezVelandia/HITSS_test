import pandas as pd
from io import BytesIO
from services.csv_processor import (
    process_csv,
    calculate_duration
)


# 1. CARGAR EL CSV COMO BYTES
CSV_PATH = "./Pruebas_Tecnicas/HITSS/data/alarmas.csv"

with open(CSV_PATH, "rb") as file:
    file_content = file.read()

# print(f"\n{"=" * 60}\nCONTENIDO ORIGINAL DEL ARCHIVO\n{"=" * 60}")
# print(file_content[:500])



# 2. EJECUTAR CON PANDAS
df = pd.read_csv(CSV_PATH, sep="|")
print(f"\n{"=" * 60}\nDATAFRAME por medio de Pandas\n{"=" * 60}")
print(df.head(5))
#print(df.dtypes)
# print((df["2G"]<0).sum())
# print((df["3G"]<0).sum())
# print((df["4G"]<0).sum())
# mask = (df["2G"] == 100) & (df["3G"] == 100) & (df["4G"] == 100)
# print(df.loc[mask])

df["NIVEL DE ALERTA"] = ""

for index, row in df.iterrows():
    if row["2G"] >= 0 and row["3G"] >= 0 and row["4G"] >= 0:
        df.loc[index, "NIVEL DE ALERTA"] = "P"
print(df.head(5))
condicion = (df["2G"] >= 0) & (df["3G"] >= 0) & (df["4G"] >= 0)
filas_no_cumplen = (~condicion).sum() #~Convierte los True en False y viceversa
print(filas_no_cumplen)
filas_cumplen = df[df["NIVEL DE ALERTA"] == "P"]
print(filas_cumplen)
print("----------------------------------")
for index, row in df.iterrows():
    if row["2G"] == 100 and row["3G"] == 100 and row["4G"] == 100 and row["NOTIFICADA"] == "N":
        df.loc[index, "NIVEL DE ALERTA"] = "C"
condicion = (df["2G"] == 100) & (df["3G"] == 100) & (df["4G"] == 100) & (df["NOTIFICADA"] == "N")
filas_no_cumplen = (~condicion).sum()
print(filas_no_cumplen)
filas_cumplen = df[df["NIVEL DE ALERTA"] == "C"]
print(filas_cumplen)


# # 3. EJECUTAR process_csv()
# df = process_csv(file_content)
# print(f"\n{"=" * 60}\nDATAFRAME DESPUÉS DE process_csv()\n{"=" * 60}")
# print(df.head(5))
# print(df.dtypes)



# print(df.to_string(index=False))


# # ============================================================
# # 4. INSPECCIONAR INFORMACIÓN DEL DATAFRAME
# # ============================================================

# print("\nCOLUMNAS:")
# print(df.columns.tolist())

# print("\nTIPOS DE DATOS:")
# print(df.dtypes)

# print("\nDIMENSIONES:")
# print(df.shape)

# print("\nPRIMERAS 5 FILAS:")
# print(df.head())


# # ============================================================
# # 5. EJECUTAR calculate_duration()
# # ============================================================

# df_duration = calculate_duration(df)

# print("\n" + "=" * 60)
# print("DATAFRAME DESPUÉS DE calculate_duration()")
# print("=" * 60)

# print(df_duration.to_string(index=False))


# # ============================================================
# # 6. EXPORTAR RESULTADO A OTRO CSV DE PRUEBA
# # ============================================================

# OUTPUT_PATH = "./Pruebas_Tecnicas/HITSS/data/resultado_laboratorio.csv"

# df_duration.to_csv(
#     OUTPUT_PATH,
#     sep="|",
#     index=False,
#     encoding="utf-8-sig"
# )

# print(f"\nCSV DE PRUEBA GENERADO: {OUTPUT_PATH}")
