import sqlite3

def run_seed():
    conn = sqlite3.connect('job_portal.db')
    with open('seed_data.sql', 'r') as f:
        script = f.read()
    conn.executescript(script)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    run_seed()
