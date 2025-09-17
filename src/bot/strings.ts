export const strings = {
    greetUnknownUser: 'Схоже, ми ще не знайомі. Я - бот Книги Героїв, допомагаю тут по дрібницях. Чим можу вам допомогти?',
    greetUnderReviewUser: 'Привіт! Ми вже трохи знайомі. Поки ваш запит на розгялді, маю настпуний функціонал.',
    availableCommands: 'Доступні команди',
    getRandomWod: 'Дай рандомний воркаут',
    registerUnit: 'Я адмін, хочу додати підрозділ',
    reginsterVeteranBusiness: 'Я ветеран, хочу додати свій бізнес',
    needMoreFunctionality: 'Чому так мало функціоналу?',
    unitForgotPassword: 'Згенерувати одноразовий пароль.',
    unitShowOtp: 'Показати одноразовий пароль.',
    unitNotReachable: 'Підрозділ більше не доступний. Введіть /start щоб подивитись доступний функціонал.',
    unitRegistration: 'РЕЄСТРАЦІЯ ПІДРОЗДІЛУ',
    businessRegistration: 'РЕЄСТРАЦІЯ БІЗНЕСУ',
    setPhoto: 'Оберіть і відправте лого',
    setName: 'Введіть назву',
    setDescription: 'Введіть опис',
    setFoundationDate: 'YYYY-MM-DD (прик. 2025-04-17)',
    changesApplied: 'ЗМІНИ ЗАСТОСОВАНІ',
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
    unitApproved: (otp: string) => `Ваш підрозділ було зареєстровано.\nВикористайте цей код, для першого входу в додаток:\n${otp}.\nТам ви зможете додати інформацію та опублікувати його.`,
    unitNewOtpGenerated: (otp: string) => `Використайте цей код, як під час першого входу в додаток: \n${otp}`,
    unitYourOtp: (otp: string) => `Ваш одноразовий пароль для першого входу в додаток:\n${otp}`,
    unitRejected: 'Ваш запит на реєстрацію підрозділу було відхилено.',
    nameValidation: 'Назва обовʼязкова та має не перевищувати 20 символів',
    descriptionValidation: 'Опис обовʼязкова та має не перевищувати 1000 символів',
    foundationDateValidation: 'Дата заснування обовʼязкова та має відповідати формату YYYY-DD-MM (2025-04-17)',

    greetKnownUser: (name: string) => {
        return `Привіт, ${name}! Що будемо робити?`;
    },
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