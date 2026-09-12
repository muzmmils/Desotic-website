import { Flame, Dumbbell, Wheat, Droplets, Sparkles } from "lucide-react";

interface NutritionVisualizerProps {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export function NutritionVisualizer({
  calories,
  proteinG,
  carbsG,
  fatG,
  fiberG,
}: NutritionVisualizerProps) {
  // Standard Daily Values (FDA / FSSAI based on 2,000 calorie reference diet)
  const DV_CALORIES = 2000;
  const DV_PROTEIN = 50; // grams
  const DV_CARBS = 275; // grams
  const DV_FAT = 78; // grams
  const DV_FIBER = 28; // grams

  const dvCalories = (calories / DV_CALORIES) * 100;
  const dvProtein = (proteinG / DV_PROTEIN) * 100;
  const dvCarbs = (carbsG / DV_CARBS) * 100;
  const dvFat = (fatG / DV_FAT) * 100;
  const dvFiber = (fiberG / DV_FIBER) * 100;

  // Calculate macro calorie energy split safely
  const proteinKcal = proteinG * 4;
  const carbsKcal = carbsG * 4;
  const fatKcal = fatG * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

  const proteinEnergyPct =
    totalMacroKcal > 0 ? Math.round((proteinKcal / totalMacroKcal) * 100) : 0;
  const carbsEnergyPct = totalMacroKcal > 0 ? Math.round((carbsKcal / totalMacroKcal) * 100) : 0;
  const fatEnergyPct =
    totalMacroKcal > 0 ? Math.max(0, 100 - proteinEnergyPct - carbsEnergyPct) : 0;

  const nutrients = [
    {
      label: "Protein",
      amount: `${proteinG}g`,
      dvPct: Math.round(dvProtein),
      barWidth: Math.min(100, Math.max(0, dvProtein)),
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      icon: Dumbbell,
      note: `${proteinEnergyPct}% of calories`,
    },
    {
      label: "Carbohydrates",
      amount: `${carbsG}g`,
      dvPct: Math.round(dvCarbs),
      barWidth: Math.min(100, Math.max(0, dvCarbs)),
      color: "bg-sky-500",
      textColor: "text-sky-400",
      icon: Wheat,
      note: `${carbsEnergyPct}% of calories`,
    },
    {
      label: "Healthy Fats",
      amount: `${fatG}g`,
      dvPct: Math.round(dvFat),
      barWidth: Math.min(100, Math.max(0, dvFat)),
      color: "bg-amber-500",
      textColor: "text-amber-400",
      icon: Droplets,
      note: `${fatEnergyPct}% of calories`,
    },
    {
      label: "Dietary Fiber",
      amount: `${fiberG}g`,
      dvPct: Math.round(dvFiber),
      barWidth: Math.min(100, Math.max(0, dvFiber)),
      color: "bg-teal-400",
      textColor: "text-teal-300",
      icon: Sparkles,
      note: "Promotes gut health",
    },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>Nutritional Facts & Macro Breakdown</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent micro & macronutrient profile per single serving
          </p>
        </div>

        {/* Calories Badge */}
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2">
          <Flame className="h-5 w-5 text-amber-500" />
          <div>
            <div className="text-lg font-black text-amber-500 leading-none">
              {calories} <span className="text-xs font-semibold">kcal</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">
              {Math.round(dvCalories)}% Daily Value
            </div>
          </div>
        </div>
      </div>

      {/* Macro Ratio Stacked Bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80">Energy Macro Ratio</span>
          <span className="text-[11px]">
            <span className="text-emerald-400 font-semibold">{proteinEnergyPct}%</span> P •{" "}
            <span className="text-sky-400 font-semibold">{carbsEnergyPct}%</span> C •{" "}
            <span className="text-amber-400 font-semibold">{fatEnergyPct}%</span> F
          </span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/50 p-0.5">
          <div
            style={{ width: `${proteinEnergyPct}%` }}
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
            title={`Protein: ${proteinEnergyPct}%`}
          />
          <div
            style={{ width: `${carbsEnergyPct}%` }}
            className="h-full bg-sky-500 transition-all duration-500"
            title={`Carbs: ${carbsEnergyPct}%`}
          />
          <div
            style={{ width: `${fatEnergyPct}%` }}
            className="h-full bg-amber-500 rounded-r-full transition-all duration-500"
            title={`Fats: ${fatEnergyPct}%`}
          />
        </div>
      </div>

      {/* Detailed Nutrient Progress Grid */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {nutrients.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.label}
              className="rounded-xl border border-border/30 bg-background/50 p-3 transition-colors hover:border-border/60"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-muted/60 ${n.textColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{n.label}</div>
                    <div className="text-[10px] text-muted-foreground">{n.note}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">{n.amount}</div>
                  <div className="text-[10px] font-medium text-muted-foreground">{n.dvPct}% DV</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className={`h-full rounded-full ${n.color} transition-all duration-500`}
                  style={{ width: `${n.barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-[11px] text-muted-foreground italic text-center">
        *Percent Daily Values (DV) are based on a 2,000 calorie reference diet for healthy Indian
        adults.
      </div>
    </div>
  );
}
