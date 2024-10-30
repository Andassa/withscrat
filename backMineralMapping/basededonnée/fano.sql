-- SQLBook: Code
-- public.decoupe_cent definition

-- Drop table

-- DROP TABLE public.decoupe_cent;

CREATE TABLE public.decoupe_cent (
	gid int4 NOT NULL DEFAULT nextval('dec_100_dmst_gid_seq'::regclass),
	perimeter numeric NULL,
	dec100new_ float8 NULL,
	indicatif varchar(8) NULL,
	nom varchar(40) NULL,
	date_editi int2 NULL,
	geom public.geometry(multipolygon) NULL,
	CONSTRAINT dec_100_dmst_pkey PRIMARY KEY (gid)
);
CREATE INDEX dec_100_dmst_geom_idx ON public.decoupe_cent USING gist (geom);


-- public.geol definition

-- Drop table

-- DROP TABLE public.geol;

CREATE TABLE public.geol (
	id serial4 NOT NULL,
	lithology varchar(254) NULL,
	geom public.geometry NULL,
	mot2 varchar(254) NULL,
	mot1 varchar(200) NULL,
	CONSTRAINT geol_pkey PRIMARY KEY (id)
);


-- public.indice_line definition

-- Drop table

-- DROP TABLE public.indice_line;

CREATE TABLE public.indice_line (
	gid int4 NOT NULL DEFAULT nextval('indice_line_wgs_gid_seq'::regclass),
	nom varchar(100) NULL,
	subst varchar(35) NULL,
	localite varchar(100) NULL,
	secteur varchar(100) NULL,
	geometrie varchar(85) NULL,
	azimut varchar(32) NULL,
	age varchar(27) NULL,
	nature varchar(75) NULL,
	taille float8 NULL,
	tonnage varchar(40) NULL,
	teneur varchar(63) NULL,
	"source" varchar(10) NULL,
	geom public.geometry(multilinestring) NULL,
	CONSTRAINT indice_line_wgs_pkey PRIMARY KEY (gid)
);
CREATE INDEX indice_line_wgs_geom_idx ON public.indice_line USING gist (geom);


-- public.indice_point definition

-- Drop table

-- DROP TABLE public.indice_point;

CREATE TABLE public.indice_point (
	gid serial4 NOT NULL,
	objectid float8 NULL,
	nom varchar(100) NULL,
	subst varchar(35) NULL,
	localite varchar(100) NULL,
	secteur varchar(100) NULL,
	geometrie varchar(87) NULL,
	azimut varchar(32) NULL,
	age varchar(29) NULL,
	nature varchar(75) NULL,
	taille numeric NULL,
	tonnage varchar(40) NULL,
	teneur varchar(63) NULL,
	"source" varchar(10) NULL,
	"n°" numeric NULL,
	geom public.geometry(point) NULL,
	CONSTRAINT indice_point_pkey PRIMARY KEY (gid)
);
CREATE INDEX indice_point_geom_idx ON public.indice_point USING gist (geom);


-- public.indice_zone definition

-- Drop table

-- DROP TABLE public.indice_zone;

CREATE TABLE public.indice_zone (
	gid serial4 NOT NULL,
	nom varchar(100) NULL,
	subst varchar(35) NULL,
	localite varchar(100) NULL,
	secteur varchar(100) NULL,
	geometrie varchar(85) NULL,
	azimut varchar(32) NULL,
	age varchar(28) NULL,
	nature varchar(75) NULL,
	taille float8 NULL,
	tonnage varchar(40) NULL,
	teneur varchar(63) NULL,
	"source" varchar(10) NULL,
	geom public.geometry(multipolygon) NULL,
	CONSTRAINT indice_zone_pkey PRIMARY KEY (gid)
);
CREATE INDEX indice_zone_geom_idx ON public.indice_zone USING gist (geom);


-- public.substances definition

-- Drop table

-- DROP TABLE public.substances;

CREATE TABLE public.substances (
	id serial4 NOT NULL,
	nom varchar(255) NULL,
	CONSTRAINT substances_pkey PRIMARY KEY (id)
);


-- public.prop_subs definition

-- Drop table

-- DROP TABLE public.prop_subs;

CREATE TABLE public.prop_subs (
	id serial4 NOT NULL,
	idprop int4 NULL,
	subs varchar(50) NULL,
	CONSTRAINT prop_subs_pkey PRIMARY KEY (id)
);


-- public.prop_subs foreign keys

ALTER TABLE public.prop_subs ADD CONSTRAINT prop_subs_fk FOREIGN KEY (idprop) REFERENCES public.propriete(id);