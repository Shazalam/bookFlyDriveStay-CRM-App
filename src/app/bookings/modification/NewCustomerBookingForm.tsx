// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import InputField from "@/components/InputField";
// import VehicleSelector from "@/components/VehicleSelector";
// import LoadingButton from "@/components/LoadingButton";
// import TimePicker from "@/components/TimePicker";
// import { ArrowLeft } from "lucide-react";
// import LoadingScreen from "@/components/LoadingScreen";
// import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
// import { saveBooking, resetOperationStatus } from "@/app/store/slices/bookingSlice";
// import ErrorComponent from "@/components/ErrorComponent";
// import FieldSelectionPanel from "@/components/FieldSelectionPanel";
// import { Booking, TimelineChange, TimelineEntry } from "@/types/booking";
// import { addRentalCompany, fetchRentalCompanies } from "@/app/store/slices/rentalCompanySlice";
// import { useToastHandler } from "@/lib/utils/hooks/useToastHandler";
// import { RootState } from "@/app/store/store";

// const createEditableGroups = {
//   Vehicle: ["rentalCompany", "confirmationNumber", "vehicleImage"],
//   "Locations & Dates": [
//     "pickupLocation",
//     "dropoffLocation",
//     "pickupDate",
//     "dropoffDate",
//     "pickupTime",
//     "dropoffTime",
//   ],
// };

// interface NewCustomerBookingFormProps {
//   id?: string | null;
// }

// export default function NewCustomerBookingForm({ id }: NewCustomerBookingFormProps) {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { loading, error, operation } = useAppSelector((state) => state.booking);

//   const [form, setForm] = useState<Booking>({
//     id: "",
//     fullName: "",
//     email: "",
//     phoneNumber: "",
//     rentalCompany: "",
//     confirmationNumber: "",
//     vehicleImage: "",
//     total: "",
//     mco: "",
//     modificationFee: [],
//     payableAtPickup: "",
//     pickupDate: "",
//     dropoffDate: "",
//     pickupTime: "",
//     dropoffTime: "",
//     pickupLocation: "",
//     dropoffLocation: "",
//     cardLast4: "",
//     expiration: "",
//     billingAddress: "",
//     salesAgent: "",
//     status: "MODIFIED",
//     dateOfBirth: "",
//   });

//   const [editable, setEditable] = useState<Record<string, boolean>>(() =>
//     Object.values(createEditableGroups)
//       .flat()
//       .reduce((acc, field) => ({ ...acc, [field]: false }), {})
//   );

//   const [newModificationFee, setNewModificationFee] = useState("");
//   const { rentalCompanies } = useAppSelector(
//     (state: RootState) => state.rentalCompany
//   );
//   const [otherRentalCompany, setOtherRentalCompany] = useState("");
//   const { handleSuccessToast, handleErrorToast } = useToastHandler();


//   // Fetch rental companies on mount
//   useEffect(() => {
//     dispatch(fetchRentalCompanies());
//   }, [dispatch]);


//   useEffect(() => {
//     if (form.rentalCompany === "Other") {
//       setOtherRentalCompany(form.rentalCompany);
//       setForm(prev => ({ ...prev, rentalCompany: "" }));
//     }
//   }, [form.rentalCompany]);


//   // Fetch logged-in agent
//   useEffect(() => {
//     async function fetchUser() {
//       const res = await fetch("/api/auth/me", { credentials: "include" });
//       const data = await res.json();
//       if (data.user) {
//         setForm((prev) => ({ ...prev, salesAgent: data.user.name }));
//       }
//     }
//     fetchUser();
//   }, []);

//   // Handle input change
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value } as Booking));
//   };

//   const toggleField = (field: string) => {
//     setEditable((prev) => ({ ...prev, [field]: !prev[field] }));
//   };

//   const toggleAll = () => {
//     const allFields = Object.values(createEditableGroups).flat();
//     const allSelected = allFields.every((f) => editable[f]);
//     const newValue = !allSelected;
//     const updated = allFields.reduce(
//       (acc, f) => ({ ...acc, [f]: newValue }),
//       {}
//     );
//     setEditable(updated);
//   };

//   const addModificationFee = () => {
//     if (newModificationFee) {
//       setForm((prev) => ({
//         ...prev,
//         modificationFee: [...prev.modificationFee, { charge: newModificationFee }],
//       }));
//       setNewModificationFee("");
//     }
//   };

//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();

//   //   const formData: Partial<Booking> = { ...form };
//   //   const changes: TimelineChange[] = [];

//   //   // collect only selected fields
//   //   // Object.keys(editable).forEach((field) => {
//   //   //   if (editable[field] && form[field as keyof Booking]) {
//   //   //     changes.push({
//   //   //       text: ` ${field} set to ${form[field as keyof Booking]}`,
//   //   //     });
//   //   //   }
//   //   // });

//   //   Object.keys(editable).forEach((field) => {
//   //     const newValue = form[field as keyof Booking];
//   //     if (editable[field] && newValue !== undefined && newValue !== null) {
//   //       // Use "null" for oldValue since this is a new customer
//   //       changes.push({
//   //         text: `${field} updated from null to "${newValue}"`
//   //       });
//   //     }
//   //   });


//   //   if (changes.length === 0) {
//   //     toast.error("No fields selected. Please select at least one to log in timeline.");
//   //     return;
//   //   }

//   //   const timelineEntry: TimelineEntry = {
//   //     date: new Date().toISOString(),
//   //     message: `New Modification booking Created with ${changes.length} selected field(s)`,
//   //     agentName: form.salesAgent,
//   //     changes,
//   //   };

//   //   (formData as any).timeline = [timelineEntry]; // ✅ wrap in array


//   //   console.log("formData =>",)
//   //   formData
//   //   await dispatch(saveBooking({
//   //     formData,
//   //     id: id || undefined,
//   //   }));
//   // };

//   // Side effects after submit

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {

//       const companyName = form.rentalCompany.trim();
//       if (!companyName) {
//         handleErrorToast("Please enter or select a rental company.");
//         return;
//       }


//       // 1️⃣ Check if company already exists in Redux store
//       const companyExists = rentalCompanies.some((rc) => rc.name.toLowerCase() === companyName.toLowerCase());

//       // 2️⃣ If it exists, proceed. If it's "Other", set flag to show input field
//       if (companyExists && otherRentalCompany === "Other") {
//         handleErrorToast("This rental company already exists. Please select it or choose 'Other'.");
//         setForm(prev => ({ ...prev, rentalCompany: "" }));
//         setOtherRentalCompany("");
//         return;
//       }

//       // 3️⃣ If company doesn’t exist & isn’t 'Other', add it to MongoDB
//       if (!companyExists && otherRentalCompany === "Other") {
//         const result = await dispatch(addRentalCompany({ name: companyName }));
//         if (addRentalCompany.rejected.match(result)) {
//           handleErrorToast(result?.payload || "Failed to add rental company");
//           setOtherRentalCompany(""); // reset
//           return;
//         }
//         handleSuccessToast(`Added new company: ${companyName}`);
//         await dispatch(fetchRentalCompanies()); // refresh list
//       }
//       // Now proceed to save booking
//       const formData: Partial<Booking> = { ...form };
//       const changes: TimelineChange[] = [];

//       // Map raw fields to human-readable labels
//       const fieldLabels: Record<string, string> = {
//         pickupLocation: "Pickup Location",
//         dropoffLocation: "Dropoff Location",
//         pickupDate: "Pickup Date",
//         dropoffDate: "Dropoff Date",
//         pickupTime: "Pickup Time",
//         dropoffTime: "Dropoff Time",
//         fullName: "Full Name",
//         email: "Email",
//         phoneNumber: "Phone Number",
//         rentalCompany: "Rental Company",
//         confirmationNumber: "Confirmation Number",
//         vehicleImage: "Vehicle Image",
//         total: "Total",
//         mco: "MCO",
//         payableAtPickup: "Payable at Pickup",
//         cardLast4: "Card Last 4 Digits",
//         expiration: "Expiration",
//         billingAddress: "Billing Address",
//         status: "Status",
//         dateOfBirth: "Date of Birth"
//       };

//       // Helper to format time in 12-hour format
//       const formatTime = (time: string | null | undefined) => {
//         if (!time) return "";
//         const [hourStr, minuteStr] = time.split(":");
//         let hour = parseInt(hourStr, 10);
//         const minute = minuteStr ?? "00";
//         const ampm = hour >= 12 ? "PM" : "AM";
//         hour = hour % 12 || 12;
//         return `${hour}:${minute} ${ampm}`;
//       };

//       // Collect only selected fields
//       Object.keys(editable).forEach((field) => {
//         if (editable[field]) {
//           let newValue = form[field as keyof Booking];

//           // Format time fields
//           if (["pickupTime", "dropoffTime"].includes(field)) {
//             newValue = newValue ? formatTime(newValue as string) : "";
//           }

//           if (newValue !== undefined && newValue !== null && newValue !== "") {
//             changes.push({
//               text: `Change in ${fieldLabels[field] || field}: to "${newValue}"`
//             });
//           }
//         }
//       });

//       if (changes.length === 0) {
//         handleErrorToast("No fields selected. Please select at least one to log in timeline.");
//         return;
//       }

//       const timelineEntry: TimelineEntry = {
//         date: new Date().toISOString(),
//         message: `New modification booking created with ${changes.length} selected field(s)`,
//         agentName: form.salesAgent,
//         changes,
//       };

//       formData.timeline = [timelineEntry]; // ✅ no more `any`

//       await dispatch(saveBooking({
//         formData,
//         id: id || undefined,
//       }));


//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Network error";
//       handleErrorToast(`Error: ${errorMessage}. Please try again.`);
//       return;
//     }
//   };

//   useEffect(() => {
//     if (operation === "succeeded") {
//       handleSuccessToast("Booking created successfully!");
//       router.push("/dashboard");
//       dispatch(resetOperationStatus());
//     } else if (operation === "failed") {
//       handleErrorToast(error || "Failed to create booking");
//       dispatch(resetOperationStatus());
//     }
//   }, [operation, error, router, dispatch, handleSuccessToast, handleErrorToast]);

//   if (loading) return <LoadingScreen />;
//   if (error)
//     return (
//       <ErrorComponent
//         title="Failed to Create Booking"
//         message={error || "Unknown error"}
//         onRetry={() => dispatch(resetOperationStatus())}
//       />
//     );

//   return (
//     <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10">
//       {/* Header */}
//       <div className="w-full max-w-7xl flex items-center gap-4 mb-6">
//         <button
//           onClick={() => router.push("/dashboard")}
//           className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full shadow-sm hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200"
//         >
//           <ArrowLeft size={18} />
//           Back
//         </button>
//         <h1 className="text-3xl font-bold text-gray-900 flex-1">🆕 New Modification Reservation</h1>
//       </div>

//       {/* Main content */}
//       <div className="w-full max-w-7xl bg-white p-10 rounded-2xl shadow-xl grid md:grid-cols-4 gap-8">
//         {/* Left panel */}
//         <div className="md:col-span-1 w-full">
//           <FieldSelectionPanel
//             editable={editable}
//             toggleField={toggleField}
//             toggleAll={toggleAll}
//           />
//         </div>
//         {/* Right: form */}
//         <form onSubmit={handleSubmit} className="md:col-span-3 space-y-10">
//           {/* Customer Info */}
//           <section>
//             <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">
//               👤 Customer Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <InputField label="Customer Name" name="fullName" value={form.fullName} onChange={handleChange} required />
//               <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
//               <InputField label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
//               <InputField label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth || ""} onChange={handleChange} required />
//             </div>
//           </section>

//           {/* Booking details */}
//           <section>
//             <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">📅 Booking Details</h2>

//             {/* Row 1: Rental Company & Confirmation Number */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               <div>
//                 {
//                   otherRentalCompany === "Other" || rentalCompanies.length === 0 ? (
//                     <InputField
//                       label="Rental Company"
//                       name="rentalCompany"
//                       value={form.rentalCompany}
//                       onChange={handleChange}
//                       placeholder="Enter Rental Company"
//                       required
//                     />
//                   ) : (
//                     <>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Rental Company
//                       </label>
//                       <select
//                         name="rentalCompany"
//                         value={form.rentalCompany}
//                         onChange={handleChange}
//                         className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
//                         required
//                       >
//                         <option value="">Select a company</option>
//                         {rentalCompanies.map((company) => (
//                           <option key={company._id} value={company.name}>
//                             {company.name}
//                           </option>
//                         ))}
//                       </select>
//                     </>
//                   )
//                 }
//               </div>

//               <InputField
//                 label="Confirmation Number"
//                 name="confirmationNumber"
//                 value={form.confirmationNumber}
//                 onChange={handleChange}
//                 placeholder="Enter Confirmation Number"
//                 required
//               />
//             </div>

//             {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Rental Company</label>
//                 <select
//                   name="rentalCompany"
//                   value={form.rentalCompany}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
//                   required
//                 >
//                   <option value="">Select a company</option>
//                   {rentalCompanies.map((company) => (
//                     <option key={company} value={company}>
//                       {company}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <InputField
//                 label="Confirmation Number"
//                 name="confirmationNumber"
//                 value={form.confirmationNumber}
//                 onChange={handleChange}
//                 required
//               />
//             </div> */}

//             <VehicleSelector value={form.vehicleImage} onChange={(url) => setForm((prev) => ({ ...prev, vehicleImage: url }))} />

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
//               <InputField label="Pickup Location" name="pickupLocation" value={form.pickupLocation} onChange={handleChange} required />
//               <InputField label="Pickup Date" name="pickupDate" type="date" value={form.pickupDate} onChange={handleChange} required />
//               <TimePicker label="Pickup Time" name="pickupTime" value={form.pickupTime} onChange={handleChange} required />
//               <InputField label="Drop-off Location" name="dropoffLocation" value={form.dropoffLocation} onChange={handleChange} required />
//               <InputField label="Drop-off Date" name="dropoffDate" type="date" value={form.dropoffDate} onChange={handleChange} required />
//               <TimePicker label="Drop-off Time" name="dropoffTime" value={form.dropoffTime} onChange={handleChange} required />
//             </div>
//           </section>

//           {/* Payment Info */}
//           <section>
//             <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">💳 Payment Information</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

//               {/* Modification Fee */}
//               <div className="md:col-span-2">
//                 <div className="flex flex-col gap-2">
//                   <label className="block text-sm font-medium text-gray-700">Modification Fee</label>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={newModificationFee}
//                       onChange={(e) => setNewModificationFee(e.target.value)}
//                       placeholder="Enter fee (e.g., 25.00)"
//                       className="flex-1 border border-gray-300 rounded-lg p-3 bg-white  text-gray-800"
//                     />
//                     <button
//                       type="button"
//                       onClick={addModificationFee}
//                       disabled={!newModificationFee.trim()}
//                       className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                     >
//                       Add Fee
//                     </button>
//                   </div>
//                 </div>
//                 {form.modificationFee.length > 0 && (
//                   <div className="mt-3">
//                     <p className="text-sm font-medium text-gray-700 mb-2">Current Modification Fee:</p>
//                     <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
//                       <span className="text-gray-700 font-medium">
//                         ${form.modificationFee[form.modificationFee.length - 1].charge}
//                       </span>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           const updated = [...form.modificationFee];
//                           updated.pop();
//                           setForm((prev) => ({ ...prev, modificationFee: updated }));
//                         }}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <InputField
//                 label="Card Last 4 Digits"
//                 name="cardLast4"
//                 value={form.cardLast4}
//                 onChange={handleChange}
//                 placeholder="Enter Last 4 Digits"
//                 maxLength={4}
//               />
//               <InputField
//                 label="Expiration Date"
//                 name="expiration"
//                 type="month"
//                 value={form.expiration}
//                 onChange={handleChange}
//               />
//               <div className="md:col-span-2 lg:col-span-5">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Billing Address
//                 </label>
//                 <textarea
//                   name="billingAddress"
//                   value={form.billingAddress}
//                   onChange={handleChange}
//                   placeholder="Enter Billing Address"
//                   rows={3}
//                   className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
//                 />
//               </div>
//             </div>
//           </section>

//           {/* Sales Agent */}
//           <section>
//             <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">🧑‍💼 Sales Agent</h2>
//             <InputField label="Sales Agent" name="salesAgent" value={form.salesAgent} onChange={handleChange} readOnly />
//           </section>

//           {/* Submit */}
//           <div>
//             <LoadingButton type="submit" loading={loading} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 text-lg rounded-lg">
//               Create Booking
//             </LoadingButton>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";
import VehicleSelector from "@/components/VehicleSelector";
import LoadingButton from "@/components/LoadingButton";
import TimePicker from "@/components/TimePicker";
import { ArrowLeft, Plus, Trash2, User, Calendar, MapPin, CreditCard, Briefcase, DollarSign, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { saveBooking, resetOperationStatus } from "@/app/store/slices/bookingSlice";
import ErrorComponent from "@/components/ErrorComponent";
import FieldSelectionPanel from "@/components/FieldSelectionPanel";
import { Booking, TimelineChange, TimelineEntry } from "@/types/booking";
import { addRentalCompany, fetchRentalCompanies } from "@/app/store/slices/rentalCompanySlice";
import { useToastHandler } from "@/lib/utils/hooks/useToastHandler";
import { RootState } from "@/app/store/store";

const createEditableGroups = {
  Vehicle: ["rentalCompany", "confirmationNumber", "vehicleImage"],
  "Locations & Dates": [
    "pickupLocation",
    "dropoffLocation",
    "pickupDate",
    "dropoffDate",
    "pickupTime",
    "dropoffTime",
  ],
};

interface NewCustomerBookingFormProps {
  id?: string | null;
}

export default function NewCustomerBookingForm({ id }: NewCustomerBookingFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, operation } = useAppSelector((state) => state.booking);

  const [form, setForm] = useState<Booking>({
    id: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    rentalCompany: "",
    confirmationNumber: "",
    vehicleImage: "",
    total: "",
    mco: "",
    modificationFee: [],
    payableAtPickup: "",
    pickupDate: "",
    dropoffDate: "",
    pickupTime: "",
    dropoffTime: "",
    pickupLocation: "",
    dropoffLocation: "",
    cardLast4: "",
    expiration: "",
    billingAddress: "",
    salesAgent: "",
    status: "MODIFIED",
    dateOfBirth: "",
  });

  const [editable, setEditable] = useState<Record<string, boolean>>(() =>
    Object.values(createEditableGroups)
      .flat()
      .reduce((acc, field) => ({ ...acc, [field]: false }), {})
  );

  const [newModificationFee, setNewModificationFee] = useState("");
  const { rentalCompanies } = useAppSelector(
    (state: RootState) => state.rentalCompany
  );
  const [otherRentalCompany, setOtherRentalCompany] = useState("");
  const { handleSuccessToast, handleErrorToast } = useToastHandler();

  // Fetch rental companies on mount
  useEffect(() => {
    dispatch(fetchRentalCompanies());
  }, [dispatch]);

  useEffect(() => {
    if (form.rentalCompany === "Other") {
      setOtherRentalCompany(form.rentalCompany);
      setForm(prev => ({ ...prev, rentalCompany: "" }));
    }
  }, [form.rentalCompany]);

  // Fetch logged-in agent
  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data.user) {
        setForm((prev) => ({ ...prev, salesAgent: data.user.name }));
      }
    }
    fetchUser();
  }, []);

  // Calculate MCO when total or payableAtPickup changes
  useEffect(() => {
    if (form.total && form.payableAtPickup) {
      const total = parseFloat(form.total) || 0;
      const payableAtPickup = parseFloat(form.payableAtPickup) || 0;
      const mco = total - payableAtPickup;

      if (mco >= 0) {
        setForm(prev => ({ ...prev, mco: mco.toFixed(2) }));
      }
    } else {
      setForm(prev => ({ ...prev, mco: "0.00" }));
    }
  }, [form.total, form.payableAtPickup]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as Booking));
  };

  const toggleField = (field: string) => {
    setEditable((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleAll = () => {
    const allFields = Object.values(createEditableGroups).flat();
    const allSelected = allFields.every((f) => editable[f]);
    const newValue = !allSelected;
    const updated = allFields.reduce(
      (acc, f) => ({ ...acc, [f]: newValue }),
      {}
    );
    setEditable(updated);
  };

  const addModificationFee = () => {
    if (newModificationFee) {
      setForm((prev) => ({
        ...prev,
        modificationFee: [...prev.modificationFee, { charge: newModificationFee }],
      }));
      setNewModificationFee("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const companyName = form.rentalCompany.trim();
      if (!companyName) {
        handleErrorToast("Please enter or select a rental company.");
        return;
      }

      // Check if company already exists in Redux store
      const companyExists = rentalCompanies.some((rc) => rc.name.toLowerCase() === companyName.toLowerCase());

      // If it exists, proceed. If it's "Other", set flag to show input field
      if (companyExists && otherRentalCompany === "Other") {
        handleErrorToast("This rental company already exists. Please select it or choose 'Other'.");
        setForm(prev => ({ ...prev, rentalCompany: "" }));
        setOtherRentalCompany("");
        return;
      }

      // If company doesn't exist & isn't 'Other', add it to MongoDB
      if (!companyExists && otherRentalCompany === "Other") {
        const result = await dispatch(addRentalCompany({ name: companyName }));
        if (addRentalCompany.rejected.match(result)) {
          handleErrorToast(result?.payload || "Failed to add rental company");
          setOtherRentalCompany(""); // reset
          return;
        }
        handleSuccessToast(`Added new company: ${companyName}`);
        await dispatch(fetchRentalCompanies()); // refresh list
      }

      // Now proceed to save booking
      const formData: Partial<Booking> = { ...form };
      const changes: TimelineChange[] = [];

      // Map raw fields to human-readable labels
      const fieldLabels: Record<string, string> = {
        pickupLocation: "Pickup Location",
        dropoffLocation: "Dropoff Location",
        pickupDate: "Pickup Date",
        dropoffDate: "Dropoff Date",
        pickupTime: "Pickup Time",
        dropoffTime: "Dropoff Time",
        fullName: "Full Name",
        email: "Email",
        phoneNumber: "Phone Number",
        rentalCompany: "Rental Company",
        confirmationNumber: "Confirmation Number",
        vehicleImage: "Vehicle Image",
        total: "Total",
        mco: "MCO",
        payableAtPickup: "Payable at Pickup",
        cardLast4: "Card Last 4 Digits",
        expiration: "Expiration",
        billingAddress: "Billing Address",
        status: "Status",
        dateOfBirth: "Date of Birth"
      };

      // Helper to format time in 12-hour format
      const formatTime = (time: string | null | undefined) => {
        if (!time) return "";
        const [hourStr, minuteStr] = time.split(":");
        let hour = parseInt(hourStr, 10);
        const minute = minuteStr ?? "00";
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${hour}:${minute} ${ampm}`;
      };

      // Collect only selected fields
      Object.keys(editable).forEach((field) => {
        if (editable[field]) {
          let newValue = form[field as keyof Booking];

          // Format time fields
          if (["pickupTime", "dropoffTime"].includes(field)) {
            newValue = newValue ? formatTime(newValue as string) : "";
          }

          if (newValue !== undefined && newValue !== null && newValue !== "") {
            changes.push({
              text: `Change in ${fieldLabels[field] || field}: to "${newValue}"`
            });
          }
        }
      });

      if (changes.length === 0) {
        handleErrorToast("No fields selected. Please select at least one to log in timeline.");
        return;
      }

      const timelineEntry: TimelineEntry = {
        date: new Date().toISOString(),
        message: `New modification booking created with ${changes.length} selected field(s)`,
        agentName: form.salesAgent,
        changes,
      };

      formData.timeline = [timelineEntry];

      await dispatch(saveBooking({
        formData,
        id: id || undefined,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error";
      handleErrorToast(`Error: ${errorMessage}. Please try again.`);
      return;
    }
  };

  useEffect(() => {
    if (operation === "succeeded") {
      handleSuccessToast("Booking created successfully!");
      router.push("/dashboard");
      dispatch(resetOperationStatus());
    } else if (operation === "failed") {
      handleErrorToast(error || "Failed to create booking");
      dispatch(resetOperationStatus());
    }
  }, [operation, error, router, dispatch, handleSuccessToast, handleErrorToast]);

  if (loading) return <LoadingScreen />;
  if (error)
    return (
      <ErrorComponent
        title="Failed to Create Booking"
        message={error || "Unknown error"}
        onRetry={() => dispatch(resetOperationStatus())}
      />
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 rounded-xl shadow-sm hover:bg-white hover:border-green-300 hover:text-green-600 transition-all duration-200 self-start"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Dashboard</span>
          </motion.button>

          <div className="text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
            >
              New Modification Booking
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 mt-2"
            >
              Create a new modification booking for a customer
            </motion.p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="grid md:grid-cols-4 gap-0">
            {/* Left Panel - Field Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-1 bg-slate-50/50 border-r border-slate-200 p-6"
            >
              <FieldSelectionPanel
                editable={editable}
                toggleField={toggleField}
                toggleAll={toggleAll}
              />
            </motion.div>

            {/* Right Panel - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-3 p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Section: Customer Information */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Customer Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputField
                      label="Customer Name"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Enter full name"
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<User className="w-4 h-4 text-slate-400" />}
                    />
                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<User className="w-4 h-4 text-slate-400" />}
                    />
                    <InputField
                      label="Phone Number"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      required
                      placeholder="Enter phone number"
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<User className="w-4 h-4 text-slate-400" />}
                    />
                    <InputField
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth || ""}
                      onChange={handleChange}
                      required
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<Calendar className="w-4 h-4 text-slate-400" />}
                    />
                  </div>
                </motion.section>

                {/* Section: Booking Details */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Booking Details</h2>
                  </div>

                  {/* Rental Company & Confirmation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Rental Company
                      </label>
                      {otherRentalCompany === "Other" || rentalCompanies.length === 0 ? (
                        <input
                          name="rentalCompany"
                          value={form.rentalCompany}
                          onChange={handleChange}
                          placeholder="Enter rental company name"
                          required
                          className="w-full border-2 border-slate-200 bg-white/50 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                        />
                      ) : (
                        <select
                          name="rentalCompany"
                          value={form.rentalCompany}
                          onChange={handleChange}
                          className="w-full border-2 border-slate-200 bg-white/50 rounded-xl p-4 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                          required
                        >
                          <option value="">Select a company</option>
                          {rentalCompanies.map((company) => (
                            <option key={company._id} value={company.name}>
                              {company.name}
                            </option>
                          ))}
                          <option value="Other">Other (Add new)</option>
                        </select>
                      )}
                    </div>

                    <InputField
                      label="Confirmation Number"
                      name="confirmationNumber"
                      value={form.confirmationNumber}
                      onChange={handleChange}
                      placeholder="Enter confirmation number"
                      required
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>

                  {/* Vehicle Image */}
                  <div className="mb-8">
                    <VehicleSelector
                      value={form.vehicleImage}
                      onChange={(url) => setForm((prev) => ({ ...prev, vehicleImage: url }))}
                    />
                  </div>

                  {/* Location and Date/Time Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputField
                      label="Pickup Location"
                      name="pickupLocation"
                      value={form.pickupLocation}
                      onChange={handleChange}
                      required
                      placeholder="Enter pickup location"
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<MapPin className="w-4 h-4 text-slate-400" />}
                    />

                    <InputField
                      label="Pickup Date"
                      name="pickupDate"
                      type="date"
                      value={form.pickupDate}
                      onChange={handleChange}
                      required
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<Calendar className="w-4 h-4 text-slate-400" />}
                    />

                    <TimePicker
                      label="Pickup Time"
                      name="pickupTime"
                      value={form.pickupTime}
                      onChange={handleChange}
                      required
                    />

                    <InputField
                      label="Drop-off Location"
                      name="dropoffLocation"
                      value={form.dropoffLocation}
                      onChange={handleChange}
                      required
                      placeholder="Enter drop-off location"
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<MapPin className="w-4 h-4 text-slate-400" />}
                    />

                    <InputField
                      label="Drop-off Date"
                      name="dropoffDate"
                      type="date"
                      value={form.dropoffDate}
                      onChange={handleChange}
                      required
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<Calendar className="w-4 h-4 text-slate-400" />}
                    />

                    <TimePicker
                      label="Drop-off Time"
                      name="dropoffTime"
                      value={form.dropoffTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.section>

                {/* Section: Payment Information */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <CreditCard className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Payment Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <InputField
                      label="Total Amount ($)"
                      name="total"
                      value={form.total || ""}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                    />

                    <InputField
                      label="Payable at Pickup ($)"
                      name="payableAtPickup"
                      value={form.payableAtPickup || ""}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                    />

                    <InputField
                      label="MCO Amount"
                      name="mco"
                      value={form.mco || ""}
                      onChange={handleChange}
                      placeholder="MCO Reference"
                      readOnly
                      className="bg-slate-100 border-slate-200 text-slate-500"
                      icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                    />

                    {/* Modification Fee Section */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <label className="block text-sm font-semibold text-amber-800 mb-3">
                          Modification Fee
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newModificationFee}
                            onChange={(e) => setNewModificationFee(e.target.value)}
                            placeholder="Enter fee amount (e.g., 25.00)"
                            className="flex-1 border-2 border-amber-200 bg-white rounded-xl p-3 text-amber-800 placeholder-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all duration-200"
                          />
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={addModificationFee}
                            disabled={!newModificationFee.trim()}
                            className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </motion.button>
                        </div>
                      </div>

                      {/* Display added fees */}
                      {form.modificationFee.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-green-50 rounded-xl p-4 border border-green-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-green-800">Current Modification Fee</p>
                              <p className="text-lg font-bold text-green-600">
                                ${form.modificationFee[form.modificationFee.length - 1].charge}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => {
                                const updatedFees = [...form.modificationFee];
                                updatedFees.pop();
                                setForm(prev => ({ ...prev, modificationFee: updatedFees }));
                              }}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <InputField
                      label="Card Last 4 Digits"
                      name="cardLast4"
                      value={form.cardLast4}
                      onChange={handleChange}
                      placeholder="1234"
                      maxLength={4}
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                      icon={<CreditCard className="w-4 h-4 text-slate-400" />}
                    />

                    <InputField
                      label="Expiration Date"
                      name="expiration"
                      type="month"
                      value={form.expiration}
                      onChange={handleChange}
                      className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                    />

                    <div className="md:col-span-3 lg:col-span-5">
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Billing Address
                      </label>
                      <textarea
                        name="billingAddress"
                        value={form.billingAddress}
                        onChange={handleChange}
                        placeholder="Enter complete billing address"
                        rows={3}
                        className="w-full border-2 border-slate-200 bg-white/50 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                </motion.section>

                {/* Section: Sales Agent */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Sales Agent</h2>
                  </div>

                  <InputField
                    label="Sales Agent"
                    name="salesAgent"
                    value={form.salesAgent}
                    onChange={handleChange}
                    placeholder="Sales agent name"
                    readOnly={true}
                    className="bg-slate-100 border-slate-200 text-slate-500"
                    icon={<Briefcase className="w-4 h-4 text-slate-400" />}
                  />
                </motion.section>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="pt-6"
                >
                  <LoadingButton
                    type="submit"
                    loading={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Booking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Edit3 className="w-5 h-5" />
                        <span>Create Modification Booking</span>
                      </div>
                    )}
                  </LoadingButton>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}