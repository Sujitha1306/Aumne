import sqlite3
conn = sqlite3.connect('job_portal.db')
cur = conn.cursor()
cur.execute('PRAGMA table_info(jobs)')
cols = [row[1] for row in cur.fetchall()]
if 'required_fields' not in cols:
    cur.execute("ALTER TABLE jobs ADD COLUMN required_fields TEXT DEFAULT '[]'")
    conn.commit()
    print('Column required_fields added to jobs table')
else:
    print('Column already exists')
conn.close()
