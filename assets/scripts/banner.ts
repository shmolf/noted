import CookieMonster from 'SCRIPTS/lib/cookie';

interface CookieReference {
  [key: string]: string;
}

const revealingClass = 'not-dismissed';

let banner: HTMLElement|null;

const BannerCookies: CookieReference = {
  newStorage: 'NEW STORAGE NOTICE',
};

window.onload = () => {
  banner = document.getElementById('notice-banner');

  if (!isDismissed('newStorage')) {
    revealBanner();
  }

  if (banner !== null) {
    banner.onclick = () => dismiss('newStorage');
  }
};

function isDismissed(bannerName: string) {
  return Boolean(CookieMonster.get(BannerCookies[bannerName]));
}

function revealBanner() {
  banner?.classList?.add(revealingClass);
}

function dismiss(bannerName: string) {
  CookieMonster.store(BannerCookies[bannerName], true);
  banner?.classList?.remove(revealingClass);
}
