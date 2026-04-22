import sqlite3
conn = sqlite3.connect('job_portal.db')
cur = conn.cursor()

cur.execute('PRAGMA table_info(messages)')
cols = [row[1] for row in cur.fetchall()]

if 'is_read' not in cols:
    cur.execute("ALTER TABLE messages ADD COLUMN is_read INTEGER DEFAULT 0")
    conn.commit()
    print('Column is_read added to messages table')
else:
    print('Column already exists')

conn.close()
