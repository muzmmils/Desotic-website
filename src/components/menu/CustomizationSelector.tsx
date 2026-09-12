import { useState, useEffect } from "react";
import { Check, Sparkles, MessageSquare } from "lucide-react";
import type { MenuItemCustomizationOption } from "@/components/menu/menuData";
import type { SelectedCustomizations } from "@/components/menu/cartUtils";

interface CustomizationSelectorProps {
  options: MenuItemCustomizationOption[];
  onChange: (customizations: SelectedCustomizations, extraPrice: number) => void;
}

export function CustomizationSelector({ options, onChange }: CustomizationSelectorProps) {
  // State for single choice selections (e.g. dressing, milk_base, grain_base, spice_level, temperature)
  const [singleChoices, setSingleChoices] = useState<
    Record<string, { id: string; label: string; price: number }>
  >({});
  // State for multi-choice add-ons (e.g. extra_protein, boosters, toppings)
  const [selectedAddons, setSelectedAddons] = useState<
    Record<string, { id: string; name: string; price: number }>
  >({});
  // State for notes
  const [kitchenNotes, setKitchenNotes] = useState("");

  // Initialize default single choices
  useEffect(() => {
    const initialSingle: Record<string, { id: string; label: string; price: number }> = {};
    for (const opt of options) {
      const firstOpt = opt.options?.[0];
      if (opt.type === "single_choice" && firstOpt) {
        initialSingle[opt.id] = {
          id: firstOpt.id,
          label: firstOpt.label,
          price: firstOpt.price,
        };
      }
    }
    setSingleChoices(initialSingle);
  }, [options]);

  // Recalculate totals and notify parent whenever choices change
  useEffect(() => {
    let extra = 0;

    // Add extra from single choice upgrades
    for (const choice of Object.values(singleChoices)) {
      extra += choice.price || 0;
    }

    // Add extra from selected add-ons
    const addonsList = Object.values(selectedAddons);
    for (const addon of addonsList) {
      extra += addon.price || 0;
    }

    // Capture all single-choice selections into options to preserve choices like protein_boost, packaging, temperature
    const dynamicOptions: Record<string, string> = {};
    for (const [key, choice] of Object.entries(singleChoices)) {
      if (choice?.label) {
        dynamicOptions[key] = choice.label;
      }
    }

    const payload: SelectedCustomizations = {
      dressing: singleChoices["dressing"]?.label,
      spiceLevel: singleChoices["spice_level"]?.label,
      milkBase: singleChoices["milk_base"]?.label,
      grainBase: singleChoices["grain_base"]?.label,
      options: Object.keys(dynamicOptions).length > 0 ? dynamicOptions : undefined,
      addons: addonsList,
      notes: kitchenNotes.trim() ? kitchenNotes.trim() : undefined,
    };

    onChange(payload, extra);
  }, [singleChoices, selectedAddons, kitchenNotes, onChange]);

  const handleSingleSelect = (
    optionId: string,
    choice: { id: string; label: string; price: number },
  ) => {
    setSingleChoices((prev) => ({
      ...prev,
      [optionId]: choice,
    }));
  };

  const handleAddonToggle = (addon: { id: string; label: string; price: number }) => {
    setSelectedAddons((prev) => {
      const copy = { ...prev };
      if (copy[addon.id]) {
        delete copy[addon.id];
      } else {
        copy[addon.id] = {
          id: addon.id,
          name: addon.label,
          price: addon.price,
        };
      }
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {options.map((opt) => {
        if (opt.type === "single_choice" && opt.options) {
          const currentSelected = singleChoices[opt.id]?.id || opt.options[0]?.id;

          return (
            <div key={opt.id} className="rounded-2xl border border-border/50 bg-card/40 p-4.5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>{opt.name}</span>
                  {opt.required && (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Required
                    </span>
                  )}
                </label>
                <span className="text-xs text-muted-foreground">Select one</span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {opt.options.map((choice) => {
                  const isSelected = currentSelected === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSingleSelect(opt.id, choice)}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer text-left ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground shadow-sm shadow-primary/10 ring-1 ring-primary"
                          : "border-border/60 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-transparent"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                        <span>{choice.label}</span>
                      </div>
                      {choice.price > 0 && (
                        <span className="rounded-md bg-accent/20 px-1.5 py-0.5 text-[11px] font-bold text-accent">
                          +₹{choice.price}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        if (opt.type === "multi_choice" && opt.options) {
          return (
            <div key={opt.id} className="rounded-2xl border border-border/50 bg-card/40 p-4.5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span>{opt.name}</span>
                </label>
                <span className="text-xs text-muted-foreground">Optional add-ons</span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {opt.options.map((addon) => {
                  const isChecked = Boolean(selectedAddons[addon.id]);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => handleAddonToggle(addon)}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer text-left ${
                        isChecked
                          ? "border-accent bg-accent/10 text-foreground shadow-sm ring-1 ring-accent"
                          : "border-border/60 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-muted-foreground/40 bg-transparent"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span>{addon.label}</span>
                      </div>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-foreground/90">
                        +₹{addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        if (opt.type === "text") {
          return (
            <div key={opt.id} className="rounded-2xl border border-border/50 bg-card/40 p-4.5">
              <label className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{opt.name}</span>
              </label>
              <input
                type="text"
                value={kitchenNotes}
                onChange={(e) => setKitchenNotes(e.target.value)}
                placeholder={opt.placeholder || "Special kitchen requests..."}
                maxLength={100}
                className="w-full rounded-xl border border-input bg-background/70 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
