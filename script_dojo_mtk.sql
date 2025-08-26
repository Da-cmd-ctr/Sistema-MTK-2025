DROP SCHEMA IF EXISTS `mydb`;
CREATE SCHEMA IF NOT EXISTS `mydb`;
USE `mydb`;

CREATE TABLE IF NOT EXISTS `mydb`.`Usuarios` (
  `idUsuarios` INT NOT NULL AUTO_INCREMENT,
  `Correo` VARCHAR(100) NOT NULL,
  `Password` VARCHAR(255) NOT NULL,
  `Rol` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idUsuarios`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `mydb`.`Generos` (
  `idGeneros` INT NOT NULL AUTO_INCREMENT,
  `Descripcion` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idGeneros`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `mydb`.`Roles` (
  `idRoles` INT NOT NULL AUTO_INCREMENT,
  `Descripcion` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idRoles`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `mydb`.`Sedes` (
  `idSedes` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(45) NOT NULL,
  `Ubicacion` VARCHAR(45) NOT NULL,
  `Direccion_exacta` VARCHAR(100) NOT NULL,
  `Telefono` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idSedes`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `mydb`.`Personas` (
  `idPersonas` INT NOT NULL AUTO_INCREMENT,
  `Primer_nombre` VARCHAR(45) NOT NULL,
  `Segundo_nombre` VARCHAR(45) NOT NULL,
  `Primer_apellido` VARCHAR(45) NOT NULL,
  `Segundo_apellido` VARCHAR(45) NOT NULL,
  `Telefono` VARCHAR(45) NOT NULL,
  `Persona_emergencia` VARCHAR(45) NOT NULL,
  `Contacto_emergencia` VARCHAR(45) NOT NULL,
  `Edad` INT NOT NULL,
  `Fecha_nac` DATE NOT NULL,
  `Año_inicio` YEAR NOT NULL,
  `Usuarios_idUsuarios` INT NOT NULL,
  `Sedes_idSedes` INT NOT NULL,
  `Generos_idGeneros` INT NOT NULL,
  `Roles_idRoles` INT NOT NULL,
  PRIMARY KEY (`idPersonas`),
  INDEX `fk_Personas_Usuarios_idx` (`Usuarios_idUsuarios` ASC),
  INDEX `fk_Personas_Sedes1_idx` (`Sedes_idSedes` ASC),
  INDEX `fk_Personas_Generos1_idx` (`Generos_idGeneros` ASC),
  INDEX `fk_Personas_Roles1_idx` (`Roles_idRoles` ASC),
  CONSTRAINT `fk_Personas_Usuarios`
    FOREIGN KEY (`Usuarios_idUsuarios`)
    REFERENCES `mydb`.`Usuarios` (`idUsuarios`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Personas_Sedes1`
    FOREIGN KEY (`Sedes_idSedes`)
    REFERENCES `mydb`.`Sedes` (`idSedes`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Personas_Generos1`
    FOREIGN KEY (`Generos_idGeneros`)
    REFERENCES `mydb`.`Generos` (`idGeneros`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Personas_Roles1`
    FOREIGN KEY (`Roles_idRoles`)
    REFERENCES `mydb`.`Roles` (`idRoles`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `mydb`.`Clases` (
  `idClases` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idClases`)
) ENGINE = InnoDB;
