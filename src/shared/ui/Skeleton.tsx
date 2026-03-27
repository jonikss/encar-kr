export function CardSkeleton() {
  return (
    <div className="skeleton">
      <div className="sk-img" />
      <div className="sk-body">
        <div className="sk-line" style={{ width: "45%" }} />
        <div className="sk-line" style={{ width: "70%" }} />
        <div className="sk-line" style={{ width: "100%" }} />
        <div className="sk-line" style={{ width: "55%" }} />
      </div>
    </div>
  );
}
