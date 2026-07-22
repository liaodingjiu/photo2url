export default function DemoImage({ variant = "demo" }: { variant?: "demo" | "hidden" }) {
  return (
    <div
      className={`w-full max-w-xs mx-auto lg:w-80 lg:max-w-none shrink-0 transition-all duration-500 ${
        variant === "hidden" ? "opacity-0 !w-0 overflow-hidden" : ""
      }`}
    >
      <div className="overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 aspect-[4/5] flex items-center justify-center">
        <img
          src="/demo.gif"
          alt="See how photo2url works"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="absolute text-xs text-muted-foreground/40 pointer-events-none">
          See how it works
        </span>
      </div>
    </div>
  );
}
