import Flower from './Flower';
import styles from './Study.module.css';

const SESSION_GOAL = 4;

export default function Garden({ garden, todaySessions, activeSession, nextFlower }) {
  const slots = Array.from({ length: SESSION_GOAL });

  return (
    <div className={styles.gardenPlot}>
      <div className={styles.plantsRow}>
        {slots.map((_, i) => {
          const done = garden[i];
          const isCurrent = !done && i === todaySessions && activeSession;
          const isSeed = !done && !isCurrent;

          if (done) {
            return (
              <div key={done.id} className={styles.plantSlot}>
                <Flower stage="bloom" color={done.color} center={done.center} height={90} />
              </div>
            );
          }
          if (isCurrent) {
            return (
              <div key={`bud-${i}`} className={styles.plantSlot}>
                <Flower stage="bud" color={nextFlower.color} center={nextFlower.center} height={78} active />
              </div>
            );
          }
          return (
            <div key={`seed-${i}`} className={styles.plantSlot}>
              <Flower stage="seed" height={60} />
            </div>
          );
        })}
      </div>
      <div className={styles.gardenGround} />
      <div className={styles.gardenMood}>
        {todaySessions === 0 && !activeSession && 'Start a session to grow your first flower'}
        {todaySessions === 0 && activeSession && 'Your first flower is growing… keep going!'}
        {todaySessions > 0 && todaySessions < SESSION_GOAL && !activeSession && `${todaySessions} flower${todaySessions > 1 ? 's' : ''} bloomed · keep planting`}
        {todaySessions > 0 && todaySessions < SESSION_GOAL && activeSession && 'Growing… stay focused!'}
        {todaySessions >= SESSION_GOAL && 'Your garden is in full bloom today ✦'}
      </div>
    </div>
  );
}
