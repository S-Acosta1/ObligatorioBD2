CREATE TABLE Pais (
    id_pais     INTEGER AUTO_INCREMENT PRIMARY KEY,
    codigo      VARCHAR(3)  NOT NULL UNIQUE,
    nombre      VARCHAR(80) NOT NULL
);

CREATE TABLE Equipo (
    id_equipo   INTEGER AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE Estadio (
    id_estadio  INTEGER AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    id_pais     INTEGER NOT NULL,
    CONSTRAINT fk_estadio_pais FOREIGN KEY (id_pais) REFERENCES Pais(id_pais)
);

CREATE TABLE ComisionVigente (
    id_comision  INTEGER AUTO_INCREMENT PRIMARY KEY,
    porcentaje   DECIMAL(5,2) NOT NULL,
    fecha_desde  DATE NOT NULL,
    fecha_hasta  DATE,                         -- NULL = vigente actualmente
    CONSTRAINT ck_comision_pct   CHECK (porcentaje >= 0),
    CONSTRAINT ck_comision_rango CHECK (fecha_hasta IS NULL OR fecha_hasta >= fecha_desde)
);

CREATE TABLE Usuario (
    id_usuario    INTEGER AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(120) NOT NULL,
    correo        VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_pais       INTEGER NOT NULL,
    CONSTRAINT fk_usuario_pais FOREIGN KEY (id_pais) REFERENCES Pais(id_pais)
);

CREATE TABLE Documento (
    id_documento  INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_usuario    INTEGER NOT NULL,
    id_pais       INTEGER NOT NULL,            -- pais emisor del documento
    tipo          VARCHAR(20) NOT NULL,        -- ej. 'CI', 'PASAPORTE', 'DNI'
    numero        VARCHAR(30) NOT NULL,
    CONSTRAINT fk_doc_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_doc_pais    FOREIGN KEY (id_pais)    REFERENCES Pais(id_pais),
    CONSTRAINT uq_documento   UNIQUE (id_pais, tipo, numero)
);

CREATE TABLE Direccion (
    id_direccion  INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_usuario    INTEGER NOT NULL,
    id_pais       INTEGER NOT NULL,
    localidad     VARCHAR(80)  NOT NULL,
    calle         VARCHAR(120) NOT NULL,
    numero        VARCHAR(10)  NOT NULL,
    codigo_postal VARCHAR(10)  NOT NULL,
    CONSTRAINT fk_dir_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_dir_pais    FOREIGN KEY (id_pais)    REFERENCES Pais(id_pais)
);

CREATE TABLE Telefono (
    id_telefono INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_usuario  INTEGER NOT NULL,
    numero      VARCHAR(20) NOT NULL,
    CONSTRAINT fk_tel_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Administrador (
    id_usuario           INTEGER PRIMARY KEY,
    id_pais_jurisdiccion INTEGER NOT NULL,
    fecha_asignacion     DATE NOT NULL,
    CONSTRAINT fk_admin_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_admin_pais    FOREIGN KEY (id_pais_jurisdiccion) REFERENCES Pais(id_pais)
);

CREATE TABLE Funcionario (
    id_usuario  INTEGER PRIMARY KEY,
    num_legajo  VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT fk_func_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE UsuarioGeneral (
    id_usuario           INTEGER PRIMARY KEY,
    fecha_registro       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_verificacion  VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT fk_ug_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT ck_ug_estado  CHECK (estado_verificacion IN ('PENDIENTE','VERIFICADO','RECHAZADO'))
);

CREATE TABLE Sector (
    id_sector        INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_estadio       INTEGER NOT NULL,
    nombre           CHAR(1) NOT NULL,
    capacidad_maxima INTEGER NOT NULL,
    CONSTRAINT nombre CHECK (nombre IN ('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T')),
    CONSTRAINT fk_sector_estadio FOREIGN KEY (id_estadio) REFERENCES Estadio(id_estadio),
    CONSTRAINT uq_sector         UNIQUE (id_estadio, nombre),
    CONSTRAINT ck_sector_cap     CHECK (capacidad_maxima > 0)
);

CREATE TABLE Evento (
    id_evento           INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_estadio          INTEGER NOT NULL,
    id_equipo_local     INTEGER NOT NULL,
    id_equipo_visitante INTEGER NOT NULL,
    fecha_hora          TIMESTAMP NOT NULL,
    id_admin            INTEGER NOT NULL,
    CONSTRAINT fk_evento_estadio   FOREIGN KEY (id_estadio)          REFERENCES Estadio(id_estadio),
    CONSTRAINT fk_evento_local     FOREIGN KEY (id_equipo_local)     REFERENCES Equipo(id_equipo),
    CONSTRAINT fk_evento_visitante FOREIGN KEY (id_equipo_visitante) REFERENCES Equipo(id_equipo),
    CONSTRAINT fk_evento_admin     FOREIGN KEY (id_admin)            REFERENCES Administrador(id_usuario),
    CONSTRAINT ck_evento_equipos   CHECK (id_equipo_local <> id_equipo_visitante)
);

CREATE TABLE EventoSector (
    id_evento_sector INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_evento        INTEGER NOT NULL,
    id_sector        INTEGER NOT NULL,
    costo            DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_es_evento     FOREIGN KEY (id_evento) REFERENCES Evento(id_evento),
    CONSTRAINT fk_es_sector     FOREIGN KEY (id_sector) REFERENCES Sector(id_sector),
    CONSTRAINT uq_evento_sector UNIQUE (id_evento, id_sector),
    CONSTRAINT ck_es_costo      CHECK (costo >= 0)
);

CREATE TABLE FuncionarioEventoSector (
    id_funcionario   INTEGER NOT NULL,
    id_evento_sector INTEGER NOT NULL,
    CONSTRAINT pk_fes      PRIMARY KEY (id_funcionario, id_evento_sector),
    CONSTRAINT fk_fes_func FOREIGN KEY (id_funcionario)   REFERENCES Funcionario(id_usuario),
    CONSTRAINT fk_fes_es   FOREIGN KEY (id_evento_sector) REFERENCES EventoSector(id_evento_sector)
);

CREATE TABLE Dispositivo (
    id_dispositivo INTEGER AUTO_INCREMENT PRIMARY KEY,
    codigo         VARCHAR(40) NOT NULL UNIQUE,
    id_funcionario INTEGER NOT NULL,
    autorizado     SMALLINT NOT NULL DEFAULT 1,  -- 1=activo, 0=revocado
    CONSTRAINT fk_disp_funcionario FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_usuario),
    CONSTRAINT ck_disp_autorizado  CHECK (autorizado IN (0,1))
);

CREATE TABLE Compra (
    id_compra         INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_usuario        INTEGER NOT NULL,
    id_comision       INTEGER NOT NULL,          -- comision vigente al momento de la compra
    fecha             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado            VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    monto_total       DECIMAL(10,2) NOT NULL,
    comision_aplicada DECIMAL(5,2) NOT NULL,     -- snapshot del % en el momento de la compra
    CONSTRAINT fk_compra_usuario  FOREIGN KEY (id_usuario)  REFERENCES UsuarioGeneral(id_usuario),
    CONSTRAINT fk_compra_comision FOREIGN KEY (id_comision) REFERENCES ComisionVigente(id_comision),
    CONSTRAINT ck_compra_estado   CHECK (estado IN ('PENDIENTE','CONFIRMADA','PAGA')),
    CONSTRAINT ck_compra_monto    CHECK (monto_total >= 0),
    CONSTRAINT ck_compra_comision CHECK (comision_aplicada >= 0)
);

CREATE TABLE Entrada (
    id_entrada                INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_compra                 INTEGER NOT NULL,
    id_evento_sector          INTEGER NOT NULL,
    id_usuario_actual         INTEGER NOT NULL,
    precio                    DECIMAL(10,2) NOT NULL,
    estado                    VARCHAR(20) NOT NULL DEFAULT 'VALIDA',
    transferencias_realizadas SMALLINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_entrada_compra  FOREIGN KEY (id_compra)          REFERENCES Compra(id_compra),
    CONSTRAINT fk_entrada_es      FOREIGN KEY (id_evento_sector)   REFERENCES EventoSector(id_evento_sector),
    CONSTRAINT fk_entrada_usuario FOREIGN KEY (id_usuario_actual)  REFERENCES Usuario(id_usuario),
    CONSTRAINT ck_entrada_estado  CHECK (estado IN ('VALIDA','CONSUMIDA','ANULADA')),
    CONSTRAINT ck_entrada_transf  CHECK (transferencias_realizadas BETWEEN 0 AND 3)
);

CREATE TABLE Transferencia (
    id_transferencia INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_entrada       INTEGER NOT NULL,
    id_origen        INTEGER NOT NULL,
    id_destino       INTEGER NOT NULL,
    fecha_hora       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado           VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT fk_transf_entrada FOREIGN KEY (id_entrada)  REFERENCES Entrada(id_entrada),
    CONSTRAINT fk_transf_origen  FOREIGN KEY (id_origen)   REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_transf_destino FOREIGN KEY (id_destino)  REFERENCES Usuario(id_usuario),
    CONSTRAINT ck_transf_estado  CHECK (estado IN ('PENDIENTE','ACEPTADA','RECHAZADA')),
    CONSTRAINT ck_transf_partes  CHECK (id_origen <> id_destino)
);

CREATE TABLE TokenQR (
    id_token    INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_entrada  INTEGER NOT NULL,
    codigo      VARCHAR(64) NOT NULL,
    generado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_en   TIMESTAMP NOT NULL,              -- generado_en + 30 segundos
    estado      VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_token_entrada FOREIGN KEY (id_entrada) REFERENCES Entrada(id_entrada),
    CONSTRAINT ck_token_estado  CHECK (estado IN ('ACTIVO','EXPIRADO','CONSUMIDO'))
);

CREATE TABLE ValidacionLog (
    id_validacion  INTEGER AUTO_INCREMENT PRIMARY KEY,
    id_entrada     INTEGER NOT NULL,
    id_token       INTEGER NOT NULL,
    id_funcionario INTEGER NOT NULL,
    id_dispositivo INTEGER NOT NULL,
    fecha_hora     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resultado      VARCHAR(20) NOT NULL,
    CONSTRAINT fk_val_entrada     FOREIGN KEY (id_entrada)     REFERENCES Entrada(id_entrada),
    CONSTRAINT fk_val_token       FOREIGN KEY (id_token)       REFERENCES TokenQR(id_token),
    CONSTRAINT fk_val_funcionario FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_usuario),
    CONSTRAINT fk_val_dispositivo FOREIGN KEY (id_dispositivo) REFERENCES Dispositivo(id_dispositivo),
    CONSTRAINT ck_val_resultado   CHECK (resultado IN ('ACEPTADO','RECHAZADO'))
);

CREATE INDEX idx_entrada_usuario ON Entrada(id_usuario_actual);
CREATE INDEX idx_compra_usuario  ON Compra(id_usuario);
CREATE INDEX idx_evento_fecha    ON Evento(fecha_hora);
CREATE INDEX idx_token_entrada   ON TokenQR(id_entrada, estado);
CREATE INDEX idx_transf_entrada  ON Transferencia(id_entrada);
CREATE INDEX idx_comision_fechas ON ComisionVigente(fecha_desde, fecha_hasta);
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
