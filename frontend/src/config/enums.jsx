const ErrorMap = {
    'ERR_WRONG_CREDENTIALS': 'Email o password sbagliati.',
    'ERR_ALREADY_EXISTS': 'Email o Username già in uso.',
    'ERR_BAD_REQUEST': 'Errore nel server.',
    'ERR_INVALID_PASSWORD': 'Password non valida.',
    'ERR_DIFFERENT_PASSWORDS': 'Le password non corrispondono',
    'ERR_SERVER_ERROR': 'Errore con il server.',
    'ERR_RESOURCE_NOT_FOUND': 'Non trovato.',
    'ERR_USER_NOT_FOUND': 'User non trovato.',
    'ERR_GAME_NOT_FOUND': 'Gioco non trovato.',
    'ERR_ALREADY_REQUESTED': 'Hai già inviato una richiesta di amicizia.',
    'ERR_SELF_FRIEND': 'Non puoi essere amico di te stesso.',
    'ERR_STUPID': 'Lo user è stupido.',
    'ERR_ALREADY_IN_CART': 'Il gioco è già nel carrello',
    'ERR_ALREADY_BOUGHT' : 'Il gioco è già nella libreria',
    'ERR_COVER_REQUIRED': 'L\'immagine di copertina è richiesto',
    'ERR_ATTACHMENTS_REQUIRED': 'Gli allegati del gioco sono richiesti',
    'ERR_NO_RATING': 'Non hai valutato il gioco.',
    'ERR_TOO_MANY_TAGS': 'Puoi scegliere al massimo 4 tags.',
    'ERR_NO_GAMES_AVAILABLES': 'Non sono presenti giochi con tali filtri.',
    'ERR_GAME_NOT_OWNED': 'Gioco non posseduto.',
    'ERR_UNAUTHORIZED': 'Non hai i permessi per compiere quest\'azione.',
    'ERR_OVERLAP_DISCOUNTS': 'I periodi di sconto non possono incrociarsi con quelli già attivi!',
    'ERR_NOT_LOGGED_IN': 'Non sei loggato!',
    'ERR_INSECURE_PASSWORD': 'La password deve: non essere comune, non essere numerica, almeno 8 caratteri, diversa dallo username',
    'ERR_EMPTY_EMAIL_OR_USERNAME': 'La mail o lo username non possono essere vuoti',
    'ERR_INVALID_EMAIL': 'La mail non è valida'
}
const blockedUrls = []

const validUrls = [
    "^/$",
    '^/user/[0-9]+$',
]

export {ErrorMap, blockedUrls, validUrls}