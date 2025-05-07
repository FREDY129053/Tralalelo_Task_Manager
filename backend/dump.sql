--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: board_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.board_users (
    user_id uuid NOT NULL,
    board_id uuid NOT NULL,
    role text NOT NULL,
    CONSTRAINT board_users_role_check CHECK ((role = ANY (ARRAY['CREATOR'::text, 'MODERATOR'::text, 'MEMBER'::text])))
);


ALTER TABLE public.board_users OWNER TO postgres;

--
-- Name: boards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.boards (
    id uuid NOT NULL,
    title text NOT NULL,
    description text,
    is_public boolean DEFAULT true,
    color character varying(7),
    CONSTRAINT color_hex_constraint_boards CHECK (((color IS NULL) OR ((color)::text ~* '^#[a-f0-9]{6}$'::text)))
);


ALTER TABLE public.boards OWNER TO postgres;

--
-- Name: columns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.columns (
    id uuid NOT NULL,
    board_id uuid,
    title text NOT NULL,
    "position" integer,
    color character varying(7),
    CONSTRAINT color_hex_constraint_columns CHECK (((color IS NULL) OR ((color)::text ~* '^#[a-f0-9]{6}$'::text)))
);


ALTER TABLE public.columns OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    task_id uuid,
    user_id uuid,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: subtasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtasks (
    id uuid NOT NULL,
    task_id uuid,
    title text NOT NULL,
    is_completed boolean DEFAULT false
);


ALTER TABLE public.subtasks OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid NOT NULL,
    column_id uuid,
    title text NOT NULL,
    description text,
    due_date timestamp without time zone,
    priority text,
    status text,
    color character varying(7),
    responsible_id uuid,
    CONSTRAINT color_hex_constraint_tasks CHECK (((color IS NULL) OR ((color)::text ~* '^#[a-f0-9]{6}$'::text))),
    CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['LOW'::text, 'MEDIUM'::text, 'HIGH'::text]))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['TODO'::text, 'IN_PROGRESS'::text, 'DONE'::text, 'REJECT'::text])))
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    phone text,
    avatar_url text,
    registered_at timestamp without time zone DEFAULT now(),
    is_admin boolean DEFAULT false,
    hashed_password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: board_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.board_users (user_id, board_id, role) FROM stdin;
00000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000001	CREATOR
00000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000001	MEMBER
00000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000002	CREATOR
00000000-0000-0000-0000-000000000003	10000000-0000-0000-0000-000000000002	MEMBER
\.


--
-- Data for Name: boards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boards (id, title, description, is_public, color) FROM stdin;
10000000-0000-0000-0000-000000000001	Project A	Private project	f	#ff5733
10000000-0000-0000-0000-000000000002	Public Board	Shared tasks	t	#33ccff
\.


--
-- Data for Name: columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.columns (id, board_id, title, "position", color) FROM stdin;
20000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000001	To Do	1	#dddddd
20000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000001	Done	2	\N
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, task_id, user_id, content, created_at) FROM stdin;
50000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001	Working on it.	2025-05-07 06:00:00
\.


--
-- Data for Name: subtasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtasks (id, task_id, title, is_completed) FROM stdin;
40000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	Check logs	t
40000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000001	Write test	f
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, column_id, title, description, due_date, priority, status, color, responsible_id) FROM stdin;
30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	Fix Bug	Fix login issue	2025-05-10 10:00:00	HIGH	TODO	#f1c40f	00000000-0000-0000-0000-000000000002
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, phone, avatar_url, registered_at, is_admin, hashed_password) FROM stdin;
00000000-0000-0000-0000-000000000001	alice	alice@example.com	1234567890	\N	2025-05-07 05:59:02	t	hashed_pass_alice
00000000-0000-0000-0000-000000000002	bob	bob@example.com	\N	\N	2025-05-07 05:59:02	f	hashed_pass_bob
00000000-0000-0000-0000-000000000003	carol	carol@example.com	\N	\N	2025-05-07 05:59:02	f	hashed_pass_carol
\.


--
-- Name: board_users board_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_users
    ADD CONSTRAINT board_users_pkey PRIMARY KEY (user_id, board_id);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: columns columns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.columns
    ADD CONSTRAINT columns_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: subtasks subtasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: board_users board_users_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_users
    ADD CONSTRAINT board_users_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- Name: board_users board_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_users
    ADD CONSTRAINT board_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: columns columns_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.columns
    ADD CONSTRAINT columns_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- Name: comments comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: subtasks subtasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_column_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_column_id_fkey FOREIGN KEY (column_id) REFERENCES public.columns(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_responsible_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_responsible_id_fkey FOREIGN KEY (responsible_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

