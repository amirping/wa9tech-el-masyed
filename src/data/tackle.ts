export type BaitId = 'worm' | 'sardine' | 'crab' | 'shrimp' | 'squid' | 'mussel' | 'bread' | 'live'

export interface Bait {
  name: string
  tip: string
}

export const BAITS: Record<BaitId, Bait> = {
  worm: { name: 'الدود (محرس ولا بحيرة)', tip: 'حطّو كامل على الصنارة وخلّي طرف يتحرّك. بدّلو كل 20 دقيقة.' },
  sardine: { name: 'سردينة', tip: 'مقصوصة فيليه ومربوطة بخيط الإيلاستيك (fil élastique) باش ما تطيحش في اللانسي.' },
  crab: { name: 'قبقوب', tip: 'القبقوب اللين (crabe mou) أحسن. اربطو بالإيلاستيك.' },
  shrimp: { name: 'قمبري', tip: 'قمبري حي ولا طري، الصنارة من الذيل.' },
  squid: { name: 'كلمار / شوابي', tip: 'الأبيض متاعو مقصوص شرايح، يصبر على الصنارة.' },
  mussel: { name: 'بلح البحر (moule)', tip: 'محلول ومربوط بالإيلاستيك.' },
  bread: { name: 'خبز ولا عجينة', tip: 'عجينة بالسردين ولا الجبن، كوّر صغير.' },
  live: { name: 'حوتة حيّة (بوري صغير، سبوقة)', tip: 'الصنارة في ظهرها باش تبقى تعوم.' },
}

export type RigId = 'sliding' | 'twoHook' | 'longLeader' | 'grip' | 'nightBig' | 'float' | 'rock' | 'liveBait'

export interface Rig {
  name: string
  how: string
  hook: string
}

export const RIGS: Record<RigId, Rig> = {
  sliding: {
    name: 'تركيبة منزلقة (coulissant)',
    how: 'البلومب يجري على الخيط الأساسي، بعدو ميريون (émerillon) وبادولين طولو 1.5 حتى 3 متر (0.28–0.35). الحوت يهزّ الطعم وما يحسّش بالثقل.',
    hook: '1/0 حتى 3/0',
  },
  twoHook: {
    name: 'تركيبة بفرعين (pater noster)',
    how: 'خيط 0.40 فيه زوز فروع، كل فرع 30 حتى 60 سم بخيط 0.22–0.28. البلومب في التالي.',
    hook: '6 حتى 1',
  },
  longLeader: {
    name: 'بادولين طويل (bas de ligne long)',
    how: 'كي البحر راكد والماء صافي: بادولين 3 حتى 5 متر، 0.22–0.26 فليوروكاربون، وبلومب خفيف.',
    hook: '2 حتى 1',
  },
  grip: {
    name: 'تركيبة البحر الهايج (plomb grappin)',
    how: 'بلومب بالمخالب 125 حتى 175 غرام باش ما يجرّوش الموج. بادولين قصير 60 حتى 100 سم (0.35–0.40).',
    hook: '1/0 حتى 3/0 قويّة',
  },
  nightBig: {
    name: 'تركيبة الحوت الكبير في الليل',
    how: 'خيط 0.45–0.50، طعم كبير (سردينة كاملة ولا كلمار)، والفران (frein) مرخوف شويّة.',
    hook: '3/0 حتى 5/0',
  },
  float: {
    name: 'بالفلوتور (bouchon)',
    how: 'فلوتور 2 حتى 4 غرام، خيط 0.18–0.20، والطعم على عمق نص متر لمتر ونص.',
    hook: '10 حتى 6',
  },
  rock: {
    name: 'تركيبة قصيرة للصخر',
    how: 'بادولين قصير 40 حتى 60 سم باش ما يتشبّكش. البلومب بخيط أضعف (fil de rupture) باش كان تشبّك يتقطع هو برك.',
    hook: '2 حتى 1/0',
  },
  liveBait: {
    name: 'تركيبة الحوتة الحيّة',
    how: 'بادولين 0.40 طولو متر، بلومب منزلق خفيف ولا بلاش بلومب، وخلّي الحوتة تعوم.',
    hook: '2/0 حتى 4/0',
  },
}

/** Sinker weight advice by the wave height that actually reaches the beach. */
export function sinkerFor(effHs: number): string {
  if (effHs < 0.5) return '80 حتى 100 غرام'
  if (effHs < 1) return '100 حتى 125 غرام'
  if (effHs < 1.5) return '125 حتى 150 غرام (grappin)'
  return '150 حتى 175 غرام (grappin)'
}
