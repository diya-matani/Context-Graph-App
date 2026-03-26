import os
import json
import sqlite3
from pathlib import Path

DATA_DIR = Path(r"c:\Users\dmata\OneDrive - vitbhopal.ac.in\Desktop\Dodge AI\sap-o2c-data")
DB_PATH = Path(r"c:\Users\dmata\OneDrive - vitbhopal.ac.in\Desktop\Dodge AI\context-graph-app\o2c_graph.db")

def create_and_populate():
    # connect to db
    os.makedirs(DB_PATH.parent, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    for folder in DATA_DIR.iterdir():
        if not folder.is_dir(): continue
        table_name = folder.name
        print(f"Processing table: {table_name}")
        
        # Find all jsonl files in the folder
        jsonl_files = list(folder.glob("*.jsonl"))
        if not jsonl_files: continue
        
        # Read the first line of the first file to infer schema
        first_file = jsonl_files[0]
        with open(first_file, "r", encoding="utf-8") as f:
            first_line = f.readline()
            if not first_line: continue
            sample_record = json.loads(first_line)
        
        columns = list(sample_record.keys())
        # Create table statement
        col_defs = [f'"{col}" TEXT' for col in columns]
        # Drop table if exists to keep it idempotent
        cursor.execute(f'DROP TABLE IF EXISTS "{table_name}"')
        create_stmt = f'CREATE TABLE "{table_name}" ({", ".join(col_defs)})'
        cursor.execute(create_stmt)
        
        # Load data from all files in folder
        for jfile in jsonl_files:
            print(f"  Loading {jfile.name}...")
            records = []
            with open(jfile, "r", encoding="utf-8") as f:
                for line in f:
                    if not line.strip(): continue
                    record = json.loads(line)
                    # ensure we only insert known columns (in case some rows have extra, though unlikely in simple datasets)
                    row = [str(record.get(col, "")) for col in columns]
                    records.append(row)
            
            # Insert batched
            placeholders = ", ".join(["?"] * len(columns))
            cols_str = ", ".join([f'"{c}"' for c in columns])
            insert_stmt = f'INSERT INTO "{table_name}" ({cols_str}) VALUES ({placeholders})'
            cursor.executemany(insert_stmt, records)
            conn.commit()

    print("Done generating SQLite DB!")

if __name__ == "__main__":
    create_and_populate()
