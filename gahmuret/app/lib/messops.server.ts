// @ts-ignore no types for this yet
import acceptLanguageParser from 'accept-language-parser';
import type {AbstractIntlMessages} from "use-intl";

export function resolveLocale(request: Request) {
    const supported_languages = ['en', 'es'];
    const default_langauge = supported_languages[0];
    // hunt for locale in query params
    const url = new URL(request.url);
    const url_locale = url.searchParams.get('locale');
    // prefer URL-provided locale, then accept-language header, then default
    const locale =
        acceptLanguageParser.pick(
            supported_languages,
            url_locale || request.headers.get('accept-language') || default_langauge,
            // allow loose matching ('es' for 'es-ES')
            {loose: true}
        ) || default_langauge;
    return locale;
}

export async function getMessages(locale = 'en') {
    // use relative import here, because it's dynamic and ~/ can only be used in static imports
    return (await import(`../../messages/${locale}.json`)).default;
}

/**
 * @param {AbstractIntlMessages} messages Locale-specific messages HashMap
 * @param {string} namespace Optional namespace to prepend on the lookup_key when actioning the t() call
 * @return {Function} return a translation function `t(lookup_key)` that returns locale-specific strings
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getTestTranslations(messages: AbstractIntlMessages, namespace?: string): Function {
    return (key: string) => {
        const composite_path = namespace ? `${namespace}.${key}` : key;
        return composite_path.split('.').reduce((previousValue: AbstractIntlMessages, currentValue: string) => previousValue[currentValue] as AbstractIntlMessages, messages);
    };
}

export function getTimezone() {
    return 'Europe/London';
}
