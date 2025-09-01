export const strings = {
    greetUnknownUser: 'Схоже, ми ще не знайомі. Я - бот Книги Героїв, допомагаю тут по дрібницях. Чим можу вам допомогти?',
    getRandomWod: 'Дай рандомний воркаут',
    registerUnit: 'Я адмін, хочу додати підрозділ',
    reginsterVeteranBusiness: 'Я ветеран, хочу додати свій бізнес',
    needMoreFunctionality: 'Чому так мало функціоналу?',
    unitRegistration: 'РЕЄСТРАЦІЯ ПІДРОЗДІЛУ',
    businessRegistration: 'РЕЄСТРАЦІЯ БІЗНЕСУ',
    unitRegistrationExplanation: `РЕЄСТРАЦІЯ ПІДРОЗДІЛУ\n
Відповіддю на це повідомлення ви зробите запит на рееєстрацію підрозділу.
Назву потім можна буде змінити. Інстаграм та телеграм канал (якщо є) для верифікації
Відправте повідомлення по цьому шаблону:\n
Назва:\nIнстаграм:\nТелеграм канал:`,
    unitRegistrationTemplate: `Назва:\nПосилання на інстграм акк:\nПосилання на тг канал (якщо є):`,
    cantIdentifyUser: 'Не можу ідентифікувати користувача. Спробуйте ще раз.',
    botsNotAllowed: 'Мені заборонено спілкуватись із ботами.',
    usernameNotDefined: 'Будь ласка, встановіть імʼя користувача в налаштуваннях і спробуйте ще раз. Нам буде легше комунікувати.',
    userBanned: 'Ви забанені. Наразі не можу нічим допомогти.',

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