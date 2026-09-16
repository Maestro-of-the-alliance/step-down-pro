import { SampleImage } from '../types';

// Crisp, high-contrast, colorful vector art rendered as data URIs for instant previewing
const SAMPLES: SampleImage[] = [
  {
    id: 'cyberpunk',
    name: 'Neon Metropolis',
    category: 'Sci-Fi',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0c0422"/>
            <stop offset="50%" stop-color="#3c096c"/>
            <stop offset="85%" stop-color="#9d4edd"/>
            <stop offset="100%" stop-color="#ff6b6b"/>
          </linearGradient>
          <radialGradient id="sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffea00"/>
            <stop offset="70%" stop-color="#ff007f"/>
            <stop offset="100%" stop-color="#7209b7"/>
          </radialGradient>
          <linearGradient id="grid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ff007f" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#4cc9f0" stop-opacity="0.2"/>
          </linearGradient>
        </defs>
        <!-- Sky -->
        <rect width="600" height="600" fill="url(#sky)"/>
        <!-- Cyber Sun -->
        <circle cx="300" cy="270" r="130" fill="url(#sun)"/>
        <!-- Sun horizontal cuts -->
        <rect x="160" y="270" width="280" height="6" fill="#3c096c"/>
        <rect x="160" y="285" width="280" height="9" fill="#3c096c"/>
        <rect x="160" y="303" width="280" height="13" fill="#3c096c"/>
        <rect x="160" y="325" width="280" height="18" fill="#3c096c"/>
        <rect x="160" y="352" width="280" height="24" fill="#3c096c"/>
        <!-- Distant Mountains -->
        <polygon points="0,420 120,340 250,400 390,320 520,380 600,340 600,450 0,450" fill="#240046"/>
        <!-- Skyline Silhouettes -->
        <rect x="40" y="240" width="65" height="220" fill="#10002b"/>
        <rect x="55" y="260" width="8" height="180" fill="#4cc9f0"/>
        <rect x="75" y="280" width="8" height="140" fill="#ffea00"/>
        
        <rect x="130" y="210" width="80" height="250" fill="#0d0221"/>
        <polygon points="170,170 160,210 180,210" fill="#ff007f"/>
        <rect x="145" y="230" width="50" height="4" fill="#ff007f"/>
        <rect x="145" y="245" width="50" height="4" fill="#ff007f"/>
        <rect x="145" y="260" width="50" height="4" fill="#ff007f"/>
        <rect x="145" y="275" width="50" height="4" fill="#ff007f"/>

        <rect x="230" y="290" width="90" height="170" fill="#1b033d"/>
        <rect x="250" y="310" width="12" height="12" fill="#00f5d4"/>
        <rect x="280" y="310" width="12" height="12" fill="#ff007f"/>
        <rect x="250" y="340" width="12" height="12" fill="#ffea00"/>
        <rect x="280" y="340" width="12" height="12" fill="#00f5d4"/>

        <rect x="340" y="220" width="75" height="240" fill="#0c0422"/>
        <rect x="440" y="260" width="95" height="200" fill="#15002b"/>
        <rect x="460" y="280" width="55" height="5" fill="#4cc9f0"/>
        <rect x="460" y="295" width="55" height="5" fill="#4cc9f0"/>
        <rect x="460" y="310" width="55" height="5" fill="#ffea00"/>

        <!-- Grid Floor -->
        <rect x="0" y="440" width="600" height="160" fill="#05010e"/>
        <line x1="0" y1="460" x2="600" y2="460" stroke="#ff007f" stroke-width="2"/>
        <line x1="0" y1="485" x2="600" y2="485" stroke="#ff007f" stroke-width="2"/>
        <line x1="0" y1="515" x2="600" y2="515" stroke="#ff007f" stroke-width="3"/>
        <line x1="0" y1="555" x2="600" y2="555" stroke="#ff007f" stroke-width="4"/>
        
        <!-- Perspective grid lines -->
        <line x1="300" y1="440" x2="0" y2="600" stroke="#4cc9f0" stroke-width="2"/>
        <line x1="300" y1="440" x2="150" y2="600" stroke="#4cc9f0" stroke-width="2"/>
        <line x1="300" y1="440" x2="300" y2="600" stroke="#4cc9f0" stroke-width="2"/>
        <line x1="300" y1="440" x2="450" y2="600" stroke="#4cc9f0" stroke-width="2"/>
        <line x1="300" y1="440" x2="600" y2="600" stroke="#4cc9f0" stroke-width="2"/>
      </svg>
    `)}`,
  },
  {
    id: 'shiba',
    name: 'Pixel Shiba',
    category: 'Character',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffecd2"/>
            <stop offset="100%" stop-color="#fcb69f"/>
          </radialGradient>
        </defs>
        <rect width="600" height="600" fill="url(#bg)"/>
        <!-- Soft background circle -->
        <circle cx="300" cy="300" r="230" fill="#ffffff" opacity="0.6"/>
        
        <!-- Ears -->
        <polygon points="170,220 220,110 270,190" fill="#d97724"/>
        <polygon points="190,200 220,135 250,185" fill="#fceade"/>
        
        <polygon points="430,220 380,110 330,190" fill="#d97724"/>
        <polygon points="410,200 380,135 350,185" fill="#fceade"/>
        
        <!-- Head Base -->
        <ellipse cx="300" cy="300" rx="160" ry="145" fill="#e88938"/>
        
        <!-- White cheeks & muzzle mask -->
        <path d="M 170 300 C 170 410, 230 420, 300 420 C 370 420, 430 410, 430 300 C 420 250, 370 270, 300 295 C 230 270, 180 250, 170 300 Z" fill="#ffffff"/>
        <circle cx="210" cy="270" r="16" fill="#ffffff"/>
        <circle cx="390" cy="270" r="16" fill="#ffffff"/>
        
        <!-- Eyes -->
        <ellipse cx="235" cy="275" rx="14" ry="17" fill="#2d1b11"/>
        <circle cx="230" cy="270" r="5" fill="#ffffff"/>
        
        <ellipse cx="365" cy="275" rx="14" ry="17" fill="#2d1b11"/>
        <circle cx="360" cy="270" r="5" fill="#ffffff"/>

        <!-- Nose -->
        <ellipse cx="300" cy="335" rx="18" ry="13" fill="#1b120c"/>
        <ellipse cx="297" cy="331" rx="5" ry="3" fill="#665b55"/>

        <!-- Cute Smile -->
        <path d="M 300 348 L 300 365" stroke="#1b120c" stroke-width="4" stroke-linecap="round"/>
        <path d="M 270 365 Q 300 380 300 365 Q 300 380 330 365" fill="none" stroke="#1b120c" stroke-width="4" stroke-linecap="round"/>
        
        <!-- Pink Blush -->
        <ellipse cx="195" cy="330" rx="22" ry="14" fill="#ff708d" opacity="0.45"/>
        <ellipse cx="405" cy="330" rx="22" ry="14" fill="#ff708d" opacity="0.45"/>

        <!-- Little Bandana -->
        <polygon points="230,425 300,510 370,425" fill="#2a9d8f"/>
        <circle cx="300" cy="460" r="6" fill="#e9c46a"/>
        <circle cx="280" cy="445" r="5" fill="#e9c46a"/>
        <circle cx="320" cy="445" r="5" fill="#e9c46a"/>
      </svg>
    `)}`,
  },
  {
    id: 'alpine',
    name: 'Mountain Lake',
    category: 'Nature',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e3c72"/>
            <stop offset="40%" stop-color="#2a5298"/>
            <stop offset="70%" stop-color="#f39c12"/>
            <stop offset="100%" stop-color="#e74c3c"/>
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1b4965"/>
            <stop offset="100%" stop-color="#0b1b26"/>
          </linearGradient>
        </defs>
        <!-- Sky -->
        <rect width="600" height="380" fill="url(#skyGrad)"/>
        <!-- Setting Sun -->
        <circle cx="300" cy="270" r="70" fill="#ffd166"/>
        
        <!-- Distant Mountain Range -->
        <polygon points="0,380 90,220 180,310 300,160 410,290 510,200 600,330 600,380" fill="#3d348b"/>
        <!-- Snowcaps -->
        <polygon points="300,160 275,195 295,190 300,205 315,190 325,195" fill="#ffffff"/>
        <polygon points="90,220 75,245 90,240 105,245" fill="#ffffff"/>
        <polygon points="510,200 495,225 510,220 525,225" fill="#ffffff"/>

        <!-- Near Mountain -->
        <polygon points="120,380 230,260 350,380" fill="#2b2d42"/>
        <polygon points="380,380 480,280 600,380" fill="#2b2d42"/>

        <!-- Water -->
        <rect y="380" width="600" height="220" fill="url(#waterGrad)"/>
        <!-- Water reflection shimmer -->
        <ellipse cx="300" cy="420" rx="40" ry="4" fill="#ffd166" opacity="0.7"/>
        <ellipse cx="300" cy="445" rx="60" ry="4" fill="#ffd166" opacity="0.6"/>
        <ellipse cx="300" cy="475" rx="80" ry="5" fill="#ffd166" opacity="0.4"/>
        <ellipse cx="300" cy="515" rx="100" ry="6" fill="#f39c12" opacity="0.3"/>

        <!-- Pine Trees Silhouette Foreground -->
        <polygon points="40,430 65,340 90,430" fill="#081c15"/>
        <polygon points="70,440 95,350 120,440" fill="#081c15"/>
        <polygon points="20,450 45,370 70,450" fill="#081c15"/>
        
        <polygon points="470,440 500,330 530,440" fill="#081c15"/>
        <polygon points="510,450 535,360 560,450" fill="#081c15"/>
        <polygon points="440,460 465,380 490,460" fill="#081c15"/>
      </svg>
    `)}`,
  },
  {
    id: 'ramen',
    name: 'Steaming Ramen',
    category: 'Food',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="#1d2d44"/>
        <!-- Table mat -->
        <rect x="60" y="240" width="480" height="320" rx="30" fill="#3e5c76" opacity="0.4"/>
        
        <!-- Steam swirls -->
        <path d="M 230 180 Q 210 140 240 100 Q 270 60 250 30" fill="none" stroke="#f0ebd8" stroke-width="6" stroke-linecap="round" opacity="0.4"/>
        <path d="M 300 170 Q 280 130 310 90 Q 340 50 320 20" fill="none" stroke="#f0ebd8" stroke-width="7" stroke-linecap="round" opacity="0.5"/>
        <path d="M 370 190 Q 350 150 380 110 Q 410 70 390 40" fill="none" stroke="#f0ebd8" stroke-width="5" stroke-linecap="round" opacity="0.4"/>

        <!-- Bowl Shadow -->
        <ellipse cx="300" cy="460" rx="190" ry="50" fill="#0d131a" opacity="0.5"/>
        
        <!-- Bowl Outer -->
        <path d="M 120 310 Q 300 520 480 310 Z" fill="#d90429"/>
        <path d="M 140 330 Q 300 500 460 330 Z" fill="#ef233c"/>
        <rect x="170" y="320" width="260" height="10" fill="#ffffff" rx="5"/>
        
        <!-- Bowl Rim & Broth -->
        <ellipse cx="300" cy="310" rx="180" ry="70" fill="#ffffff"/>
        <ellipse cx="300" cy="310" rx="168" ry="60" fill="#a0601e"/>
        
        <!-- Noodles (golden yellow curls) -->
        <ellipse cx="270" cy="310" rx="110" ry="40" fill="#f4a261"/>
        
        <!-- Boiled Egg Halves -->
        <g transform="translate(340, 290) rotate(20)">
          <ellipse cx="0" cy="0" rx="36" ry="26" fill="#ffffff"/>
          <circle cx="4" cy="0" r="16" fill="#f39c12"/>
          <circle cx="2" cy="-3" r="5" fill="#f1faee"/>
        </g>

        <!-- Chashu Pork slices -->
        <g transform="translate(230, 280) rotate(-15)">
          <ellipse cx="0" cy="0" rx="42" ry="28" fill="#8d0801"/>
          <ellipse cx="0" cy="0" rx="34" ry="20" fill="#b7094c"/>
          <circle cx="-5" cy="0" r="12" fill="#c9184a"/>
        </g>
        
        <!-- Narutomaki (Fish cake) -->
        <g transform="translate(295, 335)">
          <circle cx="0" cy="0" r="22" fill="#ffffff"/>
          <path d="M -8 -3 Q 0 -14 10 -6 Q 14 6 0 10 Q -10 6 -8 -3" fill="none" stroke="#ff4d6d" stroke-width="4"/>
        </g>

        <!-- Green Onions (Scallions) -->
        <circle cx="220" cy="325" r="7" fill="#52b788"/>
        <circle cx="235" cy="340" r="6" fill="#40916c"/>
        <circle cx="215" cy="345" r="7" fill="#74c69d"/>
        <circle cx="360" cy="340" r="8" fill="#52b788"/>
        <circle cx="375" cy="325" r="6" fill="#40916c"/>

        <!-- Nori Seaweed sheets -->
        <polygon points="150,260 170,210 205,225 185,275" fill="#1b4332"/>
        <polygon points="175,250 195,200 230,215 210,265" fill="#081c15"/>
        
        <!-- Chopsticks resting -->
        <line x1="160" y1="210" x2="480" y2="280" stroke="#774936" stroke-width="8" stroke-linecap="round"/>
        <line x1="150" y1="225" x2="470" y2="295" stroke="#5e3023" stroke-width="8" stroke-linecap="round"/>
      </svg>
    `)}`,
  },
];

export { SAMPLES };
