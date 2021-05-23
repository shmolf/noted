import $ from 'jquery';
import { Cookie, getCookie, deleteCookie } from 'cuki/dist/cuki';
// @ts-ignore
import CookieConsent from '@grrr/cookie-consent';
import 'NODE/@grrr/cookie-consent/styles/cookie-consent.scss';

const FUNC = 'consent-functional';
const REMEMBERME = 'consent-rememberme';

const cookieConsent = CookieConsent({
    append: true, // We'll manually append in the $.ready function
    cookies: [
        {
            id: FUNC,
            label: 'Functional',
            description: 'We use cookies to track what settings you\'ve opted for, to prepare the html/assets.',
            required: false,
        },
        {
            id: REMEMBERME,
            label: 'Remember Me',
            description: 'By using the "Remember Me" option during login, a cookie is stored for subsequent logins.',
            required: true,
        },
    ],
    // Labels to provide content for the dialog.
    labels: {
        title: 'Cookies & Privacy',
        description: '<p>Disallowing the use of cookies can disrupt application behavior.</p>',
        // Button labels based on state and preferences.
        button: {
            // The default button label.
            default: 'Save preferences',
            // Shown when `acceptAllButton` is set, and no option is selected.
            acceptAll: 'Accept all',
        },
        // ARIA labels to improve accessibility.
        aria: {
            button: 'Confirm cookie settings',
            tabList: 'List with cookie types',
            tabToggle: 'Toggle cookie tab',
        },
    },
});

$(() => {
    if (cookieConsent.isAccepted(FUNC) === undefined) {
        cookieConsent.showDialog();
    }

    $('.show-cookie-pref').on('click', () => {
        cookieConsent.showDialog();
    });
});

function store(name: string, value: string|number|boolean, duration?: number): void {
  if (cookieConsent.isAccepted(FUNC)) {
    (new Cookie({name, value, daysAlive: (duration ?? 365)})).persist();
  }
}

function get(name: string): string|number|boolean|null {
    return getCookie(name);
}

function remove(name: string): void {
    deleteCookie(name);
}

export default {
    store,
    get,
    remove,
};
