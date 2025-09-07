import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface Car {
  name: string;
  category: string;
  image: string;
}

interface VehicleSelectorProps {
  form: {
    vehicleType: string;
    vehicleCategory: string;
    vehicleImage: string;
    [key: string]: unknown; // allow other form fields
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

const carDatabase: Car[] = [
  {
    name: "Toyota Corolla",
    category: "Sedan",
    image:
      "https://cdn.imagin.studio/getImage?customer=car&make=toyota&modelFamily=corolla&paintId=pspc0001",
  },
  {
    name: "Honda Civic",
    category: "Sedan",
    image:
      "https://cdn.imagin.studio/getImage?customer=car&make=honda&modelFamily=civic&paintId=pspc0002",
  },
  {
    name: "BMW X5",
    category: "SUV",
    image:
      "https://cdn.imagin.studio/getImage?customer=car&make=bmw&modelFamily=x5&paintId=pspc0003",
  },
  {
    name: "Mercedes GLE",
    category: "SUV",
    image:
      "https://cdn.imagin.studio/getImage?customer=car&make=mercedes-benz&modelFamily=gle&paintId=pspc0004",
  },
  {
    name: "Tesla Model 3",
    category: "Electric",
    image:
      "https://cdn.imagin.studio/getImage?customer=car&make=tesla&modelFamily=model3&paintId=pspc0005",
  },
];

export default function VehicleSelector({ form, setForm }: VehicleSelectorProps) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCars = carDatabase.filter(
    (car) =>
      car.category.toLowerCase().includes(search.toLowerCase()) ||
      car.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelectCar(car: Car) {
    setForm((prev: any) => ({
      ...prev,
      vehicleType: car.name,
      vehicleCategory: car.category,
      vehicleImage: car.image,
    }));
    setSearch("");
    setShowDropdown(false);
  }

  function handleClearSelection() {
    setForm((prev: any) => ({
      ...prev,
      vehicleType: "",
      vehicleCategory: "",
      vehicleImage: "",
    }));
  }

  return (
    <div className="md:col-span-2 relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Vehicle Search
      </label>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowDropdown(true);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Type 'Sedan' or 'Toyota Corolla'"
        className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
      />

      {/* Dropdown Menu */}
      {showDropdown && search && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <div
                key={car.name}
                onClick={() => handleSelectCar(car)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-indigo-50 transition"
              >
                <Image
                  src={car.image}
                  alt={car.name}
                  width={60}
                  height={40}
                  className="rounded-md object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{car.name}</p>
                  <p className="text-xs text-gray-500">{car.category}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="p-3 text-gray-500 text-sm">No cars found.</p>
          )}
        </div>
      )}

      {/* Selected Car Preview */}
      {form.vehicleImage && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={form.vehicleImage}
              alt={form.vehicleType}
              width={80}
              height={56}
              className="rounded-md object-cover"
            />
            <div>
              <p className="font-medium text-gray-700">{form.vehicleType}</p>
              <p className="text-sm text-gray-500">{form.vehicleCategory}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearSelection}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
