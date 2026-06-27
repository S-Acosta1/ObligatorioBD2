CREATE TABLE Pais (
    codigo VARCHAR(3)  NOT NULL UNIQUE PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE TipoDocumento (
    id_tipo  INTEGER AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE Documento (
	tipo          INTEGER NOT NULL,
	numero        VARCHAR(30) NOT NULL,
    cod_pais      VARCHAR(3)  NOT NULL,
	PRIMARY KEY (tipo, numero, cod_pais),
    CONSTRAINT fk_doc_pais    FOREIGN KEY (cod_pais)    REFERENCES Pais(codigo),
	CONSTRAINT fk_doc_tipo FOREIGN KEY (tipo) REFERENCES TipoDocumento(id_tipo)
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
	tipo_documento     INTEGER      NOT NULL,
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
    cod_pais          VARCHAR(3)  NOT NULL,
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
    id_evento            INTEGER NOT NULL,
    id_sector            INTEGER NOT NULL,
    nombre_estadio       VARCHAR(100) NOT NULL,
    asientos_disponibles INTEGER NOT NULL DEFAULT 0,
	precio               DECIMAL(5, 2) NOT NULL,
	PRIMARY KEY (id_evento, id_sector, nombre_estadio),

    CONSTRAINT fk_habilita_evento
	FOREIGN KEY (id_evento)
	REFERENCES Evento(id_evento),

    CONSTRAINT fk_habilita_sector
	FOREIGN KEY (id_sector, nombre_estadio)
	REFERENCES Sector(id_sector, nombre_estadio),

    CONSTRAINT ck_ehs_asientos
    CHECK (asientos_disponibles >= 0)
);

CREATE TABLE FuncionarioAsignadoEventoSector (
	email_funcionario VARCHAR(120) NOT NULL,
	id_evento       INTEGER NOT NULL,
    id_sector       INTEGER NOT NULL,
    nombre_estadio  VARCHAR(100) NOT NULL,
	PRIMARY KEY (email_funcionario, id_evento, id_sector, nombre_estadio),

	CONSTRAINT fk_habilita_evento_sector
	FOREIGN KEY (id_evento, id_sector, nombre_estadio)
	REFERENCES EventoHabilitaSector(id_evento, id_sector, nombre_estadio),

	CONSTRAINT fk_habilita_funcionario
	FOREIGN KEY (email_funcionario)
	REFERENCES Funcionario(email_usuario)
);

CREATE TABLE Comision (
	id_comision   INTEGER NOT NULL PRIMARY KEY,
	porcentaje    DECIMAL(5, 2) NOT NULL,
	fecha_inicio  DATE NOT NULL,
	fecha_final   DATE
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
    CONSTRAINT ck_compra_monto    CHECK (monto_total >= 0)
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
	id_entrada      INTEGER       NOT NULL AUTO_INCREMENT PRIMARY KEY,
	precio          DECIMAL(5, 2) NOT NULL,
	estado          VARCHAR(10)   NOT NULL DEFAULT 'VALIDA',
	id_evento       INTEGER       NOT NULL,
    id_sector       INTEGER       NOT NULL,
    nombre_estadio  VARCHAR(100)  NOT NULL,
	id_compra       INTEGER       NOT NULL,
	email_usuario   VARCHAR(120)  NOT NULL,

    CONSTRAINT fk_entrada_compra
	FOREIGN KEY (id_compra)
	REFERENCES Compra(id_compra),

	CONSTRAINT fk_entrada_evento
	FOREIGN KEY (id_evento, id_sector, nombre_estadio)
	REFERENCES EventoHabilitaSector(id_evento, id_sector, nombre_estadio),

	CONSTRAINT fk_entrada_usuario
	FOREIGN KEY (email_usuario)
	REFERENCES Usuario(email),

    CONSTRAINT ck_entrada_estado  CHECK (estado IN ('VALIDA','CONSUMIDA','ANULADA'))
);

CREATE TABLE Transferencia (
    id_transferencia INTEGER AUTO_INCREMENT PRIMARY KEY,
    email_usuario_origen        VARCHAR(120) NOT NULL,
    email_usuario_recibe       VARCHAR(120) NOT NULL,
    fecha_hora       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado           VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT fk_transf_origen  FOREIGN KEY (email_usuario_origen)   REFERENCES Usuario(email),
    CONSTRAINT fk_transf_destino FOREIGN KEY (email_usuario_recibe)  REFERENCES Usuario(email),
    CONSTRAINT ck_transf_estado  CHECK (estado IN ('PENDIENTE','ACEPTADA','RECHAZADA')),
    CONSTRAINT ck_transf_partes  CHECK (email_usuario_origen <> email_usuario_recibe)
);

CREATE TABLE TransferenciaContieneEntrada (
	id_transferencia INTEGER NOT NULL,
	id_entrada INTEGER NOT NULL,
	PRIMARY KEY (id_transferencia, id_entrada),

    CONSTRAINT fk_contiene_transf
	FOREIGN KEY (id_transferencia)
	REFERENCES Transferencia(id_transferencia),

    CONSTRAINT fk_contiene_entrada
	FOREIGN KEY (id_entrada)
	REFERENCES Entrada(id_entrada)
);

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
	REFERENCES Escaner(id_escaner, nombre_estadio)
);

CREATE TABLE TokenQR (
    id_token    INTEGER AUTO_INCREMENT PRIMARY KEY,
	estado      VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
	codigo      VARCHAR(64) NOT NULL,
    generado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_en   TIMESTAMP NOT NULL,
	id_entrada  INTEGER NOT NULL,

    CONSTRAINT fk_token_entrada FOREIGN KEY (id_entrada) REFERENCES Entrada(id_entrada),

    CONSTRAINT ck_token_estado  CHECK (estado IN ('ACTIVO','EXPIRADO','CONSUMIDO'))
);

CREATE TABLE Verificacion (
	id_verificacion INTEGER AUTO_INCREMENT PRIMARY KEY,
	fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	estado      VARCHAR(20) NOT NULL DEFAULT 'INVALIDO',
	id_token INTEGER NOT NULL,
	email_funcionario VARCHAR(120) NOT NULL,
	id_escaner INTEGER NOT NULL,
	nombre_estadio VARCHAR(100) NOT NULL,
	id_entrada INTEGER NOT NULL,

    CONSTRAINT fk_verificacion_token FOREIGN KEY (id_token) REFERENCES TokenQR(id_token),

    CONSTRAINT fk_verificacion_escaner
	FOREIGN KEY (email_funcionario, id_escaner, nombre_estadio)
	REFERENCES FuncionarioEscaner(email_funcionario, id_escaner, nombre_estadio),

    CONSTRAINT fk_verificacion_entrada FOREIGN KEY (id_entrada) REFERENCES Entrada(id_entrada),


    CONSTRAINT ck_verificacion_estado  CHECK (estado IN ('VALIDO','INVALIDO','CONSUMIDO'))
);

DELIMITER $$

CREATE TRIGGER trg_ehs_cap_maxima
BEFORE INSERT ON EventoHabilitaSector
FOR EACH ROW
BEGIN
    DECLARE cap INT;
    DECLARE msg VARCHAR(200);
    SELECT capacidad_maxima INTO cap
    FROM Sector
    WHERE id_sector = NEW.id_sector AND nombre_estadio = NEW.nombre_estadio;
    IF cap IS NULL THEN
        SET msg = CONCAT('Sector ', NEW.id_sector, ' not found in stadium ', NEW.nombre_estadio);
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = msg;
    END IF;
    SET NEW.asientos_disponibles = cap;
END$$

CREATE TRIGGER trg_ehs_before_update
BEFORE UPDATE ON EventoHabilitaSector
FOR EACH ROW
BEGIN
    DECLARE cap INT;
    SELECT capacidad_maxima INTO cap
    FROM Sector
    WHERE id_sector = NEW.id_sector AND nombre_estadio = NEW.nombre_estadio;
    IF NEW.asientos_disponibles > cap THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'asientos_disponibles cannot exceed sector capacity';
    END IF;
END$$

CREATE TRIGGER trg_sector_before_update_cap
BEFORE UPDATE ON Sector
FOR EACH ROW
BEGIN
    DECLARE diff INT;
    SET diff = OLD.capacidad_maxima - NEW.capacidad_maxima;
    IF diff > 0 THEN
        IF EXISTS (
            SELECT 1
            FROM EventoHabilitaSector
            WHERE id_sector = NEW.id_sector
              AND nombre_estadio = NEW.nombre_estadio
              AND asientos_disponibles - diff < 0
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot reduce capacity: tickets already sold exceed new capacity';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_sector_after_update_cap
AFTER UPDATE ON Sector
FOR EACH ROW
BEGIN
    DECLARE diff INT;
    SET diff = OLD.capacidad_maxima - NEW.capacidad_maxima;
    IF diff != 0 THEN
        UPDATE EventoHabilitaSector
        SET asientos_disponibles = asientos_disponibles - diff
        WHERE id_sector = NEW.id_sector
          AND nombre_estadio = NEW.nombre_estadio;
    END IF;
END$$

CREATE TRIGGER trg_entrada_before_insert
BEFORE INSERT ON Entrada
FOR EACH ROW
BEGIN
    DECLARE disp INT;
    DECLARE sector_precio DECIMAL(5,2);
    SELECT asientos_disponibles, precio INTO disp, sector_precio
    FROM EventoHabilitaSector
    WHERE id_evento = NEW.id_evento
      AND id_sector = NEW.id_sector
      AND nombre_estadio = NEW.nombre_estadio
    FOR UPDATE;
    IF disp <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No available seats in this sector for the event';
    END IF;
    SET NEW.precio = sector_precio;
    UPDATE EventoHabilitaSector
    SET asientos_disponibles = asientos_disponibles - 1
    WHERE id_evento = NEW.id_evento
      AND id_sector = NEW.id_sector
      AND nombre_estadio = NEW.nombre_estadio;
END$$

CREATE TRIGGER trg_entrada_after_update_anulada
AFTER UPDATE ON Entrada
FOR EACH ROW
BEGIN
    IF OLD.estado != 'ANULADA' AND NEW.estado = 'ANULADA' THEN
        UPDATE EventoHabilitaSector
        SET asientos_disponibles = asientos_disponibles + 1
        WHERE id_evento = NEW.id_evento
          AND id_sector = NEW.id_sector
          AND nombre_estadio = NEW.nombre_estadio;
    END IF;
END$$

CREATE TRIGGER trg_check_entrada_transfer_limit
BEFORE INSERT ON TransferenciaContieneEntrada
FOR EACH ROW
BEGIN
    DECLARE transfer_count INT;

    SELECT COUNT(*) INTO transfer_count
    FROM TransferenciaContieneEntrada tce
    JOIN Transferencia t ON tce.id_transferencia = t.id_transferencia
    WHERE tce.id_entrada = NEW.id_entrada
      AND t.estado = 'ACEPTADA';

    IF transfer_count >= 3 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Limite alcanzado: la entrada ya ha sido transferida 3 veces.';
    END IF;
END$$

DELIMITER ;
