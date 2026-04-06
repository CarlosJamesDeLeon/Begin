export default function Flower({ stage = 'seed', color = '#F4A7B0', center = '#F5D98C', height = 80, active = false }) {
  const w = height * 0.42;
  const h = height;

  if (stage === 'seed') {
    return (
      <svg width={w} height={h} viewBox="0 0 20 80" fill="none">
        <rect x="9" y="42" width="2" height="34" rx="1" fill="#C4B89A"/>
        <ellipse cx="10" cy="38" rx="6" ry="6" fill="#C4A882"/>
        <ellipse cx="10" cy="35" rx="3.5" ry="2.5" fill="#D4BC96" opacity="0.6"/>
      </svg>
    );
  }

  if (stage === 'sprout') {
    return (
      <svg width={w} height={h} viewBox="0 0 20 80" fill="none">
        <rect x="9" y="30" width="2" height="46" rx="1" fill="#8BAF6A"/>
        <ellipse cx="6" cy="40" rx="6" ry="3.5" fill="#A5C47C" transform="rotate(-25 6 40)"/>
        <ellipse cx="14" cy="50" rx="6" ry="3.5" fill="#A5C47C" transform="rotate(25 14 50)"/>
        <ellipse cx="10" cy="26" rx="7" ry="7" fill={color} opacity="0.45"/>
        <circle cx="10" cy="26" r="4" fill={center} opacity="0.6"/>
      </svg>
    );
  }

  if (stage === 'bud') {
    return (
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <svg width={w} height={h} viewBox="0 0 24 88" fill="none">
          <rect x="11" y="28" width="2" height="56" rx="1" fill="#8BAF6A"/>
          <ellipse cx="7" cy="42" rx="7" ry="4" fill="#A5C47C" transform="rotate(-20 7 42)"/>
          <ellipse cx="17" cy="58" rx="7" ry="4" fill="#A5C47C" transform="rotate(20 17 58)"/>
          <ellipse cx="12" cy="20" rx="8" ry="10" fill={color} opacity="0.55"/>
          <ellipse cx="12" cy="14" rx="5" ry="7" fill={color} opacity="0.5"/>
          <ellipse cx="18" cy="17" rx="5" ry="6" fill={color} opacity="0.45" transform="rotate(40 18 17)"/>
          <ellipse cx="6" cy="17" rx="5" ry="6" fill={color} opacity="0.45" transform="rotate(-40 6 17)"/>
          <circle cx="12" cy="20" r="5" fill={center} opacity="0.75"/>
        </svg>
        {active && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 14, height: 14, borderRadius: '50%',
            background: '#D4956B', border: '2px solid #F0EDE8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="1" x2="4" y2="7"/><line x1="1" y1="4" x2="7" y2="4"/>
            </svg>
          </div>
        )}
      </div>
    );
  }

  // bloom
  return (
    <svg width={w * 1.1} height={h} viewBox="0 0 32 88" fill="none">
      <rect x="15" y="24" width="2" height="60" rx="1" fill="#8BAF6A"/>
      <ellipse cx="9" cy="40" rx="8" ry="4.5" fill="#A5C47C" transform="rotate(-20 9 40)"/>
      <ellipse cx="23" cy="58" rx="8" ry="4.5" fill="#A5C47C" transform="rotate(20 23 58)"/>
      <ellipse cx="16" cy="20" rx="10" ry="10" fill={color}/>
      <ellipse cx="16" cy="11" rx="5.5" ry="8" fill={color} opacity="0.75"/>
      <ellipse cx="25" cy="14" rx="5.5" ry="8" fill={color} opacity="0.75" transform="rotate(45 25 14)"/>
      <ellipse cx="7"  cy="14" rx="5.5" ry="8" fill={color} opacity="0.75" transform="rotate(-45 7 14)"/>
      <ellipse cx="25" cy="26" rx="5.5" ry="8" fill={color} opacity="0.75" transform="rotate(135 25 26)"/>
      <ellipse cx="7"  cy="26" rx="5.5" ry="8" fill={color} opacity="0.75" transform="rotate(-135 7 26)"/>
      <circle cx="16" cy="20" r="6" fill={center}/>
    </svg>
  );
}
