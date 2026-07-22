export default function DemoImage() {
  return (
    <div className="w-full lg:w-80 shrink-0">
      <div className="overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 aspect-[4/5]">
        <img
          src="/demo.gif"
          alt="How photo2url works — upload, get link, embed anywhere"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
