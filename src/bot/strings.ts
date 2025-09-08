export const strings = {
    greetUnknownUser: 'Схоже, ми ще не знайомі. Я - бот Книги Героїв, допомагаю тут по дрібницях. Чим можу вам допомогти?',
    greetUnderReviewUser: 'Привіт! Ми вже трохи знайомі. Поки ваш запит на розгялді, маю настпуний функціонал.',
    greetKnownUser: (name: string) => {
        return `Привіт, ${name}! Що будемо робити?`;
    },
    getRandomWod: 'Дай рандомний воркаут',
    registerUnit: 'Я адмін, хочу додати підрозділ',
    reginsterVeteranBusiness: 'Я ветеран, хочу додати свій бізнес',
    needMoreFunctionality: 'Чому так мало функціоналу?',
    unitRegistration: 'РЕЄСТРАЦІЯ ПІДРОЗДІЛУ',
    businessRegistration: 'РЕЄСТРАЦІЯ БІЗНЕСУ',
    unitRegistrationExplanation: `РЕЄСТРАЦІЯ ПІДРОЗДІЛУ\n
Відповіддю на це повідомлення ви зробите запит на рееєстрацію підрозділу.
Назву потім можна буде змінити. Інстаграм та телеграм канал (не обовʼязковий) для верифікації
Відправте повідомлення по цьому шаблону:\n
{
    "name": "example_unit_name",
    "adminEmail": "unitAdmin@example.com",
    "instagramUrl": "example_unit_instagram_url",
    "telegramChannel": "example_unit_channel_link"
}`,
    unitRegistrationWrongFormat: 'Не правильний формат. Подивіться приклад з повідомлення.',
    cantIdentifyUser: 'Не можу ідентифікувати користувача. Спробуйте ще раз.',
    botsNotAllowed: 'Мені заборонено спілкуватись із ботами.',
    usernameNotDefined: 'Будь ласка, встановіть імʼя користувача в налаштуваннях і спробуйте ще раз. Нам буде легше комунікувати.',
    userBanned: 'Ви забанені. Наразі не можу нічим допомогти.',
    downloadApps: `Щоб отримати більше функціоналу, будь ласка, завантажте наш застосунок:\niOS: ТУТ ПОСИЛАННЯ НА АЙОС\nANDROID: ТУТ ПОСИЛАННЯ НА АНДРОЇД.`,
    approve: 'ЗАТВЕРДИТИ',
    reject: 'ВІДХИЛИТИ',
    ban: 'БАН',
    unitRegistrationAccepted: 'Запит на розгляді. Щоб отримати сповіщення не видаляйте цей чат',
    unitRegistrationExists: 'Ви вже стоврили запит на підрозділ, він на розгляді.',
    uknownErrorHappend: 'На нашому боці сталась помилка. Працюємо над її виправленням.',
    unitApproved: 'Ваш підрозділ було зареєстровано. Тепер ви зможете його дозаповнити та опублікувати.',
    unitRejected: 'Ваш запит на реєстрацію підрозділу було відхилено.',

    unitRegistrationRequest: (requestInfo: string, contact: string) => {
        return `ЗАПИТ НА ПІДРОЗДІЛ:\n\nКОНТАКТ:${contact}\n\n${requestInfo}`;
    },
    unknownRequest: (requestOrCommand: string) => {
        return `Нажаль, я не знаю такої команди: ${requestOrCommand}`
    },
    wodMessageTemplate: (name: string, date: Date, scheme: string) => {
        return `${name}\nДата виконання: ${date.toLocaleDateString("uk-UA", {month:'long',day:'numeric'})}\n\nСхема:\n${scheme}`;
    }
}