import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/shared/Field";
import { Building2, Home, CheckCircle2, Sparkles } from "lucide-react";
import { uid } from "@/lib/helpers";
import { saveData } from "@/lib/storage";
import { buildSeed } from "@/lib/seed";
import { useApp } from "@/context/AppContext";

const STEPS = ["welcome", "building", "units", "done"];

export function OnboardingWizard() {
  const { setData, update, updatePrefs } = useApp();
  const [step, setStep] = useState(0);
  const [buildingName, setBuildingName] = useState("");
  const [buildingAddress, setBuildingAddress] = useState("");
  const [unitCount, setUnitCount] = useState("6");
  const [monthlyRent, setMonthlyRent] = useState("5000");
  const [createdBuildingId, setCreatedBuildingId] = useState(null);

  function exploreDemo() {
    const seed = buildSeed();
    saveData(seed);
    setData(seed);
    updatePrefs("onboarded", true);
  }

  function handleAddBuilding() {
    if (!buildingName.trim()) return;
    const bId = uid();
    setCreatedBuildingId(bId);
    update((d) => ({
      ...d,
      buildings: [...d.buildings, { id: bId, name: buildingName.trim(), address: buildingAddress.trim(), totalUnits: 0 }],
    }));
    setStep(2);
  }

  function handleAddUnits() {
    const count = Math.max(1, Math.min(50, parseInt(unitCount) || 1));
    const rent = Math.max(0, parseInt(monthlyRent) || 0);
    update((d) => {
      const newUnits = Array.from({ length: count }, (_, i) => ({
        id: uid(), buildingId: createdBuildingId, label: `Unit ${i + 1}`,
        floor: 1, monthlyRent: rent, status: "vacant",
      }));
      return {
        ...d,
        units: [...d.units, ...newUnits],
        buildings: d.buildings.map((b) => b.id === createdBuildingId ? { ...b, totalUnits: count } : b),
      };
    });
    setStep(3);
  }

  function finish() {
    updatePrefs("onboarded", true);
  }

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[60] bg-[#f8f7f4] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= step ? "bg-zinc-900 scale-110" : "bg-zinc-300"}`} />
          ))}
        </div>

        {current === "welcome" && (
          <Card className="border border-zinc-200/80 shadow-lg">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🏠</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Welcome to UpaUpa!</h1>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                  Track rent payments for your apartments — no more paper notebooks.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <Button onClick={() => setStep(1)} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800 h-12 text-base">
                  <Building2 size={18} className="mr-2" /> Start Fresh
                </Button>
                <Button variant="outline" onClick={exploreDemo} className="w-full rounded-full h-12 text-base">
                  <Sparkles size={18} className="mr-2" /> Explore Demo
                </Button>
                <p className="text-xs text-zinc-400">
                  "Start Fresh" lets you set up your own buildings. "Explore Demo" loads sample data so you can look around first.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {current === "building" && (
          <Card className="border border-zinc-200/80 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-zinc-100 rounded-xl flex items-center justify-center mb-3">
                  <Building2 size={24} className="text-zinc-600" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Add Your Building</h2>
                <p className="text-sm text-zinc-500 mt-1">You can add more buildings later.</p>
              </div>
              <div className="space-y-4">
                <Field label="Building Name">
                  <Input value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder='e.g. "Building A" or "Apartment sa Main St"' className="rounded-xl h-11" autoFocus />
                </Field>
                <Field label="Address (optional)">
                  <Input value={buildingAddress} onChange={(e) => setBuildingAddress(e.target.value)} placeholder="e.g. 123 Main St, Las Pinas" className="rounded-xl h-11" />
                </Field>
              </div>
              <Button onClick={handleAddBuilding} disabled={!buildingName.trim()} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800 h-12 text-base">
                Next
              </Button>
            </CardContent>
          </Card>
        )}

        {current === "units" && (
          <Card className="border border-zinc-200/80 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-zinc-100 rounded-xl flex items-center justify-center mb-3">
                  <Home size={24} className="text-zinc-600" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Add Units</h2>
                <p className="text-sm text-zinc-500 mt-1">How many units does <strong>{buildingName}</strong> have?</p>
              </div>
              <div className="space-y-4">
                <Field label="Number of Units">
                  <Input type="number" value={unitCount} onChange={(e) => setUnitCount(e.target.value)} min="1" max="50" className="rounded-xl h-11" />
                </Field>
                <Field label="Monthly Rent per Unit (₱)">
                  <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} min="0" className="rounded-xl h-11" />
                </Field>
                <p className="text-xs text-zinc-400">You can customize each unit's rent and label later.</p>
              </div>
              <Button onClick={handleAddUnits} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800 h-12 text-base">
                Create Units
              </Button>
            </CardContent>
          </Card>
        )}

        {current === "done" && (
          <Card className="border border-zinc-200/80 shadow-lg">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">You're All Set!</h2>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                  Your building and units are ready. Next, add your tenants and start recording payments.
                </p>
              </div>
              <Button onClick={finish} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800 h-12 text-base">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
