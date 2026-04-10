export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-4">
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full bg-[#D9A826] animate-bounce"
          style={{ animationDelay: "-0.3s" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-[#D9A826] animate-bounce"
          style={{ animationDelay: "-0.15s" }}
        />
        <span className="h-1.5 w-1.5 rounded-full bg-[#D9A826] animate-bounce" />
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Loading
      </p>
    </div>
  );
}
