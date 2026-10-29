/**
 * i18n — English, Türkçe, Azərbaycan (user-facing languages).
 * Interpolation: {n} placeholders.
 */
import type { Lang } from '../game/types';

type Dict = Record<string, string>;

const en: Dict = {
  'meta.title': 'Stakura — Serene Tower Stacking',

  'menu.tagline': 'Stack calm. Stack high.',
  'menu.play': 'PLAY',
  'menu.themes': 'THEMES',
  'menu.missions': 'MISSIONS',
  'menu.settings': 'SETTINGS',
  'menu.best': 'BEST {n}m',

  'hud.m': 'm',

  'combo.perfect': 'PERFECT',
  'combo.growing': 'GROWING',
  'milestone.text': '{n}m MILESTONE +{b}',

  'over.title': 'THE TOWER RESTS',
  'over.best': 'BEST',
  'over.stacked': 'You stacked {n}m',
  'over.newBest': 'NEW BEST',
  'over.gems': '+{n} gems',
  'over.tryAgain': 'TRY AGAIN',
  'over.home': 'HOME',
  'over.share': 'SHARE',
  'over.shareText': 'I stacked {n}m in Stakura. Can you go higher?',

  'themes.title': 'THEMES',
  'themes.selected': 'ACTIVE',
  'themes.cost': '{n} gems',
  'themes.locked': 'TAP TO UNLOCK',
  'themes.special': 'Reach {n}m in one run',
  'themes.need': 'Need {n} more gems',
  'themes.unlocked': 'Theme unlocked',

  'missions.title': 'DAILY MISSIONS',
  'missions.claim': 'CLAIM +{n}',
  'missions.claimed': 'CLAIMED',
  'missions.done': 'DONE',
  'missions.reset': 'New missions every day',
  'mission.height': 'Skyline: reach {n}m in one run',
  'mission.perfects': 'Precision: {n} perfect drops today',
  'mission.combo': 'Flow: chain {n} perfects in a row',
  'mission.runs': 'Persistence: play {n} runs today',
  'mission.floors': 'Dedication: stack {n} floors today',

  'settings.title': 'SETTINGS',
  'settings.sound': 'Sound',
  'settings.haptics': 'Haptics',
  'settings.quality': 'Graphics',
  'settings.qualityAuto': 'AUTO',
  'settings.qualityHigh': 'HIGH',
  'settings.qualityEco': 'ECO',
  'settings.language': 'Language',
  'settings.about': 'About',
  'settings.reset': 'Reset progress',
  'settings.resetConfirm': 'Erase all progress? This cannot be undone.',
  'settings.resetYes': 'ERASE',
  'settings.resetNo': 'KEEP',
  'settings.version': 'Stakura v{v} — web build',

  'pause.title': 'PAUSED',
  'pause.resume': 'RESUME',
  'pause.restart': 'RESTART',
  'pause.home': 'HOME',

  'onboard.title': 'Tap to drop the block',
  'onboard.body': 'Land perfectly to build combos — combos grow your block back.',

  'toast.copied': 'Copied to clipboard',
  'toast.missionDone': 'Mission complete — claim your gems',
  'toast.claimed': '+{n} gems claimed',
  'toast.themeUnlocked': 'Theme unlocked: {name}',
  'toast.newThemeSelected': 'Theme active',

  'a11y.pause': 'Pause the game',
  'a11y.gems': 'Gems: {n}',
  'a11y.height': 'Height: {n} meters',

  'theme.dusk': 'Dusk Sakura',
  'theme.matcha': 'Matcha Mist',
  'theme.coral': 'Coral Dawn',
  'theme.honey': 'Honey Fields',
  'theme.ember': 'Ember Dusk',
  'theme.plum': 'Plum Velvet',
  'theme.jade': 'Jade River',
  'theme.midnight': 'Midnight Lantern',
  'theme.prism': 'Prism Void',
  'theme.storm': 'Sakura Storm',

  'error.noWebgl': 'Your browser cannot run WebGL. Stakura needs it to render its 3D towers.',
};

const tr: Dict = {
  'meta.title': 'Stakura — Huzurlu Kule Dizme',

  'menu.tagline': 'Sakin diz. Yükseğe diz.',
  'menu.play': 'OYNA',
  'menu.themes': 'TEMALAR',
  'menu.missions': 'GÖREVLER',
  'menu.settings': 'AYARLAR',
  'menu.best': 'EN İYİ {n}m',

  'hud.m': 'm',

  'combo.perfect': 'MÜKEMMEL',
  'combo.growing': 'BÜYÜYOR',
  'milestone.text': '{n}m MİLESTONE +{b}',

  'over.title': 'KULE DİNLENİYOR',
  'over.best': 'EN İYİ',
  'over.stacked': '{n} metre dikdurdun',
  'over.newBest': 'YENİ REKOR',
  'over.gems': '+{n} elmas',
  'over.tryAgain': 'TEKRAR DENE',
  'over.home': 'ANA SAYFA',
  'over.share': 'PAYLAŞ',
  'over.shareText': 'Stakura’da {n} metre dikdurdum. Sen daha yükseğe çıkabilir misin?',

  'themes.title': 'TEMALAR',
  'themes.selected': 'AKTİF',
  'themes.cost': '{n} elmas',
  'themes.locked': 'AÇMAK İÇİN DOKUN',
  'themes.special': 'Tek oyunda {n} metre ulaş',
  'themes.need': '{n} elmas daha gerekli',
  'themes.unlocked': 'Tema açıldı',

  'missions.title': 'GÜNLÜK GÖREVLER',
  'missions.claim': 'AL +{n}',
  'missions.claimed': 'ALINDI',
  'missions.done': 'TAMAM',
  'missions.reset': 'Her gün yeni görevler',
  'mission.height': 'Ufuk çizgisi: tek oyunda {n} metre ulaş',
  'mission.perfects': 'Hassasiyet: bugün {n} mükemmel bırakış',
  'mission.combo': 'Akış: art arda {n} mükemmel zincirle',
  'mission.runs': 'Kararlılık: bugün {n} oyun oyna',
  'mission.floors': 'Adanmışlık: bugün {n} kat diz',

  'settings.title': 'AYARLAR',
  'settings.sound': 'Ses',
  'settings.haptics': 'Titreşim',
  'settings.quality': 'Grafik',
  'settings.qualityAuto': 'OTO',
  'settings.qualityHigh': 'YÜKSEK',
  'settings.qualityEco': 'EKONOMİ',
  'settings.language': 'Dil',
  'settings.about': 'Hakkında',
  'settings.reset': 'İlerlemeyi sıfırla',
  'settings.resetConfirm': 'Tüm ilerleme silinsin mi? Bu geri alınamaz.',
  'settings.resetYes': 'SİL',
  'settings.resetNo': 'KORU',
  'settings.version': 'Stakura v{v} — web sürümü',

  'pause.title': 'DURAKLADI',
  'pause.resume': 'DEVAM ET',
  'pause.restart': 'YENİDEN BAŞLAT',
  'pause.home': 'ANA SAYFA',

  'onboard.title': 'Bloğu bırakmak için dokun',
  'onboard.body': 'Mükemmel inişler seriyi büyütür — seri bloğun geri gelmesini sağlar.',

  'toast.copied': 'Panoya kopyalandı',
  'toast.missionDone': 'Görev tamamlandı — elmasını al',
  'toast.claimed': '+{n} elmas alındı',
  'toast.themeUnlocked': 'Tema açıldı: {name}',
  'toast.newThemeSelected': 'Tema etkin',

  'a11y.pause': 'Oyunu duraklat',
  'a11y.gems': 'Elmas: {n}',
  'a11y.height': 'Yükseklik: {n} metre',

  'theme.dusk': 'Alacakaranlık Sakura',
  'theme.matcha': 'Matcha Sisi',
  'theme.coral': 'Mercan Şafağı',
  'theme.honey': 'Bal Tarlaları',
  'theme.ember': 'Kor Alacakaranlığı',
  'theme.plum': 'Mürdüm Kadife',
  'theme.jade': 'Yeşim Nehri',
  'theme.midnight': 'Gece Feneri',
  'theme.prism': 'Prizma Boşluğu',
  'theme.storm': 'Sakura Fırtınası',

  'error.noWebgl': 'Tarayıcın WebGL çalıştıramıyor. Stakura’nın 3D kuleleri için gerekli.',
};

const az: Dict = {
  'meta.title': 'Stakura — Sakit Qala Dizmə',

  'menu.tagline': 'Sakit diz. Yüksəyə diz.',
  'menu.play': 'OYNA',
  'menu.themes': 'MÖVZULAR',
  'menu.missions': 'TAPŞIRIQLAR',
  'menu.settings': 'TƏNZİMLƏMƏLƏR',
  'menu.best': 'REKORD {n}m',

  'hud.m': 'm',

  'combo.perfect': 'MÜKƏMMƏL',
  'combo.growing': 'BÖYÜYÜR',
  'milestone.text': '{n}m MİLESTONE +{b}',

  'over.title': 'QULA DİNLƏNİR',
  'over.best': 'REKORD',
  'over.stacked': '{n} metr qaldırdın',
  'over.newBest': 'YENİ REKORD',
  'over.gems': '+{n} kristal',
  'over.tryAgain': 'YENİDƏN',
  'over.home': 'EV',
  'over.share': 'PAYLAŞ',
  'over.shareText': 'Stakura’da {n} metr qaldırdım. Sən daha yüksəyə çıxa bilərsənmi?',

  'themes.title': 'MÖVZULAR',
  'themes.selected': 'AKTİV',
  'themes.cost': '{n} kristal',
  'themes.locked': 'AÇMAQ ÜÇÜN TOXUN',
  'themes.special': 'Tək oyunda {n} metrə çat',
  'themes.need': '{n} kristal daha lazımdır',
  'themes.unlocked': 'Mövzu açıldı',

  'missions.title': 'GÜNLÜK TAPŞIRIQLAR',
  'missions.claim': 'GÖTÜR +{n}',
  'missions.claimed': 'GÖTÜRÜLDÜ',
  'missions.done': 'HAZIR',
  'missions.reset': 'Hər gün yeni tapşırıqlar',
  'mission.height': 'Üfüq: tək oyunda {n} metrə çat',
  'mission.perfects': 'Dəqiqlik: bu gün {n} mükəmməl buraxılış',
  'mission.combo': 'Axın: ard-arda {n} mükəmməl zənciri',
  'mission.runs': 'İrarət: bu gün {n} oyun oyna',
  'mission.floors': 'Sədaqət: bu gün {n} mərtəbə diz',

  'settings.title': 'TƏNZİMLƏMƏLƏR',
  'settings.sound': 'Səs',
  'settings.haptics': 'Titrəmə',
  'settings.quality': 'Qrafika',
  'settings.qualityAuto': 'AVTO',
  'settings.qualityHigh': 'YÜKSƏK',
  'settings.qualityEco': 'EKO',
  'settings.language': 'Dil',
  'settings.about': 'Haqqında',
  'settings.reset': 'İrəliləyişi sıfırla',
  'settings.resetConfirm': 'Bütün irəliləyiş silinsin? Bu geri qaytarıla bilməz.',
  'settings.resetYes': 'SİL',
  'settings.resetNo': 'SAXLA',
  'settings.version': 'Stakura v{v} — web versiyası',

  'pause.title': 'DAYANDIRILDI',
  'pause.resume': 'DEVAM ET',
  'pause.restart': 'YENİDƏN BAŞLA',
  'pause.home': 'EV',

  'onboard.title': 'Bloku buraxmaq üçün toxun',
  'onboard.body': 'Mükəmməl enişlər zənciri böyüdür — zəncir blokun geri qayıtmasını təmin edir.',

  'toast.copied': 'Mübadilə buferinə kopyalandı',
  'toast.missionDone': 'Tapşırıq tamamlandı — kristalını götür',
  'toast.claimed': '+{n} kristal alındı',
  'toast.themeUnlocked': 'Mövzu açıldı: {name}',
  'toast.newThemeSelected': 'Mövzu aktivdir',

  'a11y.pause': 'Oyunu dayandır',
  'a11y.gems': 'Kristal: {n}',
  'a11y.height': 'Hündürlük: {n} metr',

  'theme.dusk': 'Alatoran Sakura',
  'theme.matcha': 'Matcha Dumanı',
  'theme.coral': 'Mərcan Sübhü',
  'theme.honey': 'Bal Tarlaları',
  'theme.ember': 'Köz Alatoranı',
  'theme.plum': 'Gavalı Məxməri',
  'theme.jade': 'Yaşəm Çayı',
  'theme.midnight': 'Gecə Fənəri',
  'theme.prism': 'Prizma Boşluğu',
  'theme.storm': 'Sakura Fırtınası',

  'error.noWebgl': 'Brauzerinz WebGL işlədə bilmir. Stakura bunu 3D qüllər üçün istifadə edir.',
};

const DICTS: Record<Lang, Dict> = { en, tr, az };

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'tr', label: 'Türkçe' },
  { id: 'az', label: 'Azərbaycanca' },
];

let current: Lang = 'en';

export function detectLang(): Lang {
  try {
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith('az')) return 'az';
    if (nav.startsWith('tr')) return 'tr';
  } catch {
    /* default en */
  }
  return 'en';
}

export function setLang(lang: Lang): void {
  current = lang;
  document.documentElement.lang = lang;
}

export function getLang(): Lang {
  return current;
}

export function t(key: string, params?: Record<string, string | number>): string {
  let str = DICTS[current][key] ?? en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}
