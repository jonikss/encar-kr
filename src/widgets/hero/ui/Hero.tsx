export function Hero({ listingCount, brandCount }: { listingCount: number; brandCount: number }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" />
          Прямо из Кореи
        </div>
        <h1>
          Найдите <span className="accent">идеальный</span>
          <br />корейский автомобиль
        </h1>
        <p className="hero-sub">
          Свежие объявления, ежедневно обновляемые с ENCAR —
          крупнейшей площадки подержанных авто Южной Кореи.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-n">
              {listingCount > 0 ? listingCount.toLocaleString("ru-RU") : "—"}<span>+</span>
            </div>
            <div className="hero-stat-l">Объявлений</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-n">{brandCount > 0 ? brandCount : "—"}</div>
            <div className="hero-stat-l">Марок</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-n">1<span>×</span></div>
            <div className="hero-stat-l">Обновление в день</div>
          </div>
        </div>
      </div>
    </section>
  );
}
