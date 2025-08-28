export const strings = {
    greetUnknownUser: 'Схоже, ми ще не знайомі. Я - бот Книги Героїв, допомагаю тут по дрібницях. Чим можу вам допомогти?',
    getRandomWod: 'Дай рандомний воркаут',
    registerUnit: 'Я адмін, хочу додати підрозділ',
    reginsterVeteranBusiness: 'Я ветеран, хочу додати свій бізнес',
    needMoreFunctionality: 'Чому так мало функціоналу?',
    unknownRequest: (requestOrCommand: string) => {
        return `Нажаль, я не знаю такої команди: ${requestOrCommand}`
    },

    wodMessageTemplate: (name: string, date: Date, scheme: string) => {
        return `${name}\nДата виконання: ${date.toLocaleDateString("uk-UA", {month:'long',day:'numeric'})}\n\nСхема:\n${scheme}`;
    },

    unitRegistrationExplanation: `Відповіддю на це повідомлення ви зробите запит на рееєстрацію підрозділу.
Просто дозаповність шаблон, який я вже вставив.
Назву потім можна буде змінити. Інстаграм та телеграм канал для верифікації`,
    unitRegistrationTemplate: `Назва:\nПосилання на інстграм акк:\nПосилання на тг канал (якщо є):`
}