import { HugeiconsIcon } from "@hugeicons/react";
import { Loading04Icon } from "@hugeicons/core-free-icons";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <HugeiconsIcon icon={Loading04Icon} size={20} className="animate-spin" />
    </div>
  );
}
