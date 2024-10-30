-- SQLBook: Code
CREATE TABLE public.roles (
	id serial4 NOT NULL,
	"label" varchar(255) NOT NULL,
	CONSTRAINT roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.etat_user (
	id serial4 NOT NULL,
	libelle varchar(20) NULL,
	CONSTRAINT etat_user_pkey PRIMARY KEY (id)
);

CREATE TABLE public.utilisateurs (
	id varchar(255) NOT NULL,
	nom varchar(255) NOT NULL,
	prenom varchar(255) NULL,
	username varchar(255) NULL,
	fonction varchar(255) NOT NULL,
	email varchar(255) NULL,
	motdepasse varchar(500) NOT NULL,
	autorisation int4 NOT NULL,
	etat int4 NULL,
	service varchar(50) NULL,
	idresp varchar NULL,
	CONSTRAINT utilisateurs_pkey PRIMARY KEY (id)
);


-- public.utilisateurs foreign keys

ALTER TABLE public.utilisateurs ADD CONSTRAINT fkutilisateu875415 FOREIGN KEY (autorisation) REFERENCES public.roles(id);
ALTER TABLE public.utilisateurs ADD CONSTRAINT utilisateurs_fk FOREIGN KEY (etat) REFERENCES public.etat_user(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.utilisateurs ADD CONSTRAINT utilisateursresp_fk FOREIGN KEY (idresp) REFERENCES public.utilisateurs(id);

