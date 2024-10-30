-- SQLBook: Code
CREATE TABLE public.typepermis (
	id serial4 NOT NULL,
	libelle varchar(50) NULL,
	typepermis varchar NULL,
	column1 int4 NULL,
	octroie varchar NULL,
	renouvellement varchar NULL,
	CONSTRAINT typepermis_pkey PRIMARY KEY (id)
);
CREATE TABLE public.personne_societe (
	id serial4 NOT NULL,
	registre_1 varchar(100) NULL,
	registre_2 varchar(50) NULL,
	CONSTRAINT personne_societe_pkey PRIMARY KEY (id)
);