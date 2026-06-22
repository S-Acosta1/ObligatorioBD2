CREATE TABLE Pais (
    codigo VARCHAR(3)  NOT NULL UNIQUE PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL
);

CREATE TABLE Documento (
	tipo          VARCHAR(20) NOT NULL,
	numero        VARCHAR(30) NOT NULL,
    cod_pais      VARCHAR(3)  NOT NULL,
	PRIMARY KEY (tipo, numero, cod_pais),
    CONSTRAINT fk_doc_pais    FOREIGN KEY (cod_pais)    REFERENCES Pais(codigo)
);

CREATE TABLE Direccion (
    id_direccion  INTEGER AUTO_INCREMENT NOT NULL,
	cod_pais      VARCHAR(3)             NOT NULL,
	calle         VARCHAR(120)           NOT NULL,
    localidad     VARCHAR(80)            NOT NULL,
    codigo_postal VARCHAR(10)            NOT NULL,
	PRIMARY KEY (id_direccion, cod_pais),
    CONSTRAINT fk_dir_pais    FOREIGN KEY (cod_pais)    REFERENCES Pais(codigo)
);

CREATE TABLE Usuario (
    email              VARCHAR(120) NOT NULL PRIMARY KEY,
    nombre             VARCHAR(120) NOT NULL,
    hash_contra        VARCHAR(255) NOT NULL,
	tipo_documento     VARCHAR(20)  NOT NULL,
	numero_documento   VARCHAR(30)  NOT NULL,
    cod_pais_documento VARCHAR(3)   NOT NULL,
    id_direccion       INTEGER      NOT NULL,
	cod_pais_direccion VARCHAR(3)   NOT NULL,
    CONSTRAINT fk_usuario_documento FOREIGN KEY
	(tipo_documento, numero_documento, cod_pais_documento) REFERENCES
	Documento(tipo, numero, cod_pais),
    CONSTRAINT fk_usuario_direccion FOREIGN KEY
	(id_direccion, cod_pais_direccion) REFERENCES
	Direccion(id_direccion, cod_pais)
);

CREATE TABLE Telefono (
	numero        VARCHAR(20)  NOT NULL PRIMARY KEY,
	email_usuario VARCHAR(120) NOT NULL,
	CONSTRAINT fk_telefono_usuario FOREIGN KEY (email_usuario)
	REFERENCES Usuario(email)
);

CREATE TABLE Administrador (
    email_usuario     VARCHAR(120) NOT NULL PRIMARY KEY,
	fecha_asignacion  DATE         NOT NULL,
    cod_pais          VARCHAR(30)  NOT NULL,
    CONSTRAINT fk_admin_usuario FOREIGN KEY (email_usuario) REFERENCES Usuario(email),
    CONSTRAINT fk_admin_pais    FOREIGN KEY (cod_pais) REFERENCES Pais(codigo)
);

CREATE TABLE Estadio (
    nombre   VARCHAR(100) NOT NULL PRIMARY KEY,
    cod_pais VARCHAR(3)   NOT NULL,
    CONSTRAINT fk_estadio_pais FOREIGN KEY (cod_pais) REFERENCES Pais(codigo)
);

CREATE TABLE Funcionario (
    email_usuario  VARCHAR(120) NOT NULL PRIMARY KEY,
    num_legajo     VARCHAR(20)  NOT NULL UNIQUE,
    CONSTRAINT fk_func_usuario FOREIGN KEY (email_usuario) REFERENCES Usuario(email)
);

CREATE TABLE FuncionarioTrabajaEstadio (
    email_funcionario  VARCHAR(120) NOT NULL,
    nombre_estadio     VARCHAR(100) NOT NULL,
	PRIMARY KEY (email_funcionario, nombre_estadio),

    CONSTRAINT fk_trabaja_funcionario
	FOREIGN KEY (email_funcionario) REFERENCES
	Funcionario(email_usuario),

    CONSTRAINT fk_trabaja_estadio
	FOREIGN KEY (nombre_estadio) REFERENCES
	Estadio(nombre)
);

CREATE TABLE UsuarioGeneral (
    email                VARCHAR(120) NOT NULL PRIMARY KEY,
    estado_verificacion  VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
	fecha_registro       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ug_usuario FOREIGN KEY (email) REFERENCES Usuario(email),
    CONSTRAINT ck_ug_estado  CHECK (estado_verificacion IN ('PENDIENTE','VERIFICADO','RECHAZADO'))
);

CREATE TABLE Sector (
    id_sector        INTEGER AUTO_INCREMENT,
    nombre_estadio   VARCHAR(100) NOT NULL,
    nombre           CHAR(1) NOT NULL,
	capacidad_maxima INTEGER NOT NULL,
	PRIMARY KEY (id_sector, nombre_estadio),

	CONSTRAINT fk_sector_estadio
	FOREIGN KEY (nombre_estadio)
	REFERENCES Estadio(nombre),

    CONSTRAINT nombre CHECK (nombre IN ('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z')),
    CONSTRAINT uq_sector         UNIQUE (nombre_estadio, nombre),
    CONSTRAINT ck_sector_cap     CHECK (capacidad_maxima > 0)
);

CREATE TABLE Equipo (
    nombre      VARCHAR(80) NOT NULL,
	cod_pais    VARCHAR(3)  NOT NULL,
	PRIMARY KEY (nombre, cod_pais),

	CONSTRAINT fk_equipo_pais
	FOREIGN KEY (cod_pais)
	REFERENCES Pais(codigo)
);

CREATE TABLE Evento (
    id_evento           INTEGER AUTO_INCREMENT PRIMARY KEY,
	fecha_hora          TIMESTAMP NOT NULL,
	ubicacion VARCHAR(200) NOT NULL,
    nombre_estadio   VARCHAR(100) NOT NULL,
    nombre_equipo_a     VARCHAR(80) NOT NULL,
    nombre_equipo_b     VARCHAR(80) NOT NULL,
    pais_equipo_a     VARCHAR(3) NOT NULL,
    pais_equipo_b     VARCHAR(3) NOT NULL,
    CONSTRAINT fk_evento_estadio
	FOREIGN KEY (nombre_estadio)
	REFERENCES Estadio(nombre),

    CONSTRAINT fk_evento_equipo_a
	FOREIGN KEY (nombre_equipo_a, pais_equipo_a)
	REFERENCES Equipo(nombre, cod_pais),

    CONSTRAINT fk_evento_equipo_b
	FOREIGN KEY (nombre_equipo_b, pais_equipo_b)
	REFERENCES Equipo(nombre, cod_pais)
);

CREATE TABLE EventoHabilitaSector (
    id_sector       INTEGER NOT NULL,
	nombre_sector   CHAR(1) NOT NULL,
    nombre_estadio  VARCHAR(100) NOT NULL,
	PRIMARY KEY (id_evento, nombre_sector, nombre_estadio),

    CONSTRAINT fk_habilita_evento
	FOREIGN KEY (id_evento)
	REFERENCES Evento(id_evento),

    CONSTRAINT fk_habilita_sector
	FOREIGN KEY (id_sector, nombre_estadio)
	REFERENCES Sector(id_sector, nombre_estadio),
);

CREATE TABLE FuncionarioAsignadoEventoSector (
	email_funcionario VARCHAR(120) NOT NULL,
    id_sector       INTEGER NOT NULL,
	nombre_sector   CHAR(1) NOT NULL,
    nombre_estadio  VARCHAR(100) NOT NULL,
	PRIMARY KEY (email_funcionario, id_sector, nombre_sector, nombre_estadio),

	CONSTRAINT fk_habilita_evento_sector
	FOREIGN KEY (id_sector, nombre_sector, nombre_estadio)
	REFERENCES EventoHabilitaSector(id_sector, nombre_sector, nombre_estadio),

	CONSTRAINT fk_habilita_funcionario
	FOREIGN KEY (email_funcionario)
	REFERENCES Funcionario(email_usuario),
);

CREATE TABLE Comision (
	id_comision   INTEGER NOT NULL PRIMARY KEY,
	porcentaje    DECIMAL(5, 2) NOT NULL,
	fecha_inicio  DATE NOT NULL,
	fecha_final   DATE,
);

CREATE TABLE Compra (
	id_compra      INTEGER        NOT NULL PRIMARY KEY,
	email_usuario  VARCHAR(120)   NOT NULL,
	fecha          TIMESTAMP      NOT NULL,
	estado         VARCHAR(20)    NOT NULL DEFAULT 'PENDIENTE',
	monto_total    DECIMAL(10, 4) NOT NULL,

	CONSTRAINT fk_compra_usuario
	FOREIGN KEY (email_usuario)
	REFERENCES Usuario(email),

    CONSTRAINT ck_compra_estado   CHECK (estado IN ('PENDIENTE','CONFIRMADA','PAGA')),
    CONSTRAINT ck_compra_monto    CHECK (monto_total >= 0),
);

CREATE TABLE CompraAplicaComision (
	id_compra   INTEGER NOT NULL,
	id_comision INTEGER NOT NULL,
	PRIMARY KEY (id_compra, id_comision),

	CONSTRAINT fk_aplica_compra
	FOREIGN KEY (id_compra)
	REFERENCES Compra(id_compra),

	CONSTRAINT fk_aplica_comision
	FOREIGN KEY (id_comision)
	REFERENCES Comision(id_comision)
);

CREATE TABLE Entrada (
	id_entrada      INTEGER       NOT NULL PRIMARY KEY,
	precio          DECIMAL(5, 2) NOT NULL,
	estado          VARCHAR(10)   NOT NULL DEFAULT 'VALIDA',
    id_sector       INTEGER       NOT NULL,
	nombre_sector   CHAR(1)       NOT NULL,
    nombre_estadio  VARCHAR(100)  NOT NULL,
	id_compra       INTEGER       NOT NULL,
	email_usuario   VARCHAR(120)  NOT NULL,

    CONSTRAINT fk_entrada_compra
	FOREIGN KEY (id_compra)
	REFERENCES Compra(id_compra),

	CONSTRAINT fk_entrada_evento
	FOREIGN KEY (id_sector, nombre_sector, nombre_estadio)
	REFERENCES EventoHabilitaSector(id_sector, nombre_sector, nombre_estadio),

	CONSTRAINT fk_entrada_usuario
	FOREIGN KEY (email_usuario)
	REFERENCES Usuario(email),

    CONSTRAINT ck_entrada_estado  CHECK (estado IN ('VALIDA','CONSUMIDA','ANULADA'))
);

-- TODO:
-- CREATE TABLE Transferencia (
--     id_transferencia INTEGER AUTO_INCREMENT PRIMARY KEY,
--     id_entrada       INTEGER NOT NULL,
--     id_origen        INTEGER NOT NULL,
--     id_destino       INTEGER NOT NULL,
--     fecha_hora       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     estado           VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
--     CONSTRAINT fk_transf_entrada FOREIGN KEY (id_entrada)  REFERENCES Entrada(id_entrada),
--     CONSTRAINT fk_transf_origen  FOREIGN KEY (id_origen)   REFERENCES Usuario(id_usuario),
--     CONSTRAINT fk_transf_destino FOREIGN KEY (id_destino)  REFERENCES Usuario(id_usuario),
--     CONSTRAINT ck_transf_estado  CHECK (estado IN ('PENDIENTE','ACEPTADA','RECHAZADA')),
--     CONSTRAINT ck_transf_partes  CHECK (id_origen <> id_destino)
-- );

CREATE TABLE Escaner (
	id_escaner      INTEGER       NOT NULL,
    nombre_estadio  VARCHAR(100)  NOT NULL,
	PRIMARY KEY (id_escaner, nombre_estadio),

	CONSTRAINT fk_escaner_estadio
	FOREIGN KEY (nombre_estadio)
	REFERENCES Estadio(nombre)
);

CREATE TABLE FuncionarioEscaner (
	email_funcionario VARCHAR(120) NOT NULL,
	id_escaner INTEGER NOT NULL,
	nombre_estadio VARCHAR(100) NOT NULL,
	PRIMARY KEY (email_funcionario, id_escaner, nombre_estadio),

	CONSTRAINT fk_escaner_funcionario
	FOREIGN KEY (email_funcionario)
	REFERENCES Funcionario(email_usuario),

	CONSTRAINT fk_escaner_escaner
	FOREIGN KEY (id_escaner, nombre_estadio)
	REFERENCES Escaner(id_escaner, nombre_estadio),
);

CREATE TABLE TokenQR (
    id_token    INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_entrada  INTEGER NOT NULL,
    codigo      VARCHAR(64) NOT NULL,
    generado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_en   TIMESTAMP NOT NULL,
    estado      VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
	email_funcionario_verificador VARCHAR(120),
	id_escaner_verificador INTEGER,
	nombre_estadio_verificador VARCHAR(100),
	fecha_verificacion TIMESTAMP,

    CONSTRAINT fk_token_entrada FOREIGN KEY (id_entrada) REFERENCES Entrada(id_entrada),

    CONSTRAINT fk_token_verificador
	FOREIGN KEY (email_funcionario, id_escaner, nombre_estadio)
	REFERENCES FuncionarioEscaner(email_funcionario, id_escaner, nombre_estadio),

    CONSTRAINT ck_token_estado  CHECK (estado IN ('ACTIVO','EXPIRADO','CONSUMIDO'))
);

CREATE INDEX idx_entrada_usuario ON Entrada(id_usuario_actual);
CREATE INDEX idx_compra_usuario  ON Compra(id_usuario);
CREATE INDEX idx_evento_fecha    ON Evento(fecha_hora);
CREATE INDEX idx_token_entrada   ON TokenQR(id_entrada, estado);
CREATE INDEX idx_transf_entrada  ON Transferencia(id_entrada);
CREATE INDEX idx_fes_funcionario ON FuncionarioEventoSector(id_funcionario);

-- CREATE TRIGGER no_superposicion_eventos
-- BEFORE INSERT ON Evento
-- REFERENCING NEW AS nuevo
-- FOR EACH ROW
-- BEGIN ATOMIC
--     DECLARE v_conflictos INTEGER;
--
--     SELECT COUNT(*)
--     INTO v_conflictos
--     FROM Evento
--     WHERE id_estadio = nuevo.id_estadio
--       AND fecha_hora = nuevo.fecha_hora;
--
--     IF v_conflictos > 0 THEN
--         SIGNAL SQLSTATE '75002'
--             SET MESSAGE_TEXT = 'Ya existe un evento programado en ese estadio para esa fecha y hora';
--     END IF;
-- END;
