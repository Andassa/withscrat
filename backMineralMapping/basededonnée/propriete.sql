-- SQLBook: Code
-- public.propriete definition

-- Drop table

-- DROP TABLE public.propriete;

CREATE TABLE public.propriete (
	id serial4 NOT NULL,
	libelle varchar(50) NULL,
	description varchar(200) NULL,
	CONSTRAINT propriete_pkey PRIMARY KEY (id)
);