export const strings = {
    greetUnknownUser: 'Схоже, ми ще не знайомі. Я - бот Книги Героїв, допомагаю тут по дрібницях. Чим можу вам допомогти?',
    getRandomWod: 'Дай рандомний воркаут',
    registerUnit: 'Я адмін, хочу додати підрозділ',
    reginsterVeteranBusiness: 'Я ветеран, хочу додати свій бізнес',
    needMoreFunctionality: 'Чому так мало функціоналу?',

    wodMessageTemplate: (name: string, date: Date, scheme: string) => {
        return `${name}\nДата виконання: ${date.toLocaleDateString("uk-UA", {month:'long',day:'numeric'})}\n\nСхема:\n${scheme}`;
    }, 
}