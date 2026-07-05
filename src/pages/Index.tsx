import { useState, useRef } from 'react';
import func2url from '../../backend/func2url.json';

const KITTEN_IMG = 'https://cdn.poehali.dev/projects/f06181c3-645d-4cef-a63f-8283449ea57f/files/82d2ddeb-d5fd-447d-847c-b8dfc5073bd4.jpg';
const SHOCKED_IMG = 'https://cdn.poehali.dev/projects/f06181c3-645d-4cef-a63f-8283449ea57f/files/7c951ecc-157a-49e2-8404-6385071ac60a.jpg';
const HAPPY_IMG = 'https://cdn.poehali.dev/projects/f06181c3-645d-4cef-a63f-8283449ea57f/files/f67d6999-66a5-4007-b082-1f0c19bf77d1.jpg';

const FOODS = [
  { id: 'pizza', name: 'Пицца', emoji: '🍕' },
  { id: 'sushi', name: 'Суши', emoji: '🍣' },
  { id: 'burger', name: 'Бургер', emoji: '🍔' },
  { id: 'pasta', name: 'Паста', emoji: '🍝' },
  { id: 'taco', name: 'Тако', emoji: '🌮' },
  { id: 'ramen', name: 'Рамен', emoji: '🍜' },
];

const Screen = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-md mx-auto flex flex-col items-center text-center animate-fade-in">
    {children}
  </div>
);

const Index = () => {
  const [step, setStep] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [food, setFood] = useState<string | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = () => setStep((s) => s + 1);

  const dodge = () => {
    const w = containerRef.current?.clientWidth ?? 320;
    const x = (Math.random() - 0.5) * Math.min(w - 120, 260);
    const y = (Math.random() - 0.5) * 220;
    setNoPos({ x, y });
  };

  const burstHearts = () => {
    const batch = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 240,
    }));
    setHearts(batch);
    setTimeout(() => setHearts([]), 1000);
  };

  const onYes = () => {
    burstHearts();
    setTimeout(goNext, 350);
  };

  const finish = () => {
    const foodItem = FOODS.find((f) => f.id === food);
    fetch(func2url['send-date'], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date ? new Date(date).toLocaleDateString('ru-RU') : '—',
        time,
        food: foodItem ? `${foodItem.name} ${foodItem.emoji}` : '—',
      }),
    }).catch(() => {});
    goNext();
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center px-5 py-10 relative overflow-hidden"
    >
      {hearts.map((h) => (
        <span
          key={h.id}
          className="pointer-events-none absolute bottom-1/2 left-1/2 text-4xl animate-heart-float z-10"
          style={{ marginLeft: h.x }}
        >
          {['❤️', '💕', '💖', '💗'][h.id % 4]}
        </span>
      ))}

      {step === 0 && (
        <Screen>
          <div className="animate-float">
            <img
              src={KITTEN_IMG}
              alt="Котик"
              className="w-56 h-56 md:w-64 md:h-64 object-cover rounded-[2.5rem] shadow-2xl shadow-primary/30 border-8 border-white mx-auto"
            />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-primary mt-8 leading-snug">
            Ты пойдёшь со мной<br />на свидание?
          </h1>

          <div className="flex items-center justify-center gap-4 mt-10 relative h-16 w-full">
            <button
              onClick={onYes}
              className="bg-primary text-primary-foreground font-heading font-bold text-lg px-10 py-4 rounded-full shadow-xl shadow-primary/40 hover:scale-110 active:scale-95 transition-transform"
            >
              Да 💘
            </button>

            <button
              onMouseEnter={dodge}
              onClick={dodge}
              className="bg-white text-muted-foreground font-heading font-bold text-lg px-8 py-4 rounded-full shadow-md transition-transform duration-200"
              style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)` }}
            >
              Нет
            </button>
          </div>
        </Screen>
      )}

      {step === 1 && (
        <Screen>
          <img
            src={SHOCKED_IMG}
            alt="Ого"
            className="w-56 h-56 object-cover rounded-[2.5rem] shadow-2xl shadow-secondary/40 border-8 border-white mx-auto animate-wiggle"
          />
          <h2 className="font-display text-3xl md:text-4xl text-primary mt-8">
            Ты действительно нажала «да»?
          </h2>
          <button
            onClick={goNext}
            className="mt-10 bg-primary text-primary-foreground font-heading font-bold text-lg px-12 py-4 rounded-full shadow-xl shadow-primary/40 hover:scale-110 active:scale-95 transition-transform"
          >
            Окей, окей! 🙌
          </button>
        </Screen>
      )}

      {step === 2 && (
        <Screen>
          <div className="text-6xl mb-4 animate-float">📅</div>
          <h2 className="font-display text-3xl text-primary mb-8">
            Выбери дату нашей встречи
          </h2>
          <div className="bg-white/80 backdrop-blur rounded-[2rem] p-6 w-full shadow-xl space-y-5">
            <div className="text-left">
              <label className="font-heading font-bold text-sm text-muted-foreground ml-2">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 bg-muted rounded-2xl px-5 py-4 font-body text-lg outline-none focus:ring-4 ring-primary/30"
              />
            </div>
            <div className="text-left">
              <label className="font-heading font-bold text-sm text-muted-foreground ml-2">Время</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full mt-1 bg-muted rounded-2xl px-5 py-4 font-body text-lg outline-none focus:ring-4 ring-primary/30"
              />
            </div>
          </div>
          <button
            onClick={goNext}
            disabled={!date}
            className="mt-8 bg-primary text-primary-foreground font-heading font-bold text-lg px-12 py-4 rounded-full shadow-xl shadow-primary/40 hover:scale-110 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            Сохранить дату 💾
          </button>
        </Screen>
      )}

      {step === 3 && (
        <Screen>
          <h2 className="font-display text-3xl text-primary mb-8">
            Что мы будем кушать?
          </h2>
          <div className="grid grid-cols-2 gap-4 w-full">
            {FOODS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFood(f.id)}
                className={`flex flex-col items-center gap-2 py-6 rounded-[1.75rem] font-heading font-bold text-lg transition-all ${
                  food === f.id
                    ? 'bg-primary text-primary-foreground scale-105 shadow-xl shadow-primary/40 animate-pop'
                    : 'bg-white/80 text-foreground shadow-md hover:scale-105'
                }`}
              >
                <span className="text-4xl">{f.emoji}</span>
                {f.name}
              </button>
            ))}
          </div>
          {food && (
            <button
              onClick={finish}
              className="mt-8 bg-primary text-primary-foreground font-heading font-bold text-lg px-12 py-4 rounded-full shadow-xl shadow-primary/40 hover:scale-110 active:scale-95 transition-transform animate-fade-in"
            >
              Продолжить →
            </button>
          )}
        </Screen>
      )}

      {step === 4 && (
        <Screen>
          <img
            src={HAPPY_IMG}
            alt="Ура"
            className="w-56 h-56 object-cover rounded-[2.5rem] shadow-2xl shadow-primary/40 border-8 border-white mx-auto animate-float"
          />
          <h2 className="font-display text-2xl md:text-3xl text-primary mt-8 leading-snug">
            Рад, что ты не отказалась 💕<br />
            Будь готова к {time},<br />я заеду!
          </h2>
          {date && (
            <div className="mt-6 bg-white/80 backdrop-blur rounded-2xl px-6 py-4 font-heading text-foreground shadow-md">
              📅 {new Date(date).toLocaleDateString('ru-RU')} в {time}
              {food && <> · {FOODS.find((f) => f.id === food)?.emoji} {FOODS.find((f) => f.id === food)?.name}</>}
            </div>
          )}
        </Screen>
      )}
    </div>
  );
};

export default Index;