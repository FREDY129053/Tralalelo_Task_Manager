import clsx from "clsx";

const COLOR_OPTIONS = [
  "#FBEAEA",
  "#EAFBEA",
  "#FAF3E0",
  "#fad5c0",
  "#FBEAF7",
  "#d8eff4",
];

export default function SelectColor({
  color,
  setPickerVisible,
  pickerVisible,
  changeColor,
}: {
  color: string | null;
  setPickerVisible: (val: boolean) => void;
  pickerVisible: boolean;
  changeColor: (color: string) => void;
}) {
  return (
    <div className="relative flex flex-row items-center gap-4">
      <label className="font-semibold block mb-1">Цвет:</label>
      <div
        className="w-6 h-6 rounded-full border cursor-pointer"
        style={{ background: color ?? "" }}
        onClick={() => setPickerVisible(!pickerVisible)}
      />
      {pickerVisible && (
        <div className="absolute z-20 mt-30 ml-4 bg-white border border-border p-2 rounded shadow grid grid-cols-3 gap-2">
          {COLOR_OPTIONS.map((c) => (
            <div
              key={c}
              onClick={() => {
                changeColor(c);
                setPickerVisible(false);
              }}
              className={clsx(
                "w-6 h-6 rounded-full cursor-pointer border",
                color?.toLowerCase() === c.toLowerCase()
                  ? "ring-1 ring-black"
                  : ""
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}