import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SelectColor from "./ColorPicker"; // импортируйте ваш ColorPicker

type MenuOption = {
  label: string;
  onClick?: () => void;
  submenu?: MenuOption[];
  colorPicker?: boolean;
  onColorSelect?: (color: string) => void;
  color?: string;
};

type MenuProps = {
  button: React.ReactNode;
  options: MenuOption[];
  handleClass?: string;
};

export default function DropdownMenu({
  button,
  options,
  handleClass,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(
    null
  );
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && btnRef.current && menuRef.current) {
      const btnRect = btnRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      setCoords({
        left: btnRect.left + btnRect.width / 2 - menuRect.width / 2,
        top: btnRect.bottom + window.scrollY,
      });
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleClose = () => setOpen(false);

  return (
    <div className={handleClass}>
      <button ref={btnRef} onClick={() => setOpen((v) => !v)}>
        {button}
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="absolute z-[9999] min-w-[180px]"
            style={{
              left: coords ? coords.left : undefined,
              top: coords ? coords.top : undefined,
              position: "absolute",
              visibility: coords ? "visible" : "hidden",
            }}
          >
            <div className="flex justify-center">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "10px solid #fff",
                  filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.08))",
                }}
              />
            </div>
            <div className="relative bg-white rounded-xl shadow-xl border-2 border-sky-300 border-double p-1 mt-[-2px]">
              <MenuList options={options} onClose={handleClose} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function MenuList({
  options,
  onClose,
}: {
  options: MenuOption[];
  onClose: () => void;
}) {
  const [submenuIdx, setSubmenuIdx] = useState<number | null>(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  return (
    <ul className="py-1">
      {options.map((opt, idx) => (
        <li
          key={opt.label}
          className="relative group"
          onMouseEnter={() => setSubmenuIdx(opt.submenu ? idx : null)}
          onMouseLeave={() => setSubmenuIdx(null)}
        >
          {opt.colorPicker ? (
            <div className="px-4 py-1">
              <SelectColor
                color={opt.color ?? null}
                setPickerVisible={setColorPickerVisible}
                pickerVisible={colorPickerVisible}
                changeColor={(color) => {
                  opt.onColorSelect?.(color);
                  onClose();
                }}
              />
            </div>
          ) : (
            <button
              className="w-full text-left px-4 py-2 hover:bg-sky-100 transition flex items-center justify-between rounded"
              onClick={() => {
                if (opt.onClick) opt.onClick();
                if (!opt.submenu) onClose();
              }}
              type="button"
            >
              <span>{opt.label}</span>
              {opt.submenu && <span className="ml-2">&rarr;</span>}
            </button>
          )}
          {opt.submenu && submenuIdx === idx && (
            <div className="absolute top-0 left-full ml-2 z-50 min-w-[160px]">
              <div
                className="absolute left-[-10px] top-3"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "7px solid transparent",
                  borderBottom: "7px solid transparent",
                  borderRight: "10px solid #fff",
                  filter: "drop-shadow(2px 0 2px rgba(0,0,0,0.08))",
                }}
              />
              <div className="relative bg-white rounded-xl shadow-xl border-2 border-sky-300 border-double p-1">
                <MenuList options={opt.submenu} onClose={onClose} />
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
