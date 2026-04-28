export const bodyMaleAnterior = `
<svg class="body" viewBox="0 0 360 600" xmlns="http://www.w3.org/2000/svg">
  <ellipse class="body-outline" cx="180" cy="55" rx="38" ry="46"/>
  <path class="body-outline" d="M 162 95 L 158 115 L 202 115 L 198 95"/>
  <path class="body-outline" d="M 158 115 L 120 135 L 110 200 L 115 280 L 130 360 L 145 380 L 215 380 L 230 360 L 245 280 L 250 200 L 240 135 L 202 115 Z"/>
  <path class="body-outline" d="M 120 135 L 95 175 L 80 240 L 75 310 L 80 360 L 95 365 L 100 320 L 110 245 L 120 200"/>
  <path class="body-outline" d="M 240 135 L 265 175 L 280 240 L 285 310 L 280 360 L 265 365 L 260 320 L 250 245 L 240 200"/>
  <path class="body-outline" d="M 145 380 L 138 460 L 135 540 L 145 580 L 165 580 L 170 540 L 175 460 L 178 380"/>
  <path class="body-outline" d="M 215 380 L 222 460 L 225 540 L 215 580 L 195 580 L 190 540 L 185 460 L 182 380"/>
  <path class="body-detail" d="M 165 50 L 170 50"/>
  <path class="body-detail" d="M 190 50 L 195 50"/>
  <path class="body-detail" d="M 178 65 L 182 65"/>
  <path class="body-detail" d="M 170 78 Q 180 82 190 78"/>

  <path class="body-region" data-region="scalp" d="M 145 25 Q 180 5 215 25 Q 220 45 215 55 L 145 55 Q 140 45 145 25 Z"/>
  <path class="body-region" data-region="eyebrows" d="M 158 45 Q 168 42 178 45 L 178 49 Q 168 46 158 49 Z M 182 45 Q 192 42 202 45 L 202 49 Q 192 46 182 49 Z"/>
  <path class="body-region" data-region="eyelashes" d="M 160 52 L 175 52 L 175 56 L 160 56 Z M 185 52 L 200 52 L 200 56 L 185 56 Z"/>
  <path class="body-region" data-region="vibrissae" d="M 175 67 L 185 67 L 187 76 L 173 76 Z"/>
  <ellipse class="body-region" data-region="ears" cx="142" cy="60" rx="6" ry="9"/>
  <ellipse class="body-region" data-region="ears" cx="218" cy="60" rx="6" ry="9"/>
  <circle class="body-region" data-region="lymph" cx="155" cy="108" r="4"/>
  <circle class="body-region" data-region="lymph" cx="205" cy="108" r="4"/>
  <path class="body-region" data-region="thyroid" d="M 170 100 Q 180 105 190 100 L 192 110 Q 180 113 168 110 Z"/>
  <ellipse class="body-region" data-region="axilla" cx="125" cy="155" rx="10" ry="14"/>
  <ellipse class="body-region" data-region="axilla" cx="235" cy="155" rx="10" ry="14"/>
  <path class="body-region" data-region="body-skin" d="M 145 145 L 215 145 L 215 220 L 145 220 Z"/>
  <path class="body-region" data-region="body-skin" d="M 145 225 L 215 225 L 215 290 L 145 290 Z"/>
  <path class="body-region" data-region="body-skin" d="M 85 245 L 105 245 L 100 320 L 80 320 Z"/>
  <path class="body-region" data-region="body-skin" d="M 255 245 L 275 245 L 280 320 L 260 320 Z"/>
  <path class="body-region" data-region="pubic" d="M 158 320 L 202 320 L 200 360 L 160 360 Z"/>
  <path class="body-region" data-region="body-skin" d="M 145 390 L 178 390 L 175 470 L 138 470 Z"/>
  <path class="body-region" data-region="body-skin" d="M 182 390 L 215 390 L 222 470 L 185 470 Z"/>
  <path class="body-region" data-region="body-skin" d="M 138 480 L 175 480 L 168 560 L 140 560 Z"/>
  <path class="body-region" data-region="body-skin" d="M 185 480 L 222 480 L 220 560 L 192 560 Z"/>

  <line class="label-line" x1="180" y1="20" x2="180" y2="0"/>
  <text class="label-text" x="155" y="-2" text-anchor="start">SCALP</text>
  <line class="label-line" x1="178" y1="46" x2="80" y2="40"/>
  <text class="label-text" x="40" y="38">BROWS</text>
  <line class="label-line" x1="178" y1="54" x2="80" y2="58"/>
  <text class="label-text" x="40" y="60">LASHES</text>
  <line class="label-line" x1="180" y1="72" x2="80" y2="76"/>
  <text class="label-text" x="20" y="78">VIBRISSAE</text>
  <line class="label-line" x1="218" y1="60" x2="290" y2="58"/>
  <text class="label-text" x="295" y="60">EAR CANAL</text>
  <line class="label-line" x1="155" y1="108" x2="80" y2="108"/>
  <text class="label-text" x="20" y="110">LYMPH NODES</text>
  <line class="label-line" x1="180" y1="106" x2="290" y2="100"/>
  <text class="label-text" x="295" y="102">THYROID</text>
  <line class="label-line" x1="125" y1="155" x2="50" y2="158"/>
  <text class="label-text" x="20" y="160">AXILLA</text>
  <line class="label-line" x1="180" y1="180" x2="290" y2="180"/>
  <text class="label-text" x="295" y="182">BODY SKIN</text>
  <line class="label-line" x1="180" y1="340" x2="290" y2="340"/>
  <text class="label-text" x="295" y="342">PUBIC</text>
</svg>
`;

export const BODY_FIGURES = {
  'male-anterior': bodyMaleAnterior
};
