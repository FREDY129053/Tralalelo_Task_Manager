<div align="center">
  <img align="center" width="250px" height="250px" src="https://m.gjcdn.net/video-poster/900/40595871-axse7zjr-v4.webp" alt="IDOL" />
</div>

# Tralalelo Tasklala 🧩

**Tralalelo Tasklala** — это современный таск-менеджер, вдохновлённый Trello, предназначенный для эффективной командной работы и управления проектами. Проект реализован с использованием современных технологий и полностью разворачивается в Docker.

---

## 🚀 Быстрый старт

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/your-username/Tralalelo_Tasklala.git
   ```
2. Перейдите в папку проекта:
    ```bash
    cd Tralalelo_Tasklala
    ```
3. Запустите проект с помощью Docker:
    ```bash
    docker-compose up --build -d
    ```
После сборки проект будет доступен по адресам ниже:

## 🌐 Доступные страницы
| Назначение                     | URL                                                                        |
| ------------------------------ | -------------------------------------------------------------------------- |
| Swagger-документация API       | [http://localhost:8080/docs](http://localhost:8080/docs)                   |
| Страница входа / регистрации   | [http://localhost:3000](http://localhost:3000)                             |
| Главная страница досок         | [http://localhost:3000/main](http://localhost:3000/main)                   |
| Доски, в которых вы участвуете | [http://localhost:3000/in\_boards](http://localhost:3000/in_boards)        |
| Профиль пользователя           | [http://localhost:3000/profile](http://localhost:3000/profile)             |
| Уведомления                    | [http://localhost:3000/notifications](http://localhost:3000/notifications) |

## 🔐 Тестовые пользователи
| Роль      | Логин     | Пароль    |
| --------- | --------- | --------- |
| Создатель | creator   | creator   |
| Модератор | moderator | moderator |
| Участник  | member    | member    |

## 👨‍💻 Команда разработки
| Участник             | Роль в проекте                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **Зверев Родион**    | Архитектура и настройка проекта, проектирование базы данных, frontend, часть backend (уведомления) |
| **Иванов Илья**      | Основная часть backend                                                                             |
| **Нестеренко Алина** | Дизайн интерфейсов, помощь в frontend                                                              |


## 🛠️ Стек технологий
### Backend
- FastAPI — быстрый веб-фреймворк для Python

- Tortoise ORM — асинхронный ORM

- PostgreSQL — реляционная СУБД

### Frontend
- Next.js — React-фреймворк для SSR/SPA приложений
- TailwindCSS - CSS-фреймворк для создания стилей

### DevOps
- Docker — контейнеризация
- docker-compose — удобное развёртывание всего приложения

## 🧩 Схема базы данных
🔗 [Посмотреть схему базы данных](https://liambx.com/erd/p/github.com/FREDY129053/Tralalelo_Task_Manager/blob/main/backend/schema.sql?showMode=ALL_FIELDS)

## 🖼️ Демо-ролик проекта
🎞️ [Видео](https://drive.google.com/file/d/1-Nbv_tC1lIYSwBGBQN4Rcgyuz5PYHj5n/view?usp=drive_link)
