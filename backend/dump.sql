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
    id integer NOT NULL,
    user_id uuid NOT NULL,
    board_id uuid NOT NULL,
    role text NOT NULL,
    CONSTRAINT board_users_role_check CHECK ((role = ANY (ARRAY['CREATOR'::text, 'MODERATOR'::text, 'MEMBER'::text])))
);


ALTER TABLE public.board_users OWNER TO postgres;

--
-- Name: user_company_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.board_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.board_users_id_seq OWNER TO postgres;

--
-- Name: user_company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.board_users_id_seq OWNED BY public.board_users.id;

ALTER TABLE ONLY public.board_users ALTER COLUMN id SET DEFAULT nextval('public.board_users_id_seq'::regclass);

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


CREATE TABLE public.board_comments (
    id uuid NOT NULL,
    board_id uuid,
    user_id uuid,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.board_comments OWNER TO postgres;

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
    created_at timestamp with time zone DEFAULT now()
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
    id uuid NOT NULL UNIQUE,
    column_id uuid,
    title text NOT NULL,
    description text,
    "position" integer DEFAULT 0,
    due_date timestamp with time zone,
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
    id uuid NOT NULL UNIQUE,
    username text NOT NULL,
    email text NOT NULL,
    phone text,
    avatar_url text,
    registered_at timestamp with time zone DEFAULT now(),
    is_admin boolean DEFAULT false,
    hashed_password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: board_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.board_users (user_id, board_id, role) FROM stdin;
E63961D3-EC08-4218-A963-62B0B1807D51	1ECB27CB-D670-4E63-A1D1-1F77B2CA2ED4	CREATOR
C6A107FD-EB99-4C18-8FCB-EC030685D942	1ECB27CB-D670-4E63-A1D1-1F77B2CA2ED4	MEMBER
C6A107FD-EB99-4C18-8FCB-EC030685D942	B9E7DDC8-47CF-475F-ADEA-D379535C3292	CREATOR
87CB46FF-26F8-4ED5-94F7-6C70E00976FE	B9E7DDC8-47CF-475F-ADEA-D379535C3292	MEMBER
\.


--
-- Data for Name: boards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boards (id, title, description, is_public, color) FROM stdin;
1ECB27CB-D670-4E63-A1D1-1F77B2CA2ED4	Project A	Private project	f	#ff5733
B9E7DDC8-47CF-475F-ADEA-D379535C3292	Public Board	Shared tasks	t	#33ccff
\.


--
-- Data for Name: columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.columns (id, board_id, title, "position", color) FROM stdin;
1ECB27CB-D670-4E63-A1D1-1F77B2CA2ED4	1ECB27CB-D670-4E63-A1D1-1F77B2CA2ED4	To Do	1	#dddddd
B9E7DDC8-47CF-475F-ADEA-D379535C3292	1ECB27CB-D670-4E63-A1D1-1F77B2CA2ED4	Done	2	\N
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, task_id, user_id, content, created_at) FROM stdin;
1D6DDCFC-7BA2-4CF1-926C-5C828035CAE8	36A87185-B559-4E9C-A74A-23D621E6FFE2	E63961D3-EC08-4218-A963-62B0B1807D51	Working on it.	2025-05-07 06:00:00
\.


--
-- Data for Name: subtasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtasks (id, task_id, title, is_completed) FROM stdin;
3EF9B483-C3CD-4DEF-B2F9-CED6434512B7	36A87185-B559-4E9C-A74A-23D621E6FFE2	Check logs	t
DF0D436C-319A-4F45-BC1A-920AFA68EF62	36A87185-B559-4E9C-A74A-23D621E6FFE2	Write test	f
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, column_id, title, description, due_date, priority, status, color, responsible_id) FROM stdin;
36A87185-B559-4E9C-A74A-23D621E6FFE2	B9E7DDC8-47CF-475F-ADEA-D379535C3292	Fix Bug	Fix login issue	2025-05-10 10:00:00	HIGH	TODO	#f1c40f	C6A107FD-EB99-4C18-8FCB-EC030685D942
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, phone, avatar_url, registered_at, is_admin, hashed_password) FROM stdin;
E63961D3-EC08-4218-A963-62B0B1807D51	alice	alice@example.com	\N	\N	2025-05-07 05:59:02	t	$2b$12$QoaDexl3tzBVmPGZnf5oOun4RzLo8KuSgULbhAsWZ5aw9ATBME7ZW
C6A107FD-EB99-4C18-8FCB-EC030685D942	bob	bob@example.com	\N	\N	2025-05-07 05:59:02	f	hashed_pass_bob
87CB46FF-26F8-4ED5-94F7-6C70E00976FE	carol	carol@example.com	\N	\N	2025-05-07 05:59:02	f	hashed_pass_carol
\.


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    title text NOT NULL,
    text text NOT NULL,
    is_read boolean DEFAULT false,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notifications OWNER TO postgres;

--
-- Create sequence for notifications.id
--
CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;

ALTER TABLE ONLY public.notifications
    ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_responsibles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_responsibles (
    id integer NOT NULL,
    task_id uuid NOT NULL,
    user_id uuid NOT NULL
);

ALTER TABLE public.task_responsibles OWNER TO postgres;

--
-- Create sequence for task_responsibles.id
--
CREATE SEQUENCE public.task_responsibles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.task_responsibles_id_seq OWNER TO postgres;

ALTER SEQUENCE public.task_responsibles_id_seq OWNED BY public.task_responsibles.id;

ALTER TABLE ONLY public.task_responsibles
    ALTER COLUMN id SET DEFAULT nextval('public.task_responsibles_id_seq'::regclass);

ALTER TABLE ONLY public.task_responsibles
    ADD CONSTRAINT task_responsibles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.task_responsibles
    ADD CONSTRAINT task_responsibles_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.task_responsibles
    ADD CONSTRAINT task_responsibles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;



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


ALTER TABLE ONLY public.board_comments
    ADD CONSTRAINT board_comments_pkey PRIMARY KEY (id);

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

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
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



ALTER TABLE ONLY public.board_comments
    ADD CONSTRAINT board_comments_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;
--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.board_comments
    ADD CONSTRAINT board_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
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
