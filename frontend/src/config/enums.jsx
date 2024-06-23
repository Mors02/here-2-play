const ErrorMap = {
    "ERR_WRONG_CREDENTIALS": "Email o password sbagliati.",
    "ERR_ALREADY_EXISTS": "Email o Username già in uso.",
    "ERR_BAD_REQUEST": "Errore nel server.",
    "ERR_INVALID_PASSWORD": "Password non valida.",
    "ERR_DIFFERENT_PASSWORDS": "Le password non corrispondono",
    "ERR_SERVER_ERROR": "Errore con il server.",
    "ERR_RESOURCE_NOT_FOUND": "Non trovato.",
    "ERR_USER_NOT_FOUND": "User non trovato.",
    "ERR_ALREADY_REQUESTED": "Hai già inviato una richiesta di amicizia.",
    "ERR_SELF_FRIEND": "Non puoi essere amico di te stesso."
}

const blockedUrls = [
    "/user",
    "/login",
    "/register"
]

export {ErrorMap, blockedUrls}