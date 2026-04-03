  export const weatherSVGs = {
    "clear-day": `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFE566"/>
            <stop offset="100%" stop-color="#FFA000"/>
          </radialGradient>
        </defs>
        <!-- Rotating rays wrapper -->
        <g>
          <g stroke="#FFD740" stroke-width="3" stroke-linecap="round" opacity="0.7">
          <line x1="70" y1="10" x2="70" y2="22"/>
          <line x1="70" y1="118" x2="70" y2="130"/>
          <line x1="10" y1="70" x2="22" y2="70"/>
          <line x1="118" y1="70" x2="130" y2="70"/>
          <line x1="25.1" y1="25.1" x2="33.6" y2="33.6"/>
          <line x1="106.4" y1="106.4" x2="114.9" y2="114.9"/>
          <line x1="114.9" y1="25.1" x2="106.4" y2="33.6"/>
          <line x1="33.6" y1="106.4" x2="25.1" y2="114.9"/>
        </g>
          <animateTransform attributeName="transform" type="rotate" from="0 70 70" to="360 70 70" dur="20s" repeatCount="indefinite"/>
        </g>
        <!-- Sun circle stays static -->
        <circle cx="70" cy="70" r="28" fill="url(#sunGrad)" opacity="0.95"/>
        <circle cx="70" cy="70" r="22" fill="#FFE566" opacity="0.6"/>
      </svg>`,

    "clear-night": `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="moonGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#E8F0FF"/>
            <stop offset="100%" stop-color="#8BA8E0"/>
          </radialGradient>
        </defs>
        <!-- Stars -->
        <circle cx="30" cy="28" r="2" fill="#C8DAFF" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite"/></circle>
        <circle cx="110" cy="35" r="1.5" fill="#C8DAFF" opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="3.1s" repeatCount="indefinite"/></circle>
        <circle cx="22" cy="68" r="1.5" fill="#C8DAFF" opacity="0.7"><animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.9s" repeatCount="indefinite"/></circle>
        <circle cx="118" cy="60" r="2" fill="#C8DAFF" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.2s" repeatCount="indefinite"/></circle>
        <circle cx="55" cy="18" r="1.2" fill="#C8DAFF" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="3.5s" repeatCount="indefinite"/></circle>
        <!-- Moon body -->
        <circle cx="75" cy="72" r="34" fill="url(#moonGrad)" opacity="0.95"/>
        <!-- Crescent cutout illusion -->
        <circle cx="92" cy="58" r="26" fill="#0a1535" opacity="0.88"/>
        <!-- Soft glow ring -->
        <circle cx="75" cy="72" r="34" stroke="#C8DAFF" stroke-width="1" opacity="0.3" fill="none"/>
      </svg>`,

    cloudy: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#d0dce8" stop-opacity="0.85"/>
          </linearGradient>
          <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e8eef5" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#b8c8d8" stop-opacity="0.6"/>
          </linearGradient>
          <filter id="cloudBlur"><feGaussianBlur stdDeviation="1.5"/></filter>
        </defs>
        <!-- Back cloud wrapped in g for valid animateTransform -->
        <g>
          <rect x="30" y="58" width="82" height="36" rx="18" fill="url(#cloudGrad2)" filter="url(#cloudBlur)"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;4,0;0,0" dur="6s" repeatCount="indefinite"/>
        </g>
        <!-- Front cloud group -->
        <g>
          <rect x="16" y="66" width="100" height="40" rx="20" fill="url(#cloudGrad1)"/>
          <circle cx="44" cy="70" r="20" fill="url(#cloudGrad1)"/>
          <circle cx="80" cy="62" r="26" fill="url(#cloudGrad1)"/>
          <circle cx="104" cy="72" r="18" fill="url(#cloudGrad1)"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;-3,0;0,0" dur="5s" repeatCount="indefinite"/>
        </g>
      </svg>`,

    rainy: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rainCloud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#78909C"/>
            <stop offset="100%" stop-color="#546E7A"/>
          </linearGradient>
        </defs>
        <!-- Cloud -->
        <rect x="18" y="34" width="100" height="42" rx="21" fill="url(#rainCloud)"/>
        <circle cx="44" cy="42" r="20" fill="url(#rainCloud)"/>
        <circle cx="78" cy="34" r="26" fill="url(#rainCloud)"/>
        <circle cx="104" cy="44" r="17" fill="url(#rainCloud)"/>
        <!-- Rain drops animated -->
        <g stroke="#90CAF9" stroke-width="2.5" stroke-linecap="round" opacity="0.85">
          <line x1="42" y1="90" x2="36" y2="108"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0s" repeatCount="indefinite"/></line>
          <line x1="62" y1="86" x2="56" y2="104"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.2s" repeatCount="indefinite"/></line>
          <line x1="82" y1="90" x2="76" y2="108"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.4s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.4s" repeatCount="indefinite"/></line>
          <line x1="102" y1="86" x2="96" y2="104"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.6s" repeatCount="indefinite"/></line>
          <line x1="52" y1="100" x2="46" y2="118"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.9s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.9s" repeatCount="indefinite"/></line>
          <line x1="72" y1="96" x2="66" y2="114"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.1s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.1s" repeatCount="indefinite"/></line>
          <line x1="92" y1="100" x2="86" y2="118"><animate attributeName="opacity" values="1;0.3;1" dur="1.2s" begin="0.7s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-2,10;0,0" dur="1.2s" begin="0.7s" repeatCount="indefinite"/></line>
        </g>
      </svg>`,

    stormy: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="stormCloud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#455A64"/>
            <stop offset="100%" stop-color="#263238"/>
          </linearGradient>
          <linearGradient id="boltGrad" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#FFE57F"/>
            <stop offset="100%" stop-color="#FFB300"/>
          </linearGradient>
        </defs>
        <!-- Dark cloud -->
        <rect x="14" y="28" width="108" height="46" rx="23" fill="url(#stormCloud)"/>
        <circle cx="40" cy="38" r="22" fill="url(#stormCloud)"/>
        <circle cx="78" cy="28" r="28" fill="url(#stormCloud)"/>
        <circle cx="108" cy="40" r="19" fill="url(#stormCloud)"/>
        <!-- Lightning bolt -->
        <path d="M78 74 L62 100 L74 100 L58 126 L82 96 L70 96 Z" fill="url(#boltGrad)">
          <animate attributeName="opacity" values="1;0.4;1;0.6;1" dur="2.8s" repeatCount="indefinite"/>
        </path>
        <!-- Rain -->
        <g stroke="#78909C" stroke-width="2" stroke-linecap="round" opacity="0.6">
          <line x1="30" y1="80" x2="24" y2="94"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" begin="0s" repeatCount="indefinite"/></line>
          <line x1="110" y1="82" x2="104" y2="96"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" begin="0.3s" repeatCount="indefinite"/></line>
          <line x1="95" y1="78" x2="89" y2="92"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" begin="0.15s" repeatCount="indefinite"/></line>
          <line x1="40" y1="84" x2="34" y2="98"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" begin="0.45s" repeatCount="indefinite"/></line>
        </g>
      </svg>`,

    snowy: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="snowCloud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E3EEF8"/>
            <stop offset="100%" stop-color="#B0C8E0"/>
          </linearGradient>
        </defs>
        <!-- Cloud -->
        <rect x="18" y="30" width="102" height="44" rx="22" fill="url(#snowCloud)"/>
        <circle cx="44" cy="40" r="21" fill="url(#snowCloud)"/>
        <circle cx="78" cy="30" r="28" fill="url(#snowCloud)"/>
        <circle cx="106" cy="42" r="18" fill="url(#snowCloud)"/>
        <!-- Snowflakes -->
        <g fill="#90C4E8" opacity="0.9">
          <circle cx="38" cy="94" r="4"><animate attributeName="cy" values="94;104;94" dur="2s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" begin="0s" repeatCount="indefinite"/></circle>
          <circle cx="58" cy="88" r="3.5"><animate attributeName="cy" values="88;100;88" dur="2.2s" begin="0.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.2s" begin="0.4s" repeatCount="indefinite"/></circle>
          <circle cx="78" cy="92" r="4"><animate attributeName="cy" values="92;104;92" dur="1.8s" begin="0.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.8s" begin="0.8s" repeatCount="indefinite"/></circle>
          <circle cx="98" cy="86" r="3" ><animate attributeName="cy" values="86;98;86" dur="2.4s" begin="0.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.4s" begin="0.2s" repeatCount="indefinite"/></circle>
          <circle cx="48" cy="108" r="3"><animate attributeName="cy" values="108;118;108" dur="2s" begin="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" begin="1s" repeatCount="indefinite"/></circle>
          <circle cx="68" cy="104" r="3.5"><animate attributeName="cy" values="104;116;104" dur="2.3s" begin="0.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.3s" begin="0.6s" repeatCount="indefinite"/></circle>
          <circle cx="88" cy="110" r="3"><animate attributeName="cy" values="110;120;110" dur="1.9s" begin="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.9s" begin="1.2s" repeatCount="indefinite"/></circle>
        </g>
      </svg>`,

    misty: `
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fogGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
            <stop offset="30%" stop-color="rgba(255,255,255,0.55)"/>
            <stop offset="70%" stop-color="rgba(255,255,255,0.55)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </linearGradient>
        </defs>
        <!-- Fog lines -->
        <rect x="10" y="44" width="120" height="10" rx="5" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" begin="0s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;8,0;0,0" dur="4s" repeatCount="indefinite"/></rect>
        <rect x="10" y="64" width="120" height="8" rx="4" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" begin="0.8s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-10,0;0,0" dur="5s" repeatCount="indefinite"/></rect>
        <rect x="10" y="82" width="120" height="10" rx="5" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.6;0.25;0.6" dur="3.5s" begin="0.4s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;6,0;0,0" dur="4.5s" repeatCount="indefinite"/></rect>
        <rect x="10" y="100" width="120" height="7" rx="3.5" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" begin="1.2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;-8,0;0,0" dur="6s" repeatCount="indefinite"/></rect>
        <rect x="10" y="118" width="120" height="8" rx="4" fill="url(#fogGrad)"><animate attributeName="opacity" values="0.5;0.2;0.5" dur="3.2s" begin="0.6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;5,0;0,0" dur="5.5s" repeatCount="indefinite"/></rect>
      </svg>`,
  };
