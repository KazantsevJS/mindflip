# MindFlip

Минималистичное приложение для изучения карточек с интервальным повторением, созданное для подготовки к учебе.
Организуйте учебные материалы по предметам и темам, создавайте карточки и изучайте их эффективно с помощью интуитивного интерфейса.

## О приложении

MindFlip — это десктопное приложение, созданное на Electron и React, которое предоставляет чистую и сфокусированную среду для создания и изучения карточек.
Это **версия 1.0** — первоначальный релиз, сфокусированный на основной функциональности для эффективной подготовки к учебе.

## Возможности

- **Организованная структура обучения**: Создавайте предметы и организуйте темы внутри них
- **Управление карточками**: Легко добавляйте, редактируйте и удаляйте карточки
- **Интервальное повторение**: Изучайте карточки с алгоритмом, который помогает оптимизировать ваш график обучения
- **Чистый интерфейс**: Минималистичный дизайн, который помогает сосредоточиться на учебе
- **Темная/Светлая тема**: Переключайтесь между темами для комфортного изучения в любое время
- **Локальное хранилище**: Все ваши данные хранятся локально на вашем компьютере с использованием SQLite
- **Работа офлайн**: Интернет-соединение не требуется — изучайте где угодно и когда угодно

## Установка
### Для macOS
1. Скачайте последнюю версию `MindFlip-1.0.0-arm64.dmg` со страницы [Releases](https://github.com/KazantsevJS/mindflip/releases)
2. Откройте скачанный DMG файл
3. Перетащите `MindFlip.app` в папку Applications
4. Запустите MindFlip из Applications

### Сборка из исходников

Если вы хотите собрать приложение самостоятельно:

#### Требования

- Node.js (v18 или выше)
- npm или yarn

#### Шаги

1. Клонируйте репозиторий:
git clone https://github.com/KazantsevJS/mindflip.git
cd mindflip
2. Установите зависимости:
npm install
3. Запустите в режиме разработки:
npm run dev
4. Соберите для production:
npm run build

Собранное приложение будет находиться в директории dist_electron.

**Как использовать:**
Создайте предмет: Начните с добавления предмета (например, "Математика", "Философия", "Базы данных", и т.п.)
Добавьте темы: Внутри каждого предмета создавайте темы для организации ваших карточек
Создайте карточки: Добавляйте пары вопрос-ответ для каждой темы
Изучайте: Используйте режим изучения для повторения карточек с интервальным повторением
Редактируйте и управляйте: Легко редактируйте или удаляйте предметы, темы и карточки по мере необходимости

Технологии
Frontend: React 19, TypeScript
Desktop: Electron
Инструмент сборки: Vite
База данных: SQLite (через sql.js)
Управление состоянием: Zustand
Анимации: Framer Motion
Стилизация: CSS Modules

Версия 1.0
Это первоначальный релиз MindFlip. Как версия 1.0, она включает:
Основную функциональность карточек
Организацию предметов и тем
Режим изучения с интервальным повторением
Локальное хранение данных
Поддержку темной/светлой темы
Будущие версии могут включать дополнительные функции на основе отзывов пользователей и потребностей.

Участие в разработке
Это версия 1.0, и я открыт для обратной связи и вклада! Если вы столкнулись с какими-либо проблемами или у вас есть предложения по улучшению, пожалуйста, не стесняйтесь открыть issue или отправить pull request.

🙏 Благодарности
Создано с ❤️ для людей, которые хотят простой и эффективный способ быстро подготовиться к экзаменам.

Примечание: Это приложение хранит все данные локально на вашем компьютере. Ваши карточки и прогресс обучения никогда не отправляются на внешние серверы!
____________________________________________________________________________________________________________________________________________________________________________________
# MindFlip

A minimalist flashcard application with spaced repetition, designed for study preparation.
Organize your study materials by subjects and topics, create flashcards, and study them efficiently through an intuitive interface.

## About the Application

MindFlip is a desktop application built on Electron and React that provides a clean and focused environment for creating and studying flashcards.
This is **version 1.0** – the initial release, focused on core functionality for effective study preparation.

## Features

- **Organized Study Structure**: Create subjects and organize topics within them
- **Flashcard Management**: Easily add, edit, and delete flashcards
- **Spaced Repetition**: Study flashcards with an algorithm that helps optimize your learning schedule
- **Clean Interface**: Minimalist design that helps you focus on studying
- **Dark/Light Theme**: Switch between themes for comfortable studying at any time
- **Local Storage**: All your data is stored locally on your computer using SQLite
- **Offline Operation**: No internet connection required – study anywhere, anytime

## Installation
### For macOS

1. Download the latest version `MindFlip-1.0.0-arm64.dmg` from the [Releases](https://github.com/KazantsevJS/mindflip/releases) page
2. Open the downloaded DMG file
3. Drag `MindFlip.app` to the Applications folder
4. Launch MindFlip from Applications

### Building from Source

If you want to build the application yourself:

#### Requirements

- Node.js (v18 or higher)
- npm or yarn

#### Steps

1. Clone the repository:
git clone https://github.com/KazantsevJS/mindflip.git
cd mindflip
2. Install dependencies:
npm install
3. Run in development mode:
npm run dev
4. Build for production:
npm run buildThe built application will be located in the `dist_electron` directory.

## How to Use

1. **Create a Subject**: Start by adding a subject (e.g., "Mathematics", "Philosophy", "Databases", etc.)
2. **Add Topics**: Within each subject, create topics to organize your flashcards
3. **Create Flashcards**: Add question-answer pairs for each topic
4. **Study**: Use the study mode to review flashcards with spaced repetition
5. **Edit and Manage**: Easily edit or delete subjects, topics, and flashcards as needed

## Technologies

- **Frontend**: React 19, TypeScript
- **Desktop**: Electron
- **Build Tool**: Vite
- **Database**: SQLite (via sql.js)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Styling**: CSS Modules

## Version 1.0

This is the initial release of MindFlip. As version 1.0, it includes:
- Core flashcard functionality
- Subject and topic organization
- Study mode with spaced repetition
- Local data storage
- Dark/light theme support

Future versions may include additional features based on user feedback and needs.

## Contributing

This is version 1.0, and I am open to feedback and contributions! If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

## 🙏 Acknowledgments
Made with ❤️ for people who want a simple and effective way to prepare for exams quickly.
**Note**: This application stores all data locally on your computer. Your flashcards and study progress are never sent to any external servers!

