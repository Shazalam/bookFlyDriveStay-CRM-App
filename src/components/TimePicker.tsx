import React from "react";

interface TimePickerProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
}

export default function TimePicker({
    label,
    name,
    value,
    onChange,
    required,
}: TimePickerProps) {
    // generate time slots with 15 min gap + AM/PM
    const generateTimeSlots = () => {
        const slots: string[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                // hour in 12-hour format
                const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                const h = displayHour.toString().padStart(2, "0");
                const m = minute.toString().padStart(2, "0");
                const period = hour < 12 ? "AM" : "PM";

                // ✅ Display value (what user sees in dropdown)
                const displayTime = `${h}:${m} ${period}`;

                // ✅ Actual value (can store as 24-hour format)
                const valueTime = `${hour.toString().padStart(2, "0")}:${m}`;

                slots.push(`${displayTime}|${valueTime}`);
            }
        }
        return slots;
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
                <option value="">Select Time</option>
                {generateTimeSlots().map((slot) => {
                    const [label, value] = slot.split("|");
                    return (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    );
                })}
            </select>

        </div>
    );
}
