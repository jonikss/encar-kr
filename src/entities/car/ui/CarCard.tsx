import Image from "next/image";
import type { Car } from "../model/types";
import {
  formatPrice, formatMileage, formatRUB,
  fuelClass, fuelLabel, transmissionLabel,
} from "@/shared";

export function CarCard({ car, index }: { car: Car; index: number }) {
  const delay = Math.min(index * 45, 450);

  return (
    <article className="car-card" style={{ animationDelay: `${delay}ms` }}>
      <a href={car.detail_url} target="_blank" rel="noopener noreferrer">
        <div className="card-img-wrap">
          <Image
            src={car.photo ?? `https://placehold.co/640x400/161616/5C5750?text=${encodeURIComponent(car.brand)}`}
            alt={car.title}
            fill
            sizes="(max-width:860px) 50vw, 25vw"
            style={{ objectFit: "cover" }}
            unoptimized={car.photo?.includes("ci.encar.com")}
          />
          <div className="card-img-overlay" />
          <span className={`fuel-badge fuel-${fuelClass(car.fuel)}`}>
            {fuelLabel(car.fuel)}
          </span>
          {car.year && <span className="year-badge">{car.year}</span>}
        </div>
      </a>

      <div className="card-body">
        <div className="card-brand">{car.brand}</div>
        <div className="card-name">
          {[car.model, car.badge, car.badge_detail].filter(Boolean).join(" ")}
        </div>
        <div className="card-specs">
          <span className="card-spec">{formatMileage(car.mileage)}</span>
          {car.transmission && (
            <span className="card-spec">{transmissionLabel(car.transmission)}</span>
          )}
          {car.color && <span className="card-spec">{car.color}</span>}
        </div>
      </div>

      <div className="card-footer">
        <div>
          <div className="card-price-main">{formatPrice(car.price_krw)}</div>
          <div className="card-price-usd">{formatRUB(car.price_krw)}</div>
        </div>
        <a href={car.detail_url} target="_blank" rel="noopener noreferrer">
          <button className="card-cta">Смотреть →</button>
        </a>
      </div>
    </article>
  );
}
