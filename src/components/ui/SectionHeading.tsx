export function SectionHeading({
  kicker,
  title,
  description,
  light = false,
  align = "left",
}: {
  kicker?: string;
  title: string;
  description?: string;
  light?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {kicker ? <p className={`kicker ${light ? "text-gold" : ""}`}>{kicker}</p> : null}
      <h2 className={`font-display mt-3 text-3xl leading-tight md:text-4xl ${light ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-3 text-base leading-7 ${light ? "text-white/70" : "text-muted"}`}>{description}</p>
      ) : null}
    </div>
  );
}
