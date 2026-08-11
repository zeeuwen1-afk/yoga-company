/**
 * Vervanger voor het pakket `server-only` tijdens het testen.
 *
 * Dat pakket gooit zodra het buiten een React-servercontext wordt geladen — in
 * productie precies wat je wilt, want het voorkomt dat servercode per ongeluk
 * in de browser belandt. In unittests roepen we die modules rechtstreeks aan,
 * dus daar vervangt deze lege module hem.
 */
export {};
