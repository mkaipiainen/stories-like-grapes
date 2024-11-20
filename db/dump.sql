--
-- PostgreSQL database dump
--

-- Dumped from database version 17.1 (Debian 17.1-1.pgdg120+1)
-- Dumped by pg_dump version 17.1 (Debian 17.1-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: entity_tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entity_tag (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    tag text NOT NULL,
    column_name integer
);


ALTER TABLE public.entity_tag OWNER TO postgres;

--
-- Name: plant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    description text,
    name text,
    watering_frequency integer
);


ALTER TABLE public.plant OWNER TO postgres;

--
-- Data for Name: entity_tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entity_tag (id, entity_id, entity_type, tag, column_name) FROM stdin;
\.


--
-- Data for Name: plant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plant (id, description, name, watering_frequency) FROM stdin;
\.


--
-- Name: entity_tag entity_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entity_tag
    ADD CONSTRAINT entity_tag_pkey PRIMARY KEY (id);


--
-- Name: plant plant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant
    ADD CONSTRAINT plant_pkey PRIMARY KEY (id);


--
-- Name: entity_tag_entity_id_entity_class__index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX entity_tag_entity_id_entity_class__index ON public.entity_tag USING btree (entity_id, entity_type, tag);


--
-- PostgreSQL database dump complete
--

