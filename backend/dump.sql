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
    user_id uuid,
    board_id uuid,
    role text NOT NULL,
    CONSTRAINT board_users_role_check CHECK ((role = ANY (ARRAY['CREATOR'::text, 'MODERATOR'::text, 'MEMBER'::text])))
);


ALTER TABLE public.board_users OWNER TO postgres;

--
-- Name: board_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: board_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.board_users_id_seq OWNED BY public.board_users.id;


--
-- Name: boards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.boards (
    id uuid NOT NULL,
    title text NOT NULL,
    description text,
    is_public boolean DEFAULT true
);


ALTER TABLE public.boards OWNER TO postgres;

--
-- Name: columns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.columns (
    id uuid NOT NULL,
    board_id uuid,
    title text NOT NULL,
    "position" integer
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
    color text,
    CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['LOW'::text, 'MEDIUM'::text, 'HIGH'::text]))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['TODO'::text, 'IN_PROGRESS'::text, 'DONE'::text])))
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
    is_admin boolean DEFAULT false,
    password text NOT NULL DEFAULT ''
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: board_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_users ALTER COLUMN id SET DEFAULT nextval('public.board_users_id_seq'::regclass);


--
-- Data for Name: board_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.board_users (id, user_id, board_id, role) FROM stdin;
1	6f8a6abd-8bef-4f24-af71-17491774f43a	391361ae-e561-4f1a-b0ee-440c5c62611e	CREATOR
2	9869795d-ffa1-448b-a9fc-a2e9ee2cbe3f	391361ae-e561-4f1a-b0ee-440c5c62611e	MEMBER
\.


--
-- Data for Name: boards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boards (id, title, description, is_public) FROM stdin;
391361ae-e561-4f1a-b0ee-440c5c62611e	Frontend Redesign	Redesign the frontend using modern UI practices.	t
bee5e92c-d1e6-46fb-acc1-8b0dfc6bc3a7	Backend Refactor	Refactor legacy backend services for better performance.	f
\.


--
-- Data for Name: columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.columns (id, board_id, title, "position") FROM stdin;
9efdd78c-97b7-47b7-884a-ec689019adc4	391361ae-e561-4f1a-b0ee-440c5c62611e	To Do	1
1ad40261-b051-460d-8176-10a3d7226b8f	391361ae-e561-4f1a-b0ee-440c5c62611e	In Progress	2
17231aad-6286-411d-982a-98756c029a12	391361ae-e561-4f1a-b0ee-440c5c62611e	Done	3
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, task_id, user_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: subtasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtasks (id, task_id, title, is_completed) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, column_id, title, description, due_date, priority, status, color) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, phone, avatar_url, is_admin) FROM stdin;
6f8a6abd-8bef-4f24-af71-17491774f43a	alice	alice@example.com	+1234567890	https://example.com/avatars/alice.png	f
9869795d-ffa1-448b-a9fc-a2e9ee2cbe3f	bob	bob@example.com	+0987654321	https://example.com/avatars/bob.png	f
\.


--
-- Name: board_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.board_users_id_seq', 2, true);


--
-- Name: board_users board_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_users
    ADD CONSTRAINT board_users_pkey PRIMARY KEY (id);


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
-- PostgreSQL database dump complete
--

