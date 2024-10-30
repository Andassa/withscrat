CREATE TABLE roles (
    id SERIAL NOT NULL,
    label varchar(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE utilisateurs (
    id varchar(255) NOT NULL,
    nom varchar(255) NOT NULL,
    prenom varchar(255),
    username VARCHAR(255),
    fonction varchar(255) NOT NULL,
    email varchar(255),
    motdepasse varchar(500) NOT NULL,
    autorisation int4 NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE substances (
    id serial not null PRIMARY key,
    nom VARCHAR(500)
);

CREATE TABLE lessubstances (
    id serial not null PRIMARY key,
    nom VARCHAR(500)
);

Create table typePermis (
    id serial not null Primary key,
    libelle varchar(50)
);

create table personne_societe (
    id serial not null PRIMARY KEY,
    registre_1 VARCHAR(100),
    registre_2 VARCHAR(50)
);

-- CREATE OR REPLACE FUNCTION get_couches_subs(nom_substance VARCHAR)
-- RETURNS SETOF geometry AS
-- $$
-- DECLARE
--     multi_poly geometry;  -- Déclaration d'une variable pour stocker le résultat
-- BEGIN
--     SELECT ST_Collect(coalesce(t_zone.geom, t_line.geom, t_point.geom)) INTO multi_poly
--     FROM
--     (
--         SELECT geom FROM indice_zone iz WHERE nom LIKE '%' || nom_substance || '%'
--     ) t_zone
--     FULL JOIN
--     (
--         SELECT geom FROM indice_line il  WHERE nom LIKE '%' || nom_substance || '%'
--     ) t_line ON t_zone.geom = t_line.geom
--     FULL JOIN
--     (
--         SELECT geom FROM indice_point ip  WHERE nom LIKE '%' || nom_substance || '%'
--     ) t_point ON t_line.geom = t_point.geom;

--     RETURN NEXT multi_poly;  -- Retour d'une ligne contenant une géométrie MultiPolygon
-- END;
-- $$
-- LANGUAGE 'plpgsql';

create table propriete (
    id serial not null primary key,
    libelle VARCHAR(20)
);

create table prop_subs (
    id serial not null PRIMARY key,
    idprop int,
    subs VARCHAR(50)
);