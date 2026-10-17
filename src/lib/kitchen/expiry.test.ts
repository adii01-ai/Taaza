import { describe, expect, it } from "vitest";
import { addDays, daysUntil, expiryLabel, expiryTone, todayInIndia } from "./expiry";
import { categoryKey } from "./categories";

describe("expiry helpers", () => {
  it("counts whole days between dates", () => {
    expect(daysUntil("2026-10-20", "2026-10-17")).toBe(3);
    expect(daysUntil("2026-10-17", "2026-10-17")).toBe(0);
    expect(daysUntil("2026-10-15", "2026-10-17")).toBe(-2);
    expect(daysUntil(null, "2026-10-17")).toBeNull();
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
  });

  it("uses India's date near midnight UTC", () => {
    expect(todayInIndia(new Date("2026-10-17T20:00:00Z"))).toBe("2026-10-18");
  });

  it("labels and tones", () => {
    expect(expiryLabel(0)).toBe("Today");
    expect(expiryLabel(1)).toBe("Tomorrow");
    expect(expiryLabel(-1)).toBe("Yesterday");
    expect(expiryLabel(180)).toBe("6 months");
    expect(expiryTone(-1)).toBe("expired");
    expect(expiryTone(0)).toBe("today");
    expect(expiryTone(2)).toBe("soon");
    expect(expiryTone(10)).toBe("fresh");
  });
});

describe("categoryKey", () => {
  it("maps common Indian kitchen items", () => {
    expect(categoryKey(null, "Paneer")).toBe("dairy");
    expect(categoryKey("Vegetables", "Spinach (palak)")).toBe("veggies");
    expect(categoryKey(null, "Pav")).toBe("bakery");
    expect(categoryKey("Pantry", "Basmati rice")).toBe("grains");
    expect(categoryKey(null, "Mystery jar")).toBe("other");
  });
});
