--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
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
-- Name: board_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.board_comments (
    id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    board_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.board_comments OWNER TO postgres;

--
-- Name: board_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.board_users (
    id integer NOT NULL,
    role character varying(9) DEFAULT 'MEMBER'::character varying NOT NULL,
    board_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.board_users OWNER TO postgres;

--
-- Name: COLUMN board_users.role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.board_users.role IS 'creator: CREATOR\nmoderator: MODERATOR\nmember: MEMBER';


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
    title character varying(255) NOT NULL,
    description text,
    is_public boolean DEFAULT true NOT NULL,
    color character varying(7)
);


ALTER TABLE public.boards OWNER TO postgres;

--
-- Name: columns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.columns (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    "position" integer NOT NULL,
    color character varying(7),
    board_id uuid NOT NULL
);


ALTER TABLE public.columns OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    task_id uuid NOT NULL,
    user_id uuid
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    text text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: subtasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtasks (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    task_id uuid NOT NULL
);


ALTER TABLE public.subtasks OWNER TO postgres;

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
-- Name: task_responsibles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_responsibles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_responsibles_id_seq OWNER TO postgres;

--
-- Name: task_responsibles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_responsibles_id_seq OWNED BY public.task_responsibles.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "position" integer NOT NULL,
    due_date timestamp with time zone,
    priority character varying(6) DEFAULT 'LOW'::character varying NOT NULL,
    status character varying(11) DEFAULT 'TODO'::character varying NOT NULL,
    color character varying(20),
    column_id uuid NOT NULL
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: COLUMN tasks.priority; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tasks.priority IS 'low: LOW\nmedium: MEDIUM\nhigh: HIGH';


--
-- Name: COLUMN tasks.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tasks.status IS 'to_do: TODO\nin_progress: IN_PROGRESS\ndone: DONE\nreject: REJECT';


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    avatar_url character varying(255),
    registered_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    hashed_password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: board_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_users ALTER COLUMN id SET DEFAULT nextval('public.board_users_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: task_responsibles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_responsibles ALTER COLUMN id SET DEFAULT nextval('public.task_responsibles_id_seq'::regclass);


--
-- Data for Name: board_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.board_comments (id, content, created_at, board_id, user_id) FROM stdin;
\.


--
-- Data for Name: board_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.board_users (id, role, board_id, user_id) FROM stdin;
1	CREATOR	14aedaa9-28b3-43dc-a256-1480f50fd679	e93ca4f1-6711-4343-b219-47190e672cf5
2	MODERATOR	14aedaa9-28b3-43dc-a256-1480f50fd679	d2b7af42-2a2c-460b-9661-7a4e6b99f024
3	MEMBER	14aedaa9-28b3-43dc-a256-1480f50fd679	21735a31-2ee0-4fca-9abd-1c92ce5058f6
4	CREATOR	1ad0a745-9f78-47cc-8805-2f9e611a2eeb	e93ca4f1-6711-4343-b219-47190e672cf5
\.


--
-- Data for Name: boards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boards (id, title, description, is_public, color) FROM stdin;
14aedaa9-28b3-43dc-a256-1480f50fd679	public	\N	t	\N
1ad0a745-9f78-47cc-8805-2f9e611a2eeb	private	Приватная	f	\N
\.


--
-- Data for Name: columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.columns (id, title, "position", color, board_id) FROM stdin;
9d2eb59d-96cd-4277-b2f5-97bd8756ae89	First	1	\N	14aedaa9-28b3-43dc-a256-1480f50fd679
5489f4cd-7fc5-4218-aa55-88372577d476	Second	2	\N	14aedaa9-28b3-43dc-a256-1480f50fd679
a55f983e-28d4-4bb1-b375-eae8ee0d8bc8	Здесь	1	\N	1ad0a745-9f78-47cc-8805-2f9e611a2eeb
67f9785e-8db7-454a-a26f-c7a1d20501e1	Делаем	2	\N	1ad0a745-9f78-47cc-8805-2f9e611a2eeb
ad7add72-bc5b-416a-b137-d2f305bcea20	Что	3	\N	1ad0a745-9f78-47cc-8805-2f9e611a2eeb
9815ab82-5c2e-4a9c-a175-e115b6208d19	Хотим	4	\N	1ad0a745-9f78-47cc-8805-2f9e611a2eeb
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, content, created_at, task_id, user_id) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, title, text, is_read, created_at, user_id) FROM stdin;
1	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:22:30.995515+00	e93ca4f1-6711-4343-b219-47190e672cf5
2	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:22:34.269252+00	e93ca4f1-6711-4343-b219-47190e672cf5
3	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:23:01.112322+00	e93ca4f1-6711-4343-b219-47190e672cf5
4	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:23:04.156318+00	e93ca4f1-6711-4343-b219-47190e672cf5
6	Изменение роли!	Вы были назначены на роль **МОДЕРАТОР** в доске **"public"**.\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:23:22.427766+00	d2b7af42-2a2c-460b-9661-7a4e6b99f024
5	Добавление в доску!	Вас добавили в доску **"public"**. Теперь вы часть семьи)\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	t	2025-06-14 06:23:20.43175+00	d2b7af42-2a2c-460b-9661-7a4e6b99f024
7	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:23:30.613429+00	e93ca4f1-6711-4343-b219-47190e672cf5
8	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:23:33.627325+00	e93ca4f1-6711-4343-b219-47190e672cf5
9	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:24:00.810977+00	e93ca4f1-6711-4343-b219-47190e672cf5
10	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:24:03.819859+00	e93ca4f1-6711-4343-b219-47190e672cf5
11	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:24:31.819827+00	e93ca4f1-6711-4343-b219-47190e672cf5
12	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:24:35.128698+00	e93ca4f1-6711-4343-b219-47190e672cf5
13	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:25:00.055062+00	e93ca4f1-6711-4343-b219-47190e672cf5
14	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:25:03.08065+00	e93ca4f1-6711-4343-b219-47190e672cf5
15	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:25:30.121258+00	e93ca4f1-6711-4343-b219-47190e672cf5
16	Добавление в доску!	Вас добавили в доску **"public"**. Теперь вы часть семьи)\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:25:32.624223+00	21735a31-2ee0-4fca-9abd-1c92ce5058f6
17	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:25:33.119373+00	e93ca4f1-6711-4343-b219-47190e672cf5
18	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:26:00.238687+00	e93ca4f1-6711-4343-b219-47190e672cf5
19	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:26:03.702626+00	e93ca4f1-6711-4343-b219-47190e672cf5
20	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:26:30.066589+00	e93ca4f1-6711-4343-b219-47190e672cf5
21	⏰ Уведомление о сроке задачи	Через 2 дней — срок задачи **"1.1"** в колонке **"First"** на доске **"public"**.\n\n\nСсылка: http://localhost:3000/boards/14aedaa9-28b3-43dc-a256-1480f50fd679	f	2025-06-14 06:26:33.104233+00	e93ca4f1-6711-4343-b219-47190e672cf5
\.


--
-- Data for Name: subtasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtasks (id, title, is_completed, task_id) FROM stdin;
\.


--
-- Data for Name: task_responsibles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_responsibles (id, task_id, user_id) FROM stdin;
1	13a904bc-bab1-49b0-bde5-94e0fa90c38d	e93ca4f1-6711-4343-b219-47190e672cf5
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, "position", due_date, priority, status, color, column_id) FROM stdin;
13a904bc-bab1-49b0-bde5-94e0fa90c38d	1.1	\N	1	2025-06-15 14:00:00+00	HIGH	TODO	#fad5c0	9d2eb59d-96cd-4277-b2f5-97bd8756ae89
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, avatar_url, registered_at, is_admin, hashed_password) FROM stdin;
e93ca4f1-6711-4343-b219-47190e672cf5	creator	creator@gmail.com	https://i.ibb.co/XxxNzrcg/5b0076b5f1bd.png	2025-06-14 06:21:10.746582+00	f	$2b$12$PGBmwCp9fTmO3S2fTeNlTOS4N4Yy5v.Jy0zfrqPw9hvR30YxQlfd.
d2b7af42-2a2c-460b-9661-7a4e6b99f024	moderator	moderator@gmail.com	https://i.ibb.co/WNr8HMNC/609322f82fb8.png	2025-06-14 06:22:55.319701+00	f	$2b$12$BT0HIjn46NR.YVFynDcIMuYHekksNhjkyE7lAHCyMc783TE8nptMe
21735a31-2ee0-4fca-9abd-1c92ce5058f6	member	member@gmail.com	https://i.ibb.co/rg7Bbqb/93619c0cced5.png	2025-06-14 06:24:34.375667+00	f	$2b$12$0SU7LgQn924MMA8BNYVhveprO7dEG/cUGwE.V1tMp63CqP.M8RCte
\.


--
-- Name: board_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.board_users_id_seq', 4, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 21, true);


--
-- Name: task_responsibles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_responsibles_id_seq', 1, true);


--
-- Name: board_comments board_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_comments
    ADD CONSTRAINT board_comments_pkey PRIMARY KEY (id);


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
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: subtasks subtasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_pkey PRIMARY KEY (id);


--
-- Name: task_responsibles task_responsibles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_responsibles
    ADD CONSTRAINT task_responsibles_pkey PRIMARY KEY (id);


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
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: board_comments board_comments_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_comments
    ADD CONSTRAINT board_comments_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- Name: board_comments board_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.board_comments
    ADD CONSTRAINT board_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subtasks subtasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_responsibles task_responsibles_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_responsibles
    ADD CONSTRAINT task_responsibles_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_responsibles task_responsibles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_responsibles
    ADD CONSTRAINT task_responsibles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_column_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_column_id_fkey FOREIGN KEY (column_id) REFERENCES public.columns(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--
