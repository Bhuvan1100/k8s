SELECT 'CREATE DATABASE auth_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec

SELECT 'CREATE DATABASE buyer_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'buyer_db')\gexec

SELECT 'CREATE DATABASE order_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'order_db')\gexec

SELECT 'CREATE DATABASE pricing_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pricing_db')\gexec

SELECT 'CREATE DATABASE product_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'product_db')\gexec

SELECT 'CREATE DATABASE seller_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'seller_db')\gexec
