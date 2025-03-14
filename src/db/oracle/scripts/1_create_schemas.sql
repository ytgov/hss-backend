--------------------------------------------------------
--  USERS schema creation
--------------------------------------------------------

CREATE USER CONSTELLATION_HEALTH IDENTIFIED BY HSS_BACKEND;
CREATE USER HIPMA IDENTIFIED BY HSS_BACKEND;
CREATE USER GENERAL IDENTIFIED BY HSS_BACKEND;
CREATE USER MIDWIFERY IDENTIFIED BY HSS_BACKEND;

GRANT CONNECT TO CONSTELLATION_HEALTH;
GRANT RESOURCE TO CONSTELLATION_HEALTH;
ALTER USER CONSTELLATION_HEALTH quota 100M on USERS;

GRANT CONNECT TO HIPMA;
GRANT RESOURCE TO HIPMA;
ALTER USER HIPMA quota 100M on USERS;

GRANT CONNECT TO GENERAL;
GRANT RESOURCE TO GENERAL;
ALTER USER GENERAL quota 100M on USERS;

GRANT CONNECT TO MIDWIFERY;
GRANT RESOURCE TO MIDWIFERY;
ALTER USER MIDWIFERY quota 100M on USERS;

GRANT CONNECT TO DENTAL;
GRANT RESOURCE TO DENTAL;
ALTER USER DENTAL quota 100M on USERS;