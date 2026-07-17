from sqlalchemy import text
from connection import engine

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))

        print("Connected to PostgreSQL Successfully\n")

        print("PostgreSQL Version:")
        print(result.fetchone()[0])

except Exception as e:
    print("Connection Failed")
    print(e)