import { setItemStatus } from "@/app/actions/items";
import { CheckIcon, TrashIcon } from "@/components/ui/icons";

export function UsedButton({ id, name, size = 38 }: { id: string; name: string; size?: number }) {
  return (
    <form action={setItemStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value="used" />
      <button
        type="submit"
        aria-label={`Mark ${name} as used`}
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-full border-2 border-ink bg-brand"
      >
        <CheckIcon size={18} strokeWidth={2.8} />
      </button>
    </form>
  );
}

export function WastedButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={setItemStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value="wasted" />
      <button
        type="submit"
        aria-label={`Mark ${name} as thrown away`}
        className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-sand text-muted"
      >
        <TrashIcon size={17} />
      </button>
    </form>
  );
}
