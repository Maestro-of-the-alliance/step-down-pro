import { SampleAnimationPreset } from '../types';

export const ANIMATION_PRESETS: SampleAnimationPreset[] = [
  {
    id: 'flame',
    name: 'Campfire Flame',
    category: 'Elemental',
    fps: 8,
    frames: [
      {
        name: 'Flame 1',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#0f0717"/>
            <!-- Logs -->
            <polygon points="40,170 160,170 150,185 50,185" fill="#4a2810"/>
            <polygon points="50,160 150,175 140,185 40,170" fill="#6d3b14"/>
            <!-- Flame base -->
            <path d="M70,170 Q100,165 130,170 Q135,140 120,115 Q100,85 100,60 Q90,95 80,120 Q65,145 70,170 Z" fill="#e63946"/>
            <!-- Orange core -->
            <path d="M80,170 Q100,167 120,170 Q125,145 115,125 Q100,105 102,80 Q92,110 85,130 Q75,150 80,170 Z" fill="#f77f00"/>
            <!-- Yellow hot center -->
            <path d="M90,170 Q100,168 110,170 Q115,150 108,135 Q100,120 101,105 Q96,125 92,140 Q88,155 90,170 Z" fill="#fcbf49"/>
            <!-- Sparks -->
            <circle cx="85" cy="50" r="3" fill="#fcbf49"/>
            <circle cx="115" cy="70" r="2.5" fill="#f77f00"/>
          </svg>
        `)}`
      },
      {
        name: 'Flame 2',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#0f0717"/>
            <polygon points="40,170 160,170 150,185 50,185" fill="#4a2810"/>
            <polygon points="50,160 150,175 140,185 40,170" fill="#6d3b14"/>
            <!-- Flame leaping taller & curving right -->
            <path d="M68,170 Q100,165 132,170 Q140,135 125,105 Q115,70 110,40 Q95,80 82,110 Q64,140 68,170 Z" fill="#e63946"/>
            <path d="M78,170 Q100,167 122,170 Q128,140 118,115 Q110,90 108,60 Q96,95 87,120 Q75,145 78,170 Z" fill="#f77f00"/>
            <path d="M88,170 Q100,168 112,170 Q118,145 112,125 Q105,105 106,85 Q98,110 93,130 Q86,150 88,170 Z" fill="#fcbf49"/>
            <!-- Sparks -->
            <circle cx="110" cy="30" r="3.5" fill="#fcbf49"/>
            <circle cx="125" cy="55" r="2" fill="#fcbf49"/>
            <circle cx="75" cy="65" r="2.5" fill="#f77f00"/>
          </svg>
        `)}`
      },
      {
        name: 'Flame 3',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#0f0717"/>
            <polygon points="40,170 160,170 150,185 50,185" fill="#4a2810"/>
            <polygon points="50,160 150,175 140,185 40,170" fill="#6d3b14"/>
            <!-- Flame splitting / flicking left -->
            <path d="M65,170 Q100,165 130,170 Q138,140 120,115 Q95,95 90,45 Q85,85 75,115 Q62,145 65,170 Z" fill="#e63946"/>
            <!-- Left tongue -->
            <path d="M72,130 Q70,95 80,75 Q85,95 82,120 Z" fill="#f77f00"/>
            <path d="M76,170 Q100,167 120,170 Q124,142 112,120 Q100,100 95,68 Q90,100 84,125 Q72,148 76,170 Z" fill="#f77f00"/>
            <path d="M86,170 Q100,168 110,170 Q114,148 106,128 Q98,110 96,90 Q92,115 89,135 Q84,152 86,170 Z" fill="#fcbf49"/>
            <!-- Sparks -->
            <circle cx="90" cy="35" r="3" fill="#fcbf49"/>
            <circle cx="70" cy="65" r="2.5" fill="#fcbf49"/>
            <circle cx="130" cy="90" r="2" fill="#f77f00"/>
          </svg>
        `)}`
      },
      {
        name: 'Flame 4',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#0f0717"/>
            <polygon points="40,170 160,170 150,185 50,185" fill="#4a2810"/>
            <polygon points="50,160 150,175 140,185 40,170" fill="#6d3b14"/>
            <!-- Wide flame flare -->
            <path d="M70,170 Q100,165 135,170 Q142,142 126,118 Q118,85 104,52 Q95,85 84,118 Q66,145 70,170 Z" fill="#e63946"/>
            <!-- Right tongue -->
            <path d="M115,125 Q125,95 120,78 Q115,98 110,120 Z" fill="#f77f00"/>
            <path d="M80,170 Q100,167 124,170 Q128,144 116,122 Q108,98 104,72 Q98,102 90,126 Q78,148 80,170 Z" fill="#f77f00"/>
            <path d="M90,170 Q100,168 114,170 Q118,148 110,130 Q104,112 103,92 Q98,116 94,136 Q88,154 90,170 Z" fill="#fcbf49"/>
            <circle cx="104" cy="42" r="3" fill="#fcbf49"/>
            <circle cx="120" cy="70" r="2.5" fill="#fcbf49"/>
          </svg>
        `)}`
      }
    ]
  },
  {
    id: 'coin',
    name: 'Rotating Coin',
    category: 'Items',
    fps: 6,
    frames: [
      {
        name: 'Coin Front',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#111827"/>
            <!-- Outer gold rim -->
            <circle cx="100" cy="100" r="70" fill="#d97706"/>
            <circle cx="100" cy="100" r="64" fill="#f59e0b"/>
            <circle cx="100" cy="100" r="54" fill="#fbbf24"/>
            <!-- Star emblem in center -->
            <polygon points="100,65 109,87 132,87 114,101 121,123 100,110 79,123 86,101 68,87 91,87" fill="#fef08a"/>
            <!-- Shine gleam -->
            <circle cx="70" cy="70" r="6" fill="#ffffff"/>
          </svg>
        `)}`
      },
      {
        name: 'Coin 3/4 Turn',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#111827"/>
            <!-- Turned ellipse -->
            <ellipse cx="100" cy="100" rx="46" ry="70" fill="#b45309"/>
            <ellipse cx="98" cy="100" rx="42" ry="64" fill="#f59e0b"/>
            <ellipse cx="98" cy="100" rx="34" ry="54" fill="#fbbf24"/>
            <!-- Distorted star -->
            <polygon points="98,65 104,87 120,87 108,101 113,123 98,110 83,123 88,101 76,87 92,87" fill="#fef08a"/>
            <circle cx="80" cy="72" r="5" fill="#ffffff"/>
          </svg>
        `)}`
      },
      {
        name: 'Coin Edge',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#111827"/>
            <!-- Edge-on coin -->
            <ellipse cx="100" cy="100" rx="14" ry="70" fill="#78350f"/>
            <rect x="94" y="30" width="12" height="140" fill="#f59e0b"/>
            <line x1="100" y1="35" x2="100" y2="165" stroke="#fef08a" stroke-width="4"/>
            <!-- Vertical shine streak -->
            <rect x="98" y="55" width="4" height="25" fill="#ffffff"/>
          </svg>
        `)}`
      },
      {
        name: 'Coin Back 3/4',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#111827"/>
            <!-- Reverse angle -->
            <ellipse cx="100" cy="100" rx="46" ry="70" fill="#92400e"/>
            <ellipse cx="102" cy="100" rx="42" ry="64" fill="#d97706"/>
            <ellipse cx="102" cy="100" rx="34" ry="54" fill="#f59e0b"/>
            <!-- Crest symbol -->
            <polygon points="102,65 108,87 124,87 112,101 117,123 102,110 87,123 92,101 80,87 96,87" fill="#fbbf24"/>
            <circle cx="118" cy="72" r="5" fill="#ffffff"/>
          </svg>
        `)}`
      }
    ]
  },
  {
    id: 'slime',
    name: 'Slime Bounce',
    category: 'Character',
    fps: 6,
    frames: [
      {
        name: 'Idle',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#091811"/>
            <!-- Ground shadow -->
            <ellipse cx="100" cy="170" rx="45" ry="10" fill="#040b07"/>
            <!-- Body -->
            <path d="M55,160 C50,110 70,75 100,75 C130,75 150,110 145,160 C140,172 60,172 55,160 Z" fill="#10b981"/>
            <path d="M60,158 C56,115 74,83 100,83 C126,83 144,115 140,158 C135,168 65,168 60,158 Z" fill="#34d399"/>
            <!-- Cute highlight -->
            <ellipse cx="78" cy="100" rx="8" ry="14" transform="rotate(-20 78 100)" fill="#a7f3d0"/>
            <!-- Eyes -->
            <circle cx="85" cy="125" r="7" fill="#064e3b"/>
            <circle cx="87" cy="123" r="2.5" fill="#ffffff"/>
            <circle cx="115" cy="125" r="7" fill="#064e3b"/>
            <circle cx="117" cy="123" r="2.5" fill="#ffffff"/>
            <!-- Blush -->
            <ellipse cx="73" cy="136" rx="6" ry="3" fill="#059669"/>
            <ellipse cx="127" cy="136" rx="6" ry="3" fill="#059669"/>
          </svg>
        `)}`
      },
      {
        name: 'Squash',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#091811"/>
            <!-- Wide shadow -->
            <ellipse cx="100" cy="172" rx="65" ry="12" fill="#040b07"/>
            <!-- Squashed wide body -->
            <path d="M40,165 C35,130 65,105 100,105 C135,105 165,130 160,165 C155,176 45,176 40,165 Z" fill="#10b981"/>
            <path d="M46,163 C42,133 70,111 100,111 C130,111 158,133 154,163 C150,172 50,172 46,163 Z" fill="#34d399"/>
            <ellipse cx="68" cy="122" rx="12" ry="8" fill="#a7f3d0"/>
            <circle cx="80" cy="140" r="7" fill="#064e3b"/>
            <circle cx="82" cy="138" r="2.5" fill="#ffffff"/>
            <circle cx="120" cy="140" r="7" fill="#064e3b"/>
            <circle cx="122" cy="138" r="2.5" fill="#ffffff"/>
            <ellipse cx="68" cy="148" rx="6" ry="3" fill="#059669"/>
            <ellipse cx="132" cy="148" rx="6" ry="3" fill="#059669"/>
          </svg>
        `)}`
      },
      {
        name: 'Airborne Stretch',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#091811"/>
            <!-- Small shadow far below -->
            <ellipse cx="100" cy="175" rx="30" ry="7" fill="#040b07"/>
            <!-- Tall stretched jumping body -->
            <path d="M68,125 C60,65 75,30 100,30 C125,30 140,65 132,125 C128,136 72,136 68,125 Z" fill="#10b981"/>
            <path d="M72,123 C65,70 78,38 100,38 C122,38 135,70 128,123 C124,132 76,132 72,123 Z" fill="#34d399"/>
            <ellipse cx="84" cy="55" rx="6" ry="16" transform="rotate(-15 84 55)" fill="#a7f3d0"/>
            <circle cx="88" cy="85" r="7" fill="#064e3b"/>
            <circle cx="90" cy="83" r="2.5" fill="#ffffff"/>
            <circle cx="112" cy="85" r="7" fill="#064e3b"/>
            <circle cx="114" cy="83" r="2.5" fill="#ffffff"/>
            <ellipse cx="78" cy="94" rx="5" ry="3" fill="#059669"/>
            <ellipse cx="122" cy="94" rx="5" ry="3" fill="#059669"/>
          </svg>
        `)}`
      },
      {
        name: 'Apex Float',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#091811"/>
            <!-- Small shadow below -->
            <ellipse cx="100" cy="175" rx="35" ry="8" fill="#040b07"/>
            <!-- Round floating body -->
            <path d="M60,135 C52,85 72,50 100,50 C128,50 148,85 140,135 C135,147 65,147 60,135 Z" fill="#10b981"/>
            <path d="M64,133 C57,90 75,58 100,58 C125,58 143,90 136,133 C131,143 69,143 64,133 Z" fill="#34d399"/>
            <ellipse cx="80" cy="75" rx="7" ry="14" transform="rotate(-20 80 75)" fill="#a7f3d0"/>
            <circle cx="86" cy="100" r="7" fill="#064e3b"/>
            <circle cx="88" cy="98" r="2.5" fill="#ffffff"/>
            <circle cx="114" cy="100" r="7" fill="#064e3b"/>
            <circle cx="116" cy="98" r="2.5" fill="#ffffff"/>
            <ellipse cx="76" cy="110" rx="5" ry="3" fill="#059669"/>
            <ellipse cx="124" cy="110" rx="5" ry="3" fill="#059669"/>
          </svg>
        `)}`
      }
    ]
  },
  {
    id: 'crystal',
    name: 'Mana Crystal Pulse',
    category: 'Magic',
    fps: 6,
    frames: [
      {
        name: 'Dim Shimmer',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#0a0518"/>
            <!-- Pedestal -->
            <polygon points="60,165 140,165 125,185 75,185" fill="#312e81"/>
            <!-- Dim Gem -->
            <polygon points="100,45 135,85 135,125 100,160 65,125 65,85" fill="#4338ca"/>
            <polygon points="100,45 100,160 65,125 65,85" fill="#3730a3"/>
            <polygon points="100,45 120,85 120,125 100,160" fill="#6366f1"/>
            <polygon points="100,45 100,160 120,125 120,85" fill="#818cf8"/>
          </svg>
        `)}`
      },
      {
        name: 'Pulse Surge',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#0a0518"/>
            <polygon points="60,165 140,165 125,185 75,185" fill="#312e81"/>
            <!-- Aura glow ring -->
            <circle cx="100" cy="105" r="55" fill="#4f46e5" opacity="0.4"/>
            <!-- Crystal glowing -->
            <polygon points="100,40 138,83 138,127 100,165 62,127 62,83" fill="#6366f1"/>
            <polygon points="100,40 100,165 62,127 62,83" fill="#4f46e5"/>
            <polygon points="100,40 124,83 124,127 100,165" fill="#a5b4fc"/>
            <polygon points="100,40 100,165 124,127 124,83" fill="#c7d2fe"/>
            <!-- Inner light spark -->
            <circle cx="100" cy="105" r="12" fill="#ffffff" opacity="0.8"/>
          </svg>
        `)}`
      },
      {
        name: 'Radiant Flare',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#0a0518"/>
            <polygon points="60,165 140,165 125,185 75,185" fill="#312e81"/>
            <!-- High Radiant Burst -->
            <circle cx="100" cy="105" r="70" fill="#818cf8" opacity="0.3"/>
            <!-- Cross flares -->
            <polygon points="100,20 104,105 100,190 96,105" fill="#e0e7ff" opacity="0.7"/>
            <polygon points="20,105 105,101 180,105 105,109" fill="#e0e7ff" opacity="0.7"/>
            <!-- Bright crystal -->
            <polygon points="100,38 140,82 140,128 100,168 60,128 60,82" fill="#818cf8"/>
            <polygon points="100,38 100,168 60,128 60,82" fill="#6366f1"/>
            <polygon points="100,38 126,82 126,128 100,168" fill="#e0e7ff"/>
            <polygon points="100,38 100,168 126,128 126,82" fill="#ffffff"/>
            <circle cx="100" cy="105" r="18" fill="#ffffff"/>
          </svg>
        `)}`
      },
      {
        name: 'Cooling Down',
        url: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#0a0518"/>
            <polygon points="60,165 140,165 125,185 75,185" fill="#312e81"/>
            <circle cx="100" cy="105" r="45" fill="#6366f1" opacity="0.3"/>
            <polygon points="100,42 136,84 136,126 100,162 64,126 64,84" fill="#4f46e5"/>
            <polygon points="100,42 100,162 64,126 64,84" fill="#4338ca"/>
            <polygon points="100,42 122,84 122,126 100,162" fill="#818cf8"/>
            <polygon points="100,42 100,162 122,126 122,84" fill="#a5b4fc"/>
            <circle cx="100" cy="105" r="7" fill="#ffffff" opacity="0.6"/>
          </svg>
        `)}`
      }
    ]
  }
];
